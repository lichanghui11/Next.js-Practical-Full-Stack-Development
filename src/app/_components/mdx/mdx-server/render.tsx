// 这里做最终的渲染出口

import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { FC } from 'react';

import { MDXRemote } from 'next-mdx-remote/rsc';

import { customMerge } from '@/app/utils/custom-merge';

// 这里是默认的配置项
import { mdxDefaultConfig } from './mdx.default.config';

// 动态渲染需要传入配置项 mdxDefaultConfig 和数据源 source
// props 里面有外部的 source 数据
export const RenderMDX: FC<MDXRemoteProps> = (props) => {
  return <MDXRemote {...(customMerge(mdxDefaultConfig, props, 'merge') as MDXRemoteProps)} />;
};
