import type { z } from 'zod';

import type {
  baseCategorySchema,
  categoryBreadcrumbRequestParamsSchema,
  categoryListRequestParamsSchema,
  categoryListSchema,
  categorySchema,
  categoryTreeSchema,
} from './category.schema';

// 分类列表 查询请求参数类型
export type CategoryListRequestParams = z.infer<typeof categoryListRequestParamsSchema>;

// 分类面包屑 查询请求参数类型
export type CategoryBreadcrumbRequestParams = z.infer<typeof categoryBreadcrumbRequestParamsSchema>;

// 单个分类对象 查询响应数据类型
export type CategoryItem = z.infer<typeof categorySchema>;

// 分类列表扁平数组 查询响应数据类型
export type CategoryList = z.infer<typeof categoryListSchema>;

// 分类树 查询响应数据类型
export type CategoryTree = z.infer<typeof categoryTreeSchema>;

// 一份分类数据的类型
export type BaseCategory = z.infer<typeof baseCategorySchema>;
