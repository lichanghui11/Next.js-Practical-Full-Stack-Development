'use client';
import type { Metadata, ResolvingMetadata } from 'next';
import type { FC, MouseEventHandler } from 'react';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { Button } from 'ui/button';

import type { BlogFormRef } from '@/app/_components/blog-components/submit-form/types';

import { BlogForm } from '@/app/_components/blog-components/submit-form/blog-form';

import styles from './create-page.module.css';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
  const parentMetadata = await parent;
  return {
    title: `创建新文章 - ${parentMetadata.title?.absolute}`,
    description: '创建一篇新的博客文章',
  };
};

// 这里封装的是新建的博客，和更新博客使用的是同一个表单组件，通过type参数来区分
// 和新建文章不同的是这里还需要封装自己的 返回按钮、保存按钮
const BlogCreate: FC = () => {
  const createBlogRef = useRef<BlogFormRef | null>(null);
  const [pending, setPending] = useState(false);

  const handleCreate = useCallback<MouseEventHandler<HTMLButtonElement>>(async (e) => {
    e.preventDefault();
    if (createBlogRef.current?.create) {
      await createBlogRef.current.create();
    }
  }, []);

  return (
    <div className={styles.formContainer}>
      <div className={styles.buttonGroup}>
        <Button asChild className={styles.backButton}>
          <Link href="/blog">返回</Link>
        </Button>
        <Button disabled={pending} onClick={handleCreate} className={styles.createButton}>
          {pending ? '创建中...' : '创建博客'}
        </Button>
      </div>
      <BlogForm ref={createBlogRef} type="create" isPending={setPending}></BlogForm>
    </div>
  );
};
export default BlogCreate;
