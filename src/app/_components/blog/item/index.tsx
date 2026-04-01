import type { FC } from 'react';

import { Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { TagType } from '@/server/modules/tag/tag.type';

import { blogApi } from '@/api/post';
import { MdxRenderer } from '@/app/_components/mdx/mdx-client/render';
import { PostContentSkeleton } from '@/app/_components/skeleton';
import { formatDate } from '@/app/utils/format-time';
import { cn } from '@/app/utils/utils';

import type { IBlogBreadcrumbItem } from '../breadcrumb';

import { BlogBreadcrumb } from '../breadcrumb';
import { PostEditButton } from '../list/actions/edit-button';
import { getBreadcrumbLinks } from '../utils';
import styles from './style.module.css';

export const BlogDetail: FC<{
  id: string;
}> = async ({ id }) => {
  const result = await blogApi.detailById(id);
  // 这里不用写 try catch，这个错误被内部处理的，直接通过 ok 字段判断即可
  if (!result.ok) {
    if (result.status !== 404) throw new Error((await result.json()).message);
    return notFound();
  }
  const post = await result.json();
  console.log('文章详情：', post);
  const breadcrumbs: IBlogBreadcrumbItem[] = [...getBreadcrumbLinks(post.categories, 'post')];
  // 这里使用的 post 模式的面包屑，最后一个元素是可以点击的
  // 手动 push 一个当前文章的标题显示在最后，没有 link ，不可点击
  breadcrumbs.push({
    id: post.id,
    text: post.title,
  });

  return (
    <div>
      <div className={styles.container}>
        <Suspense fallback={<PostContentSkeleton />}>
          {/* 文章头部 */}
          <div className={cn('page-container')}>
            <BlogBreadcrumb items={breadcrumbs} basePath="/blog" />
          </div>

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

          <MdxRenderer
            source={post.content}
            showReadingTime
            header={
              <>
                <header className={styles.header}>
                  <h1 className={styles.title}>{post.title}</h1>
                  <div className={styles.headerActions}>
                    <PostEditButton item={post} iconBtn />
                  </div>
                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <Calendar className={styles.metaIcon} />
                      <time>
                        {formatDate(post.updatedAt ? post.updatedAt : post.createdAt, {
                          withTime: true, // 显示时分
                        })}
                      </time>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>
                          <Tag className={styles.metaIcon} />
                        </span>
                        {post.tags.map((tag: TagType) => {
                          return (
                            <Link key={tag.id} href={`/blog?tag=${tag.text}`}>
                              {tag.text}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </header>
              </>
            }
          />
        </Suspense>
      </div>
    </div>
  );
};
