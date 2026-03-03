import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { PostPageForm } from '@/app/_components/blog/form';

import styles from './style.module.css';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
  const parentMetadata = await parent;
  return {
    title: `创建新文章 - ${parentMetadata.title?.absolute}`,
    description: '新文章创建页面',
  };
};

// 这里封装的是新建的博客，和更新博客使用的是同一个表单组件，通过type参数来区分
// 和新建文章不同的是这里还需要封装自己的 返回按钮、保存按钮
const BlogCreatePage: FC = () => {
  return (
    <div className={styles.formContainer}>
      <PostPageForm />
    </div>
  );
};
export default BlogCreatePage;
