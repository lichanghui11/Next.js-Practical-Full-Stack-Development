import { isNil } from 'lodash';
import z from 'zod';

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
    .optional();
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
        }),
      content: z.string().min(1, {
        message: '标题不得少于1个字符',
      }),
      summary: z
        .string()
        .max(300, {
          message: '摘要不得超过300个字符',
        })
        .optional(),
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
      slug, // 将提前定义好的对 slug 的校验规则放进来
    })
    .strict();
};

/**
 * 文章查询响应数据结构
 * 单条文章 响应的数据结构体
 */
export const postItemResponseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    thumb: z.string().optional(),
    summary: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    content: z.string(),
    createdAt: z.coerce.date(), // 	coerce 的意思是：不管你传进来是什么类型，先尽量把它转换成 Date，再做校验
    updatedAt: z.coerce.date(),
  })
  .strict();

/**
 * 文章分页查询响应数据结构
 * 分页数据 响应的数据结构体
 */
export const postPaginateResponseSchema = z.object({
  item: z.array(postItemResponseSchema),
  meta: z.object({
    itemCount: z.coerce.number(),
    totalItems: z.coerce.number().optional(),
    perPage: z.coerce.number(),
    totalPages: z.coerce.number().optional(),
    currentPage: z.coerce.number(),
  }),
});

/**
 * 一共有多少页数
 * 总页数的响应数据结构
 */
export const totalPagesResponseSchema = z.object({
  result: z.coerce.number(),
});

/**
 * 文章分页查询请求数据结构
 */
export const postPaginationQueryRequestSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
});

/**
 * 文章页面总数查询请求数据结构
 */
export const totalPagesRequestSchema = z.object({
  limit: z.coerce.number().optional(),
});

/**
 * 文章详情查询请求数据结构
 * slug || id
 */
export const postDetailRequestSchema = z.object({
  item: z.string(),
});

/**
 * 通过ID查询文章详情的请求数据结构
 * 仅 id ,但是我没有定义单独针对ID的查询请求
 */
export const postDetailByIdRequestSchema = z.object({
  id: z.string(),
});
/**
 * 通过slug查询文章详情的请求数据结构
 * 有单独的查询请求
 */
export const postDetailBySlugRequestSchema = z.object({
  slug: z.string(),
});
