import type { FC } from 'react';

import { Clock } from 'lucide-react';

import type { ReadingTimeResult } from '../types';

interface ReadingTimeProps {
  readingTime?: ReadingTimeResult;
}

/**
 * 阅读时间显示组件
 * 使用方式：在 MDX 渲染结果中获取 scope.readingTime 传入
 */
export const ReadingTime: FC<ReadingTimeProps> = ({ readingTime }) => {
  if (!readingTime) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.75rem',
        fontSize: '0.875rem',
        color: 'var(--muted-foreground)',
        background: 'var(--muted)',
        borderRadius: '9999px',
      }}
    >
      <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
      <span>预计阅读 {readingTime.text}</span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span>{readingTime.words} 字</span>
    </div>
  );
};
