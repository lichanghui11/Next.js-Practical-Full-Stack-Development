import type { FC } from 'react';

import { Calendar, Tag } from 'lucide-react';
import Image from 'next/image';

import { queryPostById } from '@/app/_actions/post';
import { BackButton } from '@/app/_toturial-components/home/back-button/back-button';
import { formatDate } from '@/app/utils/format-time';

import styles from './blog-detail.module.css';

const BlogDetail: FC<{
  params: Promise<{ id: string }>;
}> = async ({ params }) => {
  const { id } = await params;
  const post = await queryPostById(id);

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
      <article className={styles.content}>
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </article>
    </div>
  );
};

export default BlogDetail;
