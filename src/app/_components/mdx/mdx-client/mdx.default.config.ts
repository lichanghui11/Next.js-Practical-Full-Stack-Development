// 这里是 mdx 的默认配置
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';

import { mdxComponents } from './component'; // 注入自定义的标签
import { mdxPlugins } from './plugins';

export const mdxDefaultConfig: Omit<MDXRemoteProps, 'source'> = {
  components: mdxComponents,
  options: {
    mdxOptions: mdxPlugins,
  },
};
