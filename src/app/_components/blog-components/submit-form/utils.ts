import { lowerCase, trim } from 'lodash';
import pinyin from 'pinyin';

// 根据 create update 场景生成默认值的工具函数
// T 是博客数据的类型，A 是返回的默认值类型
export const getDefaultBlogFormValues = <
  T extends Record<string, any>,
  A extends Record<string, any>,
>(
  fields: Array<keyof T>,
  params: { type: 'create' } | { type: 'update'; blog: T },
) => {
  const items = {} as T;
  // 创建 update 分支的数据
  if (params.type === 'update') {
    fields.forEach((field) => {
      if (field in params.blog) items[field] = params.blog[field];
    });
  }

  // 根据实际的分支进行填充默认值
  const defaultValues = fields.reduce(
    (acc, field) => {
      acc[field] = params.type === 'create' ? '' : items[field];
      return acc;
    },
    items as Record<keyof T, any>,
  ) as A;
  return defaultValues;
};

// 根据输入的内容，字符串转化为小写，中文转化为拼音，并用 - 连接
export const generateSlug = (input: string) => {
  const slug = pinyin(input, {
    style: 0, // 普通风格，不带声调
    segment: true, // 启用分词模式
  })
    // [ ["chong"], ["xin"], ["chu"], ["fa"] ]
    .map((words) => words[0])
    .join('-');
  return lowerCase(slug)
    .split(' ')
    .map((word) => trim(word))
    .join('-');
};
