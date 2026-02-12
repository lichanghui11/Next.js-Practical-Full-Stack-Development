import type { CategoryApiType } from '@/server/modules/category/category.route';

import { buildClient, fetchApi } from '@/lib/rpc.client';

// 直接定义路径，避免从 'use server' 文件中导入非 async 函数的值
const categoryClient = buildClient<CategoryApiType>('/categories');

// 每一个接口都对应了一个 API 路由
export const categoryApi = {
  // 获取分类列表，一个扁平的数组
  list: async (parentId?: string): Promise<Response> =>
    fetchApi(categoryClient, (client) => client[':parentId?'].$get({ param: { parentId } })),

  // 获取分类面包屑，通过一个分类ID查出其所有的祖先分类组成的一个一维数组
  breadcrumb: async (lastId: string): Promise<Response> =>
    fetchApi(categoryClient, (client) => client.breadcrumb[':lastId'].$get({ param: { lastId } })),

  // 获取分类树，一个树状结构的分类数据，通过一个分类ID查出包括自身在内的所有子节点，可以用于菜单显示
  tree: async (parentId?: string): Promise<Response> =>
    fetchApi(categoryClient, (client) => client.tree[':parentId?'].$get({ param: { parentId } })),
};
