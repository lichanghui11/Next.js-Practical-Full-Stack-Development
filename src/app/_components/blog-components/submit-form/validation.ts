import { isNil } from 'lodash';
import { z } from 'zod';

import { queryPostBySlug } from '@/app/_actions/post';
// zod 相关工具函数

/**
 * slug 唯一性验证器
 * @param slug
 * 1. 构造验证器的时候，将 id 传入闭包，用于比较
 * 2. 使用验证器的时候，传入 slug ，查处对应的文章
 * 3. 如果两者 id 相同，则通过验证
 * 4. 如果不同，则不通过验证
 */
export const slugUniqueValidator = (id?: string) => async (slug?: string) => {
  // 没有 创建过 slug
  if (isNil(slug) || slug.length === 0) {
    return true;
  }
  // 有 slug , 查出来
  const post = await queryPostBySlug(slug);
  // 进行比较
  if (!isNil(post) && post.id !== id) {
    return false;
  }
  return true;
};

// 文章的通用字段验证
export const formValidator = (id?: string) => {
  const validator = slugUniqueValidator(id);
  return z
    .object({
      title: z
        .string()
        .min(1, {
          message: '标题不得少于1个字符',
        })
        .max(200, {
          message: '标题不得超过200个字符',
        }),
      content: z.string().min(1, {
        message: '内容不得少于1个字符',
      }),
      summary: z
        .string()
        .max(300, {
          message: '摘要不得超过300个字符',
        })
        .optional(),
      slug: z
        .string()
        .max(250, {
          message: 'slug不得超过250个字符',
        })
        .optional()
        .refine(validator, {
          message: 'slug必须是唯一的,请重新设置',
        }),
      keywords: z
        .string()
        .max(200, {
          message: '描述不得超过200个字符',
        })
        .optional(),
      description: z
        .string()
        .max(300, {
          message: '描述不得超过300个字符',
        })
        .optional(),
    })
    .strict(); // 严格模式，只允许出现我定义的字段
};
