import { z } from 'zod';

// 用户登陆请求的数据 schema
export const loginRequestSchema = z.object({
  username: z.string().min(1, '请输入用户名或邮箱'),
  password: z.string().min(6, '密码至少为6个字符'),
});

// 单个用户信息 schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
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
