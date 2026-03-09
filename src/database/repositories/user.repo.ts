import { isNil } from 'lodash';

import prismaClient from '@/database/client/app-client';
import { auth } from '@/lib/auth/server';

const UserRepo = {
  // 获取当前用户会话信息
  getCurrentSession: async (req: Request) => {
    return await auth.api.getSession({
      headers: req.headers,
    });
  },

  // 用户登陆：支持用户名或邮箱
  signIn: async (usernameOrEmail: string, password: string) => {
    // 先通过用户名或邮箱查出用户
    const user = await prismaClient.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (isNil(user)) return null;

    // 使用 Better Auth 内部验证方法
    const res = await auth.api.signInEmail({
      body: {
        email: user.email,
        password,
      },
    });

    return res;
  },

  // 用户登出
  signOut: async (req: Request) => {
    return await auth.api.signOut({
      headers: req.headers,
    });
  },

  // 获取用户信息
  getUser: async (req: Request) => {
    const session = await UserRepo.getCurrentSession(req);
    return session?.user || null;
  },
};

export default UserRepo;
