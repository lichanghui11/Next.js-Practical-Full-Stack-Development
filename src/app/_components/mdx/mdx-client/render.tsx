'use server';
// 这个渲染器是服务端组件

import type { FC } from 'react';

import type { ReadingTimeResult } from './custom-plugins/remark-reading-time';
import type { MdxRendererProps } from './types';

import { ReadingTime } from './components/reading-time';
import { MdxHydration } from './mdx-hydration';
import { serializeMdx } from './serialize';

interface ExtendedMdxRendererProps extends MdxRendererProps {
  showReadingTime?: boolean; // 是否显示阅读时间
}

export const MdxRenderer: FC<ExtendedMdxRendererProps> = async ({
  source,
  options,
  hydrate,
  showReadingTime = false,
}: ExtendedMdxRendererProps) => {
  const result = await serializeMdx(source, options);
  const toc = !!result.scope.toc;
  // 从 scope 中获取阅读时间
  const readingTime = (result as any).scope?.readingTime as ReadingTimeResult | undefined;

  return (
    <div className="flex flex-col gap-1">
      {showReadingTime && readingTime && <ReadingTime readingTime={readingTime} />}
      <MdxHydration {...(hydrate || {})} compiledSource={result} toc={toc} />
    </div>
  );
};
