import { isNil } from 'lodash';

import type { SigninRequest, User } from '@/server/modules/user/user.type';

import { authClient } from '@/lib/auth/client';

export const authApi = {
  // 用户名或邮箱 密码登录
  signIn: async (
    data: SigninRequest,
    options?: {
      rememberMe?: boolean;
      callBackUrl?: string; // 登录成功回调地址
      // 登陆成功回调（储存token到本地、埋点统计、自定义提示等）
      onSuccess?: (context?: any) => void;
      onError?: (context?: any) => void;
    },
  ) => {
    try {
      return await authClient.signIn.username(
        {
          username: data.username,
          password: data.password,
          callbackURL: options?.callBackUrl,
          rememberMe: options?.rememberMe,
        },
        {
          onSuccess: options?.onSuccess,
          onError: options?.onError,
        },
      );
    } catch (error) {
      if (options?.onError) {
        options?.onError?.(error);
        return;
      }
      throw error;
    }
  },

  // 用户登出
  signOut: async (option?: { onSuccess?: (context?: any) => void }) => {
    return await authClient.signOut({
      fetchOptions: {
        onSuccess: option?.onSuccess,
      },
    });
  },

  // 获取会话信息 - 异步方式
  getSession: async () => {
    return await authClient.getSession();
  },

  // 获取当前登陆用户信息
  getAuth: async () => {
    const session = await authClient.getSession();
    if (isNil(session) || isNil(session.data?.user)) {
      return null;
    }
    return session.data.user as any as User;
  },
};
