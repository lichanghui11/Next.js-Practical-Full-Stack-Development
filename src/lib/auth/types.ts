import type { z } from 'zod';

import type { EmailOTPType } from '@/server/modules/user/user.constants';

import type {
  AliyunSendMailOptions,
  SmtpSendMailOptions,
  TencentCloudSendMailOptions,
} from '../mail/types';

export interface AuthConfig {
  protectedPages: string[];
  validates: {
    username: z.ZodString;
    password: z.ZodString;
  };
  // 用户认证配置 的类型
  mails?: {
    // 验证码邮件配置
    OTP?: {
      // 发送间隔，单位 秒
      rateLimit?: number;
      // 同一个用户名或邮箱的最大尝试次数
      allowedAttempts?: number;
      // 验证码有效期，单位 秒
      expire?: number;
      // 不同类型的 OTP 邮件的发送的配置参数类型
      send?: {
        [K in EmailOTPType]?: AliyunOTPSendConfig | SmtpOTPSendConfig | TencentCloudOTPSendConfig;
      };
    };
  };
}

interface BaseOTPSendConfig {
  // OTP 邮件主题生成函数
  subject?: (type: `${EmailOTPType}`) => (...args: any[]) => string;
}
// ======================================================
// to | vars | subject 字段说明
// OTP 是「单邮箱验证码场景」，接收人固定为 BaseOTPSendConfig 中的 email 字段（如 user@example.com），无需用户手动传 to 数组

// OTP 的 vars 固定包含 code（验证码）、expire（有效期），由处理器自动生成，用户传参可能覆盖关键变量

// OTP 主题由「场景类型（如找回密码）+ 动态参数」自动生成（如你之前分析的嵌套函数），用户手动传会破坏主题统一性
// ======================================================

type SmtpOTPSendConfig = BaseOTPSendConfig & {
  client: 'smtp';
} & Omit<SmtpSendMailOptions, 'to' | 'vars' | 'subject'>;

type TencentCloudOTPSendConfig = BaseOTPSendConfig & {
  client: 'tcloud';
} & (
    | Omit<Extract<TencentCloudSendMailOptions, { templateId: number }>, 'to' | 'vars' | 'subject'>
    | Omit<
        Extract<TencentCloudSendMailOptions, { templatePath: string }>,
        'to' | 'vars' | 'subject'
      >
  );

type AliyunOTPSendConfig = BaseOTPSendConfig & {
  client: 'aliyun';
} & (
    | Omit<Extract<AliyunSendMailOptions, { templateId: string }>, 'to' | 'vars' | 'subject'>
    | Omit<Extract<AliyunSendMailOptions, { templatePath: string }>, 'to' | 'vars' | 'subject'>
  );
