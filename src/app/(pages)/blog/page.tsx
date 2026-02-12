import type { FC } from 'react';

import { isNil } from 'lodash';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import type { PostItem } from '@/server/modules/blog/blog.type';

import { blogApi } from '@/api/post';
import { DeleteButton } from '@/app/_components/blog-components/delete-dialog/delete-button';
import { EditButton } from '@/app/_components/blog-components/edit-button/edit-button';
import { Pagination } from '@/app/_components/blog-components/pagination/pagination';
import { PageSkeleton } from '@/app/_components/skeleton';
import { formatDate } from '@/app/utils/format-time';

import styles from './blog-list.module.css';

// 通过地址栏的 query 拿到 page limit 渲染出博客列表页面
// 定义这个组件的prop参数，参数来源就是地址栏的query
// 这里的 Record<never, never> 表示默认值为空对象
type BlogListPageProps<T extends Record<string, any> = Record<never, never>> = {
  page?: string;
  limit?: string;
} & T;

const BlogListContent: FC<{
  searchParams: Promise<BlogListPageProps>;
}> = async ({ searchParams }) => {
  const { page, limit } = await searchParams;
  const currentPage = isNil(page) ? 1 : Number(page);
  const pageSize = isNil(limit) ? 10 : Number(limit) > 50 ? 50 : Number(limit);
  const result = await blogApi.list({
    page: currentPage,
    limit: pageSize,
  });
  console.log('postApi.list: ', result);
  // 这里 result 的 ClientResponse 是增强了的 ResponseType，里面有ok/status/headers/json() 这些 Response 的能力
  if (!result.ok) throw new Error((await result.json()).message);
  const posts = await result.json();

  if (posts.meta.totalPages && posts.meta.totalPages > 0 && Number(page) > posts.meta.totalPages) {
    return redirect('/');
  }
  return (
    <div className={styles.container}>
      {posts.data.length === 0 ? (
        <div className={styles.empty}>暂无博客文章</div>
      ) : (
        <div className={styles.blogGrid}>
          {posts.data.map((item: PostItem) => (
            <article
              key={item.id}
              className={styles.blogCard}
              style={{ '--bg-img': `url(${item.thumbnail})` } as any}
            >
              {/* 白色背景内层 */}
              <div className={styles.cardInner}>
                {/* 头部行：头像 + 标题 */}
                <div className={styles.cardHeader}>
                  <div className={styles.thumbnailContainer}>
                    <Image
                      src={item.thumbnail || '/placeholder-blog.png'}
                      fill
                      className={styles.thumbnail}
                      alt={item.title}
                      // 如果使用bun,请务必加上这个,因为bun中启用远程图片优化会报错
                      unoptimized
                    />
                  </div>
                  <div className={styles.titleWrapper}>
                    <Link href={`/blog/${item.slug || item.id}`}>
                      <h2 className={styles.title}>{item.title}</h2>
                    </Link>
                  </div>
                </div>

                {/* 内容区：摘要 + 元数据 */}
                <div className={styles.cardContent}>
                  <p className={styles.summary}>{item.summary || '暂无摘要'}</p>

                  <div className={styles.metadata}>
                    <Calendar className={styles.metadataIcon} />
                    <time>
                      首发于：
                      {formatDate(item.createdAt, {
                        withTime: true,
                        withSeconds: true,
                      })}
                    </time>
                    <time>
                      更新于：
                      {formatDate(item.updatedAt, {
                        withTime: true,
                        withSeconds: true,
                      })}
                    </time>
                    <EditButton id={item.id} className="ml-auto" />
                    <DeleteButton className="" id={item.id} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {posts.meta.totalPages > 1 && <Pagination meta={posts.meta} />}
    </div>
  );
};

const BlogListPage: FC<{
  searchParams: Promise<BlogListPageProps>;
}> = ({ searchParams }) => (
  <Suspense
    fallback={
      <div className={styles.container}>
        <PageSkeleton />
      </div>
    }
  >
    <BlogListContent searchParams={searchParams} />
  </Suspense>
);

export default BlogListPage;
