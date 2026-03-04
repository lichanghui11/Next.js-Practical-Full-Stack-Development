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
  console.log('====================Sidebar组件====================');
  console.log('activedCategories', activedCategories);
  console.log('activedTag', activedTag);
  console.log('====================Sidebar组件====================');
  return (
    <div className={$styles.sidebar}>
      <div className="space-y-4">
        <CategoryTreeWidget actives={activedCategories} />
        <TagListWidget actived={activedTag} />
      </div>
    </div>
  );
};
