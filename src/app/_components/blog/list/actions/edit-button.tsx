'use client';
import type { FC } from 'react';

import DocumentEdit24Regular from '@ricons/fluent/DocumentEdit24Regular';
import { UserPen } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from 'ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui/tooltip';

import type { AuthType } from '@/app/_components/auth/types';
import type { PostItem } from '@/server/modules/blog/blog.type';

import { AuthChecker } from '@/app/_components/auth';
import { cn } from '@/app/utils/utils';
import { useUrlQuery } from '@/lib/get-query';

const EditButton: FC<{
  id: string | number;
  iconBtn?: boolean;
  auth: AuthType;
}> = ({ id, iconBtn, auth }) => {
  // 对获取路径里面的 query 的方法进行了封装
  const query = useUrlQuery();

  return (
    auth && (
      <Button
        asChild
        variant="secondary"
        className={cn('text-xs', {
          'mr-3': !iconBtn,
          'btn-icon-transparent h-9 w-9 p-0 rounded-full': iconBtn,
        })}
      >
        <Link href={`/blog/edit/${id}${query}`}>
          {iconBtn ? (
            <span className="xicon text-lg leading-none">
              <DocumentEdit24Regular />
            </span>
          ) : (
            <UserPen />
          )}
          {!iconBtn && '编辑'}
        </Link>
      </Button>
    )
  );
};

export const PostEditButton: FC<{ item: PostItem; iconBtn?: boolean }> = ({ item, iconBtn }) => {
  return (
    <AuthChecker
      render={(props) => {
        return (
          <Suspense>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <EditButton id={item.id} iconBtn={iconBtn} {...props} />
                </TooltipTrigger>

                <TooltipContent>
                  <span>编辑文章</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Suspense>
        );
      }}
    />
  );
};
