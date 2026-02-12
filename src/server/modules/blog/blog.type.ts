import type { z } from 'zod';

import type {
  buildPostRequestSchema,
  postItemSchema,
  postPaginateSchema,
  postPaginationRequestSchema,
  totalPagesRequestSchema,
  totalPagesSchema,
} from './blog.schema';

/**
 * 单条文章 查询响应数据类型
 * Response
 */
export type PostItem = z.infer<typeof postItemSchema>;
/**
 * 文章分页查询 响应数据类型
 *  Response
 */
export type PostPagination = z.infer<typeof postPaginateSchema>;
/**
 * 文章页面总数 查询响应数据类型
 *  Response
 */
export type PostTotalPages = z.infer<typeof totalPagesSchema>;

/**
 * 文章操作(新建或更新文章)时的请求数据类型
 * Request
 */
export type PostCreateOrUpdateData = z.infer<ReturnType<typeof buildPostRequestSchema>>;

// 文章分页数据查询的请求参数的 数据结构 的类型
export type PostPaginateRequestQuery = z.infer<typeof postPaginationRequestSchema>;

// 文章页面总数查询请求 数据结构 的类型
export type PostPaginateNumberRequestQuery = z.infer<typeof totalPagesRequestSchema>;
