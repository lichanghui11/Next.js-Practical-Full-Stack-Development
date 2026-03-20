'use client';

import type { FC } from 'react';

import { isNil } from 'lodash';
import { Book, Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { PostItem } from '@/server/modules/blog/blog.type';

import { TagLink } from '@/app/_components/blog/form/tag';
import { formatDate } from '@/app/utils/format-time';
import { cn } from '@/app/utils/utils';

import { getBreadcrumbLinks } from '../../utils';
import { PostActions } from '../actions';
import { PostListItemMotion } from '../item-motion';
import styles from './style.module.css';

// 通过地址栏的 query 拿到 page limit 渲染出博客列表页面
// 定义这个组件的prop参数，参数来源就是地址栏的query
// 这里的 Record<never, never> 表示默认值为空对象
type BlogListItemsProps<T extends Record<string, any> = Record<never, never>> = {
  page?: string | number;
  limit?: string;
  items: PostItem[];
} & T;

export const PostListItems: FC<
  BlogListItemsProps & { activeTag?: string; activeCategories?: string[] }
> = ({ items: posts, activeTag }) => {
  return (
    <div className={styles.container}>
      {posts.length === 0 ? (
        <div className={styles.empty}>暂无博客文章</div>
      ) : (
        <div className={styles.blogGrid}>
          {posts.map((item: PostItem) => (
            <PostListItemMotion key={item.id}>
              <article
                key={item.id}
                className={styles.blogCard}
                style={{ '--bg-img': `url(${item.thumbnail})` } as any}
              >
                {/* 白色背景内层 */}
                <div className={styles.cardInner}>
                  {item.thumbnail && (
                    <div className={styles.thumbnailWrapper}>
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className={styles.thumbnailImage}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  {/* 头部行：头像 + 标题 */}
                  <div className={styles.cardHeader}>
                    <div className={styles.thumbnailContainer}>
                      <Image
                        src={item.thumbnail || '/placeholder-blog.png'}
                        alt={item.title}
                        fill
                        className={styles.thumbnail}
                        sizes="40px"
                      />
                    </div>
                    <div className={styles.titleWrapper}>
                      <Link href={`/blog/posts/${item.slug || item.id}`}>
                        <h2 className={styles.title}>{item.title}</h2>
                      </Link>
                      {item.categories.length > 0 && (
                        <div className="flex gap-0.5">
                          <span className={styles.iconWrapper}>
                            <Book className={styles.iconSmall} />
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
                        <div className="flex gap-0.5">
                          <span className={styles.iconWrapper}>
                            <Tag className={styles.iconSmall} />
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
                      <PostActions item={item} className="ml-auto" />
                    </div>
                  </div>
                </div>
              </article>
            </PostListItemMotion>
          ))}
        </div>
      )}
    </div>
  );
};
