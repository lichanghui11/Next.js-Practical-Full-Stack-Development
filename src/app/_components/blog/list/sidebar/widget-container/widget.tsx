'use client';
import type { FC, JSX, PropsWithChildren } from 'react';

import { useState } from 'react';
import { useMount } from 'react-use';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'ui/accordion';

import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import $styles from './widget.module.css';

/**
 * 这个侧边栏组件在移动端和pc端有不同的展示效果
 *
 * @param param0
 * PropsWithChildren 是 React 提供的一个 TypeScript 工具类型，用来给你的 props 自动加上 children?: ReactNode
 */
export const SidebarWidget: FC<PropsWithChildren<{ title?: JSX.Element }>> = ({
  title,
  children,
}) => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useMount(() => setMounted(true));

  return isMobile ? (
    <Accordion type="single" collapsible className={$styles.mobileWidget}>
      <AccordionItem value="item-1" className={$styles.mobileItem}>
        {title && (
          <AccordionTrigger>
            <div className={$styles.title}>{title}</div>
          </AccordionTrigger>
        )}
        <AccordionContent>
          <div className={$styles.content}>{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ) : (
    <div className={cn($styles.widget, 'page-block')}>
      {title && <div className={$styles.title}>{title}</div>}
      <div className={cn($styles.content, 'transparent-scrollbar')}>{children}</div>
    </div>
  );
};
