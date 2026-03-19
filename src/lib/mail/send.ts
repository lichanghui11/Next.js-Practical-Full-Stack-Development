import type { SendEmailRequest as DefaultTencentSendOptions } from 'tencentcloud-sdk-nodejs-ses/tencentcloud/services/ses/v20201002/ses_models';

import * as AliyunSender from '@alicloud/dm20151123';
import * as AliyunUtil from '@alicloud/tea-util';
import Email from 'email-templates';
import { isNil } from 'lodash';
import path from 'node:path';

import { customMerge } from '@/app/utils/custom-merge';

import type {
  AliyunMailClient,
  AliyunSendMailOptions,
  SmtpMailClient,
  SmtpSendMailOptions,
  TencentCloudSendMailOptions,
  TencentMailClient,
} from './types';

// email-template 实例
const emailTemplates = new Email({
  send: false,
  views: {
    root: path.join(process.cwd(), 'files/email-templates'),
    options: {
      extension: 'pug',
    },
  },
});

// =====================================
// SMTP 发送邮件
// =====================================
export const sendSmtpMail = async (params: SmtpMailClient, options: SmtpSendMailOptions) => {
  const { others, templatePath, vars, ...rest } = options;

  const newOptions: Record<string, any> = customMerge(
    // 目标数据
    {
      ...rest,
      from: options.from ?? params.default.from,
      replyTo: options.replyTo ?? params.default.replyTo,
      ...others,
    },
    // 源数据
    options.others ?? {},
    // 使用源数据 替换 目标数据
    'replace',
  );

  // 用 vars 渲染 HTML 模板 → 生成邮件 HTML 内容
  newOptions.html = await emailTemplates.render(`${templatePath.toString()}/html`, vars);
  newOptions.text = await emailTemplates.render(`${templatePath.toString()}/text`, vars);

  return params.client.sendMail(newOptions);
};

//=====================================
// 腾讯
//=====================================
export const sendTencentMail = async (
  params: TencentMailClient, // 腾讯云客户端配置（含client实例、default默认参数）
  options: TencentCloudSendMailOptions, // 通用发送选项
) => {
  // 步骤1：通用选项 → 腾讯云SDK参数名 + 合并默认配置
  const newOptions: DefaultTencentSendOptions = customMerge(
    {
      // 1. 通用参数映射到腾讯云SDK参数名（核心转换）
      FromEmailAddress: options.from ?? params.default.from, // 发件人：通用from → 腾讯云FromEmailAddress
      Destination: options.to, // 收件人：通用to数组 → 腾讯云Destination
      Subject: options.subject, // 主题：直接复用
      ReplyToAddresses: options.replyTo, // 回复邮箱：通用replyTo → 腾讯云ReplyToAddresses
      Cc: options.cc, // 抄送：直接复用
      Bcc: options.bcc, // 密送：直接复用
    },
    options.others ?? {}, // 合并自定义扩展参数（others）
    'replace', // 合并策略：自定义覆盖默认
  ) as DefaultTencentSendOptions;

  // 步骤2：根据配置选择腾讯云平台模板或本地渲染内容
  if ('templateId' in options) {
    newOptions.Template = {
      TemplateID: Number(options.templateId), // 通用templateId（数字）→ 腾讯云TemplateID
      TemplateData: JSON.stringify(options.vars), // 通用vars → 腾讯云要求JSON字符串
    };
  } else if ('templatePath' in options) {
    const html = await emailTemplates.render(
      `${options.templatePath.toString()}/html`,
      options.vars,
    );
    const text = await emailTemplates.render(
      `${options.templatePath.toString()}/text`,
      options.vars,
    );

    newOptions.Simple = {
      Html: Buffer.from(html).toString('base64'),
      Text: Buffer.from(text).toString('base64'),
    };
  } else {
    throw new Error('腾讯云邮件必须提供 templateId 或 templatePath');
  }

  // 步骤3：调用腾讯云客户端发送邮件
  return params.client.SendEmail(newOptions);
};

// =====================================
// 阿里云
// =====================================
export const sendAliyunMail = async (params: AliyunMailClient, options: AliyunSendMailOptions) => {
  // 步骤1：通用选项 → 阿里云SDK参数名 + 合并默认配置
  const newOptions: Record<string, any> = customMerge(
    {
      // 1. 核心参数映射（通用→阿里云SDK）
      accountName: options.from ?? params.default.from, // 发件人邮箱 → accountName
      fromAlias: options.fromName ?? params.default.fromName, // 发件人名称 → fromAlias
      addressType: options.others?.addressType ?? 1, // 地址类型（默认1=自定义发件人）
      toAddress: options.to.join(','), // 收件人数组→逗号分隔字符串（阿里云要求）
      subject: options.subject, // 主题直接复用
      // 回复邮箱相关配置
      replyToAddress: !isNil(options.replyTo) || !isNil(params.default.replyTo), // 是否开启回复邮箱
      replyAddress: options.replyTo ?? params.default.replyTo, // 回复邮箱地址
      replyAddressAlias: options.replyToName ?? params.default.replyToName, // 回复邮箱名称
      ...options.others, // 合并自定义扩展参数
    },
    options.others ?? {}, // 兜底合并others
    'replace', // 自定义覆盖默认
  );

  // 步骤2：分支处理模板（支持平台模板/本地模板）
  if ('templateId' in options) {
    // 场景1：使用阿里云平台预设模板（templateId）
    newOptions.template = new AliyunSender.SingleSendMailRequestTemplate({
      templateData: options.vars, // 变量直接传对象（阿里云支持）
      templateId: options.templateId, // 平台模板ID（字符串类型）
    });
  } else if ('templatePath' in options) {
    // 场景2：使用本地Pug模板（templatePath）→ 本地渲染后传入
    newOptions.htmlBody = await emailTemplates.render(
      // 渲染HTML模板
      `${options.templatePath.toString()}/html`,
      options.vars,
    );
    newOptions.textBody = await emailTemplates.render(
      // 渲染纯文本模板
      `${options.templatePath.toString()}/text`,
      options.vars,
    );
  }

  // 步骤3：封装阿里云请求对象 + 发送邮件
  const singleSendMailRequest = new AliyunSender.SingleSendMailRequest(newOptions); // 封装请求
  const runtime = new AliyunUtil.RuntimeOptions({}); // 阿里云运行时配置（超时/重试等）
  return params.client.singleSendMailWithOptions(singleSendMailRequest, runtime); // 调用客户端发送
};
