import type { FC } from 'react';

import { isNil } from 'lodash';
import { notFound } from 'next/navigation';

import { ModalProvider } from '@/app/_components/blog-components/modal/modal';

import { BlogUpdate } from './blog-update';

/**
 * 可以从路径里面拿到的参数：
 * {
 *  params,        // 路径参数（动态路由）
 *  searchParams, // 查询参数（URL ? 后面）
 * }
 * 这个路由拦截只使用在编辑博客的场景
 */
// 这里从url中获取id
const EditBlogModal: FC<{
  params: Promise<{ id: string }>;
}> = async ({ params }) => {
  const { id } = await params;
  if (isNil(id)) return notFound();
  return (
    <ModalProvider title="编辑博客" matchedPath={['/blog-edit/*']}>
      <BlogUpdate id={id} />
    </ModalProvider>
  );
};

export default EditBlogModal;
