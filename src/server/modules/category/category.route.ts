import { describeRoute, validator } from 'hono-openapi';

import { createHonoApp } from '@/server/common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '@/server/common/error';
import { createResponse } from '@/server/common/response';
import { errorSchema } from '@/server/common/schema';

import {
  categoryBreadcrumbRequestParamsSchema,
  categoryListRequestParamsSchema,
  categoryListSchema,
  categoryTreeSchema,
} from './category.schema';
import { queryCategoryBreadcrumb, queryCategoryList, queryCategoryTree } from './category.service';

const tags: string[] = ['分类操作'];
const app = createHonoApp();

export const categoryPath = '/categories';

export type CategoryApiType = typeof categoryApi;

export const categoryApi = app
  .get(
    '/:parentId?',
    describeRoute({
      tags,
      summary: '分类列表查询',
      description: '查询出数据库中的扁平数据，内部进行了树状化处理,并进行扁平化处理后的一维列表',
      responses: {
        ...createResponse(categoryListSchema, 200, '查询分类列表数据成功'),
        ...createResponse(errorSchema, 401, '分类列表数据不存在'),
        ...createResponse(errorSchema, 500, '查询分类列表数据失败'),
      },
    }),
    validator('param', categoryListRequestParamsSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { parentId } = c.req.valid('param');
        const result = await queryCategoryList(parentId);

        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询分类树数据失败', error), 500);
      }
    },
  )
  .get(
    '/tree/:parentId?',
    describeRoute({
      tags,
      summary: '分类树查询',
      description: '树形嵌套结构的分类数据查询，最终拿到的是一个树状结构',
      responses: {
        ...createResponse(categoryTreeSchema, 200, '查询分类树数据成功'),
        ...createResponse(errorSchema, 401, '分类树数据不存在'),
        ...createResponse(errorSchema, 500, '查询分类树数据失败'),
      },
    }),
    validator('param', categoryListRequestParamsSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { parentId } = c.req.valid('param');
        const result = await queryCategoryTree(parentId);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询分类树数据失败', error), 500);
      }
    },
  )
  .get(
    '/breadcrumb/:lastId',
    describeRoute({
      tags,
      summary: '分类面包屑查询',
      description: '通过一个父分类,查询出其祖先分类并组成一个一维分类列表',
      responses: {
        ...createResponse(categoryListSchema, 200, '查询分类面包屑数据成功'),
        ...createResponse(errorSchema, 401, '分类面包屑数据不存在'),
        ...createResponse(errorSchema, 500, '查询分类面包屑数据失败'),
      },
    }),
    validator('param', categoryBreadcrumbRequestParamsSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { lastId } = c.req.valid('param');
        const result = await queryCategoryBreadcrumb(lastId);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询分类面包屑数据失败', error), 500);
      }
    },
  );
