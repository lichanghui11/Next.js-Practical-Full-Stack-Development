import { Suspense } from 'react';

import type { PageMeta } from '@/database/types/pagination';

import { Pagination } from '@/app/_components/blog-components/pagination/pagination';

export const BlogListPagination = ({ meta }: { meta: PageMeta }) => {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Pagination meta={meta} />
    </Suspense>
  );
};
