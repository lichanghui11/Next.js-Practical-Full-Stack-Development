import type { Job } from 'bullmq';
import type Redis from 'ioredis';

import { Queue, Worker } from 'bullmq';
import { isNil } from 'lodash';

import type { EmailOTPType } from '@/server/modules/user/user.constants';

import { queueConfig } from '@/config/queue.config';
import { serverInstances } from '@/server/common/app';
import { sendOTPHandler } from '@/server/modules/user/user.otp';

/**
 *
 * @param redisClients 一个或多个 redis 客户端
 *  1. 队列完全复用外部传入的 Redis 客户端实例（redisClients 里的对象）；
 *  2. 不会让 BullMQ 自己创建新的 Redis 实例 / 连接；
 *  3. 队列的所有数据（任务、状态、重试规则等）都存储在这个复用的 Redis 实例中（而非新实例）。
 */
export const createQueue = (redisClients: { [key: string]: Redis }) => {
  const queues: { [key: string]: Queue } = {};
  // 拿到配置里面的所有队列名称
  const names = Object.keys(queueConfig);

  for (const name of names) {
    const { redis, ...options } = queueConfig[name];

    // 如果 redis 客户端不存在，抛出错误
    if (isNil(redisClients[redis])) {
      throw new Error(`Redis client "${redis}" for queue "${name}" not found`);
    }
    // 创建队列
    // name 是队列的唯一标识（如 OTP）；
    // connection 是指定给队列连接的 Redis 客户端实例
    queues[name] = new Queue(name, { connection: redisClients[redis], ...options });
  }

  return queues;
};

/**
 *
 * @param queueName
 * @param redisClients
 * @returns 队列对应的 redis 客户端
 */
export const getWorkerConnection = (queueName: string, redisClients: { [key: string]: Redis }) => {
  // 根据队列名称获取对应的 redis 客户端
  const { redis } = queueConfig[queueName];
  // 如果 redis 客户端不存在，抛出错误
  if (isNil(redisClients[redis])) {
    throw new Error(`Redis client "${redis}" for queue "${queueName}" not found`);
  }

  return redisClients[redis];
};

/**
 *
 * @param email 邮箱
 * @param code
 * @param type OTP 类型
 * 往队列中添加任务，如果队列不存在，直接同步发送邮件
 */
export const addOTPQueue = async (email: string, code: string, type: `${EmailOTPType}`) => {
  if (!isNil(serverInstances.queues.emailOTP)) {
    // 队列存在，添加任务
    return serverInstances.queues.emailOTP.add(type, { email, code });
  } else {
    return sendOTPHandler({ email, code }, type);
  }
};

const addOTPWorker = async () => {
  // 检查OTP队列是否已初始化
  if (!isNil(serverInstances.queues.OTP)) {
    // 创建bull/bullmq的Worker，监听"OTP"队列
    const worker = new Worker(
      // 队列名称，和生产者发送任务的队列名对应
      'OTP',
      // 任务处理函数：消费队列中的OTP任务
      async (job: Job) => {
        // 从任务中获取邮箱和验证码
        const { email, code } = job.data;
        // 执行发送OTP的逻辑
        await sendOTPHandler({ email, code }, job.name as `${EmailOTPType}`);
      },
      // 配置：指定Redis连接（bull/bullmq依赖Redis存储任务）
      { connection: getWorkerConnection('OTP', serverInstances.redis) },
    );
    // 监听任务完成事件（可在这里记录日志、清理资源等）
    worker.on('completed', (_job) => {
      console.log('OTP job completed');
    });
  }
};

// 增加 worker
export const addUserQueueWorker = async () => {
  await addOTPWorker();
};
