// TOC = Table Of Contents（目录）
import type { FC } from 'react';

import { isNil } from 'lodash';
import { Menu, NotepadText, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/app/_components/shadcn/ui/button';
import { cn } from '@/app/utils/utils';

import type { MdxHydrateProps } from '../types';

import $styles from './style.module.css';
import { TocList } from './toc-list';

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
  const [collapsed, setCollapsed] = useState(true);

  // useCallback 写法保持一致，仅做命名更清晰（无逻辑变化）
  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), []);
  const close = useCallback(() => setCollapsed(true), []);

  return (
    <div
      className={cn($styles.mobileToc, {
        [$styles['mobileToc-collapsed']]: collapsed,
        [$styles['mobileToc-expanded']]: !collapsed,
      })}
    >
      {/* 背景遮罩 - 点击关闭抽屉 */}
      <div
        role="button"
        aria-label="关闭目录"
        tabIndex={0}
        className={$styles.mobileTocOverlay}
        onClick={close}
        onKeyDown={(e) => e.key === 'Enter' && close()}
      />

      <Button
        variant="outline"
        size="icon"
        className={cn('btn-icon-transparent', $styles.mobileTocButton)}
        onClick={toggleCollapsed}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className={$styles.mobileTocMain}>
        <div className={$styles.mobileTocTitle}>
          <div className="flex items-center">
            <NotepadText className="mr-1" />
            目录
          </div>

          <div className="block items-center">
            <Button
              variant="outline"
              size="icon"
              className={cn('btn-icon-transparent')}
              onClick={close}
            >
              <X />
            </Button>
          </div>
        </div>

        <div className={cn($styles.mobileTocContent, 'transparent-scrollbar')}>
          {/* 直接使用 TocList，不复用 DesktopToc（避免 CSS 隐藏冲突） */}
          {serialized.scope?.toc && <TocList toc={serialized.scope.toc} />}
        </div>
      </div>
    </div>
  );
};

export const Toc: FC<{ serialized: Serialized; isMobile: boolean }> = (props) => {
  const { isMobile, serialized } = props;

  // 逻辑保持不变：按 isMobile 分支渲染
  return isMobile ? <MobileToc serialized={serialized} /> : <DesktopToc serialized={serialized} />;
};
