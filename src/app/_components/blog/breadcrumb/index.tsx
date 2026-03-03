'use client';
import type { FC } from 'react';

import { Home, Slash, Tag } from 'lucide-react';
import Link from 'next/link';
// Fragment 的作用是：让你在 JSX 里可以“包一组兄弟元素”，但最终不渲染任何额外的 DOM 节点。
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from 'ui/breadcrumb';

import { cn } from '@/app/utils/utils';

import $styles from './style.module.css';

/**
 * 定义面包屑里面的每个节点的数据类型
 * 每个节点有自己的类型id、类型文本以及点击之后会跳转的链接地址
 * 这个链接地址就会让这个类型节点成为一个可点击的链接
 */
export interface IBlogBreadcrumbItem {
  id: string;
  link?: string;
  text: string;
}

/**
 * 定义当前的面包屑组件的 props 参数的数据类型
 */
interface IBlogBreadcrumbProps {
  className?: string;
  items: IBlogBreadcrumbItem[];
  tag?: string;
  basePath?: string;
}

export const BlogBreadcrumb: FC<IBlogBreadcrumbProps> = ({
  className,
  items,
  tag,
  basePath = '',
}) => {
  return (
    <Breadcrumb className={cn($styles.breadcrumb, className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <span className="w-2 h-2">
                <Home />
              </span>
              首页
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {(items ?? []).map((item) => (
          <Fragment key={item.id}>
            <BreadcrumbSeparator className="[&>svg]:h-2 [&>svg]:w-2">
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="flex items-center text-xs">
              {item.link ? (
                <BreadcrumbLink asChild>
                  {/** passHref 这个属性保证 href 传到里层的 a 标签上面 */}
                  <Link href={`${basePath}${item.link}`} passHref>
                    <span>{item.text}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                <span className="text-foreground">{item.text}</span>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
      {tag && (
        <div className="flex h-full items-center">
          <Tag className="h-3! w-3!" />
          <span className="ml-2 text-xl">{tag}</span>
        </div>
      )}
    </Breadcrumb>
  );
};
