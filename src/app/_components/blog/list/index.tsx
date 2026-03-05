import type { FC } from 'react';

import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

import { blogApi } from '@/api/post';
import { cn } from '@/app/utils/utils';

import { BlogBreadcrumb } from '../breadcrumb';
import { BlogIndexSkeleton } from '../skeleton';
import { getBreadcrumbCategories, getBreadcrumbLinks } from '../utils';
import { PostListItems } from './items';
import { BlogListPagination } from './pagination';
import { Sidebar } from './sidebar';
import $styles from './style.module.css';

export interface BlogIndexProps {
  tag?: string;
  categories?: string[];
  page?: number;
  limit?: number;
}

export const BlogIndex: FC<BlogIndexProps> = async ({ page, limit = 8, tag, categories }) => {
  // 得到的是和给定的字符串分类数组对应的分类对象组成的扁平数组
  const categoryItems = await getBreadcrumbCategories(categories || []); // [blog] -> []
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
  const res = await result.json();
  console.log('博客列表数据： ', res.data);
  const meta = res.meta;
  if (meta.totalPages && meta.totalPages > 0 && meta.currentPage > meta.totalPages)
    return redirect('/');
  return (
    <Suspense fallback={<BlogIndexSkeleton />}>
      <div className={cn('page-container', $styles.blogIndex)}>
        <div className={$styles.container}>
          <div className="w-full flex-none">
            <BlogBreadcrumb items={breadcrumbs} tag={tag} basePath="" />
          </div>
          {/** 需要把 分类ID 传给这个子组件 */}
          <PostListItems page={page} limit={String(limit)} activeTag={tag} items={res.data} />
          {meta.totalPages > 1 && <BlogListPagination meta={meta}></BlogListPagination>}
        </div>
        <Sidebar activedCategories={categoryItems} activedTag={tag} />
      </div>
    </Suspense>
  );
};
