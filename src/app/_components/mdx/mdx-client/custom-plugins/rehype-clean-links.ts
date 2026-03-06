import { visit } from 'unist-util-visit';

const cleanNestedElements = (node: any) => {
  if (!node.children) return;

  // 收集所有不是 div 的子元素
  const cleanChildren: any[] = [];

  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'div') {
      // 情况1：子元素是 div → 干掉这个div，把它的子元素“提上来”
      if (child.children) {
        cleanChildren.push(...child.children);
      }
    } else {
      // 情况2：子元素不是 div → 保留它，但先清理它内部的嵌套div
      if (child.children) {
        cleanNestedElements(child);
      }
      cleanChildren.push(child);
    }
  }
  node.children = cleanChildren;
};

// 清理链接里面不正确的 div 标签
export const rehypeCleanLinks = () => {
  return (tree: any) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' || node.tagName === 'p') {
        cleanNestedElements(node);
      }
    });
  };
};
