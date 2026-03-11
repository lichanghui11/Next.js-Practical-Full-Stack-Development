'use client';
import type { FC } from 'react';

import { KeyRound, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { Button } from 'ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'ui/form';
import { Input } from 'ui/input';

import { useSendVerificationOTP } from '../hooks/otp';
import { useSignupForm, useSignupSubmit } from '../hooks/signup';
import { AuthFormSkeleton } from '../skeleton';

const FormComponent: FC = () => {
  const form = useSignupForm();
  const submitHandler = useSignupSubmit();

  const { sendOTP, buttonText } = useSendVerificationOTP();
  const username = form.watch('username');
  const email = form.watch('email');

  const disableSendBtn = useMemo(() => {
    // 禁用发送按钮的条件：用户名或邮箱为空，或表单提交中，或有错误
    return (
      username.length === 0 ||
      email.length === 0 ||
      !!form.formState.errors.username ||
      !!form.formState.errors.email ||
      form.formState.isSubmitting
    );
  }, [
    username,
    email,
    form.formState.errors.username,
    form.formState.errors.email,
    form.formState.isSubmitting,
  ]);

  // 发送 OTP 验证码
  // 教程中此处使用了 useCallback，但是编辑器提示这个函数不会被缓存
  const sendOTPHandler = async () => {
    if (!disableSendBtn) await sendOTP(email);
  };

  // 拿 query 参数： ?email=example@example.com
  const searchParams = useSearchParams();

  // 注册成功之后，跳转到登录页，把 query 原样传递过去
  const signinUrl = useMemo(() => {
    let url = '/auth/signin';
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    if (params.toString()) url += `?${params.toString()}`;

    return url;
  }, [searchParams]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="!mt-4 space-y-3">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <Input
                    {...field}
                    className="pl-10"
                    autoComplete="username"
                    placeholder="请输入用户名或邮箱地址"
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <Input
                    {...field}
                    className="pl-10"
                    autoComplete="email"
                    placeholder="请输入邮箱地址"
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                    <Input
                      {...field}
                      className="pl-10"
                      placeholder="请输入6位验证码"
                      maxLength={6}
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disableSendBtn}
                    onClick={sendOTPHandler}
                    className="whitespace-nowrap"
                  >
                    {buttonText}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <Input
                    {...field}
                    className="pl-10"
                    type="password"
                    autoComplete="password"
                    placeholder="请输入密码"
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plainPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <Input
                    {...field}
                    className="pl-10"
                    type="password"
                    placeholder="请再次输入密码"
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="!mt-5 w-full">
          {form.formState.isSubmitting ? '注册中...' : '注册'}
        </Button>
        <Button asChild className="!mt-5 w-full">
          <Link href={signinUrl}>登录</Link>
        </Button>
      </form>
    </Form>
  );
};

export const SignupForm: FC = () => {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <FormComponent />
    </Suspense>
  );
};
