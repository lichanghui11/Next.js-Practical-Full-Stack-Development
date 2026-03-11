import type { ClientConfig as DefaultTencentCloudConfig } from 'tencentcloud-sdk-nodejs-common';

import AliyunCredential, { Config as AliYunConfig } from '@alicloud/credentials';
import AliyunClient from '@alicloud/dm20151123';
import * as AliyunOpenApi from '@alicloud/openapi-client';
import { isNil } from 'lodash';
import nodemailer from 'nodemailer';
import { ses as TencentClient } from 'tencentcloud-sdk-nodejs-ses';

import { mailConfig } from '@/config/mail.config';

import type { DefaultAliyunConfig, DefaultSmtpConfig, MailClient } from './types';
const TencentSES = TencentClient.v20201002.Client;

export const createMailClient = (name?: string): MailClient => {
  const clientName = name ?? mailConfig.defaultClient;
  const config = mailConfig.clients.find((item) => item.name === clientName);

  if (isNil(config)) {
    throw new Error(`邮件发送配置名 ${clientName} 不存在`);
  }

  const result = {
    name: clientName,
    default: config.default,
  } as const;

  switch (config.type) {
    case 'aliyun':
      return {
        ...result,
        type: 'aliyun',
        client: createAliyunClient(config.options),
      };
    case 'tcloud':
      return {
        ...result,
        type: 'tcloud',
        client: createTencentClient(config.options),
      };
    case 'smtp':
      return {
        ...result,
        type: 'smtp',
        client: createSmtpClient(config.options),
      };
    default:
      throw new Error(`邮件发送配置名 ${clientName} 不支持`);
  }
};

/**
 * 创建阿里云邮件发送客户端实例
 * @param config 阿里云配置（已剔除 toMap 字段的 DefaultAliyunConfig）
 * @returns 可直接调用阿里云 API 的客户端实例
 */
const createAliyunClient = (config: Omit<DefaultAliyunConfig, 'toMap'>) => {
  // 步骤1：将原始配置封装为阿里云配置类实例（处理基础配置）
  const credentialsConfig = new AliYunConfig(config);

  // 步骤2：创建阿里云凭证客户端（处理密钥签名、权限验证）
  const credentialClient = new AliyunCredential(credentialsConfig);

  // 步骤3：构建阿里云 OpenAPI 最终配置（合并原始配置 + 凭证对象）
  const configinc = new AliyunOpenApi.Config({
    ...config, // 继承原始配置（如 endpoint、accessKeyId 等）
    credential: credentialClient, // 注入凭证管理对象（核心）
  });

  // 步骤4：创建并返回最终的阿里云客户端实例
  return new AliyunClient(configinc);
};
const createTencentClient = (config: DefaultTencentCloudConfig) => {
  return new TencentSES(config);
};

const createSmtpClient = (config: DefaultSmtpConfig) => {
  const transporter = nodemailer.createTransport(config);
  return transporter;
};
