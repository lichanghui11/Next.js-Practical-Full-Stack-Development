import type { FC } from 'react';

import { FileCode2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from 'ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui/tooltip';

import { appConfig } from '@/config/api.client';
// TODO：后期需要完善文档相关，直接跳转链接
export const ApiDoc: FC = () => {
  return (
    <>
      <Suspense fallback={null}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`${appConfig.baseUrl}${appConfig.apiPath}/docs`} target="_blank">
                <Button variant="ghost" size="icon">
                  <FileCode2 />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>访问API文档</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Suspense>
    </>
  );
};
