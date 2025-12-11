import type { FC } from 'react';

import { List as LucideList } from 'lucide-react';
import { Button } from 'ui/button';

export const List: FC<{
  size?: number;
  onClick?: () => void;
}> = ({ size = 24, onClick }) => {
  return (
    <Button
      variant="ghost"
      className="h-auto w-[24px] p-0 hover:bg-transparent"
      onClick={onClick}
    >
      <LucideList size={size} />
    </Button>
  );
};
