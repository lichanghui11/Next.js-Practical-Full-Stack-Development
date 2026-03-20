/* eslint-disable vars-on-top */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP, openAPI, username } from 'better-auth/plugins';
import { Pool } from 'pg';

// 服务端 auth 配置
import { authConfig } from '@/config/auth.config';

import { addOTPQueue } from '../queue/utils';

const connectionString = `${process.env.DATABASE_URL}`;
if (!connectionString) {
  throw new Error('未找到数据库连接字符串：DATABASE_URL is not defined');
}

// 把类型挂到全局
declare global {
  var pgAuthPool: Pool | undefined;
  var prismaAuthApp: PrismaClient | undefined;
}
// 开发模式下使用单例模式，保证 连接池 和 prisma客户端 只创建一次，better-auth 不用创建单例，它会自动复用
const createPrisma = (adapter: PrismaPg) => {
  if (globalThis.prismaAuthApp) {
    return globalThis.prismaAuthApp;
  }
  return new PrismaClient({ adapter });
};
const pool =
  globalThis.pgAuthPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 2000,
  });
const adapter = new PrismaPg(pool);
const prisma = createPrisma(adapter);
if (process.env.NODE_ENV !== 'production') {
  globalThis.pgAuthPool = pool;
  globalThis.prismaAuthApp = prisma;
}
// ------------------------

const NextCookiesPlugin = nextCookies();
export const createServerAuth = () => {
  return betterAuth({
    // 配置数据库会话存储
    database: prismaAdapter(prisma, { provider: 'postgresql' }),

    // 配置邮箱密码登录
    emailAndPassword: {
      enabled: true,
      autoSignIn: false, // 禁止注册后自动登录
    },

    // 配置访问路径
    basePath: '/api/auth',

    // 配置插件
    plugins: [
      // 用户名登陆插件
      username(),

      /**
       *  配置 disableDefaultReference 为 false ，会使用网页展示 API文档 详情
       *  因为默认配置是不使用网页展示的
       * 如果不需要展示给他人查看，设置为 true，或不配置
       * 这是服务端功能，用于开发者查看 API
       * 客户端不需要知道文档的存在，所以不需要在客户端配置对应的插件
       */
      openAPI({ path: '/reference', disableDefaultReference: false }),

      emailOTP({
        allowedAttempts: authConfig.mails?.OTP?.allowedAttempts ?? 3,
        expiresIn: authConfig.mails?.OTP?.expire ?? 60 * 5,
        async sendVerificationOTP({ email, otp, type }) {
          console.error('🔥🔥🔥 sendVerificationOTP 回调被触发了！');
          console.error('参数 email:', email, 'type:', type, 'otp:', otp);

          if (type === 'sign-in') {
            // Send the OTP for sign in
          } else if (type === 'email-verification') {
            // Send the OTP for email verification

            await addOTPQueue(email, otp, type);
          } else {
            // Send the OTP for password reset
          }
        },
      }),
    ],
  });
};

// 这里必须要使用 auth 的名字，生成 user model的时候命令行脚本会使用这个名字会使用到
export const auth = createServerAuth();

/**
 * NextCookiePlugin 这个插件是需要 Next.js 环境的，
 * 生成种子数据的脚本里面会使用到 createServerAuth 这个工厂函数，遇到 NextCookiePlugin 会报错，
 * 因为种子脚本运行环境是 ts-node，不是 Next.js 环境
 */
auth.options.plugins.push(NextCookiesPlugin as any);
export interface AuthType {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
}
