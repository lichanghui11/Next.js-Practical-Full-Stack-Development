export interface AppConfig {
  baseUrl: string;
}
/**
 * 将对象类型中的所有Date字段转换为string类型的泛型工具类型
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
