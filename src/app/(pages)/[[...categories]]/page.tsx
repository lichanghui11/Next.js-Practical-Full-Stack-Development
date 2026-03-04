import type { FC } from 'react';

import type { BlogIndexProps } from '@/app/_components/blog/list';
import type { IBlogMetadata } from '@/app/_components/blog/metadata';

import { BlogIndex } from '@/app/_components/blog/list';
import { getBlogListMetadata } from '@/app/_components/blog/metadata';

export const generateMetadata = async (
  metadata: Omit<IBlogMetadata, 'parent'>,
  parent: IBlogMetadata['parent'],
) => getBlogListMetadata({ ...metadata, parent });

const BlogIndexPage: FC<{
  searchParams: Promise<Omit<BlogIndexProps, 'categories'>>;
  params: Promise<{ categories?: string[] }>;
}> = async ({ searchParams, params }) => {
  const { categories } = await params;
  const rest = { ...(await searchParams), categories };
  return <BlogIndex {...rest} />;
};

export default BlogIndexPage;
