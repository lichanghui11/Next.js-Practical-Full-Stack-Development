'use client';
import type { FC } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useCallback } from 'react';
import {
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadcnPagination,
} from 'ui/pagination';

import type { PageMeta } from '@/database/types/pagination';

import { cn } from '@/app/utils/utils';

import styles from './pagination.module.css';

export const Pagination: FC<{
  meta: PageMeta;
}> = ({ meta }) => {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const { currentPage, totalPages: totalPage, isFirstPage, isLastPage } = meta;
  const getNextPage = useCallback(
    (value: number) => {
      const query = new URLSearchParams(searchParams.toString());
      // 首页不显示 ?page=1
      if (value === 1) {
        query.delete('page');
      } else {
        query.set('page', value.toString());
      }
      return value <= 1 ? `${currentPath}` : `${currentPath}?${query.toString()}`;
    },
    [currentPath, searchParams],
  );

  const isPrevDisabled = isFirstPage;
  const isNextDisabled = isLastPage;

  return (
    <Suspense fallback={<div>加载中...</div>}>
      <div className={styles.paginationWrapper}>
        <ShadcnPagination>
          <PaginationContent className={styles.paginationContent}>
            <PaginationItem>
              <PaginationPrevious
                disabled={isPrevDisabled}
                text="上一页"
                aria-label="上一页"
                href={getNextPage(Number(currentPage) - 1)}
                className={cn(styles.navButton, styles.prevButton)}
                data-disabled={isPrevDisabled}
              />
            </PaginationItem>
            {/* 页码显示 */}
            <PaginationItem>
              <span className={styles.pageIndicator}>
                {currentPage} / {totalPage}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                disabled={isNextDisabled}
                aria-label="下一页"
                text="下一页"
                href={getNextPage(Number(currentPage) + 1)}
                className={cn(styles.navButton, styles.nextButton)}
                data-disabled={isNextDisabled}
              />
            </PaginationItem>
          </PaginationContent>
        </ShadcnPagination>
      </div>
    </Suspense>
  );
};
