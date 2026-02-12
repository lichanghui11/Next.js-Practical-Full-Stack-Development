import { isNil } from 'lodash';

import type { CategoryItem } from '@/server/modules/category/category.type';

import { categoryApi } from '@/api/category';

export interface IBlogBreadcrumbItem {
  id: string;
  text: string;
  link?: string;
}
export const getBreadcrumbsLinks = (
  categories: CategoryItem[],
  type: 'breadcrumb' | 'post' = 'breadcrumb',
): IBlogBreadcrumbItem[] => {
  let link = '';
  return categories.map((category, index) => {
    const item: IBlogBreadcrumbItem = {
      id: category.id,
      text: category.name,
    };
    if (index < categories.length - 1 || type === 'post') {
      link = `${link}/${category.slug || category.id}`;
      item.link = link;
    }
    return item;
  });
};

/**
 * 验证 URL 中的分类路径是否合法，防止用户伪造 URL
 *
 * @param categories URL 中的分类路径段，例如访问 /frontend/react/hooks 时为 ["frontend", "react", "hooks"]
 * @returns CategoryItem[] - URL 合法，返回完整的分类信息
 *          []             - 没有传分类参数（首页场景）
 *          false          - URL 非法/伪造
 */
export const getBreadcrumbsCategories = async (
  categories?: string[],
): Promise<CategoryItem[] | false> => {
  // 没有分类参数，返回空数组（首页等不需要分类的场景）
  if (!isNil(categories) && categories.length > 0) {
    // 取最后一个（最深层的分类），用它向后端查询完整的祖先链
    const latest = categories[categories.length - 1];
    const result = await categoryApi.breadcrumb(latest);
    if (!result.ok) throw new Error((await result.json()).message);
    const items = await result.json();

    // 验证长度：URL 段数必须和后端返回的祖先链长度一致
    // 例如 URL 有 3 段，后端也应返回 3 个分类，否则说明路径被篡改
    if (items.length !== categories.length) return false;

    // 验证每一段都能对得上（通过 id 或 slug 匹配）
    // 防止类似 /backend/react 这种 React 不属于后端分类的伪造路径
    if (
      !items.every(
        (item: CategoryItem, index: number) =>
          item.id === categories[index] || item.slug === categories[index],
      )
    ) {
      return false;
    }

    // 全部验证通过，返回完整的分类数据
    return items;
  }
  return [];
};
