import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { appConfig } from '@/config/api.client';

export const authClient = createAuthClient({
  baseURL: appConfig.baseUrl,
  basePath: '/api/auth',
  // 告诉客户端，服务端启用了 username() 插件来支持用户名登录。
  // 所以客户端也需要加载对应的 usernameClient() 插件，
  // 这样你才能调用 authClient.signIn.username(...) 这个方法。
  // 如果不配这个插件，authClient 上就不会有 .signIn.username 这个选项。
  plugins: [usernameClient()],
});
