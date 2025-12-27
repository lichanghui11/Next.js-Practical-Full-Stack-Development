'use client';
import type { FC } from 'react';

import { isNil } from 'lodash';

import { Skeleton } from '@/app/_components/shadcn/ui/skeleton';

import type { EditorPreviewProps } from '../../types';

import { MdxHydration } from '../../mdx-hydration';
import styles from './editor-preview.module.css';

/**
 * 编辑器预览组件
 * 职责：展示序列化后的 MDX 内容
 */
export const EditorPreview: FC<EditorPreviewProps> = ({ serialized, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.previewContainer}>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isNil(serialized)) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.placeholder}>开始编辑以查看预览...</div>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      <MdxHydration compiledSource={serialized} toc={false} />
    </div>
  );
};
