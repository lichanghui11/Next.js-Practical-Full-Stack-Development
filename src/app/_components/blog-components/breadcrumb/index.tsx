import type { FC } from 'react';

import { Home, Slash, Tag } from 'lucide-react';
import Link from 'next/link';
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
export interface IBlogBreadcrumbItem {
  id: string;
  link?: string;
  text: string;
}
interface IBlogBreadcrumbProps {
  className?: string;
  items?: IBlogBreadcrumbItem[];
  tag?: string;
  basePath?: string;
}
export const BlogBreadCrumb: FC<IBlogBreadcrumbProps> = (props) => {
  const { items, className, tag, basePath = '' } = props;
  return (
    <Breadcrumb className={cn($styles.breadcrumb, className)}>
      <BreadcrumbList className="gap-0.5 sm:gap-1">
        <BreadcrumbItem>
          <Link href="/" passHref>
            <BreadcrumbLink className="flex items-center text-xs">
              <span className="xicon mr-1">
                <Home />
              </span>
              首页
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        {(items ?? []).map((item) => (
          <Fragment key={item.id}>
            <BreadcrumbSeparator className="[&>svg]:h-2 [&>svg]:w-2">
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="flex items-center text-xs">
              {item.link ? (
                <BreadcrumbLink asChild>
                  <Link href={`${basePath}${item.link}`} passHref>
                    {item.text}
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
          <span className="ml-2">{tag}</span>
        </div>
      )}
    </Breadcrumb>
  );
};
