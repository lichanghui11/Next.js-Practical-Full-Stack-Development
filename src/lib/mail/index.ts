import type { MailSendOptions } from '@/lib/mail/types';

import type {
  AliyunSendMailOptions,
  SmtpSendMailOptions,
  TencentCloudSendMailOptions,
} from './types';

import { createMailClient } from './client';
import { sendAliyunMail, sendSmtpMail, sendTencentMail } from './send';

export const sendMail = async (option: MailSendOptions, clientName?: string) => {
  console.log('-----------------sendMail-----------------');
  console.log('option: ', option);
  console.log('clientName: ', clientName);
  const rst = createMailClient(clientName);
  console.log('mail client: ', rst);
  const name = rst.name;

  console.log('-----------------sendMail-----------------');
  switch (rst.type) {
    case 'smtp':
      return sendSmtpMail(rst, option as SmtpSendMailOptions);
    case 'aliyun':
      return sendAliyunMail(rst, option as AliyunSendMailOptions);
    case 'tcloud':
      return sendTencentMail(rst, option as TencentCloudSendMailOptions);
    default:
      throw new Error(`不支持的客户端名称 ｜ Unsupported mail client name: ${name}`);
  }
};
