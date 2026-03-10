import type { z } from 'zod';

import type {
  authResponseSchema,
  sessionSchema,
  signinRequestSchema,
  userDetailRequestParamsSchema,
  userSchema,
} from './user.schema';

// 用户类型
export type User = z.infer<typeof userSchema>;

// 会话类型
export type Session = z.infer<typeof sessionSchema>;

// 认证响应类型
export type AuthResponse = z.infer<typeof authResponseSchema>;

// 登陆请求类型
export type SigninRequest = z.infer<typeof signinRequestSchema>;

// 用户详情请求的 参数类型
export type UserDetailRequestParams = z.infer<typeof userDetailRequestParamsSchema>;

// Better Auth 推断类型
export type AuthUser = typeof import('@/lib/auth/server').auth.$Infer.Session.user;
export type AuthSession = typeof import('@/lib/auth/server').auth.$Infer.Session.session;
