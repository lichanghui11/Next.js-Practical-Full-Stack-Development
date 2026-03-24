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
import { getDefaultValues } from '@/app/_components/blog-components/submit-form/utils';
import { authConfig } from '@/config/auth.config';
import { signupRequestSchema } from '@/server/modules/user/user.schema';

// isUsernameOrEmailUnique这个规则用于用户名或密码的唯一性验证
const isUsernameOrEmailUnique =
  async (type: 'username' | 'email') => async (data: { value: string }) => {
    // { value: 'username' | 'email' }
    const val = data.value;

    if (isNil(val) || !val.length) return true;

    const result =
      type === 'username'
        ? await authApi.checkUsernameUnique(val)
        : await authApi.checkEmailUnique(val);

    if (!result.ok) return false;
    const { result: isUnique } = await result.json();

    return isUnique;
  };

// plainPassword用于做密码确认，并不会传给后端
const signupFormSchema = signupRequestSchema
  .extend({
    plainPassword: authConfig.validates.password,
  })
  .refine((data) => data.password === data.plainPassword, {
    message: '两次输入的密码不一致',
    // 指定错误归属的字段（这里指向 plainPassword，前端可根据该字段显示错误）。
    path: ['plainPassword'],
  })
  // superRefine() 方法添加异步自定义校验，检查用户名 / 邮箱是否已被注册（需要查询数据库）。
  // 参数 data 是表单数据，ctx 是校验上下文（用于添加错误、获取已有错误）。
  .superRefine(async (data, ctx) => {
    // username这个字段存在，且没有校验错误（格式正确）
    if (data.username && !ctx.issues.some((issue) => issue.path?.includes('username'))) {
      const useIsUnique = await isUsernameOrEmailUnique('username');
      const isUnique = await useIsUnique({ value: data.username });
      if (!isUnique) {
        ctx.addIssue({
          code: 'custom',
          message: '用户名重复，请重新填写',
          path: ['username'],
        });
      }
    }

    // email这个字段存在，且没有校验错误（格式正确）
    if (data.email && !ctx.issues.some((issue) => issue.path?.includes('email'))) {
      const useIsUnique = await isUsernameOrEmailUnique('email');
      const isUnique = await useIsUnique({ value: data.email });
      if (!isUnique) {
        ctx.addIssue({
          code: 'custom',
          message: '邮箱已存在，请重新填写',
          path: ['email'],
        });
      }
    }
  });

type SignupFormType = z.infer<typeof signupFormSchema>;

// 注册功能的 表单
export const useSignupForm = () => {
  // 生成一份默认的数据
  const defaultValues = useMemo(() => {
    const values = getDefaultValues(['username', 'email', 'otp', 'password', 'plainPassword']);

    return { ...values, validateType: 'email' } as SignupFormType;
  }, []);

  return useForm<SignupFormType>({
    // 仅在输入框失焦后触发校验，避免每次输入都请求后端
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    // 对接第三方库的校验器, 这里使用 zod 校验器
    resolver: zodResolver(signupFormSchema),
    // 表单初始值
    defaultValues,
  });
};

// 注册表单的 提交函数
export const useSignupSubmit = () => {
  const router = useRouter();
  // 同步获取查询参数对象
  const searchParams = useSearchParams();

  return useCallback(
    async (params: DeepNonNullable<SignupFormType>) => {
      try {
        const { plainPassword: _, ...rest } = params;
        const result = await authApi.signUp(rest);

        if (!result.ok) {
          toast.error('注册失败', {
            description: (await result.json()).message,
          });
        }

        // 注册成功后，跳转到登录页
        let signinPath = '/auth/signin';

        // 创建一个空的查询参数对象（相当于对应 ? 后面无任何参数）；
        const urlParams = new URLSearchParams();
        searchParams.forEach((value, key) => urlParams.append(key, value));

        if (urlParams.toString()) {
          signinPath += `?${urlParams.toString()}`;
        }

        router.push(signinPath);
      } catch (err) {
        toast.error('注册失败', {
          description: (err as Error).message || '服务器错误，请稍后重试',
        });
      }
    },
    [router, searchParams],
  );
};
