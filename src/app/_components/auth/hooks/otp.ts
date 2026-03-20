import { isNil } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { EmailOTPType } from '@/server/modules/user/user.constants';

import { authApi } from '@/api/auth';
import { authConfig } from '@/config/auth.config';

interface CheckCountdownPayload {
  credential: string;
  type: `${EmailOTPType}`;
  refs: { initialized: boolean; initializing: boolean };
  setCountdown: (time: number) => void;
}

const checkCountdown = async ({ credential, type, refs, setCountdown }: CheckCountdownPayload) => {
  if (isNil(credential) || refs.initialized || refs.initializing) return;

  if (
    // 忘记密码功能 + credential字段不合法 + credential字段不是合法的邮件
    type === 'forget-password' &&
    !authConfig.validates.username.safeParse(credential).success &&
    !z.email().safeParse(credential).success
  )
    return;

  // 邮箱认证功能 + 邮箱格式不合法
  if (type === 'email-verification' && !z.email().safeParse(credential).success) return;

  refs.initializing = true;

  try {
    // 拿到是否可以发送验证码的状态
    const result = await authApi.getOTPStatus({ credential, type });
    if (result.ok) {
      const data = await result.json();
      if (!data.canSend && data.remainingTime) {
        // 如果还不可以重新发送验证码 且 有剩余时间
        setCountdown(data.remainingTime);
      } else {
        // 如可以发送，则直接倒计时置零
        setCountdown(0);
      }
    }
  } catch (error) {
    console.error('获取 OTP 失败：', error);
  } finally {
    // 【状态重置】：无论成功/失败，最终标记“初始化完成”+“停止初始化中”
    refs.initialized = true;
    refs.initializing = false;
  }
};

export const useOTPSender = (
  sendApi: (credential: string) => Promise<Response>,
  credential: string,
  type: `${EmailOTPType}`,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const initializedRef = useRef(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    // 任何变动都检查倒计时
    checkCountdown({
      credential,
      type,
      refs: { initialized: initializedRef.current, initializing: initializingRef.current },
      setCountdown,
    });
  }, [initializedRef, initializingRef, credential, type]);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // 当凭证变化的时候重置初始化状态
  useEffect(() => {
    if (credential) {
      initializedRef.current = false;
    }
  }, [credential]);

  // 调用传进来的发送验证码的 API 函数进行封装这个发送函数
  const sendOTP = useCallback(
    async (credential: string) => {
      // 正在发送中 || 倒计时还有剩余时间，不重复发送
      if (countdown > 0 || isLoading) return;

      // 发送之前，设置为加载中
      setIsLoading(true);

      try {
        const result = await sendApi(credential);
        const data = await result.json();

        if (result.ok) {
          toast.success('验证码发送成功', {
            description: '请查收您的邮箱',
          });

          // 发送成功之后开始倒计时
          if (data.remainingTime) {
            setCountdown(data.remainingTime);
          }
        } else if (result.status === 429) {
          toast.warning('发送过于频繁，请稍后再试', {
            description: data.message || '请稍后重试',
          });

          // 设置剩余时间
          if (data.remainingTime) {
            setCountdown(data.remainingTime);
          }
        } else {
          toast.error('验证码发送失败', {
            description: data.message || '请稍后重试',
          });
        }
      } catch (error) {
        toast.error('验证码发送失败', {
          description: error instanceof Error ? error.message : '服务器错误',
        });
      } finally {
        // 无论成功失败，都设置为加载完成
        setIsLoading(false);
      }
    },
    [isLoading, countdown, sendApi],
  );

  const buttonText = useMemo(() => {
    if (isLoading) return '发送中...';
    if (countdown > 0) return `${countdown} 秒后重新发送`;
    return '发送验证码';
  }, [isLoading, countdown]);
  const canSend = useMemo(() => countdown <= 0 && !isLoading, [countdown, isLoading]);

  return {
    sendOTP,
    buttonText,
    isLoading,
    countdown,
    canSend,
  };
};

// 发送 注册 验证码
export const useSendVerificationOTP = (email: string) =>
  useOTPSender(
    async (email: string) => authApi.sendEmailVerificationOTP(email),
    email,
    'email-verification',
  );

// 发送 忘记密码 验证码
export const useSendForgetPasswordOTP = (email: string) =>
  useOTPSender(
    async (email: string) => authApi.sendForgetPasswordOTP(email),
    email,
    'forget-password',
  );
