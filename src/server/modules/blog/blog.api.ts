import { zValidator } from '@hono/zod-validator';
import { isNil } from 'lodash';

import type { PageParams } from '@/database/types/pagination';

import { createHonoApp } from '@/server/common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '@/server/common/error';

import {
  buildPostRequestSchema,
  postDetailByIdRequestSchema,
  postDetailBySlugRequestSchema,
  postDetailRequestSchema,
  postPaginationQueryRequestSchema,
  totalPagesRequestSchema,
} from './blog.schema';
import {
  addPost,
  deletePost,
  queryPostByIdOrSlug,
  queryPostBySlug,
  queryPosts,
  queryPostTotalPage,
  updatePost,
} from './blog.service';
/**
 * 这里存在两个“层面”的状态：
	1.	HTTP 状态码（网络层/协议层）：通过 c.json(..., 404/500/200) 传出去的那个
	2.	业务错误信息（响应体/应用层）：用 createErrorResult(...) 生成的 JSON 里的 message / code / ok 等字段
 * 它们是两套概念，可以一致，也可以不一致（但一般建议保持一致）。
 */
const app = createHonoApp();
export const postApi = app
  // 请求博客首页的文章列表
  .get(
    '/',
    zValidator('query', postPaginationQueryRequestSchema, defaultValidatorErrorHandler),
    // 仅在 schema 校验失败时触发的自定义处理函数。校验通过不会调用；不传则用默认失败响应。
    async (c) => {
      try {
        // /api/blogs?page=1&pageSize=10
        const query = c.req.query();
        const options = Object.fromEntries(
          Object.entries(query).map(([k, v]) => [k, Number(v)]),
        ) as unknown as PageParams;
        // 上方 options 的类型为什么这么添加：这个对象的值可能不是 PageParams 类型，但是我在写代码的时候保证只用这两个字段来传参，不用其他字段，这是我的目的，具体我后续在看我请求时候的实际传参。
        const result = await queryPosts(options);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询文章分页数据失败', error), 500);
      }
    },
  )
  // 请求页面总数，参数中是每页的数量 limit
  .get(
    '/limit',
    zValidator('query', totalPagesRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const query = c.req.query();
        const limit = query.limit ? Number(query.limit) : undefined;
        const result = await queryPostTotalPage({ pageSize: limit });
        return c.json({ result }, 200);
      } catch (error) {
        return c.json(createErrorResult('查询页面总数失败', error), 500);
      }
    },
  )
  // 根据 slug || id 来查询文章
  .get(
    '/:item',
    zValidator('param', postDetailRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { item } = c.req.param();
        const result = await queryPostByIdOrSlug(item);
        if (!isNil(result)) return c.json(result, 200);
        return c.json(createErrorResult('文章不存在'), 404);
      } catch (error) {
        return c.json(createErrorResult('查询文章失败', error), 500);
      }
    },
  )
  // 根据 id 来查询文章，没有单独使用 ID 查询的方法，复用 queryPostByIdOrSlug
  .get(
    '/byId/:id',
    zValidator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.param(); // 拿到的是路径参数 { id: id }
        const result = await queryPostByIdOrSlug(id);
        if (!isNil(result)) return c.json(result, 200);
        return c.json(createErrorResult('文章不存在'), 404);
      } catch (error) {
        return c.json(createErrorResult('查询文章失败', error), 500);
      }
    },
  )
  // 根据 slug 来查询文章
  .get(
    '/bySlug/:slug',
    zValidator('param', postDetailBySlugRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { slug } = c.req.param();
        const result = await queryPostBySlug(slug);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('查询文章失败', error), 500);
      }
    },
  )
  // 新增一篇文章
  .post(
    '/',
    zValidator('json', buildPostRequestSchema(), defaultValidatorErrorHandler),
    async (c) => {
      try {
        const body = await c.req.json();
        const result = await addPost(body);
        return c.json(result, 201);
      } catch (error) {
        return c.json(createErrorResult('创建文章失败', error), 500);
      }
    },
  )
  // 更新对应 id 的文章
  .patch(
    '/:id',
    zValidator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler),
    zValidator('json', buildPostRequestSchema(), defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.param();
        const body = await c.req.json();
        const result = await updatePost({ id, ...body });
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('更新文章失败', error), 500);
      }
    },
  )
  // 删除对应 id 的文章
  .delete(
    '/:id',
    zValidator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.param();
        const result = await deletePost(id);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('删除文章失败', error), 500);
      }
    },
  );
