import type { FC, PropsWithChildren } from 'react';

import { cn } from '@/app/utils/utils';

import $styles from './style.module.css';

/**
 *
 * @param param0
 * 这是一个行容器组件，用于包裹首页里面的 C E 这两个区域的组件
 * 可以把下方的 HomeBlockContainer 组件传入之后，应用block类名样式
 */
export const HomeLineContainer: FC<
  PropsWithChildren<{ className?: string; containerClass?: string }>
> = ({ className, containerClass, children }) => {
  return (
    <div className={cn($styles.container, containerClass || '')}>
      <div className={cn('page-container', $styles.main, className || '')}>{children}</div>
    </div>
  );
};

/**
 *
 * @param param0
 * 块容器组件，用于放置A B D卡片
 */
export const HomeBlockContainer: FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => {
  return <div className={cn($styles.block, className || '')}>{children}</div>;
};
