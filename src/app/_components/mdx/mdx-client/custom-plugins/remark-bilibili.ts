/**
 * remark 插件：把 ::bilibili{bvid=xxx} 这类 leafDirective 节点，
 * 转换成 <Bilibili /> 组件。
 *
 * 使用方式：
 * ::bilibili{bvid=BV1xx411c7mD}
 * ::bilibili{bvid=BV1xx411c7mD width=100% height=400}
 */
import { visit } from 'unist-util-visit';

const remarkBilibili = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      // 只处理 leafDirective（叶子指令，如 ::bilibili{...}）
      if (node.type === 'leafDirective' && node.name === 'bilibili') {
        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};

        // 必须提供 bvid
        if (!attributes.bvid) {
          console.warn('Bilibili directive requires bvid attribute');
          return;
        }

        // 转换为 Bilibili 组件
        data.hName = 'Bilibili';
        data.hProperties = {
          bvid: attributes.bvid,
          width: attributes.width || '100%',
          height: attributes.height || '400',
          title: attributes.title || 'Bilibili Video',
        };
      }
    });
  };
};

export default remarkBilibili;
