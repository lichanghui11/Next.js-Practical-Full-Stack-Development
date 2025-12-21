'use client';
import type { FC, JSX } from 'react';

import { isNil } from 'lodash';
// 这个水合函数是核心的关键的逻辑
import { hydrate } from 'next-mdx-remote-client';
import { useMemo, useRef, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';

import { customMerge } from '@/app/utils/custom-merge';

import type { MdxHydrateProps } from './types';

import { useCodeWindow } from './hooks/code-window';
import { mdxHydrationConfig } from './mdx.hydration.config';

export const MdxHydration: FC<MdxHydrateProps> = (props) => {
  const { compiledSource, ...rest } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<JSX.Element | null>(null);
  useCodeWindow(contentRef, content);
  const options = useMemo(() => {
    return customMerge(mdxHydrationConfig, rest, 'merge');
  }, [rest]);
  useDeepCompareEffect(() => {
    // 这里的 content 是一个水合之后的、可以直接渲染的 Element 大对象
    // SerializeResult 是一个联合类型，可能包含 compiledSource 或 error
    // 只有在序列化成功时才进行水合
    if ('compiledSource' in compiledSource) {
      const { content, error } = hydrate({
        ...compiledSource,
        ...options,
      });
      if (isNil(error)) {
        setContent(content);
      }
    }
  }, [compiledSource, options]);
  if (isNil(compiledSource)) return null;

  return isNil(content) ? null : (
    <div>
      <div ref={contentRef}>{content}</div>
    </div>
  );
};
