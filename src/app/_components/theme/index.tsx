'use client';
import type { FC, PropsWithChildren } from 'react';

import { ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';

import type { ThemeOption } from './core/constants';
import type { ThemeStoreType } from './core/types';

import { ThemeContext } from './core/constants';
import { useAntdTheme, useSystemTheme, useThemeStore } from './core/hooks';
import { createThemeStore } from './core/store';

// 构建一个 dark/light 订阅器
// 这个组件只负责订阅主题变化，然后将主题应用到 children 上
const ThemeSubscriber: FC<PropsWithChildren> = ({ children }) => {
  const systemTheme = useSystemTheme();
  const themeStore = useThemeStore(); // 这里是从 themeContext 中获取的，此时已经构建好了上下文
  const antdTheme = useAntdTheme();
  useEffect(() => {
    const unSub = themeStore.subscribe(
      (state) => state.mode,
      (mode: string) => {
        const html = document.getElementsByTagName('html');
        if (mode !== 'system') {
          html[0].classList.remove('dark', 'light');
          html[0].classList.add(mode);
        } else {
          html[0].classList.remove('dark', 'light');
          html[0].classList.add(systemTheme);
        }
        // 同步 cookie，过期时间一年
        document.cookie = `theme-mode=${mode}; path=/; max-age=31536000`;
      },
      { fireImmediately: true },
    );
    return () => {
      unSub();
    };
  }, [systemTheme]);

  return (
    <ConfigProvider theme={{ algorithm: antdTheme }}>{children}</ConfigProvider>
  );
};

// 构建提供 dark/light 的上下文组件
const ThemeProvider: FC<PropsWithChildren<Partial<ThemeOption>>> = ({
  children,
  ...props
}) => {
  const [themeStore] = useState<ThemeStoreType | null>(() =>
    createThemeStore(props),
  );
  return (
    <ThemeContext value={themeStore}>
      <ThemeSubscriber>{children}</ThemeSubscriber>
    </ThemeContext>
  );
};

export default ThemeProvider;
