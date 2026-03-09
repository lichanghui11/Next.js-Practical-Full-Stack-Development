'use client';
import type { FC } from 'react';

import type { PostItem } from '@/server/modules/blog/blog.type';
import type { User } from '@/server/modules/user/user.type';

import { AuthChecker } from '@/app/_components/auth';
import { cn } from '@/app/utils/utils';

import { DeleteDialog } from './delete-button';
import { PostEditButton } from './edit-button';

/**
 *
 * @param param0
 * 将 编辑 和 删除 按钮封装在一起使用
 */
const Buttons: FC<{ item: PostItem; className?: string; auth: User | null }> = ({
  item,
  className,
  auth,
}) => {
  return (
    auth && (
      <div className={cn('flex items-end space-x-1', className)}>
        <PostEditButton item={item} />
        <DeleteDialog id={item.id} />
      </div>
    )
  );
};

export const PostActions: FC<{ item: PostItem; className?: string; auth: User | null }> = (
  props,
) => {
  return <AuthChecker render={() => <Buttons {...props} />} />;
};
