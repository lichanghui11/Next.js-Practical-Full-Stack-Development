import { z } from 'zod';

import { authConfig } from '@/config/auth.config';

import { EmailOTPType } from './user.constants';

// 用户登陆请求的数据 schema
export const signinRequestSchema = z.object({
  username: authConfig.validates.username,
  password: authConfig.validates.password,
});

// 单个用户信息 schema
export const userSchema = z.object({
  id: z.string(),
  username: authConfig.validates.username,
  displayUsername: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string().meta({ description: '用户创建时间' }),
  updatedAt: z.string().meta({ description: '用户更新时间' }),
});

// 会话信息 schema
export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(), // 把会话和用户绑定，表示某个会话属于某个用户
  expires: z.string().meta({ description: '会话过期时间' }), // 控制会话有效期
  token: z.string(), // 登陆后返回给前端的身份凭证，（JWT）前端每次请求都携带这个 token 证明身份
  ipAddress: z.string().nullable(), // 生成会话时的用户ip地址
  userAgent: z.string().nullable(), // 生成会话时用户的设备/浏览器信息
});

// 认证响应 schema
export const authResponseSchema = z.object({
  // 如果为空，那么就是一个非成功场景，需要做对应的处理
  user: userSchema.nullable(),
  session: sessionSchema.nullable(),
});

// 登出响应 schema
export const authSignoutResponseSchema = z.object({
  message: z.string(),
});

// 用户详情请求时的参数 schema
export const userDetailRequestParamsSchema = z.object({
  id: z.string().min(1, 'ID 不能为空').meta({ description: '查询某个用户时传入的用户ID' }),
});

// 发送邮箱 OTP 请求的 schema
export const sendEmailVerificationOTPRequestSchema = z.object({
  email: z.email(),
});

// 发送忘记密码 OTP 请求的 schema
export const sendForgetPasswordOTPRequestSchema = z.object({
  credential: authConfig.validates.username.or(z.email()),
});

// 检查用户名是否存在的 请求 的 schema
export const checkUserExistsSchema = sendForgetPasswordOTPRequestSchema;

// 发送验证码 的响应的 schema
export const sendOTPResponseSchema = z.object({
  // 响应消息
  message: z.string(),

  // 是否可以继续发送验证码 - 在发送频率限制内为 false
  canSend: z.boolean(),

  // 发送频率限制时间
  remainingTime: z.number().optional(),

  // 下次可发送的时间戳
  nextSendTime: z.number().optional(),
});

// 检查用户名是否唯一的 请求 的 schema
export const CheckUsernameUniqueSchema = z.object({
  username: authConfig.validates.username,
});

// 检查邮箱是否唯一的 请求 的 schema
export const checkEmailUniqueSchema = z.object({
  email: z.email(),
});

// 用户注册请求的 schema
export const signupRequestSchema = z.object({
  username: authConfig.validates.username,
  password: authConfig.validates.password,
  email: z.email('请输入有效的邮箱地址'),
  otp: z.string().length(6, '验证码为6位数字'),
  validateType: z.enum(['email', 'phone']),
  image: z.string().optional(),
});

// 找回密码 请求的 schema
export const forgetPasswordRequestSchema = z.object({
  credential: authConfig.validates.username.or(z.email()),
  password: authConfig.validates.password,
  otp: z.string().length(6, '验证码为6位数字'),
});

// 用户注册响应的 schema
export const signupResponseSchema = z.object({
  result: z.boolean(),
  user: userSchema,
});

// 该结构体用于对查询当前类型的当前邮箱地址发送频率限制时间的查询。credential可以是用户名或邮箱地址
export const otpRateLimitRequestSchema = z.object({
  credential: authConfig.validates.username.or(z.email()),
  type: z.enum(Object.values(EmailOTPType) as `${EmailOTPType}`[]),
});
