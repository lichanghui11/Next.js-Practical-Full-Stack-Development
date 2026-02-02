import type { AppConfig } from '@/lib/types';

export const apiConfig: AppConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
};
