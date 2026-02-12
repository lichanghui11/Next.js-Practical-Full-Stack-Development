import CategoryRepo from '@/database/repositories/category.repo';

/**
 *
 * @param parentId
 * @returns 扁平化的分类数组 **扁平**！！！！
 * 获取分类节点自身及其所有后代节点
 */
export const queryCategoryDescendants = async (parentId?: string) => {
  return await CategoryRepo.queryCategoryDescendants(parentId);
};

/**
 *
 * @param parentId
 * @returns 树状结构的分类数组 **树状**！！！！
 */
export const queryCategoryTree = async (parentId?: string) => {
  return await CategoryRepo.queryCategoryTree(parentId);
};

/**
 *
 * @param parentId
 * @returns 返回的是不带 children 属性的扁平数组
 * 这里内部经历了自定义的树的构建，自定义的树的扁平化
 */
export const queryCategoryList = async (parentId?: string) => {
  return await CategoryRepo.queryCategoryList(parentId);
};

/**
 *
 * @param latest
 * @returns 扁平数组
 * 返回从根节点到指定节点的路径，用于面包屑导航
 */
export const queryCategoryBreadcrumb = async (latest: string) => {
  return await CategoryRepo.queryCategoryBreadcrumb(latest);
};
