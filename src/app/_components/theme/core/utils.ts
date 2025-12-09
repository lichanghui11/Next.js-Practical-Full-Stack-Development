'use client';

import { ThemeMode } from './constants';

// 获取系统模式的工具函数
export const getSystemMode = () => {
  if (typeof window === 'undefined') return ThemeMode.LIGHT;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeMode.DARK
    : ThemeMode.LIGHT;
};
