import type { FC } from 'react';

interface BilibiliProps {
  bvid: string;
  width?: string | number;
  height?: string | number;
  title?: string;
}

/**
 * B 站视频嵌入组件
 * 使用方式：::bilibili{bvid=BV1xx411c7mD}
 */
export const Bilibili: FC<BilibiliProps> = ({
  bvid,
  width = '100%',
  height = 400,
  title = 'Bilibili Video',
}) => {
  const numericHeight = typeof height === 'string' ? Number.parseInt(height, 10) : height;

  return (
    <div
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        margin: '1.5rem 0',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <iframe
        src={`//player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0`}
        width="100%"
        height={numericHeight}
        title={title}
        frameBorder="0"
        allowFullScreen
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups"
        style={{ display: 'block' }}
      />
    </div>
  );
};
