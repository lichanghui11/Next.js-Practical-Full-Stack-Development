import type { FC } from 'react';

import type { CategoryItem } from '@/server/modules/category/category.type';

import { CategoryTreeWidget } from './category-tree';
import $styles from './style.module.css';
import { TagListWidget } from './tag-list';

/**
 * 这个侧边栏组件里面分别封装了 分类 和 标签 两个小组件
 */
export const Sidebar: FC<{
  activedCategories: false | CategoryItem[];
  activedTag?: string;
}> = ({ activedCategories, activedTag }) => {
  return (
    <div className={$styles.sidebar}>
      <div className="space-y-4">
        <CategoryTreeWidget actives={activedCategories} />
        <div className="border-b border-gray-200 w-full"></div>
        <TagListWidget actived={activedTag} />
        <div className="border-b border-gray-200 w-full"></div>
      </div>
    </div>
  );
};
