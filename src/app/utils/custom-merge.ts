import deepmerge from 'deepmerge';

export const customMerge = <A, B>(
  destination: Partial<A>,
  source: Partial<B>,
  arrayMode: 'replace' | 'merge' = 'merge', // 这里只定义 数组 的合并方式
) => {
  const options: deepmerge.Options = {};

  if (arrayMode === 'replace') {
    // 用 源数组 替换 目标数组
    options.arrayMerge = (_destinationArray, sourceArray, _options) => sourceArray;
  }
  if (arrayMode === 'merge') {
    // 合并数组，去重
    options.arrayMerge = (_destinationArray, sourceArray, _options) =>
      Array.from(new Set([..._destinationArray, ...sourceArray]));
  }
  return deepmerge(destination, source, options);
};
