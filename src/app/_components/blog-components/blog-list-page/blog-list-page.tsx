'use client';
// 通过地址栏的 query 拿到 page limit 渲染出博客列表页面
import type { FC } from 'react';

import { isNil } from 'lodash';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { queryPosts } from '@/app/fake-database/fake-data-actions';

import { BackCreateTool } from '../back-create-tool/back-create-tool';

// 定义这个组件的prop参数，参数来源就是地址栏的query
// 这里的 Record<never, never> 表示默认值为空对象
type BlogListPageProps<
  T extends Record<string, any> = Record<never, never>,
> = {
  page?: string;
  limit?: string;
} & T;

export const BlogListPage: FC<{
  searchParams: Promise<BlogListPageProps>;
}> = async ({ searchParams }) => {
  const { page, limit } = await searchParams;
  const currentPage = isNil(page) ? 1 : Number(page);
  const pageSize = isNil(limit)
    ? 10
    : Number(limit) > 50
      ? 50
      : Number(limit);
  const posts = await queryPosts({
    page: currentPage,
    pageSize,
  });
  return (
    <div>
      <BackCreateTool />
      <div>
        {posts.data.map((item) => (
          <div key={item.id}>
            <div>
              <Image
                src={item.thumbnail || ''}
                width={100}
                height={100}
                alt={item.title}
              ></Image>
              <Link href={`/blog/${item.id}`}>
                {item.title}
              </Link>
            </div>

            <div>
              <div>{item.summary || ''}</div>

              <div>
                <Calendar />
                {item.createdAt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
