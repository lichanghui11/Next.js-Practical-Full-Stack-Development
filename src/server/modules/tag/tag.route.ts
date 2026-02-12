import { describeRoute, validator } from 'hono-openapi';

import { createHonoApp } from '@/server/common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '@/server/common/error';
import { createResponse } from '@/server/common/response';
import { errorSchema } from '@/server/common/schema';

import { tagListSchema, tagRequestParamsSchema, tagSchema } from './tag.schema';
import { queryTagItem, queryTagList } from './tag.service';
const app = createHonoApp();
const tags: string[] = ['标签操作'];

export const tagPath = '/tags';
export type TagApiType = typeof tagApi;
export const tagApi = app
  .get(
    '/:id',
    describeRoute({
      tags,
      summary: '标签查询',
      description: '根据 id 或 text 查询标签',
      responses: {
        ...createResponse(tagSchema, 200, '查询标签数据成功'),
        ...createResponse(errorSchema, 401, '标签数据不存在'),
        ...createResponse(errorSchema, 500, '查询标签数据失败'),
      },
    }),
    validator('param', tagRequestParamsSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const result = await queryTagItem(id);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询标签数据失败', error), 500);
      }
    },
  )
  .get(
    '/',
    describeRoute({
      tags,
      summary: '标签列表查询',
      description: '查询出数据库中的扁平数据，内部进行了树状化处理,并进行扁平化处理后的一维列表',
      responses: {
        ...createResponse(tagListSchema, 200, '查询标签数据成功'),
        ...createResponse(errorSchema, 401, '标签数据不存在'),
        ...createResponse(errorSchema, 500, '查询标签数据失败'),
      },
    }),
    async (c) => {
      try {
        const result = await queryTagList();
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询标签数据失败', error), 500);
      }
    },
  );
