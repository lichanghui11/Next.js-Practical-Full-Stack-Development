import { createContext } from 'react';

import type { ThemeStoreType } from './types';

// 主题类型
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// 主题操作类型
export enum ThemeActions {
  CHANGE_MODE = 'change_mode', // 切换主题颜色
  TOGGLE_MODE = 'toggle_mode', // 反转主题颜色

  CHANGE_COMPACT = 'change_compact', // 切换紧凑模式
  TOGGLE_COMPACT = 'toggle_compact', // 反转紧凑模式
}

// enum 类型需要使用 `${}`的方式才能读取到里面的变量，否则每次都需要使用 ThemeMode.LIGHT 这样的方式
// 主题选项
export interface ThemeOption {
  mode: `${ThemeMode}`;
  compact: boolean;
}

// 默认配置
export const defaultThemeOption: ThemeOption = {
  mode: ThemeMode.SYSTEM,
  compact: false,
};

// 模拟 redux dispatch
export type ThemeDispatch =
  | {
      type: `${ThemeActions.CHANGE_MODE}`;
      payload: `${ThemeMode}`;
    }
  | { type: `${ThemeActions.TOGGLE_MODE}` }
  | {
      type: `${ThemeActions.CHANGE_COMPACT}`;
      payload: boolean;
    }
  | { type: `${ThemeActions.TOGGLE_COMPACT}` };

// 主题模式 所有状态 的类型
export type ThemeStateType = ThemeOption & {
  dispatch: (action: ThemeDispatch) => ThemeDispatch;
};

// 创建主题上下文
export const ThemeContext = createContext<ThemeStoreType | null>(null);
