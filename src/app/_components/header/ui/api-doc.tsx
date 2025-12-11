import type { FC } from 'react';

import { FileCode2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from 'ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'ui/tooltip';

// TODO：后期需要完善文档相关，直接跳转链接
const ApiDoc: FC = () => {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="#" target="_blank">
              <Button variant="ghost" size="icon">
                <FileCode2 />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>API文档</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default ApiDoc;
