import type { FC } from 'react';

import { PageSkeleton } from '@/app/_components/skeleton';

import $styles from './blog-list.module.css';
const PostLoadingPage: FC = () => (
  <div className={$styles.container}>
    <PageSkeleton />
  </div>
);
export default PostLoadingPage;
