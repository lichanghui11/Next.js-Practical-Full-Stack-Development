// src/app/_components/mdx/plugins/rehype-code-window.ts
import type { Element } from 'mdx/types';

import { visit } from 'unist-util-visit';

/**
 * rehype 插件：把代码块 <pre> 包装成一个“代码窗口”结构
 *
 * 作用：
 * 1) 编译期改写 HAST（HTML AST），把 <pre> 替换成自定义结构
 * 2) 给结构添加 class（code-window / code-header / code-content ...）
 * 3) 便于后续用 CSS 做外框样式、以及用 CopyButton 通过 .code-content 定位要复制的文本
 *
 * 注意：
 * - 这是 rehype 阶段（HTML AST），不是 remark 阶段（Markdown AST）
 * - 插件不会“捕捉 class 来生效”，而是插件自己“生成 class”
 */
export const rehypeCodeWindow = () => {
  return (tree: any) => {
    // 只遍历 type 为 "element" 的节点（HTML 标签节点）
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Element | null) => {
      /**
       * 只处理 <pre> 节点，并且必须拿到 parent 和 index
       * 因为我们要通过 parent.children[index] 进行“原地替换”
       */
      if (node.tagName === 'pre' && parent && typeof index === 'number') {
        /**
         * 推断语言：
         * 1. 优先从 pre.properties.className 获取
         * 2. 如果失败，尝试从 pre > code.properties.className 获取
         * 3. className 形如 ['language-typescript', ...] 或 ['language-ts']
         */
        let language = '';

        // 尝试从 pre 标签获取
        const preClasses = node.properties?.className as string[] | undefined;
        if (preClasses && Array.isArray(preClasses)) {
          const langClass = preClasses.find((cls) => cls.startsWith('language-'));
          if (langClass) {
            language = langClass.replace('language-', '');
          }
        }

        // 如果没找到，尝试从嵌套的 code 标签获取
        if (!language && node.children) {
          const codeNode = node.children.find(
            (child: any) => child.type === 'element' && child.tagName === 'code',
          );
          if (codeNode && codeNode.properties?.className) {
            const codeClasses = codeNode.properties.className as string[];
            const langClass = codeClasses.find((cls: string) => cls.startsWith('language-'));
            if (langClass) {
              language = langClass.replace('language-', '');
            }
          }
        }

        // 格式化语言名称（首字母大写）
        const formattedLanguage = language
          ? language.charAt(0).toUpperCase() + language.slice(1)
          : 'Code';

        /**
         * 生成包装结构（代码窗口 DOM contract）
         *
         * 最终结构大致是：
         * <div class="code-window">
         *   <div class="code-header">
         *     <div class="window-controls">
         *       <span class="control close"></span>
         *       <span class="control minimize"></span>
         *       <span class="control maximize"></span>
         *     </div>
         *     <span class="code-lang">{language}</span>
         *   </div>
         *   <div class="code-content">
         *     {原来的 <pre> 节点}
         *   </div>
         * </div>
         *
         * 样式由 CSS 通过这些 class 选择器实现；
         * 复制功能可通过 wrapperEl.querySelector('.code-content') 定位内容区。
         */
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-window'] },
          children: [
            // header：顶部工具栏
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['code-header'] },
              children: [
                // 类似 macOS 的三色按钮装饰
                {
                  type: 'element',
                  tagName: 'div',
                  properties: { className: ['window-controls'] },
                  children: [
                    {
                      type: 'element',
                      tagName: 'span',
                      properties: { className: ['control', 'close'] },
                      children: [],
                    },
                    {
                      type: 'element',
                      tagName: 'span',
                      properties: { className: ['control', 'minimize'] },
                      children: [],
                    },
                    {
                      type: 'element',
                      tagName: 'span',
                      properties: { className: ['control', 'maximize'] },
                      children: [],
                    },
                  ],
                },

                // 语言显示
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['code-lang'] },
                  children: [{ type: 'text', value: formattedLanguage }],
                },
              ],
            },

            // content：代码内容区（把原来的 <pre> 放进去）
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['code-content'] },
              children: [{ ...node }],
            },
          ],
        };

        // 用 wrapper 替换掉原来的 <pre>
        parent.children[index] = wrapper;
      }
    });
  };
};
