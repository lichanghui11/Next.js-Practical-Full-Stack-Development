'use client';
import type { FC } from 'react';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from 'ui/button';

import type { User } from '@/server/modules/user/user.type';

import { AuthChecker } from '@/app/_components/auth';
import { cn } from '@/app/utils/utils';
import { useUrlQuery } from '@/lib/get-query';

const CreateButton: FC<{ iconBtn?: boolean; auth: User | null }> = ({ iconBtn, auth }) => {
  // 获取 query 得逻辑需要重复使用，所以封装是最好的实践
  // 这个封装里面使用了 useSearchParams 这个hook，含有一部操作，可以在这里进行suspense挂起
  const query = useUrlQuery();

  return (
    auth && (
      <Button
        asChild
        className={cn('ml-auto', {
          'focus-visible: !ring-0': !iconBtn,
          'rounded-sm': !iconBtn,
          'size-9': iconBtn,
        })}
        variant="secondary"
        size={iconBtn ? 'icon' : 'default'}
      >
        <Link href={`/blog/create${query}`}>
          <Plus />
          {!iconBtn && '创建'}
        </Link>
      </Button>
    )
  );
};

export const PostCreateButton: FC<{ iconBtn?: boolean }> = ({ iconBtn = false }) => {
  return (
    <AuthChecker
      render={(props) => {
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <div className="flex">
              <CreateButton iconBtn={iconBtn} {...props} />
            </div>
          </Suspense>
        );
      }}
    />
  );
};
