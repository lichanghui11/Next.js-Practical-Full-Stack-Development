'use client';
import type { FC } from 'react';

import { KeyRound, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { Button } from 'ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'ui/form';
import { Input } from 'ui/input';

import { useForgetPasswordForm, useForgetPasswordSubmit } from '../hooks/forget-password';
import { useSendForgetPasswordOTP } from '../hooks/otp';
import { AuthFormSkeleton } from '../skeleton';

const FormComponent: FC = () => {
  // 忘记密码表单和提交函数
  const form = useForgetPasswordForm();
  const submitHandler = useForgetPasswordSubmit();

  // 监听表单中指定字段的实时值变化，并返回该字段的当前值。
  const credential = form.watch('credential');
  // 忘记密码OTP发送函数和按钮文本
  const { sendOTP, buttonText, canSend } = useSendForgetPasswordOTP(credential);

  const disableSendBtn = useMemo(
    () =>
      // 禁用发送按钮的条件：
      // 1. 凭证字段为空
      // 2. 凭证字段有错误
      // 3. 表单正在提交中
      // 4. 不能发送 OTP 验证码 canSend
      credential.length === 0 ||
      !!form.formState.errors.credential ||
      form.formState.isSubmitting ||
      !canSend,
    [credential, form.formState.errors.credential, form.formState.isSubmitting, canSend],
  );

  // 发送 OTP 验证码
  // 教程中此处使用了 useCallback，但是编辑器提示这个函数不会被缓存
  const sendOTPHandler = async () => {
    if (!disableSendBtn) await sendOTP(credential);
  };

  const searchParams = useSearchParams();
  // 给登录页地址里面的带上原本链接的 query 参数
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
          name="credential"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <Input
                    {...field}
                    className="pl-10"
                    autoComplete="email"
                    placeholder="请输入您的用户名或邮箱地址"
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
                    onClick={() => {
                      const credential = form.getValues('credential');
                      if (credential) sendOTPHandler();
                    }}
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
                    autoComplete="new-password"
                    placeholder="请输入新密码"
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
                    autoComplete="new-password"
                    placeholder="请再次输入新密码"
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="!mt-5 w-full">
          {form.formState.isSubmitting ? '重置中...' : '重置密码'}
        </Button>
        <Button asChild variant="outline" className="!mt-5 w-full">
          <Link href={signinUrl}>返回登录</Link>
        </Button>
      </form>
    </Form>
  );
};
export const ForgetPasswordForm: FC = () => (
  <Suspense fallback={<AuthFormSkeleton />}>
    <FormComponent />
  </Suspense>
);
