import type { FC } from 'react';

import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from 'ui/item';
import { Spinner as ShadcnSpinner } from 'ui/spinner';

export const Spinner: FC = () => {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <ShadcnSpinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            deleting...
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
};
