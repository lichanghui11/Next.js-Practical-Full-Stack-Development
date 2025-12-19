// 这里定义数据相关的类型
// 需要对翻页插件的功能进行一个转译以适应自定义规则
// 此处定义相关的类型
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
  meta: PageMeta & Record<string, any>; // 这里是因为可能翻页插件有额外的字段
  data: T[];
}

// 这个是翻页查询那个请求返回的原数据类型，在翻页组件和翻页数据请求的逻辑里面会用到
export interface PageMeta {
  itemsPerPage: number; // 每页数量
  pageSize: number; // 当前页数量
  currentPage: number; // 当前页
  totalItems: number; // 数据的总数量
  totalPages: number; // 总页数
  isFirstPage: boolean; // 是否是第一页
  isLastPage: boolean; // 是否是最后一页
  previousPage: number | null; // 上一页
  nextPage: number | null; // 下一页
}
