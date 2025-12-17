'use client';
import type { FC, PropsWithChildren } from 'react';

import { useCallback, useRef, useState } from 'react';
// 这个组件用于展示文章的摘要信息，利用原生的 details/summary 标签，额外加上自定义的过渡动画
// 这个组件拦截 原生detail 标签的 open 属性
import { useMount } from 'react-use';

import styles from './detail-summary.module.css';

export const DetailSummary: FC<
  PropsWithChildren<{
    defaultOpen?: boolean;
    summary: string;
  }>
> = ({ defaultOpen = false, summary, children }) => {
  // 手动控制这两个标签，不依赖内部 open 属性，并添加过度动画
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(defaultOpen);
  const openDetails = useCallback(
    (isInitial: boolean = false) => {
      if (detailsRef.current && contentRef.current) {
        detailsRef.current.setAttribute('open', '');
        // 只有把 details 打开了才会拿得到 有效的scrollHeight
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
        contentRef.current.style.opacity = '1';
        // 这里自定义打开标签的逻辑（动画，手动设置 open 属性）
        if (isInitial) {
          setOpen(true);
        } else {
          contentRef.current.addEventListener(
            'transitionend',
            () => {
              // open 是由 conten 的 maxHeight 决定的，
              setOpen(true);
            },
            { once: true },
          );
          //这个事件监听器在第一次触发后，会被浏览器自动移除。
        }
      }
    },
    [detailsRef, contentRef],
  );
  const closeDetails = useCallback(
    (isInitial: boolean = false) => {
      if (detailsRef.current && contentRef.current) {
        // open 是由 conten 的 maxHeight 决定的，
        contentRef.current.style.maxHeight = '0';
        contentRef.current.style.opacity = '0';
        setOpen(false);
        if (isInitial) {
          detailsRef.current.removeAttribute('open');
        } else {
          contentRef.current.addEventListener(
            'transitionend',
            () => {
              detailsRef.current?.removeAttribute('open');
            },
            { once: true },
          );
        }
      }
    },
    [detailsRef, contentRef],
  );
  const toggleDetails = useCallback(
    (e: React.MouseEvent<HTMLDetailsElement>) => {
      e.preventDefault();
      if (open) {
        closeDetails();
      } else {
        openDetails();
      }
    },
    [open, closeDetails, openDetails],
  );

  useMount(() => {
    // 第一次挂载元素，直接根据 defaultOpen 打开或关闭这个details，不需要动画
    open ? openDetails(true) : closeDetails(true);
    if (contentRef.current) {
      // 初始化完成，统一元素的状态之后，再设置过度动画，这样后续手动触发的开关效果就会带上动画
      contentRef.current.style.transition =
        'max-height 0.3s ease-out, opacity 0.2s ease-out';
    }
  });
  return (
    <details ref={detailsRef} className={styles.details}>
      <summary
        onClick={toggleDetails}
        className={styles.summary}
      >
        <span className={styles.icon}>
          {open ? '📖' : '📕'}
        </span>
        {summary}
      </summary>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </details>
  );
};
