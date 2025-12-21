/**
 * remark 插件：把 :mark[高亮文字] 这类 textDirective 节点，
 * 转换成 <Mark /> 组件。
 *
 * 使用方式：
 * 这是一段 :mark[高亮文字] 的示例
 * 这是 :mark[红色高亮]{color=red} 示例
 * 这是 :mark[自定义背景]{bg=#ffeb3b} 示例
 */
import { visit } from 'unist-util-visit';

const remarkMark = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      // 只处理 textDirective（文本指令，如 :mark[...]）
      if (node.type === 'textDirective' && node.name === 'mark') {
        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};

        // 转换为 Mark 组件
        data.hName = 'Mark';
        data.hProperties = {
          color: attributes.color,
          bg: attributes.bg,
        };
      }
    });
  };
};

export default remarkMark;
