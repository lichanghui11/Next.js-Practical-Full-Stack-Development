import type { FC } from 'react';

import { cn } from '@/app/utils/utils';

import { BackButton } from '../back-button/back-button';
import { CreateButton } from '../create-button/create-button';

export const BackCreateTool: FC<{
  back?: boolean;
  className?: string;
}> = ({ back, className }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {back && <BackButton />}
      <CreateButton />
    </div>
  );
};
