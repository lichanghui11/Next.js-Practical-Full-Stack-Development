import type { HydrateProps } from 'next-mdx-remote-client';

import { mdxComponents } from './component'; // 注入自定义的标签

export const mdxHydrationConfig: Omit<HydrateProps, 'compiledSource'> = {
  components: mdxComponents,
};
