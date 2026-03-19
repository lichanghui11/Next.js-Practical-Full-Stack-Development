import { isNil, omit } from 'lodash';

import type { MailSendOptions } from '@/lib/mail/types';

import { customMerge } from '@/app/utils/custom-merge';
import { appConfig } from '@/config/app.config';
import { authConfig } from '@/config/auth.config';
import { getDayjs } from '@/lib/get-time';
import { sendMail } from '@/lib/mail';
import { getRedisClient } from '@/lib/redis/client';
import { serverInstances } from '@/server/common/app';

import type { EmailOTPType } from './user.constants';
import type { EmailOTPPayload, SendOTPResponse } from './user.type';

import { queryUserByUsernameOrEmail } from './user.service';

const OTP_RATE_LIMIT_KEY_PREFIX = 'otp:rate_limit:';
/**
 *
 * @param data OTP 数据参数
 * @param type OTP 类型
 * @param options 邮件发送选项
 * @returns 发送结果
 */
export async function sendOTPHandler(
  data: EmailOTPPayload,
  type: `${EmailOTPType}`,
  options?: MailSendOptions,
) {
  try {
    // 拿到 OTP 的类型
    const config = authConfig.mails?.OTP?.send?.[type];
    console.log('邮件配置详情，authConfig.mails?.OTP?.send?.[type]: ', config);

    if (!isNil(config)) {
      const newOptions = customMerge(
        omit(config, ['client']),
        {
          ...(omit(options, ['vars', 'to', 'subject']) ?? {}),
          vars: {
            code: data.code,
            appname: appConfig.appName,
            expire: Math.round(
              getDayjs()
                .duration(authConfig.mails?.OTP?.expire ?? 300, 'second')
                .asMinutes(),
            ),
          },
          to: [data.email],
          subject: config.subject?.(type)(appConfig.appName, data.code),
        },
        'replace',
      );
      return await sendMail(newOptions as any as MailSendOptions, config.client);
    }
    throw new Error(`邮件配置不存在`);
  } catch (err) {
    throw new Error(`发送OTP邮件失败: ${(err as Error).message}`);
  }
}

/**
 *
 * @param email
 * @param type  OTP 类型
 * @returns 是否可以发送及剩余时间
 */
export async function checkOTPRateLimit(
  email: string,
  type: `${EmailOTPType}`,
): Promise<SendOTPResponse> {
  // 作为一个 key 来存储在 redis 中
  const key = `${OTP_RATE_LIMIT_KEY_PREFIX}${type}:${email}`;

  const rateLimit = authConfig.mails?.OTP?.rateLimit ?? 60;

  try {
    // 从提前挂载的这个变量上面拿到 redis 客户端实例
    const redis = getRedisClient(serverInstances.redis);
    const lastSendTime = await redis.get(key);

    // 还没有创建这个键，说明是第一次发送，直接返回可以发送
    if (!lastSendTime) return { canSend: true, message: '可以发送' };

    const now = Date.now(); // 返回的是时间戳

    const lastTime = Number.parseInt(lastSendTime, 10); // 解析成十进制整数
    // 已流逝的时间
    const elapsed = Math.floor((now - lastTime) / 1000);

    // 剩下的时间
    const remainingTime = rateLimit - elapsed;

    if (remainingTime > 0) {
      return {
        canSend: false,
        remainingTime,
        message: '发送过于频繁，请稍后再试',
        nextSendTime: lastTime + rateLimit * 1000,
      };
    }
    return { canSend: true, message: '可以发送' };
  } catch (_error) {
    // 如果 Redis 失败，允许发送（降级策略）
    return {
      canSend: true,
      message: `Redis 异常，可以发送，错误如下:${(_error as Error).message}`,
    };
  }
}

/**
 * 用于记录发信时间，用于和下一次发信时间进行对比以判断是否超过发信频率。
 * 其原理是使用redis的setex方法添加一条记录。
 * @param email
 * @param type
 */
export async function recordOTPSendTime(email: string, type: string): Promise<void> {
  console.log('-----------------');
  console.log('文件位置：src/server/modules/user/user.otp.ts，参数email：', email);
  console.log('这个函数记录发送时间，会存在redis里面');
  console.log('\n');
  const key = `${OTP_RATE_LIMIT_KEY_PREFIX}${type}:${email}`;

  try {
    const redis = getRedisClient(serverInstances.redis);

    // 打印实际使用的连接信息
    console.log('Redis 连接配置:', {
      host: redis.options.host,
      port: redis.options.port,
      db: redis.options.db,
      password: redis.options.password ? '***' : '无密码',
    });
    const now = Date.now();
    // ==========================
    // setex(key, seconds, value) = set(key, value) + expire(key, seconds)
    // key - Redis 键名
    // seconds - 过期时间（单位：秒）
    // value - 键对应的值
    // ==========================
    await redis.setex(key, authConfig.mails?.OTP?.rateLimit ?? 60, now.toString());
  } catch (error) {
    console.error('记录 OTP 发送时间失败：', error);
  }
}

// 在每次页面刷新后，如果需要实时判断当前输入的邮箱（或用户名）是否能发送验证码，
// 则需要一个单独的api。所以，编写一个专门的函数用于获取发送频率状态
export async function getOTPSendStatus(
  credential: string,
  type: `${EmailOTPType}`,
): Promise<SendOTPResponse> {
  const user = await queryUserByUsernameOrEmail(credential);
  if (isNil(user)) return { canSend: false, message: '用户不存在' };

  const result = await checkOTPRateLimit(user.email, type);

  return {
    ...result,
    message: result.canSend ? '可以发送' : `请等待 ${result.remainingTime} 秒`,
  };
}

// ============ 注册 OTP 管理（不依赖 Better Auth）============

const REGISTER_OTP_KEY_PREFIX = 'otp:code:register:';

/**
 * 生成 6 位数字验证码
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 存储注册验证码到 Redis
 */
export async function storeRegisterOTP(email: string, otp: string): Promise<void> {
  const key = `${REGISTER_OTP_KEY_PREFIX}${email}`;
  const redis = getRedisClient(serverInstances.redis);
  const expire = authConfig.mails?.OTP?.expire ?? 300;

  await redis.setex(key, expire, otp);
}

/**
 * 验证注册验证码
 */
export async function verifyRegisterOTP(email: string, otp: string): Promise<boolean> {
  const key = `${REGISTER_OTP_KEY_PREFIX}${email}`;
  const redis = getRedisClient(serverInstances.redis);

  const storedOTP = await redis.get(key);
  if (!storedOTP) return false;

  const isValid = storedOTP === otp;
  if (isValid) {
    await redis.del(key); // 验证成功后删除
  }

  return isValid;
}
