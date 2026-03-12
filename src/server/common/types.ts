import type { Queue } from 'bullmq';
import type Redis from 'ioredis';

// 用于存储服务器启动后的常驻内存变量
export interface ServerInstance {
  redis: { [key: string]: Redis };
  queues: { [key: string]: Queue };
}
