import type { FC } from 'react';

import { isNil } from 'lodash';
import { notFound } from 'next/navigation';

import { BlogUpdate } from '@/app/_components/blog-components/blog-update-form/blog-update';

// 添加动态标记，强制使用 SSR
export const dynamic = 'force-dynamic';
const BlogEditPage: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;
  if (isNil(id)) return notFound();
  return <BlogUpdate id={id} />;
};

export default BlogEditPage;
