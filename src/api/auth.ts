import { isNil } from 'lodash';

import type { AuthRoutes } from '@/server/modules/user/user.route';
import type {
  OTPRateLimitRequest,
  ResetPasswordRequest,
  SigninRequest,
  SignupRequest,
  User,
} from '@/server/modules/user/user.type';

import { authClient } from '@/lib/auth/client';
import { buildClient, fetchApi } from '@/lib/rpc.client';
import { authPath } from '@/server/modules/user/user.constants';

// 这里需要传入泛型，在使用这个客户端时才会有路由的类型提示
const authClientRpc = buildClient<AuthRoutes>(authPath);

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
    return authClient.signOut({
      fetchOptions: {
        onSuccess: option?.onSuccess,
      },
    });
  },

  // 获取会话信息 - 异步方式
  getSession: async () => {
    return authClient.getSession();
  },

  // 获取当前登陆用户信息
  getAuth: async () => {
    const session = await authClient.getSession();
    if (isNil(session) || isNil(session.data?.user)) {
      return null;
    }
    return session.data.user as any as User;
  },

  // 通过 邮箱验证码 注册用户 未使用Better Auth 内部的注册方法
  signUp: async (data: SignupRequest) => {
    return fetchApi(authClientRpc, async (c) => {
      return c['sign-up'].$post({ json: data });
    });
  },

  // 重置密码
  resetPassword: async (data: ResetPasswordRequest) => {
    return fetchApi(authClientRpc, async (c) => {
      return c['reset-password'].$post({ json: data });
    });
  },

  // 往邮箱发送验证码-邮箱认证
  // 这里没有使用 authClient 客户端的方法
  sendEmailVerificationOTP: async (email: string) => {
    return fetchApi(authClientRpc, async (c) => {
      return c.otp['email-verification'].$post({ json: { email } });
    });
  },

  // 往邮箱发送验证码-忘记密码
  sendForgetPasswordOTP: async (credential: string) => {
    return fetchApi(authClientRpc, async (c) => {
      return c.otp['forget-password'].$post({ json: { credential } });
    });
  },

  // 通过用户名或邮箱验证用户是否存在
  checkUserExists: async (credential: string) => {
    return fetchApi(authClientRpc, async (c) => {
      return c.check['user-exists'].$post({ json: { credential } });
    });
  },

  // 检测用户名是否唯一
  checkUsernameUnique: async (username: string) => {
    return fetchApi(authClientRpc, async (c) => {
      return c.check['username-unique'].$post({ json: { username } });
    });
  },

  // 检测邮箱是否唯一
  checkEmailUnique: async (email: string) => {
    return fetchApi(authClientRpc, async (c) => {
      return c.check['email-unique'].$post({ json: { email } });
    });
  },

  // 获取是否可以发送验证码状态
  getOTPStatus: async (data: OTPRateLimitRequest) => {
    return fetchApi(authClientRpc, async (c) => {
      return c['email-otp'].status.$post({ json: data });
    });
  },
};
