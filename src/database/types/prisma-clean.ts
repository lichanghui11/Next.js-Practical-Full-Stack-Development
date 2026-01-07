// 这里的数据类型的清理逻辑是针对 前端/业务层 ==> 数据库 数据流动方向的
// Prisma.skip 是 Prisma 写入/更新输入类型 里的概念，用来控制“这次写入要不要修改这个字段”。

// 引入 Prisma 生成的类型定义。这里主要是为了获取 Prisma.skip 这个特殊符号的类型，它是 Prisma 用来判断是否“跳过更新”的标记。
import type { Prisma } from '@prisma/client';

// 如果 T 包含 Prisma.skip 类型或者 null 类型，就将其设为 never（在联合类型中，never 会被自动剔除）。
type NonSkipNull<T> = T extends typeof Prisma.skip | null ? never : T;
// 这里跳过了 null 和 skip 标记的类型

// 递归助手 Array
// 如果表单中有一个数组字段，它会对数组里的每一个成员执行：先过滤（NonSkipNull），再递归清洗（DBFormData）
interface _DeepFormItemArray<T> extends Array<DBFormData<NonSkipNull<T>>> {}

// 递归助手 Object
// 这里强行把所有字段变为“必填”
// 遍历对象 T 的每一个键 P，对对应的值进行过滤并递归清洗
type _DeepFormItemObject<T> = {
  [P in keyof T]-?: DBFormData<NonSkipNull<T[P]>>; // 这里跳过了 undefined
};

// 总入口
export type DBFormData<T> = T extends (...args: any[]) => any
  ? T // 如果是函数，直接返回函数类型
  : T extends any[]
    ? _DeepFormItemArray<T[number]> // 如果是数组，调用数组的递归助手
    : T extends object
      ? _DeepFormItemObject<T> // 如果是对象，调用对象的递归助手
      : T; // 基础类型，直接返回原类型
