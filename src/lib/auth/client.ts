import { emailOTPClient, usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { getBaseUrl } from '../get-base-url';

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  basePath: '/api/auth',
  // 告诉客户端，服务端启用了 username() 插件来支持用户名登录。
  // 所以客户端也需要加载对应的 usernameClient() 插件，
  // 这样你才能调用 authClient.signIn.username(...) 这个方法。
  // 如果不配这个插件，authClient 上就不会有 .signIn.username 这个选项。
  plugins: [
    usernameClient(),
    // 这个 emailOTPClient 插件可以不用配置，因为项目中没有使用客户端的邮箱验证功能，项目中使用了自己定义的方法
    emailOTPClient(),
  ],
});
