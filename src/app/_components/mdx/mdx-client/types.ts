// 这里编辑客户端编辑器的各种类型
//            激活交互的类型   编译结果的类型
import type { HydrateProps, SerializeResult } from 'next-mdx-remote-client';
// 最终传入渲染组件的类型
import type { MDXRemoteProps } from 'next-mdx-remote-client/rsc';
import type { TocItem } from 'remark-flexible-toc';
// 可以被当做文件的类型：如 buffer string 等
import type { Compatible } from 'vfile';
/**
 * 现在整体的生命周期是：
 *  序列化（serialize）→ 水合（hydrate）→ 渲染（render）
 */
export interface ReadingTimeResult {
  text: string; // "5 分钟"
  minutes: number; // 5
  words: number; // 1500
}

interface Scope {
  toc?: TocItem[];
  readingTime?: ReadingTimeResult;
}

// 序列化参数配置，只有配置参数，不含序列化后的数据
// 在MDXRemoteProps中，source 既有数据的输入类型（Compatible），又有序列化之后的类型（SerializeResult），所以这里把这个 source 抽离，后续自行配置
export type MdxSerializeConfig = Omit<MDXRemoteProps, 'source'>;

// 水合参数配置 (此处原理同上)，但不同的是这里只是为了使得配置和数据的界限更加清晰
export type MdxHydrateConfig = Omit<HydrateProps, 'compiledSource'> & {
  toc?: boolean; // 是否需要生成目录
};

// MDX 水合组件props
export type MdxHydrateProps = MdxHydrateConfig & {
  compiledSource: SerializeResult<Record<string, unknown>, Scope>;
};

// MDX 渲染器组件props
export interface MdxRendererProps {
  source: Compatible;
  options?: MdxSerializeConfig;
  hydrate?: MdxHydrateProps;
}

// MDX 编辑器组件props
export interface MdxEditorProps {
  content?: string;
  setContent: (value?: string) => void;
  disabled?: boolean;
}

// 编辑器模式
export type EditorMode = 'split' | 'edit' | 'preview';

// 编辑器外壳组件props (与 MdxEditorProps 相同，但可以扩展)
export type EditorShellProps = MdxEditorProps;

// 编辑器预览组件props
export interface EditorPreviewProps {
  serialized: SerializeResult<Record<string, unknown>, Scope> | null;
  loading?: boolean;
}
