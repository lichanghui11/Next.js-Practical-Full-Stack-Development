'use client';
import type { FC } from 'react';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from 'ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from 'ui/tooltip';

export const CreateButton: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 将当前的query参数带到创建页面，方便创建文章后跳回当前页面
  const getQuery = useMemo(() => {
    const query = new URLSearchParams(searchParams.toString()).toString();
    return query ? `?${query}` : '';
  }, [searchParams]);

  // 在创建或编辑页面时不显示此按钮
  if (pathname.includes('/blog/create') || pathname.includes('/blog/blog-edit')) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={`/blog/create${getQuery}`}>
          <Button variant="ghost" size="icon" aria-label="创建文章">
            <Plus />
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>创建文章</p>
      </TooltipContent>
    </Tooltip>
  );
};
