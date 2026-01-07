import type { FC, PropsWithChildren } from 'react';

import { queryPostByIdOrSlug } from '@/app/_actions/post';
// 这个组件是封装好的用于 新建和更新 的表单组件，通过参数不同，可以实现 新建和更新
import { BlogForm } from '@/app/_components/blog-components/submit-form/blog-form';
// 这里封装的是 编辑博客 使用的type:update的表单组件
export const BlogUpdate: FC<PropsWithChildren<{ id: string }>> = async ({ id }) => {
  const post = await queryPostByIdOrSlug(id);
  console.log('post', post);
  if (!post) {
    return <div>文章未找到</div>;
  }

  return <BlogForm type="update" blog={post}></BlogForm>;
};
