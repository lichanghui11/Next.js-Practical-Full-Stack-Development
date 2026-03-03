import type { Metadata } from 'next';
import type { FC } from 'react';

import type { IPostMetadata } from '@/app/_components/blog/metadata';

import { BlogDetail } from '@/app/_components/blog/item';
import { getPostItemMetadata } from '@/app/_components/blog/metadata';

export const generateMetadata = async (
  { params }: { params: Promise<{ item: string }> },
  parent: IPostMetadata['parent'],
): Promise<Metadata> => getPostItemMetadata({ params, parent });

const PostItemPage: FC<{
  params: Promise<{ item: string }>;
}> = async ({ params }) => {
  const { item } = await params;
  console.log('文章详情： item:', item);
  return <BlogDetail id={item} />;
};

export default PostItemPage;
