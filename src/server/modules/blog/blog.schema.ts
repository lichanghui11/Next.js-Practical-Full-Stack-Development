import { isNil } from 'lodash';
import z from 'zod';

import { categoryListSchema, categorySchema } from '../category/category.schema';
import { tagListSchema } from '../tag/tag.schema';

/**
 * 新建 || 更新 文章时对即将提交的文章的数据进行校验的函数
 * 参数为验证 slug 唯一性的校验器（这里不是那个工厂函数，是已经传入ID（或无 ID传入）的校验器）
 * @param slugUniqueValidator
 * 发起请求前的文章数据验证
 */
export const buildPostRequestSchema = (
  slugUniqueValidator?: (slug?: string | null) => Promise<boolean>,
) => {
  // 单独定义对 slug 这个字段的校验
  let slug = z
    .string()
    .max(250, {
      message: 'slug不得超过250个字符',
    })
    .optional()
    .meta({ description: '文章唯一标识符' });
  // 这里是条件式地为 slug 添加这条校验规则
  if (!isNil(slugUniqueValidator)) {
    // 这个 slugUniqueValidator 是一个已经传入过 id 的校验器，而不是原始的工厂函数
    slug = slug.refine(slugUniqueValidator, {
      message: 'slug必须是唯一的,请重新设置',
    }) as any;
  }

  // 要理解这里返回的一个校验器，也就是许多校验规则的集合，其他文件拿到这份规则，再使用这份规则
  return z
    .object({
      title: z
        .string()
        .min(1, {
          message: '标题不得少于1个字符',
        })
        .max(200, {
          message: '标题不得超过200个字符',
        })
        .meta({ description: '文章标题' }),
      content: z
        .string()
        .min(1, {
          message: '标题不得少于1个字符',
        })
        .meta({ description: '文章内容' }),
      summary: z
        .string()
        .max(300, {
          message: '摘要不得超过300个字符',
        })
        .optional()
        .meta({ description: '文章摘要' }),
      keywords: z
        .string()
        .max(200, {
          message: '描述不得超过200个字符',
        })
        .optional()
        .meta({ description: '文章关键词' }),
      description: z
        .string()
        .max(300, {
          message: '描述不得超过300个字符',
        })
        .optional()
        .meta({ description: '文章描述' }),
      slug, // 将提前定义好的对 slug 的校验规则放进来
      tags: tagListSchema.optional().meta({ description: '关联标签列表' }),
      categoryId: z.string().optional().meta({ description: '关联分类ID' }),
    })
    .strict();
};

/**
 * 文章查询响应数据结构
 * 单条文章 响应的数据结构体
 */
export const postItemSchema = z
  .object({
    id: z.string().meta({ description: '文章ID' }),
    title: z.string().meta({ description: '文章标题' }),
    thumbnail: z.string().optional().meta({ description: '文章缩略图URL' }),
    summary: z.string().nullable().optional().meta({ description: '文章摘要' }),
    keywords: z.string().nullable().optional().meta({ description: '文章关键词' }),
    description: z.string().nullable().optional().meta({ description: '文章描述' }),
    slug: z.string().nullable().optional().meta({ description: '文章唯一标识符' }),
    content: z.string().meta({ description: '文章内容' }),
    createdAt: z.string().meta({ description: '文章创建时间' }),
    updatedAt: z.string().meta({ description: '文章更新时间' }),
    tags: tagListSchema.optional().meta({ description: '关联标签列表，这是一个数组' }),
    categories: categoryListSchema.meta({
      description: '关联分类及其祖先分类列表，这是一个扁平数组，没有 children 字段',
    }),
    category: categorySchema
      .nullable()
      .meta({ description: '关联分类，这是一个分类对象，带有 children 字段' }),
  })
  .strict()
  .meta({ id: 'PostItem', description: '单篇文章数据' });

/**
 * 文章分页查询响应数据结构
 * 分页数据 响应的数据结构体
 */
export const postPaginateSchema = z.object({
  data: z.array(postItemSchema).meta({ description: '文章列表' }),
  meta: z
    .object({
      itemsPerPage: z.coerce.number().meta({
        description: '每页的文章数量（这里是平均数量，不包括最后一页可能不足一页的情况）',
      }),
      totalItems: z.coerce.number().optional().meta({ description: '总文章数' }),
      pageSize: z.coerce
        .number()
        .meta({ description: '每页文章数，通过当前获取的数据长度计算，有可能一页没有占满' }),
      totalPages: z.coerce.number().optional().meta({ description: '总页数' }),
      currentPage: z.coerce.number().meta({ description: '当前页码' }),
    })
    .meta({ description: '分页信息' }),
});

/**
 * 一共有多少页数
 * 总页数的响应数据结构
 */
export const totalPagesSchema = z.object({
  result: z.coerce.number().meta({ description: '总页数' }),
});

/**
 * 文章分页数据查询 请求参数 的数据结构
 *
 * 之前对于 分页数据 这个词总是不知道这个到底是指文章数据还是分页数据，
 * 现在明白这个指的是这份数据里包含了数据库里的文章有多少页每页有几篇这些 **元数据** 以及 **请求的当前页有哪些文章**
 */
export const postPaginationRequestSchema = z.preprocess(
  (val) => {
    console.log('正在校验 postPaginationRequestSchema:', val);
    return val;
  },
  z
    .object({
      page: z.coerce.number().optional().meta({ description: '页码' }),
      limit: z.coerce.number().optional().meta({ description: '每页数量' }),
      orderBy: z.enum(['asc', 'desc']).optional().meta({ description: '排序方式' }),
      tag: z.string().optional().meta({ description: '标签过滤' }),
      category: z.string().optional().meta({ description: '分类过滤' }),
    })
    .meta({ id: 'PostPaginationRequest', description: '请求查询文章分页数据的请求参数schema' }),
);

/**
 * 文章页面总数查询 请求参数 的数据结构
 */
export const totalPagesRequestSchema = z
  .object({
    limit: z.coerce.number().optional().meta({ description: '每页数量' }),
    tag: z.string().optional().meta({ description: '标签过滤' }),
    category: z.string().optional().meta({ description: '分类过滤' }),
  })
  .meta({ id: 'TotalPagesRequest', description: '请求查询文章总页数的请求参数schema' });

/**
 * 文章详情查询请求数据结构
 * slug || id
 */
export const postDetailRequestSchema = z.object({
  item: z.string().meta({ description: '文章唯一标识符或ID' }),
});

/**
 * 通过ID查询文章详情的请求数据结构
 * 仅 id ,但是我没有定义单独针对ID的查询请求
 */
export const postDetailByIdRequestSchema = z.object({
  id: z.string().meta({ description: '文章ID' }),
});
/**
 * 通过slug查询文章详情的请求数据结构
 * 有单独的查询请求
 */
export const postDetailBySlugRequestSchema = z.object({
  slug: z.string().meta({ description: '文章唯一标识符' }),
});
