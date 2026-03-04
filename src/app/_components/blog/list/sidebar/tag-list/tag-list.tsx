import type { FC } from 'react';

import type { TagType } from '@/server/modules/tag/tag.type';

import { TagLink } from '@/app/_components/blog/form/tag';
import { cn } from '@/app/utils/utils';

import $styles from './tag-list.module.css';

/** TagLink 这个子组件里面没有定义这个 key ，这个是 React 内部的保留字段，可以直接传，用于diff */
export const TagListComponent: FC<{ items: TagType[]; actived?: string }> = ({
  items,
  actived,
}) => {
  return (
    <div className={$styles.container}>
      {items.map((tagItem) => {
        return (
          <TagLink
            key={tagItem.id}
            tag={tagItem}
            className={cn({
              [$styles.tagActived]: actived === tagItem.id,
            })}
          />
        );
      })}
    </div>
  );
};
