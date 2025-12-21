import type { FC, ReactNode } from 'react';

interface MarkProps {
  children: ReactNode;
  color?: string;
  bg?: string;
}

/**
 * 文字高亮组件
 * 使用方式：:mark[高亮文字]
 * 带参数：:mark[红色高亮]{color=red} 或 :mark[自定义背景]{bg=#ffeb3b}
 */
export const Mark: FC<MarkProps> = ({ children, color, bg }) => {
  // 默认黄色高亮渐变
  const defaultBg = 'linear-gradient(120deg, #ffeaa7 0%, #fdcb6e 100%)';

  return (
    <mark
      style={{
        padding: '0.1em 0.3em',
        borderRadius: '0.2em',
        background: bg || defaultBg,
        color: color || 'inherit',
        fontWeight: 500,
      }}
      className="dark:bg-amber-600/30"
    >
      {children}
    </mark>
  );
};
