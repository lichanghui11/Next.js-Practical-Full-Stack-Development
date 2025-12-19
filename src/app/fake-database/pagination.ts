// 根据传入的数据（一个数组）和分页参数（第几页和每页的数量）对数据进行分页处理
import { isNil } from 'lodash';

import type { PageParams, PageResult } from './pagination-types';
export const paginate = <T extends Record<string, any>>(
  data: T[],
  pageParams: PageParams,
): PageResult<T> => {
  // 确认每页数量、当前页数
  const limit = isNil(pageParams.limit) || pageParams.limit < 1 ? 1 : pageParams.limit;
  const currentPage =
    isNil(pageParams.currentPage) || pageParams.currentPage < 1 ? 1 : pageParams.currentPage;

  // 数据游标，当前页大于1时，从当前页的前一页的最后一条数据开始
  const startIndex = currentPage > 1 ? (currentPage - 1) * limit : 0;

  // 裁剪出当前页的数据
  const items = data.slice(startIndex, currentPage * limit);

  // 总页数
  const totalPages =
    data.length % limit === 0
      ? Math.floor(data.length / limit)
      : Math.floor(data.length / limit) + 1;

  // 最后一页的数量（可能没占满整页）
  const remainder = data.length % limit !== 0 ? data.length % limit : limit;

  // 根据页数得到当前页面的实际数量
  const actualItems = currentPage === totalPages ? remainder : limit;

  return {
    data: items,
    meta: {
      itemsPerPage: limit,
      pageSize: actualItems,
      currentPage,
      totalPages,
      totalItems: data.length,
    },
  };
};
