import Redis from 'ioredis';
import { isNil, omit } from 'lodash';

import { redisConfig } from '@/config/redis.config';

export const createRedisClients = () => {
  const clients: { [key: string]: Redis } = {};

  for (const connection of redisConfig.connections) {
    const client = new Redis({
      ...omit(connection, 'name'),
      lazyConnect: true,
      // retryStrategy: () => null, // 禁用自动重连
    });

    client.on('error', (err) => {
      console.error(`Redis connection error [${connection.name}]:`, err.message);
    });

    clients[connection.name] = client;
  }

  return clients;
};

export const getRedisClient = (clients: { [key: string]: Redis }, name?: string) => {
  const cName = name || redisConfig.default;
  if (isNil(clients[cName])) {
    throw new Error(`Redis client ${cName} not found`);
  }
  return clients[cName];
};
