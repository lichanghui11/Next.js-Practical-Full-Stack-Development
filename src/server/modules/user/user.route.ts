import { describeRoute, validator } from 'hono-openapi';
import { isNil } from 'lodash';

import { createHonoApp } from '@/server/common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '@/server/common/error';
import { createResponse } from '@/server/common/response';
import { errorSchema } from '@/server/common/schema';
import { AuthProtectedMiddleware } from '@/server/modules/user/user.middleware';

import { authResponseSchema, authSignoutResponseSchema, loginRequestSchema } from './user.schema';
import { getCurrentSession, getUser, signIn, signOut } from './user.service';

/**
 * 这里的 createHonoApp() 创建的不是"客户端"，
 * 而是一个小型的 Hono 路由器（Sub-Router）。
 * 它只是一个用来定义和收集路由的容器。
 */
const app = createHonoApp();
export const userPath = '/auth';
export const userTags = ['用户认证'];

export type AuthRoutes = typeof authRoutes;

export const authRoutes = app
  // 获取当前用户信息
  .get(
    '/me',
    describeRoute({
      tags: userTags,
      summary: '获取当前用户信息',
      description: '获取当前已认证用户的详细信息',
      responses: {
        ...createResponse(authResponseSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 401, '用户未认证'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    AuthProtectedMiddleware,
    async (c) => {
      try {
        const result = await getUser(c.req.raw);
        if (isNil(result)) {
          c.json(createErrorResult('认证失败', '用户不存在', 401) as any);
        }
        return c.json(result, 200);
      } catch (error: any) {
        return c.json(createErrorResult('登录失败', error), 500);
      }
    },
  )

  // 用户登陆
  .post(
    '/sign-in/username',
    describeRoute({
      tags: userTags,
      summary: '用户名或邮箱登陆',
      description: '用户可以使用用户名或邮箱登陆系统',
      responses: {
        ...createResponse(authResponseSchema, 200, '用户登陆成功'),
        ...createResponse(errorSchema, 400, '用户名或密码错误'),
        ...createResponse(errorSchema, 401, '用户未认证'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', loginRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { username, password } = c.req.valid('json');
        // 使用better auth 进行认证
        const result = await signIn(username, password);
        if (isNil(result) || isNil(result.token)) {
          c.json(createErrorResult('认证失败', '用户名或密码错误', 401));
        }
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('登陆失败', error), 500);
      }
    },
  )

  // 用户登出
  .post(
    '/sign-out',
    describeRoute({
      tags: userTags,
      summary: '用户登出',
      description: '注销当前用户会话',
      responses: {
        ...createResponse(authSignoutResponseSchema, 200, '用户登出成功'),
        ...createResponse(errorSchema, 500, '登出失败'),
      },
    }),
    AuthProtectedMiddleware,
    async (c) => {
      try {
        await signOut(c.req.raw);
        return c.json({ message: '用户登出成功' }, 200);
      } catch (error) {
        return c.json(createErrorResult('登出失败', error), 500);
      }
    },
  )

  // 获取当前用户会话信息
  .get(
    '/get-session',
    describeRoute({
      tags: userTags,
      summary: '获取当前用户会话信息',
      description: '获取当前用户会话的详细信息',
      responses: {
        ...createResponse(authResponseSchema, 200, '成功获取用户会话信息'),
        ...createResponse(errorSchema, 401, '用户未认证'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    AuthProtectedMiddleware,
    async (c) => {
      try {
        const session = await getCurrentSession(c.req.raw);
        return c.json(
          {
            user: session?.user || null,
            session: session?.session || null,
          },
          200,
        );
      } catch (error) {
        return c.json(createErrorResult('获取用户会话失败', error), 500);
      }
    },
  );
