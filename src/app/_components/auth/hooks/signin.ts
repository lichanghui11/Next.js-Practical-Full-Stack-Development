'use client';
import type { DeepNonNullable } from 'utility-types';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { use, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { SigninRequest, User } from '@/server/modules/user/user.type';

import { authApi } from '@/api/auth';
import { signinRequestSchema } from '@/server/modules/user/user.schema';

import { AuthContext } from '../constants';
// 创建 设置全局登录用户状态 的函数
export const useSetAuth = () => {
  // 使用的是认证相关的上下文里面的 setAuth 函数
  const { setAuth } = use(AuthContext);
  return useCallback((auth: User | null) => setAuth(auth), [setAuth]);
};

/** 这里的设计思路是，
 * 使用 context 的方式来管理登录用户状态、设置用户登陆状态的函数
 * 在 hook 中使用这个 store ，其他地方直接使用这里的hook函数，做到调用的入口统一，如有修改也只需要更改入口
 */

// 创建登陆表单
export const useSigninForm = () => {
  const defaultValues: SigninRequest = {
    username: '',
    password: '',
  } as DeepNonNullable<SigninRequest>;

  return useForm<SigninRequest>({
    mode: 'all', // 验证触发时机 在 onChange、onBlur、onSubmit 时都验证
    // 表单验证器
    resolver: zodResolver(signinRequestSchema),
    defaultValues,
  });
};

// 创建登陆表单提交函数
export const useSigninSubmit = () => {
  const router = useRouter();
  const setAuth = useSetAuth();

  return useCallback(
    async (params: DeepNonNullable<SigninRequest>) => {
      try {
        await authApi.signIn(params, {
          onSuccess: async () => {
            try {
              const authUser = await authApi.getAuth();
              setAuth(authUser);
            } catch (error) {
              toast.error('获取登录用户信息失败', {
                description: (error as Error).message || '请重新登录',
              });
            }

            toast.success('登录成功');
            // 检查是否有回调的url参数
            const urlParams = new URLSearchParams(window.location.search);
            const callbackUrl = urlParams.get('callbackUrl');
            isNil(callbackUrl) ? router.replace('/') : router.replace(callbackUrl);
          },
          onError: (error) => {
            toast.error('登录失败', {
              description: (error as Error).message || '请检查用户名/邮箱和密码',
            });
          },
        });
      } catch (error) {
        toast.error('登录失败', {
          description: (error as Error).message || '服务器错误',
        });
      }
    },
    [authApi, router, setAuth],
  );
};
