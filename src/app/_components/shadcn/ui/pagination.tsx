import { isNil } from 'lodash';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import type { Button } from '@/app/_components/shadcn/ui/button';

import { buttonVariants } from '@/app/_components/shadcn/ui/button';
import { cn } from '@/app/utils/utils';

function Pagination({
  className,
  ...props
}: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        'mx-auto flex w-full justify-center',
        className,
      )}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        'flex flex-row items-center gap-1',
        className,
      )}
      {...props}
    />
  );
}

function PaginationItem({
  ...props
}: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
  text?: string;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

/**
 * 改造 shadcn 提供的源代码，使其拥有：
 *  1. 按钮禁用功能
 *  2. 自定义按钮的文字
 *  3. 使用 next/Link 替代底层的 a标签
 */
function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      tabIndex={props.disabled ? -1 : props.tabIndex}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        cn({
          'pointer-events-none opacity-50': props.disabled,
        }),
        className,
      )}
      href={isNil(props.href) ? '#' : props.href}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">
        {isNil(text) ? 'Previous' : text}
      </span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">
        {isNil(text) ? 'Next' : text}
      </span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        'flex size-9 items-center justify-center',
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">
        {isNil(text) ? 'More pages' : text}
      </span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
