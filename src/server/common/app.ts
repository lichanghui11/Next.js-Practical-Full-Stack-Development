import type { Env } from 'hono';

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
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
