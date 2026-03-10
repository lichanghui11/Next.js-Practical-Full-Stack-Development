import type { FC } from 'react';

import { PostCreateButton } from '@/app/_components/blog/list/actions/create-button';

import { ThemeSwitch } from '../../../theme/switch';
import { ApiDoc } from './api-doc';
import { UserActionButton } from './user-action';
export const HeaderTools: FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <PostCreateButton iconBtn={isMobile} />
      <ApiDoc />
      <ThemeSwitch />
      <UserActionButton />
    </div>
  );
};
