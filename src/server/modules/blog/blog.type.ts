import type { z } from 'zod';

import type {
  buildPostRequestSchema,
  postItemResponseSchema,
  postPaginateResponseSchema,
  totalPagesResponseSchema,
} from './blog.schema';

/**
 * 单条文章 查询响应数据类型
 * Response
 */
export type PostItem = z.infer<typeof postItemResponseSchema>;
/**
 * 文章分页查询 响应数据类型
 *  Response
 */
export type PostPagination = z.infer<typeof postPaginateResponseSchema>;
/**
 * 文章页面总数 查询响应数据类型
 *  Response
 */
export type PostTotalPages = z.infer<typeof totalPagesResponseSchema>;

/**
 * 文章操作(新建或更新文章)时的请求数据类型
 * Request
 */
export type PostCreateOrUpdateData = z.infer<ReturnType<typeof buildPostRequestSchema>>;
