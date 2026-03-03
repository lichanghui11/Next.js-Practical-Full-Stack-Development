import type { FC } from 'react';

import { isNil } from 'lodash';
import { Tag } from 'lucide-react';

import type { TagType } from '@/server/modules/tag/tag.type';

import { tagApi } from '@/api/tag';

import { SidebarWidget } from '../widget-container/widget';
import { TagListComponent } from './tag-list';

/**
 * 外层是一个公共的container组件(SidebarWidget)
 */
export const TagListWidget: FC<{ actived?: string }> = async ({ actived }) => {
  const result = await tagApi.list();
  if (!result.ok) throw new Error((await result.json()).message);
  const tags = await result.json();

  let activeId: string | undefined;
  if (!isNil(actived)) {
    const activedTag = tags.find(
      (tag: TagType) => decodeURIComponent(tag.text) === decodeURIComponent(actived),
    );
    activeId = activedTag?.id;
  }

  return (
    <SidebarWidget
      title={
        <>
          <Tag />
          <span>标签</span>
        </>
      }
    >
      <TagListComponent items={tags} actived={activeId} />
    </SidebarWidget>
  );
};
