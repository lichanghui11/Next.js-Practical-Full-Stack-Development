import type { NextConfig } from 'next';

import createMDX from '@next/mdx';

const externals: string[] = ['next-mdx-remote', 'next-mdx-remote-client'];
/**
 * 此处需要说明：
 *   在浏览器里编译 MDX（客户端 serialize）的情况下，'rehype-prism-plus' 需要被打包进去，但是如果使用 turbopack，可能会在打包阶段触发 ESM 解析错误。
 *   这里我觉得最好不要用turbopack，因为实时预览的功能需要在客户端编译 MDX
 */
if (process.env.TURBOPACK) {
  externals.push('rehype-prism-plus');
}

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */

  // Configure `pageExtensions` to include markdown and MDX files，这样就可以将 page.mdx 视为路由文件了
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  // 如果使用 turbopack, 就不打包这两个插件，因为这些插件里面的 commonJS 有可能在打包阶段触发 ESM 解析错误。
  serverExternalPackages: externals,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

// options 是“编译期配置”，不是运行时配置
/**
 * remarkPlugins：处理 Markdown/MDX 的“结构层”
 * rehypePlugins：处理 HTML 的“展示结构层”
 * pageExtensions      → 解决「是不是路由文件」
 * createMDX.extension → 解决「哪些文件要走 MDX 编译器」
 */
const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.(md|mdx)$/,
  /**
   * options 是传给 @mdx-js/mdx 的“编译期配置对象”
   * 用来控制：MD / MDX 如何被编译成 JSX / React 代码
   */
  options: {
    /**
     * remarkPlugins
     * 用途：处理“内容结构 / 语义”
     * 典型能力：
     * - 支持 GFM（表格、任务列表）
     * - 解析 frontmatter
     * - 生成 TOC
     * - 数学公式
     * ❗不负责样式、不负责代码高亮
     */
    remarkPlugins: [
      'remark-gfm',
      // remarkToc,
    ],

    /**
     * rehypePlugins
     * 用途：处理“渲染结构 / HTML 形态”
     * 典型能力：
     * - 代码高亮（Prism / Shiki）
     * - 给 heading 自动加 id
     * - 包裹 / 修改 DOM 结构
     * - 给元素加 class / data-*
     *
     * ✅ 所有“代码高亮的结构性逻辑”都应该放在这里
     * ❌ 不适合放交互（复制按钮 / onClick）
     */
    rehypePlugins: [['rehype-prism-plus', { showLineNumbers: true, ignoreMissing: true }]],
    // ignoreMissing: true这个配置是为了忽略文档中的 .prisma 文件

    /**
     * recmaPlugins
     * ----------------
     * 作用阶段：JS / JSX AST（非常靠后）
     * 用途：修改“最终生成的 JS 代码结构”
     *
     * ⚠️ 高级用法，一般业务项目用不到
     * 典型场景：
     * - 注入 import
     * - 改写导出结构
     */
    // recmaPlugins: [],

    /**
     * providerImportSource
     * ----------------
     * 用途：指定 MDX 组件映射（useMDXComponents / Provider）从哪里导入
     *
     * Next.js App Router 场景下：
     * - 通常由 mdx-components.tsx 解决
     * - 很少需要手动配置
     */
    // providerImportSource: '@mdx-js/react',

    /**
     * jsxRuntime
     * ----------------
     * 用途：指定 JSX 运行时模式
     * - 'automatic'：React 17+ 默认（推荐）
     * - 'classic'：老模式
     *
     * 一般不需要显式设置
     */
    // jsxRuntime: 'automatic',

    /**
     * jsxImportSource
     * ----------------
     * 用途：automatic JSX runtime 的 JSX 工厂来源
     * 默认是 'react'
     *
     * 只有在使用 Preact / 自定义 JSX runtime 时才需要改
     */
    // jsxImportSource: 'react',

    /**
     * format
     * ----------------
     * 用途：强制指定输入格式
     * - 'md'  ：纯 Markdown（不允许 JSX / import）
     * - 'mdx' ：允许 JSX / import / export
     *
     * 多数情况下可以省略（编译器会自动判断）
     */
    // format: 'mdx',

    /**
     * development
     * ----------------
     * 用途：控制是否开启开发模式（更友好的错误信息）
     *
     * Next.js 一般会自动处理，不必手动配置
     */
    // development: process.env.NODE_ENV === 'development',
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
