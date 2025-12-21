/**
 * remark 插件：把 ::youtube{id=xxx} 这类 leafDirective 节点，
 * 转换成 <YouTube /> 组件。
 *
 * 使用方式：
 * ::youtube{id=dQw4w9WgXcQ}
 * ::youtube{id=dQw4w9WgXcQ width=100% height=400}
 */
import { visit } from 'unist-util-visit';

const remarkYouTube = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      // 只处理 leafDirective（叶子指令，如 ::youtube{...}）
      if (node.type === 'leafDirective' && node.name === 'youtube') {
        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};

        // 必须提供 id
        if (!attributes.id) {
          console.warn('YouTube directive requires id attribute');
          return;
        }

        // 转换为 YouTube 组件
        data.hName = 'YouTube';
        data.hProperties = {
          id: attributes.id,
          width: attributes.width || '100%',
          height: attributes.height || '400',
          title: attributes.title || 'YouTube Video',
        };
      }
    });
  };
};

export default remarkYouTube;
