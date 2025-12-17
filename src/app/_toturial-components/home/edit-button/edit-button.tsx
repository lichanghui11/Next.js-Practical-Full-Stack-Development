'use client';
import type { FC } from 'react';

import { isNil } from 'lodash';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
// 封装编辑文章的按钮
// 根据外部传入的 id 决定编辑哪一篇文章
import { Button } from 'ui/button';

import { cn } from '@/app/utils/utils';

export const EditButton: FC<{
  id: string | number;
  className?: string;
}> = ({ id, className }) => {
  const searchParams = useSearchParams();
  const getQuery = useMemo(() => {
    const query = new URLSearchParams(
      searchParams.toString(),
    ).toString();
    return isNil(query) ? '' : `?${query}`;
  }, [searchParams]);
  return (
    <>
      <Suspense fallback={<div>加载中...</div>}>
        <div className={cn(className)}>
          <Button variant="outline" asChild>
            <Link href={`/blog-edit/${id}${getQuery}`}>
              <Pencil />
            </Link>
          </Button>
        </div>
      </Suspense>
    </>
  );
};
