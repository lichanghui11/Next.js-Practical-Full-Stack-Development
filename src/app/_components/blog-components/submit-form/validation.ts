import { isNil } from 'lodash';

import { fetchApi } from '@/lib/rpc.client';
// zod 相关工具函数

/**
 * slug 唯一性验证器
 * @param slug
 * 1. 构造验证器的时候，将 id 传入闭包，用于比较
 * 2. 使用验证器的时候，传入 slug ，查出对应的文章
 * 3. 如果两者 id 相同，则通过验证
 * 4. 如果不同，则不通过验证
 */
export const slugUniqueValidator = (id?: string) => async (slug?: string | undefined | null) => {
  // 没有 创建过 slug
  if (isNil(slug) || slug.length === 0) {
    return true;
  }
  // 有 slug , 查出来
  const result = await fetchApi((honoClient) => {
    return honoClient.api.blogs.bySlug[':slug'].$get({ param: { slug } });
  });
  if (!result.ok) throw new Error((await result.json()).message);

  const post = await result.json();
  // 进行比较
  if (!isNil(post) && post.id !== id) {
    return false;
  }
  return true;
};
