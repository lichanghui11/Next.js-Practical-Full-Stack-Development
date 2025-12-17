'use client';
import type { FC } from 'react';

import { Button } from 'antd';
import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import styles from './back-button.module.css';

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
        router.back();
      }
    },
    [historyLen, router],
  );

  const disabled = useMemo(() => {
    return historyLen <= 1;
  }, [historyLen]);

  return (
    <Button
      variant="outlined"
      disabled={disabled}
      onClick={goBack}
      className={cn(styles.backButton, {
        [styles.mobile]: isMobile,
        [styles.pc]: !isMobile,
        [styles.disabled]: disabled,
      })}
      aria-disabled={disabled}
    >
      <Undo2 className={styles.icon} />
      {isMobile ? '' : '返回'}
    </Button>
  );
};
