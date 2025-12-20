'use client';
import type { FC } from 'react';

import { isNil } from 'lodash';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { Button } from 'ui/button';

import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import styles from '../shared/button-styles.module.css';

export const EditButton: FC<{
  id: string | number;
  className?: string;
}> = ({ id, className }) => {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const getQuery = useMemo(() => {
    const query = new URLSearchParams(searchParams.toString()).toString();
    return isNil(query) ? '' : `?${query}`;
  }, [searchParams]);

  return (
    <>
      <Suspense fallback={<div>加载中...</div>}>
        <div className={cn(className)}>
          <Button
            variant="outline"
            asChild
            className={cn(styles.iconButton, isMobile ? styles.mobile : styles.pc)}
          >
            <Link href={`/blog/blog-edit/${id}${getQuery}`}>
              <Pencil className={styles.buttonIcon} />
              <span className={styles.buttonText}>编辑</span>
            </Link>
          </Button>
        </div>
      </Suspense>
    </>
  );
};
