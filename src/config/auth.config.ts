import { z } from 'zod';

import type { AuthConfig } from '@/lib/auth/types';

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
};
