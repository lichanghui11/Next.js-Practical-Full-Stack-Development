import type { Reducer } from 'react';
import type { DevtoolsOptions, PersistOptions } from 'zustand/middleware';

import { createStore } from 'zustand';
import {
  devtools,
  persist,
  redux,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * 构建持久化、可调试、immer、redux的 store
 */
const createReduxStore = <T extends object, A extends { type: string }, P = T>(
  reducer: Reducer<T, A>,
  initialState: T,
  persistOptions: PersistOptions<T, P>,
  devtoolsOptions?: DevtoolsOptions,
) => {
  return createStore(
    subscribeWithSelector(
      immer(
        devtools(
          persist(redux(reducer, initialState), persistOptions as any),
          devtoolsOptions,
        ),
      ),
    ),
  );
};

export { createReduxStore };
