import { visit } from 'unist-util-visit';

const _ADMONITION_TYPES = ['note', 'tip', 'info', 'warning', 'danger'] as const;
export type AdmonitionType = (typeof _ADMONITION_TYPES)[number];

/**
 * 把 directive 的 name 映射到允许的 AdmonitionType
 * 现在是“同名映射”，本质作用是白名单过滤：
 * - 只有在映射表里的 name 才会被处理
 * - 未来也可以扩展别名：例如 caution -> warning
 */
const TYPE_MAPPING: Record<string, AdmonitionType> = {
  note: 'note',
  tip: 'tip',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
} as const;

/**
 * remark 插件：把 :::note / :::tip / ... 这类 directive 节点，
 * 转换成一个自定义组件 <Admonition />（通过 data.hName / data.hProperties）。
 *
 * 依赖前置：需要 remark-directive 之类插件先把语法解析成 *Directive 节点。
 */
const remarkAdmonitions = () => {
  return (tree: any, file: any) => {
    visit(tree, (node) => {
      // 只处理 directive 节点：container / leaf / text
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const inputType = node.name as string;

        // 通过映射表做白名单过滤，非 note/tip/info/warning/danger 直接跳过
        const type = TYPE_MAPPING[inputType];
        if (!type) return;

        /**
         * textDirective 是内联语法 :note[...]，这里明确不允许，
         * 强制要求使用块级 :::note ... :::
         */
        if (node.type === 'textDirective') {
          file.fail(`Unexpected ':${type}' text directive. Use ':::${type}' instead`, node);
          return;
        }

        // remark/rehype 通用的“桥接数据”，用来告诉后续输出成什么元素/组件
        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};

        /**
         * 标题抽取规则（保持原逻辑）：
         * - 如果第一个子节点是 paragraph
         * - 且 paragraph 的第一个子节点是 text
         * 则把该 text 作为 title，并把这一整段 paragraph 从 children 中移除，
         * 防止标题重复出现在内容区。
         */
        let title;
        if (node.children && node.children[0]?.type === 'paragraph') {
          const firstChild = node.children[0];
          if (firstChild.children[0]?.type === 'text') {
            title = firstChild.children[0].value;
            node.children.shift();
          }
        }

        /**
         * 关键：把该 directive 节点输出成 <Admonition />
         * - data.hName 指定组件名（必须在 MDX components 中提供 Admonition 组件）
         * - data.hProperties 会变成 Admonition 的 props
         *
         * 注意：这里 ...attributes 放最后（保持原逻辑），意味着 attributes 可能覆盖前面的字段。
         * 例如 attributes.title 会覆盖上面的 title 或者 attributes.type 会覆盖 type（如果你写了）。
         */
        data.hName = 'Admonition';
        data.hProperties = {
          type,
          title: title || attributes.title,
          ...attributes,
        };
      }
    });
  };
};

export default remarkAdmonitions;
