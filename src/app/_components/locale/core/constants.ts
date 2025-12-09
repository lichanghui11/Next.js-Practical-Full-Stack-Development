// 语言类型
export enum Language {
  ZH = 'zh',
  EN = 'en',
}

// 主题操作类型
export enum ThemeActions {
  CHANGE_LANGUAGE = 'change_language', // 切换语言
}

// 主题选项
export interface ThemeOption {
  language: `${Language}`;
}
// 默认配置
export const defaultThemeOption: ThemeOption = {
  language: Language.ZH,
};
// 模拟 redux dispatch
export interface ThemeDispatch {
  type: `${ThemeActions.CHANGE_LANGUAGE}`;
  payload: `${Language}`;
}
