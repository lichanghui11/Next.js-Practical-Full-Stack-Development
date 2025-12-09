import type { Reducer } from 'react';

import { produce } from 'immer';
import { createJSONStorage } from 'zustand/middleware';

import { createReduxStore } from '@/app/utils/create-store';

import type { ThemeDispatch, ThemeOption } from './constants';

import { defaultThemeOption, ThemeActions } from './constants';
import { getSystemMode } from './utils';

// 创建 Reducer 函数，执行状态变更逻辑，返回新的状态(UI 层面触发变更)
/**
 * @param state - 当前状态
 * @param action - 动作
 * @returns - 新的状态
 * 这个 reducer 是专门为了 theme store 设计的
 */
export const themeReducer: Reducer<ThemeOption, ThemeDispatch> = (
  state,
  action,
) => {
  switch (action.type) {
    case ThemeActions.CHANGE_MODE:
      return produce(state, (draft) => {
        if (state.mode === 'system') {
          draft.mode = getSystemMode();
        } else {
          draft.mode = action.payload;
        }
      });
    case ThemeActions.TOGGLE_MODE:
      return produce(state, (draft) => {
        if (state.mode === 'dark') {
          draft.mode = 'light';
        } else {
          draft.mode = 'dark';
        }
      });
    case ThemeActions.CHANGE_COMPACT:
      return produce(state, (draft) => {
        draft.compact = action.payload;
      });
    case ThemeActions.TOGGLE_COMPACT:
      return produce(state, (draft) => {
        draft.compact = !draft.compact;
      });
    default:
      return state;
  }
};

// 创建用于主题的 store, 这是一个创建函数，并不是store本身，只不过这个 store 是为 theme 定制的
/**
 * @param options - 部分主题配置
 * @returns - 主题 store
 * 这个 store创建函数 是专门为了 theme store 设计的
 */
export const createThemeStore = (options: Partial<ThemeOption>) =>
  createReduxStore(
    themeReducer,
    { ...defaultThemeOption, ...options },
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        compact: state.compact,
      }),
    },
  );
