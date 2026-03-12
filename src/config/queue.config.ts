import type { QueueConfig } from '@/lib/queue/types';

// OTP是配置的名称，redis对应redis配置中的某个连接。而列队的配置，请自行查看bullmq官网文档
export const queueConfig: QueueConfig = {
  // OTP 就是这个队列的名称
  OTP: {
    // Redis 实例名称（对应项目中 Redis 配置的别名）
    redis: 'default',
    // 任务的默认执行选项
    defaultJobOptions: {
      // 重试次数
      attempts: 5,
      // 重试的退避策略
      backoff: {
        type: 'exponential', // exponential 指数退避策略; fixed 固定退避策略
        delay: 1000, // 延迟毫秒数
      },
    },
  },
};
