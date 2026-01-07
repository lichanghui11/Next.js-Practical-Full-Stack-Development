import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { isNil } from 'lodash';
import { notFound } from 'next/navigation';

import { BlogUpdate } from '@/app/_components/blog-components/blog-update-form/blog-update';

// 添加动态标记，强制使用 SSR
export const dynamic = 'force-dynamic';

// 第一个参数不使用也需要解构，否则无法获取 parent 元数据
export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
  const parentMetadata = await parent;
  return {
    title: `编辑文章 - ${parentMetadata.title?.absolute}`,
    description: '编辑文章内容',
  };
};

const BlogEditPage: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;
  if (isNil(id)) return notFound();
  return <BlogUpdate id={id} />;
};

export default BlogEditPage;
