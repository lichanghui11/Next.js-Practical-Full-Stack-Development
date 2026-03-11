import { isNil, omit } from 'lodash';

import type { MailSendOptions } from '@/lib/mail/types';

import { customMerge } from '@/app/utils/custom-merge';
import { appConfig } from '@/config/app.config';
import { authConfig } from '@/config/auth.config';
import { getDayjs } from '@/lib/get-time';
import { sendMail } from '@/lib/mail';

import type { EmailOTPType } from './user.constants';
import type { EmailOTPPayload } from './user.type';

export async function sendOTPHandler(
  data: EmailOTPPayload,
  type: `${EmailOTPType}`,
  options?: MailSendOptions,
) {
  try {
    // 拿到 OTP 的类型
    const config = authConfig.mails?.OTP?.send?.[type];

    if (!isNil(config)) {
      const newOptions = customMerge(
        omit(config, ['client']),
        {
          ...(omit(options, ['vars', 'to', 'subject']) ?? {}),
          vars: {
            code: data.code,
            appname: appConfig.appName,
            expire: Math.round(
              getDayjs()
                .duration(authConfig.mails?.OTP?.expire ?? 300, 'second')
                .asMinutes(),
            ),
          },
          to: [data.email],
          subject: config.subject?.(type)(appConfig.appName, data.code),
        },
        'replace',
      );
      return sendMail(newOptions as any as MailSendOptions, config.client);
    }
    throw new Error(`邮件配置不存在`);
  } catch (err) {
    throw new Error(`发送OTP邮件失败: ${(err as Error).message}`);
  }
}
