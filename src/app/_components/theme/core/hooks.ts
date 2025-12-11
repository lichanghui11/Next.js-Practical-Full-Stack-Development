'use client';
import { theme } from 'antd';
import { debounce } from 'lodash';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';

import type { ThemeMode, ThemeStateType } from './constants';

import { ThemeActions, ThemeContext } from './constants';
import { getSystemMode } from './utils';

// 这里只是获取了 ThemeContext 中的那个 store 对象
export const useThemeStore = () => {
  const themeStore = use(ThemeContext);
  if (!themeStore) {
    throw new Error('ThemeContext not found');
  }
  return themeStore;
};

// 这里的 selector 传入的是整个对象的变更函数，包含 mode, compact, dispatch，可以根据需要返回对应的值
export const useThemeState = <T>(selecter: (state: ThemeStateType) => T): T => {
  const themeStore = useThemeStore();
  return useStore(themeStore, useShallow(selecter));
};

// 获取 mode, compact 的hook
export const useThemeMode = () => {
  return useThemeState((state) => ({
    mode: state.mode,
    compact: state.compact,
  }));
};

// 获取 对主题进行操作 的hook(theme actions)
export const useThemeActions = () => {
  const dispatch = useThemeState((state) => state.dispatch);

  // 设置 暗/亮 模式
  const changeMode = useMemo(() => {
    return debounce(
      (v: `${ThemeMode}`) =>
        dispatch({
          type: ThemeActions.CHANGE_MODE,
          payload: v,
        }),
      100,
    );
  }, [dispatch]);

  // 切换 暗/亮 模式
  const toggleMode = useMemo(() => {
    return debounce(() => dispatch({ type: ThemeActions.TOGGLE_MODE }), 100);
  }, [dispatch]);

  // 设置紧凑模式
  const changeCompact = useCallback(
    (v: boolean) =>
      dispatch({
        type: ThemeActions.CHANGE_COMPACT,
        payload: v,
      }),
    [dispatch],
  );

  // 切换紧凑模式 宽松/紧凑
  const toggleCompact = useCallback(
    () => dispatch({ type: ThemeActions.TOGGLE_COMPACT }),
    [dispatch],
  );

  // 组件卸载的时候取消 debounced 的函数
  useEffect(() => {
    return () => {
      changeMode.cancel();
      toggleMode.cancel();
    };
  }, [changeMode, toggleMode]);

  return {
    changeMode,
    toggleMode,
    changeCompact,
    toggleCompact,
  };
};

// 监听并获取系统主题
// use开头表示 hook 函数，功能和 getSystemMode() 是相同的，但是会自动更新
export const useSystemTheme = () => {
  const [systemThemeMode, setSystemThemeMode] = useState(() => getSystemMode());

  useEffect(() => {
    const handleChange = () => setSystemThemeMode(getSystemMode());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', handleChange);

    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, []);

  return systemThemeMode;
};

// 根据用户的设置计算出最终的 主题模式
export const useUserThemeMode = () => {
  const { mode, compact } = useThemeMode();
  const sysMode = useSystemTheme();
  const finalMode = mode === 'system' ? sysMode || 'light' : mode;

  return {
    mode: finalMode,
    compact,
  };
};

// 根据用户的设置计算出 Antd 里面对应的主题算法
// 这里返回的是一个函数，用于计算 Antd 的主题算法
export const useAntdTheme = () => {
  const { mode, compact } = useUserThemeMode();
  return useMemo(() => {
    const algorithm = [];
    if (mode === 'dark') {
      algorithm.push(theme.darkAlgorithm);
    } else {
      algorithm.push(theme.defaultAlgorithm);
    }
    if (compact) {
      algorithm.push(theme.compactAlgorithm);
    }
    return algorithm;
  }, [compact, mode]);
};
