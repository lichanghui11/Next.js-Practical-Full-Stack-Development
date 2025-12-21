/**
 * remark 插件：计算文章阅读时间
 *
 * 工作原理：
 * 1. 遍历 Markdown AST，统计文本节点的字数
 * 2. 按照平均阅读速度计算预计阅读时间
 * 3. 将结果存入 vfile.data.readingTime
 *
 * 阅读速度参考：
 * - 中文：300-500 字/分钟
 * - 英文：200-250 词/分钟
 */
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import type { ReadingTimeResult } from '../types';

interface Options {
  wordsPerMinute?: number; // 中文每分钟阅读字数
}

const remarkReadingTime = (options: Options = {}) => {
  const wordsPerMinute = options.wordsPerMinute || 400; // 默认 400 字/分钟

  return (tree: any, file: any) => {
    let totalChars = 0;

    // 遍历所有节点，统计文本
    visit(tree, (node) => {
      // 统计文本节点
      if (node.type === 'text' || node.type === 'code' || node.type === 'inlineCode') {
        const text = toString(node);
        // 中文字符、英文单词都按字符数统计
        totalChars += text.length;
      }
    });

    // 计算阅读时间
    const minutes = Math.max(1, Math.ceil(totalChars / wordsPerMinute));

    const result: ReadingTimeResult = {
      text: `${minutes} 分钟`,
      minutes,
      words: totalChars,
    };

    // 存入 vfile.data，后续可通过 scope 访问
    file.data.readingTime = result;
  };
};

export default remarkReadingTime;
export type { ReadingTimeResult };
