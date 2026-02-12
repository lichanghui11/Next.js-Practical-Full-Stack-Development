import type { TagApiType } from '@/server/modules/tag/tag.route';

import { buildClient, fetchApi } from '@/lib/rpc.client';

// 直接定义路径，避免从 'use server' 文件中导入非 async 函数的值
const tagClient = buildClient<TagApiType>('/tags');

export const tagApi = {
  // 查出所有的标签
  list: async (): Promise<Response> => fetchApi(tagClient, (client) => client.index.$get()),

  // 根据某个 id 查出该标签的详情
  detail: async (id: string): Promise<Response> =>
    fetchApi(tagClient, (client) => client[':id'].$get({ param: { id } })),
};
