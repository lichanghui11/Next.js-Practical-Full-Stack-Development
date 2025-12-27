// 序列化的工具函数
'use server';
// 此功能默认在服务端运行，防止 插件prism-themes-plus 在客户端可能需要使用 node 相关的 api

import type { Compatible } from 'vfile';

import { serialize } from 'next-mdx-remote-client/serialize';

import { customMerge } from '@/app/utils/custom-merge';

import type { MdxSerializeConfig } from './types';

import { mdxSerializationConfig } from './mdx.serialization.config';

export const serializeMdx = async (source: Compatible, options?: MdxSerializeConfig) => {
  const mergedOptions = options
    ? customMerge(mdxSerializationConfig, options, 'merge')
    : mdxSerializationConfig;
  const result = await serialize({ source, ...mergedOptions });
  console.log('after serialized: ', result);
  return result;
};
/**
 * 1️⃣ 序列化在做什么？
    在 MDX 里，serialize 通常包括：
      •	解析 Markdown / MDX 文本
      •	运行 remark / rehype 插件链
      •	代码高亮（prism / shiki）
      •	生成 TOC、slug
      •	产出可 hydrate 的编译结果（SerializeResult）
 */
