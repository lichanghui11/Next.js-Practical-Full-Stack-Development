import { z } from 'zod';

import type { AuthConfig } from '@/lib/auth/types';
import type { EmailOTPType } from '@/server/modules/user/user.constants';

export const authConfig: AuthConfig = {
  protectedPages: ['/blog/create', '/blog/edit'],
  validates: {
    username: z
      .string()
      .min(6, '用户名不能少于6个字符')
      .max(15, '用户名不能超过15个字符')
      .regex(/^[\w$]+$/, '用户名只能包含大小写字母、数字、$ 和 _'),
    password: z
      .string()
      .min(6, '密码不能少于6个字符')
      .max(32, '密码不能超过32个字符')
      .regex(/^[\w$]+$/, '密码只能包含大小写字母、数字、$ 和 _'),
  },
  mails: {
    OTP: {
      rateLimit: process.env.NODE_ENV === 'development' ? 20 : 60,
      allowedAttempts: 5,
      expire: process.env.NODE_ENV === 'development' ? 30 : 300,
      send: {
        'email-verification': {
          client: 'tcloud',
          templatePath: 'email-verification',
          subject: (_type: `${EmailOTPType}`) => (appname: string, code: string) =>
            `${appname}的用户注册邮件 | 您的验证码为：${code}`,
        },
        'forget-password': {
          client: 'aliyun',
          templatePath: 'forget-password',
          subject: (_type: `${EmailOTPType}`) => (appname: string, code: string) =>
            `${appname}的找回密码邮件 | 您的验证码为：${code}`,
        },
        // 'email-verification': {
        //   client: 'tcloud',
        //   templateId: 37672,
        //   subject: (_type: `${EmailOTPType}`) => (appname: string, code: string) =>
        //     `${appname}的用户注册邮件 | 您的验证码为：${code}`,
        // },
        // 'email-verification': {
        //   client: 'smtp',
        //   templatePath: 'email-verification',
        //   subject: (_type: `${EmailOTPType}`) => (appname: string, code: string) =>
        //     `${appname}的用户注册邮件 | 您的验证码为：${code}`,
        // },
      },
    },
  },
};
