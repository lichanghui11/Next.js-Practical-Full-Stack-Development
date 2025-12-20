import type { FC } from 'react';

import { cn } from '@/app/utils/utils';

import { DeleteDialog } from './delete-dialog';

export const DeleteButton: FC<{
  id: string | number;
  className?: string;
}> = ({ id, className }) => {
  return (
    <>
      <div className={cn(className)}>
        <DeleteDialog id={id} />
      </div>
    </>
  );
};
