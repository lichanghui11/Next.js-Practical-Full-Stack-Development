import type { QueueOptions } from 'bullmq';

export interface QueueOption extends Omit<QueueOptions, 'connection'> {
  redis: string;
}

export interface QueueConfig {
  [queueName: string]: QueueOption;
}

/**
 * QueueOption: 一个列队的配置选项，继承自bullmq的QueueOptions。但此处，我们不直接使用redis连接实例，而是根据src/config/redis.ts中配置的redis连接名称来配置列队。所以，去除connection选项，添加redis选项
 */
