// mdx 使用到的插件的集合
// 用到的插件不多，但是也拆出来，方便管理，模拟大项目

import type { Pluggable } from 'unified';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkFlexibleToc from 'remark-flexible-toc';
import remarkGfm from 'remark-gfm';

import { rehypeCodeWindow } from './custom-plugins/rehype-code-window';
import remarkAdmonition from './custom-plugins/remark-admonition';
import remarkBilibili from './custom-plugins/remark-bilibili';
import remarkMark from './custom-plugins/remark-mark';
import remarkReadingTime from './custom-plugins/remark-reading-time';
import remarkYouTube from './custom-plugins/remark-youtube';

export const mdxPlugins = {
  rehypePlugins: [
    rehypeCodeWindow, // 先包装代码窗口结构
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'append', // 链接放在标题后面
        properties: {
          className: ['heading-anchor'],
          ariaHidden: true,
          tabIndex: -1,
        },
        content: {
          type: 'element',
          tagName: 'span',
          properties: { className: ['anchor-icon'] },
          children: [{ type: 'text', value: '#' }],
        },
      },
    ],
    [rehypePrism, { showLineNumbers: true, ignoreMissing: true }], // 再进行语法高亮
  ] as Pluggable[],
  remarkPlugins: [
    remarkReadingTime, // 计算阅读时间（需放在前面）
    remarkFlexibleToc, // 生成目录（写入 vfile.data.toc）
    remarkDirective, // 解析 directive 语法
    remarkAdmonition, // :::note 提示框
    remarkBilibili, // ::bilibili{bvid=xxx} B站视频
    remarkYouTube, // ::youtube{id=xxx} YouTube视频
    remarkMark, // :mark[高亮] 文字高亮
    remarkGfm, // GFM 表格等
  ] as Pluggable[],
};
// remarkGfm 解析 → 生成 <table> 节点
//     ↓
// component.tsx 接管 → 添加 styles.tableWrapper
//     ↓
// component.module.css → 定义表格样式
