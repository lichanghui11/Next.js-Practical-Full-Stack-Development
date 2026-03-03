'use client';
import type { FC } from 'react';

import DocumentEdit24Regular from '@ricons/fluent/DocumentEdit24Regular';
import { UserPen } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from 'ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui/tooltip';

import type { PostItem } from '@/server/modules/blog/blog.type';

import { cn } from '@/app/utils/utils';
import { useUrlQuery } from '@/lib/get-query';

const EditButton: FC<{
  id: string | number;
  iconBtn?: boolean;
}> = ({ id, iconBtn }) => {
  // 对获取路径里面的 query 的方法进行了封装
  const query = useUrlQuery();

  return (
    <Button
      asChild
      variant="secondary"
      className={cn('text-xs', {
        'mr-3': !iconBtn,
        'btn-icon-transparent': iconBtn,
      })}
    >
      <Link href={`/blog/edit/${id}${query}`}>
        {iconBtn ? (
          <span className="xicon text-2xl">
            <DocumentEdit24Regular />
          </span>
        ) : (
          <UserPen />
        )}
        {!iconBtn && '编辑'}
      </Link>
    </Button>
  );
};

export const PostEditButton: FC<{ item: PostItem; iconBtn?: boolean }> = ({ item, iconBtn }) => {
  return (
    <Suspense>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <EditButton id={item.id} iconBtn={iconBtn} />
          </TooltipTrigger>

          <TooltipContent>
            <span>编辑文章</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Suspense>
  );
};
