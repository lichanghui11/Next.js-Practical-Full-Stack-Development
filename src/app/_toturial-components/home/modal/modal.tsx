'use client';
import type { FC } from 'react';

import { trim } from 'lodash';
import glob from 'micromatch';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'ui/dialog';

import { cn } from '@/app/utils/utils';

import type { ModalProps } from './types';

import styles from './modal.module.css';

// 这里定义的是教程使用的弹窗组件
export const ModalProvider: FC<ModalProps> = ({
  title,
  matchedPath,
  className,
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // useEffect 里面多用于副作用结果驱动状态，如订阅状态、请求数据、读写内存
  // useMemo 里面多用于派生结果驱动状态，如计算、过滤、排序
  const open = useMemo(() => {
    return glob.isMatch(
      trim(pathname, '/'),
      matchedPath.map((path) => trim(path, '/')),
    );
  }, [pathname, matchedPath]);
  const close = useCallback(() => router.back(), [router]);
  return open ? (
    <Dialog defaultOpen onOpenChange={close}>
      <DialogContent
        className={cn(styles.dialogContent, className)}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>
            {title}
          </DialogTitle>
          <DialogDescription
            className={styles.dialogDescription}
          >
            请在下方编辑您的文章
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  ) : null;
};
