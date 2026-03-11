'use client';
import type { FC } from 'react';

import { Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { Button } from 'ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'ui/form';
import { Input } from 'ui/input';

import { useSigninForm, useSigninSubmit } from '../hooks';
import { AuthFormSkeleton } from '../skeleton';

const FormComponent: FC = () => {
  const form = useSigninForm();
  const submitHandler = useSigninSubmit();
  const searchParams = useSearchParams();
  const signupUrl = useMemo(() => {
    let url = '/auth/signup';
    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return url;
  }, [searchParams]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="!mt-4 space-y-3">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                    <Input
                      {...field}
                      className="pl-10"
                      // autoComplete 是 HTML 原生属性，username 是标准化值（对应 “用户名 / 账号”）；浏览器自动补全提示
                      autoComplete="username"
                      placeholder="请输入用户名或邮箱地址"
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                    <Input
                      {...field}
                      className="pl-10"
                      // autoComplete 是 HTML 原生属性，password 是标准化值（对应 “密码”）；浏览器自动补全提示
                      autoComplete="password"
                      placeholder="请输入密码"
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="flex justify-end">
          <Link
            href="/auth/forget-password"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            忘记密码？
          </Link>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="!mt-5 w-full">
          {form.formState.isSubmitting ? '登录中...' : '登录'}
        </Button>
      </form>
    </Form>
  );
};

export const SignInForm: FC = () => (
  <Suspense fallback={<AuthFormSkeleton />}>
    <FormComponent />
  </Suspense>
);
