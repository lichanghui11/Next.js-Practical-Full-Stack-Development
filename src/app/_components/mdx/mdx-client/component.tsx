import type { MDXComponents } from 'mdx/types';
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';

import Image from 'next/image';
// 这里可以替换 mdx 的标签，换上拥有自定义样式的标签
import Link from 'next/link';
import React from 'react';

import styles from './component.module.css';
import { Admonition } from './components/admonition';
import { Bilibili } from './components/bilibili';
import { Mark } from './components/mark';
import { ReadingTime } from './components/reading-time';
import { YouTube } from './components/youtube';

// 接管最常用的标签
export const mdxComponents: MDXComponents = {
  wrapper: ({ children }) => <div className={styles.wrapper}>{children}</div>,
  // Headings
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold mt-5 mb-2" {...props}>
      {children}
    </h3>
  ),

  // Paragraph 这个标签的自定义会导致 p 标签 包裹 div 标签，这不符合 html 规范，会导致报错，所以这里直接注释掉这部分内容
  // p: ({ children, ...props }) => {
  //   // 检查子元素是否包含块级元素（如 div、h1-h6、ul、ol、table 等）
  //   const hasBlockElements = React.Children.toArray(children).some((child) => {
  //     if (React.isValidElement(child)) {
  //       const tagName = (child.type as any).displayName || (child.type as any).name || '';
  //       const blockTags = [
  //         'div',
  //         'h1',
  //         'h2',
  //         'h3',
  //         'h4',
  //         'h5',
  //         'h6',
  //         'ul',
  //         'ol',
  //         'table',
  //         'figure',
  //         'blockquote',
  //         'pre',
  //         'Admonition',
  //         'Bilibili',
  //         'YouTube',
  //       ];
  //       return blockTags.includes(tagName.toLowerCase());
  //     }
  //     return false;
  //   });

  //   // 如果包含块级元素，使用 div 代替 p
  //   if (hasBlockElements) {
  //     return (
  //       <div className="leading-7 my-4" {...props}>
  //         {children}
  //       </div>
  //     );
  //   }

  //   // 普通段落使用 p 标签
  //   return (
  //     <p className="leading-7 my-4" {...props}>
  //       {children}
  //     </p>
  //   );
  // },

  // Links
  a: ({ href = '', children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // 内部链接走 next/link
    if (href.startsWith('/')) {
      return (
        <Link href={href} className={styles.link} {...props}>
          {children}
        </Link>
      );
    }

    // Hash 锚点链接 - 平滑滚动
    if (href.startsWith('#')) {
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = href.slice(1); // 去掉 #
        const element = document.getElementById(targetId);
        if (element) {
          // 计算头部高度（考虑滚动后的高度变化）
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 60; // 默认60px
          const offset = headerHeight + 20; // 额外添加20px间距

          // 使用更精确的滚动方式，考虑头部遮挡
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
          // 更新 URL hash（不触发跳转）
          window.history.pushState(null, '', href);
        }
      };
      return (
        <a href={href} onClick={handleClick} {...props}>
          {children}
        </a>
      );
    }

    // 外部链接加上安全属性和图标
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${styles.link} ${styles.externalLink}`}
        {...props}
      >
        {children}
      </a>
    );
  },

  // 表格组件 - 带响应式包装器和完整样式
  table: ({ children, ...props }) => (
    <div className={styles.tableWrapper}>
      <table className={styles.table} {...props}>
        {children}
      </table>
    </div>
  ),
  thead: (props) => <thead {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => <tr {...props} />,
  th: (props) => <th {...props} />,
  td: (props) => <td {...props} />,

  // 列表
  ul: (props) => <ul className={styles.ul} {...props} />,
  ol: (props) => <ol className={styles.ol} {...props} />,
  li: (props) => <li className={styles.li} {...props} />,

  // 引用
  blockquote: (props) => <blockquote className={styles.blockquote} {...props} />,

  // 水平分割线
  hr: (props) => <hr className={styles.hr} {...props} />,

  // 图片 - 使用 Next.js Image 优化
  img: ({ alt = '', src, ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
    // MDX 中的图片通常没有明确的宽高，使用 fill 模式
    if (!src) return null;
    return (
      <span className={styles.imageWrapper}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className={styles.img}
          {...(props as any)}
        />
      </span>
    );
  },

  // 图片标题（如果使用 figure）
  figure: (props) => <figure className={styles.figure} {...props} />,
  figcaption: (props) => <figcaption className={styles.figcaption} {...props} />,

  // 自定义 MDX 组件
  Admonition,
  Bilibili,
  Mark,
  ReadingTime,
  YouTube,
};
