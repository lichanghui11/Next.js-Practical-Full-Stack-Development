import { isNil } from 'lodash';

import type { CategoryItem } from '@/server/modules/category/category.type';

import { categoryApi } from '@/api/category';

import type { IBlogBreadcrumbItem } from './breadcrumb';

/**
 * 获取嵌套后的面包屑的数据
 * breadcrumb 模式下最后一项不可点击
 * post 模式下最后一项可以点击
 */
export const getBreadcrumbLinks = (
  categories: CategoryItem[],
  type: 'breadcrumb' | 'post' = 'breadcrumb',
): IBlogBreadcrumbItem[] => {
  console.log('getBreadcrumbLinks: categories', categories);
  let link = '';
  if (isNil(categories) || categories.length === 0) return [];
  return categories.map((category, idx) => {
    const item: IBlogBreadcrumbItem = {
      id: category.id,
      text: category.name,
    };
    if (idx < categories.length - 1 || type === 'post') {
      link = `${link}/${category.slug || category.id}`;
      item.link = link;
    }
    return item;
  });
};

/**
 *
 * @param categories
 * 入参应该是一个 ID 组成的数组
 * 使用最后一个分类 ID 查询出这个分类链条上的的每个分类组成的一位数组
 * 如果能够和服务端的数据的顺序一一对应上，则返回查询到的分类扁平数组
 * 否则返回 false
 */
export const getBreadcrumbCategories = async (categories: string[]) => {
  if (!isNil(categories) && categories.length - 1) {
    const lastId = categories[categories.length - 1];
    const result = await categoryApi.breadcrumb(lastId);
    if (!result.ok) {
      throw new Error((await result.json()).message);
    }
    const categoryArr = await result.json();
    if (
      // 从数据库查出来的分类数据一位数组和这里拿到的分类ID组成的一位数组如果不能一一对应上，则这个分类数据不正确
      !categoryArr.every(
        (cat: CategoryItem, idx: number) =>
          cat.id === categories[idx] || cat.slug === categories[idx],
      )
    ) {
      return false;
    }
    return categoryArr;
  }
  return [];
};
