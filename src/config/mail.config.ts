import type { MailConfig } from '@/lib/mail/types';

export const mailConfig: MailConfig = {
  defaultClient: 'smtp',
  clients: [
    {
      name: 'smtp',
      type: 'smtp',
      options: {
        // SMTP 服务器域名，QQ 邮箱用 smtp.qq.com，Gmail 常用 smtp.gmail.com
        host: process.env.SMTP_HOST || 'smtp.qq.com',
        port: Number.parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '1769444976@qq.com',
          pass: process.env.SMTP_PASS || '', // 这个不是邮箱密码，是授权码
        },
      },
      default: {
        from: '1769444976@qq.com',
      },
    },
    {
      name: 'aliyun',
      type: 'aliyun',
      default: {
        from: '1769444976@qq.com',
        fromName: '西瓜博客',
        replyTo: '1769444976@qq.com',
        replyToName: '西瓜博客',
      },
      options: {
        defaultFrom: '1769444976@qq.com',
        type: 'access_key', // 阿里云凭证类型
        accessKeyId: process.env.ALIYUN_KEY || '',
        accessKeySecret: process.env.ALIYUN_SECRET || '',
        endpoint: 'dm.aliyuncs.com', // 阿里云邮件接口地址
      },
    },
    /**
     * 使用腾讯云的 SES 服务
     *  1. 需要有一个合法的域名
     *  2. 需要创建一个自己域名的邮箱地址
     *  3. 在腾讯云使用子账号创建TENCENTCLOUD_SECRET_ID 和 TENCENTCLOUD_SECRET_KEY
     */
    {
      name: 'tcloud',
      type: 'tcloud',
      // 使用的是腾讯云的 SES 服务，配置了自己的域名，这个地址是自己的域名邮箱
      default: { from: 'xigua@lichanghui.asia' },
      options: {
        credential: {
          secretId: process.env.TENCENTCLOUD_SECRET_ID || '',
          secretKey: process.env.TENCENTCLOUD_SECRET_KEY || '',
        },
        // 物理地区必须要和自己配置的账号的物理地区一致
        region: 'ap-hongkong', // 服务地域
        profile: {
          httpProfile: {
            endpoint: 'ses.tencentcloudapi.com', // SES API 域名
          },
        },
      },
    },
  ],
};
