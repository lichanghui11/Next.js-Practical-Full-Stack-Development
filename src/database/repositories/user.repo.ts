// ContentfulStatusCode 本质是一个 TypeScript 类型，它限定了变量 / 参数只能是符合 HTTP 标准的状态码数值（如 200、400、404、500 等），而非任意数字。
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { isNil } from 'lodash';

import type { EmailOTPType } from '@/server/modules/user/user.constants';
import type {
  ResetPasswordRequest,
  SendOTPResponse,
  SignupRequest,
  User,
} from '@/server/modules/user/user.type';

import { authConfig } from '@/config/auth.config';
import prismaClient from '@/database/client/app-client';
import { auth } from '@/lib/auth/server';
import { addOTPQueue } from '@/lib/queue/utils';
import {
  checkOTPRateLimit,
  generateOTP,
  recordOTPSendTime,
  storeRegisterOTP,
  verifyRegisterOTP,
} from '@/server/modules/user/user.otp';

const UserRepo = {
  // 获取当前用户会话信息
  getCurrentSession: async (req: Request) => {
    return auth.api.getSession({
      headers: req.headers,
    });
  },

  // 用户登陆：支持用户名或邮箱
  signIn: async (usernameOrEmail: string, password: string) => {
    // 先通过用户名或邮箱查出用户
    const user = await prismaClient.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
    if (isNil(user)) return null;

    // 使用 Better Auth 内部验证方法
    const res = await auth.api.signInEmail({
      body: {
        email: user.email,
        password,
      },
    });

    return res;
  },

  // 用户登出
  signOut: async (req: Request) => {
    return auth.api.signOut({
      headers: req.headers,
    });
  },

  // 获取用户信息 ：根据当前会话获取用户信息
  getUser: async (req: Request) => {
    const session = await UserRepo.getCurrentSession(req);
    return session?.user || null;
  },
  // 根据用户id、用户名、邮箱地址等多种凭证查询用户
  queryUser: async (credential: string) => {
    return await prismaClient.user.findUnique({
      where: {
        OR: [{ id: credential }, { username: credential }, { email: credential }],
      },
    });
  },

  // 根据用户名或邮箱地址查询用户
  queryUserByUsernameOrEmail: async (usernameOrEmail: string) => {
    return await prismaClient.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
  },

  // 根据用户名查询用户
  queryUserByUsername: async (username: string) => {
    return await prismaClient.user.findUnique({
      where: {
        username,
      },
    });
  },

  // 根据邮箱地址查询用户
  queryUserByEmail: async (email: string) => {
    return await prismaClient.user.findUnique({
      where: {
        email,
      },
    });
  },

  // 根据用户id删除用户
  deleteUser: async (userId: string) => {
    const user = await UserRepo.queryUser(userId);
    // 如果用户不存在，返回 null
    if (isNil(user)) return null;

    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });

    // 返回删除的用户信息
    return user;
  },

  //===========下方是注册服务功能==============
  // 基本逻辑如下：
  // 1. 检测用户名和邮箱是否被占用
  // 2. 使用better-auth的signUpEmail注册用户
  // 3. 检测邮件验证码是否正确，如果不正确或者整个执行逻辑异常则删除用户
  // 4. 邮件验证码正确则更新用户的emailVerified为true，并返回新注册的用户信息
  // =======================================
  // 这个 validateType 里面有 email 和 iphone 两个类型，现在直接使用email的方式，忽略这个类型字段
  signUpByEmail: async (
    data: Omit<SignupRequest, 'validateType'>,
  ): Promise<{ result: false; message: string } | { result: true; user: User }> => {
    const { username, email, password, otp } = data;

    // 通过邮件查询用户是否存在
    const isExistByEmail = await UserRepo.queryUserByEmail(email);
    if (!isNil(isExistByEmail)) return { result: false, message: '邮箱已被注册' };

    // 通过用户名查询用户是否存在
    const isExistByUsername = await UserRepo.queryUserByUsername(username);
    if (!isNil(isExistByUsername)) return { result: false, message: '用户名已被注册' };

    // better-auth 的 signUpEmail这个插件里面返回的字段不止下面这两个，只是此处只使用这两个
    let res: { token: string; user: User } | undefined;

    try {
      res = (await auth.api.signUpEmail({
        body: {
          name: username,
          username,
          email,
          password,
        },
      })) as unknown as { token: string; user: User };

      // 使用验证码验证邮箱
      const checkOtp = await UserRepo.checkVerificationOTP(email, otp);
      if (!checkOtp) {
        // 验证不通过，删除用户
        await UserRepo.deleteUser(res.user.id);
        return { result: false, message: '验证码错误' };
      } else {
        // 验证通过，更新用户邮箱验证状态
        await prismaClient.user.update({
          where: {
            email: res.user.email,
          },
          data: {
            emailVerified: true,
          },
        });
      }
    } catch (err: any) {
      // 注册过程中出现异常，删除用户
      if (!isNil(res?.user.id)) await UserRepo.deleteUser(res.user.id);

      // 此处并没有抛错，返回的失败结果和验证失败的结果是一样的，message字段 同样可以用于提示
      return { result: false, message: '注册过程中出现异常', ...err.body };
    }

    return { result: true, user: res.user };
  },

  // 通过邮箱重置用户密码
  resetPasswordByEmail: async (data: ResetPasswordRequest) => {
    const { credential, otp, password } = data;
    const user = await UserRepo.queryUserByUsernameOrEmail(credential);

    if (isNil(user)) return { result: false, message: '用户不存在' };

    const res = await auth.api.resetPasswordEmailOTP({
      body: {
        email: user.email,
        otp,
        password,
      },
    });

    return { result: res.success, message: res.success ? '密码重置成功' : '密码重置失败' };
  },

  // 发送用户注册操作的邮件验证码
  sendOTP: async (
    email: string,
    type: `${EmailOTPType}`,
  ): Promise<{ result: SendOTPResponse; code: ContentfulStatusCode }> => {
    const limit = authConfig.mails?.OTP?.rateLimit ?? 60;

    // 检查发送频率
    const rateLimitCheck = await checkOTPRateLimit(email, type);

    // 不能发送
    if (!rateLimitCheck.canSend) {
      return {
        result: {
          message: `请在 ${rateLimitCheck.remainingTime} 秒后重试`,
          canSend: false,
          remainingTime: rateLimitCheck.remainingTime,
          nextSendTime: rateLimitCheck.nextSendTime,
        },
        code: 429,
      };
    }

    // 注册场景：使用自定义验证码逻辑
    if (type === 'email-verification') {
      const otp = generateOTP();
      await storeRegisterOTP(email, otp);
      await addOTPQueue(email, otp, type);
      await recordOTPSendTime(email, type);

      return {
        result: {
          message: '验证码发送成功',
          canSend: true,
          remainingTime: limit,
          nextSendTime: Date.now() + limit * 1000,
        },
        code: 200,
      };
    }

    // 其他场景（如忘记密码）：使用 Better Auth
    await auth.api.sendVerificationOTP({
      body: { email, type },
    });
    await recordOTPSendTime(email, type);

    return {
      result: {
        message: '验证码发送成功',
        canSend: true,
        remainingTime: limit,
        nextSendTime: Date.now() + limit * 1000,
      },
      code: 200,
    };
  },

  // 自定义验证邮箱验证码逻辑，不使用 better-auth 内部的验证方法
  checkVerificationOTP: async (email: string, otp: string) => {
    const isValid = await verifyRegisterOTP(email, otp);
    return isValid;
  },
};

export default UserRepo;
