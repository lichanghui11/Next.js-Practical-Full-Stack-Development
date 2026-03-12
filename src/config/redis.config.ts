import type { RedisConfig } from '@/lib/redis/types';
/**
 * ✅ 指向规则：default 的值必须严格匹配 connections 数组中某一个对象的 name 字段值
 * （比如配置里 default: 'default' 对应 name: 'default'），否则会提示 “找不到默认连接”。
 */
export const redisConfig: RedisConfig = {
  // 指定默认使用的 Redis 连接名称
  default: 'default',
  connections: [
    // 数组里可以配置多个 Redis 连接（比如同时连测试 / 生产 Redis）
    {
      // 给这个 Redis 连接起一个唯一标识名
      name: 'default',
      // Redis 服务器的 IP / 域名
      host: process.env.REDIS_HOST || 'localhost',
      // Redis 服务器的端口号
      port: Number.parseInt(process.env.REDIS_PORT || '6379'),
      // Redis 服务器的密码
      password: process.env.REDIS_PASSWORD || '',
      // 指定连接的 Redis 数据库编号（默认是 0）
      db: Number.parseInt(process.env.REDIS_DB || '0'),
      // 设为 null 表示 “无限重试”（直到连接成功 / 超时）
      maxRetriesPerRequest: null,
    },
  ],
};
