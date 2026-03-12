import { trim } from 'lodash';

import { appConfig } from '@/config/app.config';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return trim(window.location.origin, '/');

  // Next.js 运行时会注入真实的 origin（含端口），可用于 dev 端口自动漂移场景（端口自动切换）
  if (process.env.__NEXT_PRIVATE_ORIGIN) return trim(process.env.__NEXT_PRIVATE_ORIGIN, '/');

  // 允许用户通过环境变量覆盖（比如反向代理/自定义域名等场景）
  if (process.env.NEXT_PUBLIC_BASE_URL) return trim(process.env.NEXT_PUBLIC_BASE_URL, '/');

  // 最后兜底（保持旧行为）
  return trim(appConfig.baseUrl, '/');
};
