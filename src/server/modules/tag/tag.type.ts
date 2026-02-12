import type { z } from 'zod';

import type { tagListSchema, tagRequestParamsSchema, tagSchema } from './tag.schema';

// 标签请求的参数的类型
export type TagRequestParamsType = z.infer<typeof tagRequestParamsSchema>;

// 单个标签对象的类型
export type TagType = z.infer<typeof tagSchema>;

// 标签列表的类型
export type TagListType = z.infer<typeof tagListSchema>;
