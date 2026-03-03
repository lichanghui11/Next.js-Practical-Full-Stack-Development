import type { FC } from 'react';

import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { blogApi } from '@/api/post';

import { BlogBreadcrumb } from '../breadcrumb';
import { BlogIndexSkeleton } from '../skeleton';
import { getBreadcrumbCategories, getBreadcrumbLinks } from '../utils';
import { PostListItems } from './items';
import { BlogListPagination } from './pagination';
import { Sidebar } from './sidebar';

export interface BlogIndexProps {
  tag?: string;
  categories?: string[];
  page?: number;
  limit?: number;
}

export const BlogIndex: FC<BlogIndexProps> = async ({ page, limit = 8, tag, categories }) => {
  // 得到的是和给定的字符串分类数组对应的分类对象组成的扁平数组
  const categoryItems = await getBreadcrumbCategories(categories || []);
  if (!categoryItems) return notFound();

  const lastCategory =
    categoryItems.length > 0 ? categoryItems[categoryItems.length - 1] : undefined;

  const breadcrumbs = getBreadcrumbLinks(categoryItems);

  const result = await blogApi.list({
    page,
    limit,
    tag,
    category: lastCategory?.id,
    orderBy: 'desc',
  });
  if (!result.ok) throw new Error((await result.json()).message);
  const { _item, meta } = await result.json();
  if (meta.totalPages && meta.totalPages > 0 && meta.currentPage > meta.totalPages)
    return redirect('/');
  return (
    <div className="">
      <Suspense fallback={<BlogIndexSkeleton />}>
        <div className="flex gap-5 m-auto w-[1000px]">
          <div>
            <div>
              <BlogBreadcrumb items={breadcrumbs} tag={tag} basePath="" />
            </div>
            <PostListItems page={page} limit={String(limit)} activeTag={tag} />
            {meta.totalPages > 1 && <BlogListPagination meta={meta}></BlogListPagination>}
          </div>
          <Sidebar activedCategories={categoryItems} activedTag={tag} />
        </div>
      </Suspense>
    </div>
  );
};
