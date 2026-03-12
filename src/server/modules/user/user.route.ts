import { describeRoute, validator } from 'hono-openapi';
import { isNil } from 'lodash';

import { createHonoApp } from '@/server/common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '@/server/common/error';
import { createResponse } from '@/server/common/response';
import { errorSchema, successMessageWithResultSchema } from '@/server/common/schema';
import { EmailOTPType } from '@/server/modules/user/user.constants';
import { AuthProtectedMiddleware } from '@/server/modules/user/user.middleware';
import { getOTPSendStatus } from '@/server/modules/user/user.otp';

import {
  authResponseSchema,
  authSignoutResponseSchema,
  checkEmailUniqueSchema,
  checkUserExistsSchema,
  CheckUsernameUniqueSchema,
  forgetPasswordRequestSchema,
  otpRateLimitRequestSchema,
  sendEmailVerificationOTPRequestSchema,
  sendForgetPasswordOTPRequestSchema,
  sendOTPResponseSchema,
  signinRequestSchema,
  signupRequestSchema,
  signupResponseSchema,
} from './user.schema';
import {
  getCurrentSession,
  getUser,
  queryUserByEmail,
  queryUserByUsername,
  queryUserByUsernameOrEmail,
  resetPasswordByEmail,
  sendOTP,
  signIn,
  signOut,
  signUpByEmail,
} from './user.service';

/**
 * 这里的 createHonoApp() 创建的不是"客户端"，
 * 而是一个小型的 Hono 路由器（Sub-Router）。
 * 它只是一个用来定义和收集路由的容器。
 */
const app = createHonoApp();
export const authPath = '/auth';
export const userTags = ['用户认证'];

export type AuthRoutes = typeof authRoutes;

