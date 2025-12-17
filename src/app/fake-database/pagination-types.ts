// 分页的相关类型

// 分页元数据
export interface PageMeta {
  itemsPerPage: number; // 每一页数据量
  pageSize: number; // 当前页面的数据量
  currentPage: number; // 当前页
  totalItems: number; // 总数量
  totalPages: number; // 总页数
}

// 分页参数
export interface PageParams {
  currentPage: number;
  limit: number; // 每页数量
}

// 分页返回数据类型
export interface PageResult<T extends Record<string, any>> {
  meta: PageMeta;
  data: T[];
}
