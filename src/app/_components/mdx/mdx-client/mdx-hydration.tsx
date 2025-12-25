'use client';
import type { FC, JSX } from 'react';

import { isNil } from 'lodash';
// 这个水合函数是核心的关键的逻辑
import { hydrate } from 'next-mdx-remote-client';
import { useMemo, useRef, useState } from 'react';
import { useDeepCompareEffect, useMount } from 'react-use';

import { useIsMobile } from '@/app/utils/browser';
import { customMerge } from '@/app/utils/custom-merge';
import { cn } from '@/app/utils/utils';

import type { MdxHydrateProps } from './types';

import { Toc } from './components/toc';
import { useCodeWindow } from './hooks/code-window';
import $styles from './mdx-hydration.module.css';
import { mdxHydrationConfig } from './mdx.hydration.config';

export const MdxHydration: FC<MdxHydrateProps> = (props) => {
  useMount(() => {
    // 确保页面完全加载
    if (typeof window !== 'undefined') {
      // 获取当前URL的hash
      const hash = decodeURIComponent(window.location.hash);
      if (hash) {
        // 延迟执行以确保DOM已完全渲染
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  });
  const { compiledSource, toc, ...rest } = props;
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

  // 移动端检测 (使用项目统一的 hook)
  const isMobile = useIsMobile();

  if (isNil(compiledSource)) return null;

  /* 判断是否显示 TOC */
  const hasToc = toc && !isNil(compiledSource.scope?.toc);

  return isNil(content) ? null : (
    <div className={$styles.wrapper}>
      <div
        ref={contentRef}
        className={cn($styles.content, {
          [$styles.fullWidth]: !hasToc,
        })}
      >
        {content}
      </div>
      {hasToc && (
        <>
          {/* 桌面端：侧边栏 TOC */}
          <div className={$styles.toc}>
            <Toc serialized={compiledSource} isMobile={false} />
          </div>
          {/* 移动端：浮动按钮 TOC */}
          {isMobile && <Toc serialized={compiledSource} isMobile />}
        </>
      )}
    </div>
  );
};
