// mdx 使用到的插件的集合
// 用到的插件不多，但是也拆出来，方便管理，模拟大项目

import type { Pluggable } from 'unified';

import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

export const mdxPlugins = {
  rehypePlugins: [[rehypePrism, { showLineNumbers: true, ignoreMissing: true }] as Pluggable],
  remarkPlugins: [remarkGfm] as Pluggable[],
};
