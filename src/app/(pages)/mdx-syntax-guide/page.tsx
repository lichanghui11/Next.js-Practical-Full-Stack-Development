import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import $styles from '@/app/_components/header/ui/pc-menu.module.css';
import { MdxRenderer } from '@/app/_components/mdx/mdx-client/render';
import { cn } from '@/app/utils/utils';

import styles from './mdx-page.module.css';

export default async function Page() {
  // 读取 MDX 文件内容
  const mdxPath = path.join(process.cwd(), 'src/docs/mdx-syntax-guide.md');
  const source = await readFile(mdxPath, 'utf-8');

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/blog" className={cn($styles.menuItem, 'border-none')}>
          <BookOpen className="h-4 w-4" />
          <span>返回博客</span>
        </Link>
      </div>
      <h1 className={styles.title}>MDX 语法格式说明</h1>
      <div className={styles.content}>
        {/* 使用 MdxRenderer 渲染 MDX 源码，应用所有自定义插件和功能 */}
        <MdxRenderer source={source} showReadingTime={true} />
      </div>
    </div>
  );
}
