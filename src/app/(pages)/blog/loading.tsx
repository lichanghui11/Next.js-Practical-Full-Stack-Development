import type { FC } from 'react';

import { PageSkeleton } from '@/app/_components/skeleton';

const PostLoadingPage: FC = () => (
  <div className="">
    <PageSkeleton />
  </div>
);
export default PostLoadingPage;
