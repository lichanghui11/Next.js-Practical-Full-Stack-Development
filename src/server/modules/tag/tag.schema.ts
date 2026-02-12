import { z } from 'zod';

// 标签查询的请求参数 数据结构体
export const tagRequestParamsSchema = z.object({
  id: z.string().meta({ description: '查询某个标签时传入的标签ID' }),
});

// 标签的响应数据结构体
export const tagSchema = z
  .object({
    id: z.string().meta({ description: '标签ID' }),
    text: z.string().meta({ description: '标签名称' }),
  })
  .meta({ id: 'TagDetail', description: '单个标签的详情' });

// 标签列表的响应数据结构体
export const tagListSchema = z.array(tagSchema).meta({ description: '标签列表，这是一个数组' });
