'use client';

import type { FC, JSX, PropsWithChildren } from 'react';

import { useState } from 'react';
import { useMount } from 'react-use';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'ui/accordion';

import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import $styles from './widget.module.css';

/**
 * 侧边栏组件
 * @param title 侧边栏标题
 * @param children 侧边栏内容
 *
 * title 的类型设计不仅可以支持传纯文本，也支持 JSX 结构
 */
export const SidebarWidget: FC<PropsWithChildren<{ title?: JSX.Element }>> = ({
  title,
  children,
}) => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  useMount(() => {
    setMounted(true);
  });
  // 在平板设备和移动设备的屏下均设为移动设备状态
  if (!mounted) return null;
  return isMobile ? (
    <Accordion type="single" collapsible className={$styles.mobileWidget}>
      <AccordionItem className={$styles.mobileItem} value="item-1">
        {title && (
          <AccordionTrigger>
            <div className={$styles.title}>{title}</div>
          </AccordionTrigger>
        )}
        <AccordionContent>
          <div className={cn($styles.content, 'transparent-scrollbar')}>{children}</div>
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
