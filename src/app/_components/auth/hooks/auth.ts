'use client';
import { use, useMemo } from 'react';

import { AuthContext } from '../constants';

// 获取当前登录用户，auth 这个字段有三种取值：User | null | false，
// 用户如果已经登陆，则为用户信息，其他情况为无用户信息状态
export const useAuth = () => {
  // 使用的是认证相关的上下文里面的 auth 字段
  const { auth } = use(AuthContext);
  return useMemo(() => auth, [auth]);
};
