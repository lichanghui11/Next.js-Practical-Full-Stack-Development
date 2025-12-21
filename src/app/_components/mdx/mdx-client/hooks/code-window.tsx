// 这里定义的是一个 代码窗口hook，封装了自定义的包裹代码的组件样式和复制代码的功能
import type { FC, JSX, MouseEventHandler, RefObject } from 'react';

import { isNil } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * CopyButton
 * ----------
 * 代码复制按钮组件。
 *
 * 设计前提：
 * - 外层 rehype 插件已经生成了 `.code-window` 结构
 * - 其中 `.code-content` 包裹着真正的 <pre><code> 内容
 *
 * 本组件只负责：
 * - 从 wrapperEl 中查找 `.code-content`
 * - 读取其文本内容
 * - 写入剪贴板
 * - 提供“Copied!” 的短暂反馈
 */
export const CopyButton: FC<{ wrapperEl: Element | null }> = ({ wrapperEl }) => {
  const [copied, setCopied] = useState(false);

  /**
   * 点击复制按钮时的处理函数
   */
  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();

      // 如果没有传入 code-window 容器，直接退出
      if (isNil(wrapperEl)) return;

      // 在 code-window 内查找代码内容区
      const contentEl = wrapperEl.querySelector('.code-content') as HTMLElement;
      if (isNil(contentEl)) return;

      // 将代码文本写入剪贴板
      // 注意：这里没有做错误捕获，假设运行环境支持 clipboard API
      navigator.clipboard.writeText(contentEl.textContent || '');

      // 设置复制状态，用于 UI 提示
      setCopied(true);

      // 2 秒后恢复按钮文案
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    },
    [wrapperEl],
  );

  return (
    <button className="code-copy" type="button" onClick={handleClick}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

/**
 * useCodeWindow
 * -------------
 * 用于"增强" rehypeCodeWindow 生成的代码块 DOM 的 Hook。
 *
 * 职责：
 * 1. 在 MDX 内容渲染完成后，扫描 DOM 中的 `.code-window`
 * 2. 在每个 `.code-window` 的 `.code-header` 中注入一个工具栏容器
 * 3. 使用 React createRoot 将 <CopyButton /> 渲染进该工具栏
 *
 * 这是一个「命令式 DOM + React 混合」的实现方式：
 * - rehype 阶段只负责生成结构（HTML AST）
 * - 客户端阶段通过 DOM 查询补充交互能力
 */
export const useCodeWindow = (
  ref: RefObject<HTMLDivElement | null>,
  content: JSX.Element | null,
) => {
  /**
   * 阻止默认点击行为的事件处理函数
   *
   * 原始意图：
   * - 看起来是为了防止某些 summary/details 的默认折叠行为
   * - 但当前代码实际绑定在 `.code-header` 上
   */
  const preventSummaryToggle = useCallback((e: Event) => e.preventDefault(), []);

  /**
   * 单一 Effect：
   * 当 content 变化（即 MDX 内容重新渲染）时，
   * 1. 在 ref.current 容器内扫描 `.code-window`
   * 2. 为每个 code-window 注入工具栏和复制按钮
   *
   * 这样避免了级联 setState，直接在一个 effect 中完成所有 DOM 操作
   */
  useEffect(() => {
    if (!ref.current || !content) return;

    // 扫描所有代码窗口
    const wrapperEls = ref.current.querySelectorAll('.code-window');
    if (!wrapperEls.length) return;

    // 为每个代码窗口注入工具栏和按钮
    wrapperEls.forEach((wrapperEl) => {
      // 查找当前代码块的 header 区域
      const headerEl = wrapperEl.querySelector('.code-header');
      if (isNil(headerEl)) return;

      // 给 header 绑定 click 事件（阻止默认行为）
      headerEl.addEventListener('click', preventSummaryToggle);

      // 查找是否已经存在工具栏容器
      let toolsEl = headerEl.querySelector('div.code-tools') as HTMLElement;

      // 如果不存在，则创建并插入
      if (isNil(toolsEl)) {
        toolsEl = document.createElement('div');
        toolsEl.className = 'code-tools';
        headerEl.appendChild(toolsEl);

        // 使用 React 18 的 createRoot
        // 将 CopyButton 渲染到这个"命令式创建的 DOM 节点"中
        const toolsNodes = createRoot(toolsEl);
        toolsNodes.render(<CopyButton wrapperEl={wrapperEl} />);
      }
    });

    /**
     * cleanup 函数
     * 移除所有事件监听器以避免内存泄漏
     */
    return () => {
      wrapperEls.forEach((wrapperEl) => {
        const headerEl = wrapperEl.querySelector('.code-header');
        if (!isNil(headerEl)) {
          headerEl.removeEventListener('click', preventSummaryToggle);
        }
      });
    };
  }, [content, preventSummaryToggle, ref]);
};
