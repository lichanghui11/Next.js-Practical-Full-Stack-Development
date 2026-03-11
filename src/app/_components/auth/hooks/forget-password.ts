'use client';
import type { DeepNonNullable } from 'utility-types';
import type { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { authApi } from '@/api/auth';
import { authConfig } from '@/config/auth.config';
import { forgetPasswordRequestSchema } from '@/server/modules/user/user.schema';

import { getDefaultValues } from '../../blog-components/submit-form/utils';

// 检查用户是否存在 的hook
const isUserExists = async (data: { credential: string }) => {
  const val = data.credential;
  // 入参数为空，返回 true
  if (isNil(val) || !val.length) return true;

  const result = await authApi.checkUserExists(val);
  // 请求结果未成功，直接返回 false
  // 这里是教程的写法，但是我感觉不应该直接返回 false,应该返回一个错误信息
  if (!result.ok) return false;

  // 这里是请求成功之后的结果，可能存在（true）也可能不存在（false）
  const { result: isExist } = await result.json();
  return isExist;
};

// 忘记密码表单 schema
const forgetPasswordFormSchema = forgetPasswordRequestSchema
  .extend({
    plainPassword: authConfig.validates.password,
  })
  .superRefine(async (data, ctx) => {
    // credential 这个字段存在，且这个字段没有校验错误
    if (data.credential && !ctx.issues.some((issue) => issue.path?.includes('credential'))) {
      const exists = await isUserExists(data);
      if (!exists) {
        ctx.addIssue({
          code: 'custom',
          message: '用户不存在',
          path: ['credential'],
        });
      }
    }
  });

type ForgetPasswordFormType = z.infer<typeof forgetPasswordFormSchema>;

// 忘记密码表单 构建函数
export const useForgetPasswordForm = () => {
  const defaultValues = useMemo(() => {
    return getDefaultValues<ForgetPasswordFormType, ForgetPasswordFormType>([
      'credential',
      'otp',
      'password',
      'plainPassword',
    ]);
  }, []);

  return useForm<ForgetPasswordFormType>({
    mode: 'all',
    resolver: zodResolver(forgetPasswordFormSchema),
    defaultValues,
  });
};

// 忘记密码表单 提交函数
export const useForgetPasswordSubmit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    async (params: DeepNonNullable<ForgetPasswordFormType>) => {
      const { plainPassword: _, ...rest } = params;
      try {
        const result = await authApi.resetPassword(rest);

        if (!result.ok) {
          toast.error('密码重置失败', {
            description: (await result.json()).message,
          });
        }

        let signinPath = '/auth/signin';

        const urlParams = new URLSearchParams();

        searchParams.forEach((value, key) => {
          urlParams.set(key, value);
        });

        if (urlParams.toString()) {
          signinPath += `?${urlParams.toString()}`;
        }
        router.push(signinPath);
      } catch (err) {
        toast.error('密码重置失败', {
          description: (err as Error).message || '服务器错误',
        });
      }
    },
    [router, searchParams],
  );
};
