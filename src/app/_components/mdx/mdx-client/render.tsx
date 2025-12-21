'use server';
// 这个渲染器是服务端组件

import type { FC } from 'react';

import type { MdxRendererProps } from './types';

import { MdxHydration } from './mdx-hydration';
import { serializeMdx } from './serialize';

export const MdxRenderer: FC<MdxRendererProps> = async ({
  source,
  options,
  hydrate,
}: MdxRendererProps) => {
  const result = await serializeMdx(source, options);
  return <MdxHydration {...(hydrate || {})} compiledSource={result} />;
};
