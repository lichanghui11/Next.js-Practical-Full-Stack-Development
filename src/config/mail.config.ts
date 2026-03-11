import type { MailConfig } from '@/lib/mail/types';

export const mailConfig: MailConfig = {
  defaultClient: 'tcloud',
  clients: [
    {
      name: 'smtp',
      type: 'smtp',
      options: {
        host: process.env.SMTP_HOST || 'smtp.qq.com',
        port: Number.parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || 'weeesti470@gmail.com',
          pass: process.env.SMTP_PASS || '12345678',
        },
      },
      default: {
        from: 'pincman@foxmail.com',
      },
    },
    {
      name: 'aliyun',
      type: 'aliyun',
      default: {
        from: 'weeesti470@gmail.com',
        fromName: 'esti',
        replyTo: 'weeesti470@gmail.com',
        replyToName: 'esti',
      },
      options: {
        defaultFrom: 'weeesti470@gmail.com',
        type: 'access_key',
        accessKeyId: process.env.ALIYUN_KEY || '',
        accessKeySecret: process.env.ALIYUN_SECRET || '',
        endpoint: 'dm.aliyuncs.com',
      },
    },
    {
      name: 'tcloud',
      type: 'tcloud',
      default: { from: 'weeesti470@gmail.com' },
      options: {
        credential: {
          secretId: process.env.TENCENTCLOUD_SECRET_ID || '',
          secretKey: process.env.TENCENTCLOUD_SECRET_KEY || '',
        },
        region: 'ap-guangzhou',
        profile: {
          httpProfile: {
            endpoint: 'ses.tencentcloudapi.com',
          },
        },
      },
    },
  ],
};
