import type { FC } from 'react';

import { Skeleton } from 'ui/skeleton';

import $styles from '@/app/_components/blog/list/style.module.css';

/**
 * 文章列表页骨架屏
 */
const BlogIndexSkeleton: FC = () => (
  <div className="page-container flex min-h-screen w-full flex-auto animate-pulse mx-auto">
    <div className={`${$styles.blogIndex} w-full`}>
      <div className={$styles.container}>
        <div className="w-full flex-none mb-6">
          <Skeleton className="flex h-9 w-full items-center justify-between rounded-md bg-zinc-950/30 px-3 shadow-sm backdrop-blur-sm dark:bg-zinc-500/10" />
        </div>
        <div className="flex w-full flex-col space-y-6">
          {[...Array.from({ length: 3 })].map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Skeleton className="h-48 w-full bg-zinc-100 dark:bg-zinc-800" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-3 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-full mb-2 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-2/3 mb-4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                  <Skeleton className="h-3 w-24 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-10 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="order-1 mb-8 flex w-full flex-none flex-col lg:order-2 lg:mb-0 lg:w-72">
        <div className="sticky top-8 space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Skeleton className="h-6 w-1/2 mb-4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <Skeleton className="h-40 w-full mb-4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            {[...Array.from({ length: 4 })].map((_, index) => (
              <Skeleton
                key={index.toFixed()}
                className="h-4 w-full mb-2 rounded-md bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Skeleton className="h-6 w-1/2 mb-4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            {[...Array.from({ length: 3 })].map((_, index) => (
              <Skeleton
                key={index.toFixed()}
                className="h-8 w-full mb-3 rounded-md bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 文章详情页骨架屏
 */
const PostItemSkeleton: FC = () => (
  <div className="page-container flex w-full flex-auto flex-col">
    <div className="order-2 flex flex-auto flex-col space-y-5">
      <div className="w-full flex-none">
        <Skeleton className="flex h-9 w-full items-center justify-between rounded-md bg-gray-950/30 dark:bg-zinc-500/10 px-3 shadow-sm backdrop-blur-sm" />
      </div>
      <div>文章详情骨架屏</div>
      <div className="flex w-full flex-auto flex-col space-y-4">
        <Skeleton className="w-full flex-auto bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm" />
      </div>
    </div>
  </div>
);

/**
 * 文章内容骨架屏
 */
const PostContentSkeleton: FC = () => (
  <div className="relative flex size-full flex-auto justify-between gap-8 space-x-2">
    <Skeleton className="w-auto flex-auto bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm" />
    <Skeleton className="hidden bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm lg:flex lg:w-56" />
  </div>
);

export { BlogIndexSkeleton, PostContentSkeleton, PostItemSkeleton };
