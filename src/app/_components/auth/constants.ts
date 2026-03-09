// 使用一个全局状态的已认证判断器，
// 可以用于隐藏需要登录才显示的组件以及可以判断登录状态而显示退出或登录按钮

import { createContext } from 'react';

import type { AuthContextType, AuthType } from './types';

export const AuthContext = createContext<AuthContextType>({
  auth: false,
  setAuth: (_value: AuthType) => {},
});
