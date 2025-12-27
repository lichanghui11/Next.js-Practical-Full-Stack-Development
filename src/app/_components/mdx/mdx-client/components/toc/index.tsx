// TOC = Table Of Contents（目录）
import type { FC } from 'react';

import { isNil } from 'lodash';
import { Menu, NotepadText, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/app/_components/shadcn/ui/button';
import { cn } from '@/app/utils/utils';

import type { MdxHydrateProps } from '../../types';

import { TocList } from '../toc-list';
import $styles from './toc.module.css';

/**
 * 仅做类型抽取（无逻辑变化）
 */
type Serialized = MdxHydrateProps['compiledSource'];

/**
 * 桌面设备下的目录组件
 */
const DesktopToc: FC<{ serialized: Serialized }> = ({ serialized }) => {
  // 逻辑保持不变：toc 为空则不渲染
  const toc = serialized.scope?.toc;
  const tocRef = useRef<HTMLDivElement>(null);

  // 同步 TOC 高度与内容高度
  useEffect(() => {
    const updateTocHeight = () => {
      const contentEl = document.querySelector('[class*="content"]') as HTMLElement;
      if (contentEl && tocRef.current) {
        const contentHeight = contentEl.scrollHeight;
        tocRef.current.style.maxHeight = `${contentHeight}px`;
      }
    };

    updateTocHeight();

    // 监听内容高度变化
    const contentEl = document.querySelector('[class*="content"]');
    if (contentEl) {
      const resizeObserver = new ResizeObserver(updateTocHeight);
      resizeObserver.observe(contentEl);
      return () => resizeObserver.disconnect();
    }
  }, [toc]);

  if (isNil(toc) || toc.length < 1) return null;

  return (
    <div ref={tocRef} className={$styles.desktopToc}>
      <TocList toc={toc} />
    </div>
  );
};

/**
 * 移动或平板设备下的目录组件
 */
const MobileToc: FC<{ serialized: Serialized }> = (props) => {
  const { serialized } = props;
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // 目录展开时禁止背景页面滚动
  useEffect(() => {
    if (isOpen) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      const body = document.body;

      // 保存原始样式
      const originalPosition = body.style.position;
      const originalTop = body.style.top;
      const originalWidth = body.style.width;
      const originalOverflow = body.style.overflow;

      // 锁定滚动：使用 fixed 定位
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';

      return () => {
        // 恢复原始样式
        body.style.position = originalPosition;
        body.style.top = originalTop;
        body.style.width = originalWidth;
        body.style.overflow = originalOverflow;

        // 恢复滚动位置
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* 触发按钮 - 始终显示 */}
      <Button
        variant="outline"
        size="icon"
        className={cn('btn-icon-transparent', $styles.mobileTocButton)}
        onClick={open}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay 容器 - 只在打开时渲染 */}
      {isOpen && (
        <div
          role="button"
          aria-label="关闭目录"
          tabIndex={0}
          className={$styles.mobileTocOverlay}
          onClick={close}
          onKeyDown={(e) => e.key === 'Enter' && close()}
        >
          {/* 阻止点击冒泡的包裹层 */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div onClick={(e) => e.stopPropagation()}>
            {/* 抽屉内容 */}
            <section
              className={$styles.mobileTocDrawer}
              role="dialog"
              aria-modal="true"
              aria-label="目录"
            >
              <div className={$styles.mobileTocTitle}>
                <div className="flex items-center">
                  <NotepadText className="mr-1" />
                  目录
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="btn-icon-transparent"
                  onClick={close}
                  aria-label="关闭目录"
                >
                  <X />
                </Button>
              </div>

              <div className={cn($styles.mobileTocContent, 'transparent-scrollbar')}>
                {serialized.scope?.toc && (
                  <TocList toc={serialized.scope.toc} onItemClick={close} />
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};

export const Toc: FC<{ serialized: Serialized; isMobile: boolean }> = (props) => {
  const { isMobile, serialized } = props;

  // 逻辑保持不变：按 isMobile 分支渲染
  return isMobile ? <MobileToc serialized={serialized} /> : <DesktopToc serialized={serialized} />;
};
