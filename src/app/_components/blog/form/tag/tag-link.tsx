'use client';
import type { FC } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import type { TagType } from '@/server/modules/tag/tag.type';

export const TagLink: FC<{ tag: TagType; className?: string }> = ({ tag, className }) => {
  const searchParams = useSearchParams();
  // 数据示例：category=tech&page=3&tags=react&tags=nextjs
  const pathname = usePathname();
  // 数据示例: "/blog/posts"
  const getPageUrl = useCallback(
    (item: TagType) => {
      const params = new URLSearchParams(searchParams);
      if (params.has('tag')) params.delete('tag');
      params.set('tag', item.text);
      return pathname + (params.toString() ? `?${params.toString()}` : '');
    },
    [searchParams, pathname],
  );
  return (
    <Link key={tag.id} href={getPageUrl(tag)} className={className ?? ''}>
      {tag.text}
    </Link>
  );
};
