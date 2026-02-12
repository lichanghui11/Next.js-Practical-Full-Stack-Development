// 这个文件用于写对于翻页插件的转译逻辑，即 adapter 适配器

import { omit } from 'lodash';

import type { PageMeta } from '../types/pagination';
/**
  把插件返回的 { result, count, limit, page, totalPages ... }
  转成你自己的 { items, meta }
 */
export const paginationAdapter = (data: any) => {
  const [result, meta] = data;

  // 需要计算的值：每页的平均数量 当前页的数量
  const itemsPerPage = meta.pageCount > 0 ? Math.floor(meta.totalCount / meta.pageCount) : 0;
  // 当前页为最后一页 && 可以整除，则取平均页面数量
  // 当前页为最后一页 && 不能整除，则取余数
  // 当前页不是最后一页，则取每页平均数量
  const pageSize =
    meta.pageCount > 0 && meta.currentPage === meta.pageCount
      ? meta.totalCount % meta.pageCount === 0
        ? itemsPerPage
        : meta.totalCount % meta.pageCount
      : itemsPerPage;
  return {
    data: result,
    meta: {
      itemsPerPage, // 每页数量，这里指的是平均数量，不包括最后一页
      pageSize, // 当前页面的数据量，通过当前获取的数据长度计算，因为有可能一页没有占满
      currentPage: meta.currentPage, // 当前页
      totalItems: meta.totalCount, // 总数量
      totalPages: meta.pageCount, // 总页数
      ...omit(meta, ['totalCount', 'currentPage', 'pageCount']),
    } as PageMeta,
  };
};