export const authRoutes = app
  // 用户注册：通过邮箱和密码注册用户
  .post(
    '/sign-up',
    describeRoute({
      tags: userTags,
      summary: '邮箱注册',
      description: '创建新用户',
      responses: {
        ...createResponse(signupResponseSchema, 200, '用户注册成功'),
        ...createResponse(errorSchema, 400, '邮箱已被注册'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', signupRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { validateType, ...data } = c.req.valid('json');
        if (validateType !== 'email') throw new Error('目前仅支持邮箱注册');
        const res = await signUpByEmail(data);

        // 如果失败，使用错误信息创建一个错误结果
        if (!res.result) return c.json(createErrorResult(res.message), 400);

        return c.json(res, 201);
      } catch (error: any) {
        return c.json(createErrorResult('注册失败', error), 500);
      }
    },
  )

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
    validator('json', signinRequestSchema, defaultValidatorErrorHandler),
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
  )

  // 重置密码
  .post(
    '/reset-password',
    describeRoute({
      tags: userTags,
      summary: '重置密码',
      description: '用户通过邮箱重置密码',
      responses: {
        ...createResponse(errorSchema, 400, '请求数据验证失败，无效的重置令牌或密码'),
        ...createResponse(authResponseSchema, 200, '密码重置成功'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', forgetPasswordRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const data = c.req.valid('json');
        const result = await resetPasswordByEmail(data);

        if (!result.result) return c.json(createErrorResult(result.message), 400);

        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('密码重置失败', error), 500);
      }
    },
  )

  // 发送邮箱验证码
  .post(
    '/otp/email-verification',
    describeRoute({
      tags: userTags,
      summary: '发送邮箱验证码',
      description: '用户通过邮箱获取验证码',
      responses: {
        ...createResponse(errorSchema, 400, '请求数据验证失败，无效的邮箱地址'),
        ...createResponse(sendOTPResponseSchema, 200, '验证码发送成功'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', sendEmailVerificationOTPRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { email } = c.req.valid('json');
        const res = await sendOTP(email, EmailOTPType.EMAIL_VERIFICATION);

        return c.json(res.result, res.code);
      } catch (error) {
        return c.json(createErrorResult('验证码发送失败', error), 500);
      }
    },
  )

  // 忘记密码
  .post(
    '/otp/forget-password',
    describeRoute({
      tags: userTags,
      summary: '忘记密码',
      description: '用户通过邮箱获取忘记密码验证码',
      responses: {
        ...createResponse(errorSchema, 400, '请求数据验证失败，无效的邮箱地址或用户名'),
        ...createResponse(sendOTPResponseSchema, 200, '验证码发送成功'),
        ...createResponse(errorSchema, 404, '用户不存在'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', sendForgetPasswordOTPRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { credential } = c.req.valid('json');
        const user = await queryUserByUsernameOrEmail(credential);
        // 先查用户是否存在
        if (isNil(user)) return c.json(createErrorResult('用户不存在'), 404);

        const res = await sendOTP(user.email, EmailOTPType.FORGET_PASSWORD);
        return c.json(res.result, res.code);
      } catch (error) {
        return c.json(createErrorResult('忘记密码验证码发送失败', error), 500);
      }
    },
  )

  // 检查用户是否存在
  .post(
    '/check/user-exists',
    describeRoute({
      tags: userTags,
      summary: '检查用户是否存在',
      description: '通过用户名或邮箱检查用户是否存在',
      responses: {
        ...createResponse(errorSchema, 400, '请求数据验证失败，无效的用户名或邮箱'),
        ...createResponse(successMessageWithResultSchema, 200, '检查成功'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', checkUserExistsSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { credential } = c.req.valid('json');
        const user = await queryUserByUsernameOrEmail(credential);

        // 如果用户不存在，返回 false
        if (isNil(user)) return c.json({ result: false }, 200);
        // 如果用户存在，返回 true
        return c.json({ result: true }, 200);
      } catch (error) {
        return c.json(createErrorResult('检查用户是否存在失败', error), 500);
      }
    },
  )

  // 检查用户名是否唯一
  .post(
    '/check/username-unique',
    describeRoute({
      tags: userTags,
      summary: '检查用户名是否唯一',
      description: '检查用户名是否已被注册',
      responses: {
        ...createResponse(errorSchema, 400, '请求数据验证失败，无效的用户名'),
        // 这个成功的 schema 是通用的，里面包含两个字段 {result, message}
        ...createResponse(successMessageWithResultSchema, 200, '检查成功'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', CheckUsernameUniqueSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { username } = c.req.valid('json');
        const user = await queryUserByUsername(username);

        // 如果用户不存在，可以使用，返回 true
        if (isNil(user)) return c.json({ result: true, message: '用户名可以使用' }, 200);
        // 如果用户存在，不可使用，返回 false
        return c.json({ result: false, message: '用户名已被注册' }, 200);
      } catch (error) {
        return c.json(createErrorResult('检查用户名是否唯一失败', error), 500);
      }
    },
  )

  // 检查邮箱是否唯一
  .post(
    '/check/email-unique',
    describeRoute({
      tags: userTags,
      summary: '检查邮箱是否唯一',
      description: '检查邮箱是否已被注册',
      responses: {
        ...createResponse(errorSchema, 400, '请求数据验证失败，无效的邮箱'),
        // 这个成功的 schema 是通用的，里面包含两个字段 {result, message}
        ...createResponse(successMessageWithResultSchema, 200, '检查成功'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', checkEmailUniqueSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { email } = c.req.valid('json');
        const user = await queryUserByEmail(email);

        // 如果用户不存在，可以使用，返回 true
        if (isNil(user)) return c.json({ result: true, message: '邮箱可以使用' }, 200);
        // 如果用户存在，不可使用，返回 false
        return c.json({ result: false, message: '邮箱已被注册' }, 200);
      } catch (error) {
        return c.json(createErrorResult('检查邮箱是否唯一失败', error), 500);
      }
    },
  )

  // 获取是否可以发送验证码的状态
  .post(
    '/email-otp/status',
    describeRoute({
      tags: userTags,
      summary: '获取 OTP 发送状态',
      description: '获取邮箱验证码的发送状态，用于页面刷新后恢复倒计时',
      responses: {
        ...createResponse(sendOTPResponseSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 401, '无权限'),
        ...createResponse(errorSchema, 500, '服务器错误'),
      },
    }),
    validator('json', otpRateLimitRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { credential, type } = c.req.valid('json');
        const data = await getOTPSendStatus(credential, type);

        return c.json(data, 200);
      } catch (error) {
        return c.json(createErrorResult('获取状态失败', error), 500);
      }
    },
  );
