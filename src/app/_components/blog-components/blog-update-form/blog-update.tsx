import type { FC, PropsWithChildren } from 'react';

import { BlogForm } from '@/app/_components/blog-components/submit-form/blog-form';
import { fetchApi } from '@/lib/rpc.client';
// 这里封装的是 编辑博客 使用的type:update的表单组件
export const BlogUpdate: FC<PropsWithChildren<{ id: string }>> = async ({ id }) => {
  const result = await fetchApi((honoClient) => {
    return honoClient.api.blogs.byId[':id'].$get({ param: { id } });
  });
  if (!result.ok) throw new Error((await result.json()).message);
  const post = await result.json();
  if (!post) {
    return <div>文章未找到</div>;
  }

  return (
    <BlogForm
      type="update"
      // 后端序列化为 string 的时间字段转换回 Date 以满足组件类型要求
      blog={{
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }}
    ></BlogForm>
  );
};
