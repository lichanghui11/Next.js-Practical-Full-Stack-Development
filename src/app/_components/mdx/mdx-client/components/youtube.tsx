import type { FC } from 'react';

interface YouTubeProps {
  id: string;
  width?: string | number;
  height?: string | number;
  title?: string;
}

/**
 * YouTube 视频嵌入组件
 * 使用方式：::youtube{id=dQw4w9WgXcQ}
 */
export const YouTube: FC<YouTubeProps> = ({
  id,
  width = '100%',
  height = 400,
  title = 'YouTube Video',
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
        src={`https://www.youtube.com/embed/${id}`}
        width="100%"
        height={numericHeight}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        style={{ display: 'block' }}
      />
    </div>
  );
};
