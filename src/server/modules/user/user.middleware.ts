import { createMiddleware } from 'hono/factory';
import { isNil } from 'lodash';

import { auth } from '@/lib/auth/server';
import { createErrorResult } from '@/server/common/error';

export const AuthProtectedMiddleware = createMiddleware(async (ctx, next) => {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
  try {
    session = await auth.api.getSession({
      headers: ctx.req.raw.headers,
    });
  } catch (error) {
    ctx.set('user', null);
    ctx.set('session', null);

    return ctx.json(createErrorResult('服务器错误', error), 500);
  }

  if (isNil(session?.user)) {
    ctx.set('user', null);
    ctx.set('session', null);

    return ctx.json(createErrorResult('用户未认证'), 401);
  }

  // 注意：ctx.set(key, value) 是 Hono 存储请求上下文的正确方式（不是响应头）
  ctx.set('user', session.user);
  ctx.set('session', session);
  await next();
});
