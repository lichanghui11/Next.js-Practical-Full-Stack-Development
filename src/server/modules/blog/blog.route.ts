import { describeRoute, validator } from 'hono-openapi';
import { isNil } from 'lodash';

import type { PostPaginationOptions } from '@/database/repositories/post.repo';
import type { PageParams } from '@/database/types/pagination';

import { createHonoApp } from '@/server/common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '@/server/common/error';
import { createResponse } from '@/server/common/response';
import { errorSchema } from '@/server/common/schema';

import {
  buildPostRequestSchema,
  postDetailByIdRequestSchema,
  postDetailBySlugRequestSchema,
  postDetailRequestSchema,
  postItemSchema,
  postPaginateSchema,
  postPaginationRequestSchema,
  totalPagesRequestSchema,
  totalPagesSchema,
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

// tags 的意义就是：给接口分组/分类，方便在文档里组织展示，也方便后续做筛选、权限/负责人标注等。
// 	一个接口可以同时属于 Posts 和 Admin（看实际情况是怎么设计的）
const tags: string[] = ['文章操作'];
export const postPath = '/blog';
// 这里的 typeof 是类型操作符，只在编译阶段生效，编译器会扫描整个文件来解析类型，不受代码书写顺序的限制。
// 所以可以提前使用 postApi 的类型
export type PostApiType = typeof postApi;

const app = createHonoApp();
export const postApi = app
  // 请求博客首页的文章列表
  .get(
    '/',
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '博客首页的文章列表',
      description: '博客首页的文章列表，带有分页数据',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postPaginateSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '查询文章分页数据失败'),
      },
    }),
    validator('query', postPaginationRequestSchema, defaultValidatorErrorHandler),
    // defaultValidatorErrorHandler 是仅在 schema 校验失败时触发的自定义处理函数。校验通过不会调用；不传则用默认失败响应。
    async (c) => {
      try {
        // /api/blogs?page=1&pageSize=10
        // const query = c.req.query(); // 这个是原始取数据的方式，取到的是字符串
        const query = c.req.valid('query'); // 这个取的是经过 validator 校验后的数据
        const options = Object.fromEntries(
          Object.entries(query).map(([k, v]) => {
            if (k === 'page') {
              return ['currentPage', Number(v)];
            }
            if (['limit', 'currentPage'].includes(k)) {
              return [k, Number(v)];
            }
            return [k, v];
          }),
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
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '页面总数',
      description:
        '根据每页显示的文章条目的数量和文章总数计算出总页数，如果没有合法的limit参数，默认为10',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(totalPagesSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '查询页面总数失败'),
      },
    }),
    validator('query', totalPagesRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const query = c.req.valid('query');
        const options = Object.fromEntries(
          Object.entries(query).map(([key, value]) =>
            ['limit'].includes(key) ? [key, Number(value)] : [key, value],
          ),
        ) as unknown as Omit<PostPaginationOptions, 'currentPage'>;
        // const limit = query.limit ? Number(query.limit) : 10; // 这一行是添加 tag category 这两个表之前的查询方式
        const result = await queryPostTotalPage(options);
        return c.json({ result }, 200);
      } catch (error) {
        return c.json(createErrorResult('查询页面总数失败', error), 500);
      }
    },
  )
  // 根据 slug || id 来查询单条文章
  .get(
    '/:item',
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '查询单条文章',
      description: '根据 slug 或 id 查询单条文章详情',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postItemSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 404, '文章不存在'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '查询文章详情失败'),
      },
    }),
    validator('param', postDetailRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { item } = c.req.valid('param');
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
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '根据 ID 查询文章',
      description: '只通过文章 ID 来查询文章详情',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postItemSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 404, '文章不存在'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '查询文章详情失败'),
      },
    }),
    validator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.valid('param'); // 拿到的是路径参数 { id: id }
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
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '根据 Slug 查询文章',
      description: '根据文章 Slug 查询文章详情',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postItemSchema, 200, '请求成功'),
        ...createResponse(errorSchema, 404, '文章不存在'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '查询文章详情失败'),
      },
    }),
    validator('param', postDetailBySlugRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { slug } = c.req.valid('param');
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
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '新增文章',
      description: '新增一篇博客文章',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postItemSchema.nullable(), 201, '请求成功'), // 新增成功返回当前的文章数据，可能为 null
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '新增文章失败'),
      },
    }),
    validator('json', buildPostRequestSchema(), defaultValidatorErrorHandler),
    async (c) => {
      try {
        const body = await c.req.json();
        const result = await addPost(body);
        return c.json(result, 201);
      } catch (error) {
        return c.json(createErrorResult('新增文章失败', error), 500);
      }
    },
  )
  // 更新对应 id 的文章
  .patch(
    '/:id',
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '更新文章',
      description: '更新一篇已有的博客文章',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postItemSchema.nullable(), 200, '请求成功'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '更新文章失败'),
      },
    }),
    validator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler),
    validator('json', buildPostRequestSchema(), defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
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
    // OpenApi 中间件
    describeRoute({
      tags,
      summary: '删除一篇文章',
      description: '删除一篇已经存在的文章',
      responses: {
        // 这里的状态码是 HTTP 层面的
        ...createResponse(postItemSchema.nullable(), 200, '请求成功'),
        ...createResponse(errorSchema, 400, '请求数据验证失败'),
        ...createResponse(errorSchema, 500, '删除文章失败'),
      },
    }),
    validator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const result = await deletePost(id);
        return c.json(result, 200);
      } catch (error) {
        return c.json(createErrorResult('删除文章失败', error), 500);
      }
    },
  );
