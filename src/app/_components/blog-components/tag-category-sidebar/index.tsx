import type { FC } from 'react';

import type { CategoryItem } from '@/server/modules/category/category.type';

import { CategoryTreeWidget } from './category';
import $styles from './style.module.css';
import { TagListWidget } from './tag';

export const Sidebar: FC<{ activedCategories: false | CategoryItem[]; activedTag?: string }> = ({
  activedCategories,
  activedTag,
}) => {
  return (
    <div className={$styles.sidebar}>
      <div className="space-y-4">
        <CategoryTreeWidget actives={activedCategories} />
        <TagListWidget actived={activedTag} />
      </div>
    </div>
  );
};
