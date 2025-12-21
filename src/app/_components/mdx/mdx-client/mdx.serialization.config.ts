// 这里是 mdx 的默认配置
import type { MDXRemoteProps } from 'next-mdx-remote-client/rsc';

import { mdxComponents } from './component'; // 注入自定义的标签
import { mdxPlugins } from './plugins';

export const mdxSerializationConfig: Omit<MDXRemoteProps, 'source'> = {
  components: mdxComponents,
  options: {
    disableImports: true, // 安全策略，不允许在 mdx 文件中使用 import 语句
    parseFrontmatter: true, // 解析 frontmatter，拿到一些元数据如 title、description 等
    vfileDataIntoScope: 'toc', // 将 vfileData 注入到 scope 中，方便在 mdx 文件中使用
    mdxOptions: mdxPlugins,
  },
};

/*
 * MDX/remark/rehype 生态里，处理内容时会用一个“虚拟文件对象”承载信息：
	•	vfile.value：内容
	•	vfile.data：插件在处理过程中塞进去的各种数据（例如：目录、标题信息、slug 列表……）
 */
