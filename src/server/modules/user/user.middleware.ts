import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
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
    throw new HTTPException(500, {
      res: new Response(JSON.stringify(createErrorResult('服务器错误', error))),
    });
  }

  if (isNil(session?.user)) {
    ctx.set('user', null);
    ctx.set('session', null);
    throw new HTTPException(401, {
      res: new Response(JSON.stringify(createErrorResult('用户未认证', 401))),
    });
  }

  ctx.set('user', session.user);
  ctx.set('session', session);
  await next();
});
