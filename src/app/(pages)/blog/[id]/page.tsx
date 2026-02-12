import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { IBlogBreadcrumbItem } from '@/app/utils/get-breadcrumb';

import { blogApi } from '@/api/post';
import { BackButton } from '@/app/_components/blog-components/back-button/back-button';
import { BlogBreadCrumb } from '@/app/_components/blog-components/breadcrumb';
import { MdxRenderer } from '@/app/_components/mdx/mdx-client/render';
import { PostContentSkeleton } from '@/app/_components/skeleton';
import { formatDate } from '@/app/utils/format-time';
import { getBreadcrumbsLinks } from '@/app/utils/get-breadcrumb';
import { cn } from '@/app/utils/utils';

import styles from './blog-detail.module.css';
export const generateMetadata = async (
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const id = (await params).id;

  const result = await blogApi.detailById(id);
  if (!result.ok) {
    /** 如果这里请求不成功，不需要做任何事，这里只是元数据相关的东西，不涉及页面 */
    return {};
  }
  const post = await result.json();
  return {
    title: `${post?.title || '博客详情'} - ${(await parent).title?.absolute}`,
    description: post ? post.description || post.title : '您访问的文章不存在或已被删除',
    keywords: post?.keywords ? post.keywords.split(',').map((kw: string) => kw.trim()) : [],
  };
};

const BlogDetail: FC<{
  params: Promise<{ id: string }>;
}> = async ({ params }) => {
  const { id } = await params;

  const result = await blogApi.detailById(id);
  // 这里不用写 try catch，这个错误被内部处理的，直接通过 ok 字段判断即可
  if (!result.ok) {
    if (result.status !== 404) throw new Error((await result.json()).message);
    return notFound();
  }
  const post = await result.json();
  const breadcrumbs: IBlogBreadcrumbItem[] = [...getBreadcrumbsLinks(post.categories, 'post')];
  breadcrumbs.push({
    id: post.id,
    text: post.title,
  });
  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>文章不存在或已被删除</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      {/* 文章头部 */}
      <div className={cn('page-container')}>
        <BlogBreadCrumb items={breadcrumbs} basePath="" />
      </div>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Calendar className={styles.metaIcon} />
            <time>
              {formatDate(post.createdAt, {
                withTime: true,
              })}
            </time>
          </div>
          {post.summary && (
            <div className={styles.metaItem}>
              <Tag className={styles.metaIcon} />
              <span>有摘要</span>
            </div>
          )}
        </div>
      </header>

      {/* 文章缩略图 */}
      {post.thumbnail && (
        <div className={styles.thumbnail}>
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className={styles.thumbnailImage}
            priority
          />
        </div>
      )}

      {/* 文章摘要 */}
      {post.summary && <div className={styles.summary}>{post.summary}</div>}

      {/* 文章内容 */}
      <Suspense fallback={<PostContentSkeleton />}>
        <MdxRenderer source={post.content} showReadingTime />
      </Suspense>
    </div>
  );
};

export default BlogDetail;
