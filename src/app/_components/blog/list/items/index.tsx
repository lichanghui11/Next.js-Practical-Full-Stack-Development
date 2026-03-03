import type { FC } from 'react';

import { isNil } from 'lodash';
import { Book, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { PostItem } from '@/server/modules/blog/blog.type';

import { blogApi } from '@/api/post';
import { TagLink } from '@/app/_components/blog/form/tag';
import { formatDate } from '@/app/utils/format-time';
import { cn } from '@/app/utils/utils';

import { getBreadcrumbLinks } from '../../utils';
import { PostActions } from '../actions';
import styles from './style.module.css';

// 通过地址栏的 query 拿到 page limit 渲染出博客列表页面
// 定义这个组件的prop参数，参数来源就是地址栏的query
// 这里的 Record<never, never> 表示默认值为空对象
type BlogListItemsProps<T extends Record<string, any> = Record<never, never>> = {
  page?: string | number;
  limit?: string;
  tag?: string;
  category?: string;
} & T;

export const PostListItems: FC<
  BlogListItemsProps & { activeTag?: string; activeCategories?: string[] }
> = async ({ page, limit, tag, category, activeTag }) => {
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
                  <div className={styles.titleWrapper}>
                    <Link href={`/blog/posts/${item.slug || item.id}`}>
                      <h2 className={styles.title}>{item.title}</h2>
                    </Link>
                    {item.categories.length > 0 && (
                      <div>
                        <span>
                          <Book />
                        </span>
                        {getBreadcrumbLinks(item.categories, 'post').map((category) => (
                          <Link
                            key={category.id}
                            href={category.link!}
                            className="ellips animate-decoration animate-decoration-sm"
                          >
                            #{category.text}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 内容区：摘要 + 元数据 */}
                <div className={styles.cardContent}>
                  <p className={styles.summary}>{item.summary || '暂无摘要'}</p>

                  <div>
                    {!isNil(item.tags) && item.tags.length > 0 && (
                      <div>
                        <span>
                          <Tag />
                        </span>
                        {item.tags?.map((tag) => (
                          <TagLink
                            key={tag.id}
                            tag={tag}
                            className={cn({
                              // 此处的样式需要后续重新写
                              'border-amber-400': activeTag === tag.text,
                            })}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.metadata}>
                    <Calendar className={styles.metadataIcon} />
                    <time>
                      最后更新
                      {formatDate(item.updatedAt || item.createdAt, {
                        withTime: true,
                        withSeconds: true,
                      })}
                    </time>
                    <PostActions item={item} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
