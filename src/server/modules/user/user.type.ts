import type { z } from 'zod';

import type {
  authResponseSchema,
  forgetPasswordRequestSchema,
  sendOTPResponseSchema,
  sessionSchema,
  signinRequestSchema,
  signupRequestSchema,
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

// 验证码邮件内容中的参数变量的类型
export interface EmailOTPPayload {
  email: string;
  code: string;
}

// 用户注册请求的类型
export type SignupRequest = z.infer<typeof signupRequestSchema>;

// 找回密码 请求的类型
export type ResetPasswordRequest = z.infer<typeof forgetPasswordRequestSchema>;

// 发送 OTP验证码 响应的类型
export type SendOTPResponse = z.infer<typeof sendOTPResponseSchema>;
