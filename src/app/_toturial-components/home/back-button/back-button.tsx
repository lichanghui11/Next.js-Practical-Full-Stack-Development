'use client';
import type { FC } from 'react';

import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Button } from 'ui/button';

import styles from '@/app/_toturial-components/shared/button-styles.module.css';
import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

export const BackButton: FC = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [historyLen] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.history.length;
    }
    return 0;
  });

  const goBack = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (historyLen > 1) {
        // 使用 setTimeout 确保在导航完成后再刷新
        // 这样可以确保刷新的是目标页面而不是当前页面
        router.back();

        // 如果当前不在首页，返回后可能到首页，所以刷新
        // 首页可能是 '/' 或 '/page/1' 或其他页码
        setTimeout(() => {
          // 检测返回后是否在首页或列表页
          const currentPath = window.location.pathname;
          if (currentPath === '/blog' || currentPath.startsWith('/blog/page/')) {
            router.refresh();
          }
        }, 100);
      }
    },
    [historyLen, router],
  );

  const disabled = useMemo(() => {
    return historyLen <= 1;
  }, [historyLen]);

  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={goBack}
      className={cn(styles.iconButton, isMobile ? styles.mobile : styles.pc)}
      aria-disabled={disabled}
    >
      <Undo2 className={styles.buttonIcon} />
      <span className={styles.buttonText}>返回</span>
    </Button>
  );
};
