'use client';
import type { FC } from 'react';

import { Button } from 'antd';
import { isNil } from 'lodash';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { IoMdAddCircle } from 'react-icons/io';

import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import styles from './create-button.module.css';

export const CreateButton: FC = () => {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  // 将当前的query参数带到创建页面，方便创建文章后跳回当前页面
  const getQuery = useMemo(() => {
    const query = new URLSearchParams(
      searchParams.toString(),
    ).toString();
    return isNil(query) ? '' : `?${query}`;
  }, [searchParams]);

  return (
    <Button
      variant="outlined"
      aria-label="创建文章"
      className={cn(styles.createButton, {
        [styles.mobile]: isMobile,
        [styles.pc]: !isMobile,
      })}
    >
      <Link
        href={`/blog/create${getQuery}`}
        className="flex items-center gap-2"
      >
        <IoMdAddCircle className={styles.icon} />
        {isMobile ? '' : '创建文章'}
      </Link>
    </Button>
  );
};
