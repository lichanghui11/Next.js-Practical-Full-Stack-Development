import type { Env } from 'hono';

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { addUserQueueWorker, createQueue } from '@/lib/queue/utilis';
import { createRedisClients } from '@/lib/redis/client';

// 后端启动器
// 为了优化执行，我们需要一次性创建所有客户端实例，并把它们赋值给一个全局变量，
// 而不是每次用到一个客户端连接时都去创建一个新的redis实例。
// 这个行为就需要在启动整个后端的hono服务器时就执行好，否则在后端api中拿不到这个全局变量。
// 所以，我们需要写一个后端启动器，在创建hono服务器之前执行该启动器，
// 在启动器内遍历配置中的所有redis连接，并为这些连接创建实例，然后赋值给一个全局服务端变量
import type { ServerInstance } from './types';

// 启动服务器后的常驻内存变量
export const serverInstances: ServerInstance = {
  redis: {},
  queues: {},
};

// 服务器启动函数
export const beforeServer = async () => {
  serverInstances.redis = createRedisClients();
  serverInstances.queues = createQueue(serverInstances.redis);
  // 仅在服务器启动时创建一次 Worker
  await addUserQueueWorker();
};

const createHonoApp = <E extends Env>() => {
  // 在这里可以设置日志，中间件，鉴权等。
  const app = new Hono<E>();
  app.use(prettyJSON({ space: 2, force: true }));
  app.use(logger());
  app.notFound((c) => c.json({ message: 'API route not found', ok: false }, 404));
  app.onError((err, c) => {
    console.error('Unhandled API Error （未处理的 API 错误）:', err);
    return c.json({ message: err.message, ok: false }, 500);
  });

  return app;
};
export { createHonoApp };

/**
 * 为了让层次更加的清晰，我使用这个 /server/common/app.ts 文件来专门创建 Hono 实例和使用中间件，不要在其他地方再重复使用中间件
 */
