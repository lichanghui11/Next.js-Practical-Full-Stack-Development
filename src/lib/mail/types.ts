import type AliyunClientObj from '@alicloud/dm20151123';
import type { $OpenApiUtil } from '@alicloud/openapi-core';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { ClientConfig as DefaultTencentCloudConfig } from 'tencentcloud-sdk-nodejs-common';
import type { ses as TencenClientObj } from 'tencentcloud-sdk-nodejs-ses';
import type { SendEmailRequest as DefaultTencentSendOptions } from 'tencentcloud-sdk-nodejs-ses/tencentcloud/services/ses/v20201002/ses_models';

//======================================================
// 邮件发送函数的 参数的类型
//======================================================

//==========
/**
 * SES：Simple Email Service
 * 所有邮件发送方式都共享这一套基础的参数，BaseMailSendOptions 是邮件的核心属性。
 */
// 邮件发送函数的参数 基础类型
export interface BaseMailSendOptions {
  // 发件人邮箱地址
  from?: string;

  // 发件人名称
  fromName?: string;

  // 收件人邮箱地址列表
  to: string[];

  // 邮件主题
  subject: string;

  // 抄送人邮箱地址列表 carbon copy
  cc?: string[];

  // 密送人邮箱地址列表 blind carbon copy
  bcc?: string[];

  // 回复邮箱地址
  replyTo?: string;

  // 回复邮箱名称
  replyToName?: string;

  // 模版变量（所有平台都支持模版渲染）
  vars?: Record<string, any>;
}

// 腾讯云邮件发送函数的 参数类型
export type TencentCloudSendMailOptions = BaseMailSendOptions & {
  templateId: number; // 腾讯云必填的 模版ID （number）
  // 这里排除掉已经封装的核心的通用参数，透传腾讯云的其他核心参数
  others?: Omit<
    DefaultTencentSendOptions,
    | 'FromEmailAddress'
    | 'Destination'
    | 'Subject'
    | 'Template'
    | 'Simple'
    | 'ReplyToAddresses'
    | 'vars'
  >;
};

// 阿里云邮件发送函数的 参数类型
// 阿里云的模版方式有两种：使用阿里云预设的模版ID ｜ 自定义模版文件路径（阿里云支持本地模版渲染）
export type AliyunSendMailOptions = BaseMailSendOptions &
  (
    | {
        templateId: string;
      }
    | { templatePath: string }
  ) & {
    others: Record<string, any> &
      // addressType 阿里云特有的参数：0=阿里云控制台配置的发件人；1=自定义发件人
      { addressType?: number };
  };

// SMTP 邮件发送函数的 参数类型
export type SmtpSendMailOptions = Omit<BaseMailSendOptions, 'subject'> & { subject?: string } & {
  templatePath: string; // SMTP 必填：本地模版文件路径
  others?: Omit<Mail.Options, 'replyTo' | 'replyName'>;
};

// 最终的邮件发送函数的 参数类型
export type MailSendOptions =
  | TencentCloudSendMailOptions
  | AliyunSendMailOptions
  | SmtpSendMailOptions;

// ======================================================
// 客户端配置参数
// SmtpMailClient: SMTP 邮件客户端类型，client实例的类来自于nodemailer导入
// AliyunMailClient: 阿里云邮件客户端类型，client实例的类来自于阿里云SDK导入
// TencentMailClient: 腾讯云邮件客户端类型，client实例的类来自于腾讯云SDK导入
// MailClient: 是几种客户端实例的联合类型
// ======================================================

export type DefaultAliyunConfig = $OpenApiUtil.Config;

export type DefaultSmtpConfig = SMTPConnection.Options;

// 基础的客户端配置
interface BaseMailClientConfig {
  name: string;
}

// aliyun 邮件客户端配置
interface AliyunMailClientConfig extends BaseMailClientConfig {
  type: 'aliyun';
  options: Omit<DefaultAliyunConfig, 'toMap'>;
  default: Required<Pick<BaseMailSendOptions, 'from'>> &
    Pick<BaseMailSendOptions, 'fromName' | 'replyTo' | 'replyToName'>;
}

// tencent 邮件客户端配置
interface TencentCloudMailClientConfig extends BaseMailClientConfig {
  type: 'tcloud';
  options: DefaultTencentCloudConfig;
  default: Required<Pick<BaseMailSendOptions, 'from'>>;
}

// smtp 邮件客户端配置
interface SmtpMailClientConfig extends BaseMailClientConfig {
  type: 'smtp';
  options: DefaultSmtpConfig;
  default: Required<Pick<BaseMailSendOptions, 'from'>> & Pick<BaseMailSendOptions, 'replyTo'>;
}

export type MailClientConfig =
  | AliyunMailClientConfig
  | TencentCloudMailClientConfig
  | SmtpMailClientConfig;

// 邮件配置
export interface MailConfig {
  defaultClient: string;
  clients: Array<MailClientConfig>;
}

//======================================================
// 客户端的 类型
//======================================================

// 阿里云邮件客户端类型
export interface AliyunMailClient extends Omit<AliyunMailClientConfig, 'options'> {
  client: AliyunClientObj;
}
// tencent 邮件客户端类型
export interface TencentMailClient extends Omit<TencentCloudMailClientConfig, 'options'> {
  client: InstanceType<typeof TencenClientObj.v20201002.Client>;
}

// smtp 邮件客户端类型
export interface SmtpMailClient extends Omit<SmtpMailClientConfig, 'options'> {
  client: Transporter<SMTPTransport.SentMessageInfo>;
}

export type MailClient = AliyunMailClient | TencentMailClient | SmtpMailClient;
