// mdx 使用到的插件的集合
// 用到的插件不多，但是也拆出来，方便管理，模拟大项目

import type { Pluggable } from 'unified';

import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

import { rehypeCodeWindow } from './custom-plugins/rehype-code-window';

export const mdxPlugins = {
  rehypePlugins: [
    rehypeCodeWindow, // 先包装代码窗口结构
    [rehypePrism, { showLineNumbers: true, ignoreMissing: true }], // 再进行语法高亮
  ] as Pluggable[],
  remarkPlugins: [remarkGfm] as Pluggable[],
};
