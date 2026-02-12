import { isNil } from 'lodash';

import type { PostApiType } from '@/server/modules/blog/blog.route';
import type {
  PostCreateOrUpdateData,
  PostPaginateRequestQuery,
} from '@/server/modules/blog/blog.type';

import { buildClient, fetchApi } from '@/lib/rpc.client';

// 直接定义路径，避免从 'use server' 文件中导入非 async 函数的值
const blogClient = buildClient<PostApiType>('/blog');

// 返回的是一个 Response 对象
export const blogApi = {
  // 分页数据
  list: async (options: PostPaginateRequestQuery): Promise<Response> => {
    const page = isNil(options.page) || Number(options.page) < 1 ? 1 : Number(options.page);
    const limit = isNil(options.limit) || Number(options.limit) < 1 ? 10 : Number(options.limit);
    const { tag, category, orderBy } = options;
    return fetchApi(blogClient, (client) => {
      return client.index.$get({
        query: {
          tag,
          category,
          orderBy,
          page: page.toString(),
          limit: limit.toString(),
        },
      });
    });
  },

  // 单篇文章详情 这里可以根据 slug 或者 id 来查询
  detail: async (item: string): Promise<Response> =>
    fetchApi(blogClient, (client) => client[':item'].$get({ param: { item } })),

  // 通过 slug 查询某篇文章
  detailBySlug: async (slug: string): Promise<Response> =>
    fetchApi(blogClient, (client) => client.bySlug[':slug'].$get({ param: { slug } })),

  // 通过 id 查询某篇文章
  detailById: async (id: string): Promise<Response> =>
    fetchApi(blogClient, (client) => client.byId[':id'].$get({ param: { id } })),

  // 根据每页的文章数量 limit 获取总页数
  totalPage: async (limit: string): Promise<Response> =>
    fetchApi(blogClient, (client) => client.limit.$get({ query: { limit } })),

  // 创建文章
  create: async (data: PostCreateOrUpdateData): Promise<Response> =>
    fetchApi(blogClient, (client) => client.index.$post({ json: { ...data } })),

  // 更新文章
  update: async (id: string, data: PostCreateOrUpdateData): Promise<Response> =>
    fetchApi(blogClient, (client) => client[':id'].$patch({ param: { id }, json: { ...data } })),

  // 删除文章
  delete: async (id: string): Promise<Response> =>
    fetchApi(blogClient, (client) => client[':id'].$delete({ param: { id } })),
};
