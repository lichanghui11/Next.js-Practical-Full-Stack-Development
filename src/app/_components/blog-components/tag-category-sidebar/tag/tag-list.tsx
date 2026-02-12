import type { FC } from 'react';

import type { TagType as TagItem } from '@/server/modules/tag/tag.type';

import { TagLink } from '@/app/_components/blog-components/submit-form/tag/tag-link';
import { cn } from '@/app/utils/utils';

import $styles from './tag-list.module.css';

export const TagListComponent: FC<{ items: TagItem[]; actived?: string }> = ({
  items,
  actived,
}) => {
  return (
    <div className={$styles.container}>
      {items.map((tagItem) => (
        <TagLink
          key={tagItem.id}
          tag={tagItem}
          className={cn({
            [$styles.tagActived]: actived === tagItem.id,
            // 当 actived === tagItem.id 为 true 时，加上 tagActived 样式
            // 为 false 时，不加
          })}
        />
      ))}
    </div>
  );
};
