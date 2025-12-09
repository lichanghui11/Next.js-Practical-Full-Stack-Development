import type { createThemeStore } from './store';
// 主题状态池的类型
// 这里是根据 createThemeStore 的返回值类型推断出来的
export type ThemeStoreType = ReturnType<typeof createThemeStore>;
