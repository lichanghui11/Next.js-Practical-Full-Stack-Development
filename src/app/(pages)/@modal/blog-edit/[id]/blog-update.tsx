import type { FC, PropsWithChildren } from 'react';

// 这个组件是封装好的用于 新建和更新 的表单组件，通过参数不同，可以实现 新建和更新
import { BlogForm } from '@/app/_toturial-components/home/submit-form/blog-form';
import { queryPostById } from '@/app/fake-database/fake-data-actions';
// 这里封装的是 编辑博客 使用的type:update的表单组件
export const BlogUpdate: FC<
  PropsWithChildren<{ id: string }>
> = async ({ id }) => {
  const post = await queryPostById(id);
  return <BlogForm type="update" blog={post}></BlogForm>;
};
