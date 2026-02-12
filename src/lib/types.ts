import type dayjs from 'dayjs';

/**
 * 将对象类型中的所有Date字段转换为string类型的泛型工具类型
 * @param T - 需要转换的对象类型
 * @returns 转换后的对象类型
 * 递归转换
 */
export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends Date | undefined
        ? string | undefined
        : T[K] extends Date | null | undefined
          ? string | null | undefined
          : T[K] extends object
            ? DateToString<T[K]>
            : T[K];
};

// 应用配置
export interface AppConfig {
  // 基础url
  baseUrl: string;
  // API路径
  apiPath: string;
  // 时区，默认Asia/Shanghai
  timezone?: string;
  // 语言，默认zh-cn
  locale?: string;
}

// getTime函数获取时间的选项参数
export interface TimeOptions {
  // 时间
  date?: dayjs.ConfigType;
  // 输出格式
  format?: dayjs.OptionType;
  // 语言
  locale?: string;
  // 是否严格模式
  strict?: boolean;
  // 时区
  timezone?: string;
}
