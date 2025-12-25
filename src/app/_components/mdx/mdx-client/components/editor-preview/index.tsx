'use client';
import type { FC } from 'react';

import { isNil } from 'lodash';

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
        <div className={styles.skeleton}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
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
