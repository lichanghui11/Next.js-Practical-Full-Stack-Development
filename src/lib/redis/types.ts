import type { RedisOptions } from 'ioredis';

export interface RedisOption extends RedisOptions {
  name: string;
}

export interface RedisConfig {
  // 默认的连接名称
  default: string;

  // 连接列表
  connections: RedisOption[];
}
