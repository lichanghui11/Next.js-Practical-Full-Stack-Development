import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { authApi } from '@/api/auth';

export const useOTPSender = (sendApi: (credential: string) => Promise<Response>) => {
  const [isLoading, setIsLoading] = useState(false);

  // 调用传进来的发送验证码的 API 函数进行发送
  const sendOTP = useCallback(
    async (credential: string) => {
      // 正在发送中，不重复发送
      if (isLoading) return;

      // 发送之前，设置为加载中
      setIsLoading(true);

      try {
        const result = await sendApi(credential);
        const data = await result.json();

        if (result.ok) {
          toast.success('验证码发送成功', {
            description: '请查收您的邮箱',
          });
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
    [isLoading, sendApi],
  );

  const buttonText = useMemo(() => {
    if (isLoading) return '发送中...';
    return '发送验证码';
  }, [isLoading]);

  return {
    sendOTP,
    buttonText,
    isLoading,
  };
};

// 发送 注册 验证码
export const useSendVerificationOTP = () =>
  useOTPSender((email: string) => authApi.sendEmailVerificationOTP(email));

// 发送 忘记密码 验证码
export const useSendForgetPasswordOTP = () =>
  useOTPSender((email: string) => authApi.sendForgetPasswordOTP(email));
