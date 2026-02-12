import type { AppConfig } from '@/lib/types';

export const appConfig: AppConfig = {
  // 基础url
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  // API路径
  apiPath: process.env.NEXT_PUBLIC_API_PATH || '/api',
  // 时区，默认Asia/Shanghai
  timezone: 'Asia/Shanghai',
  // 语言，默认zh-cn
  locale: 'zh-cn',
};
