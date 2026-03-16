'use client';
// 视频弹出框组件

import type { Option } from 'artplayer';
import type { FC } from 'react';

// 直接获取 Radix UI 底层原始组件，绕开 shadcn 的二次封装，获取更多的自定义的灵活性
import * as DialogPrimitive from '@radix-ui/react-dialog';
import CloseIcon from '@ricons/material/CloseFilled';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from 'ui/dialog';

import { customMerge } from '@/app/utils/custom-merge';
import { cn } from '@/app/utils/utils';

import $styles from './video.module.css';

const VideoPlayer = dynamic(async () => import('../video/player'), { ssr: false });
interface Props {
  className?: string;
  videoOptions: Omit<Option, 'container'>;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const VideoModal: FC<Props> = ({ className, videoOptions, open, setOpen }) => {
  const videoOptionsWithDefaults = customMerge(
    videoOptions,
    { autoplay: true, muted: true },
    'replace',
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <DialogPortal>
        <DialogOverlay className={$styles.overlay}></DialogOverlay>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn($styles.content, className)}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="mb-2 flex w-full items-center justify-center">
            <button type="button" className={$styles.closeButton} onClick={close}>
              <span className="xicon">
                <CloseIcon />
              </span>
            </button>
          </div>
          <VideoPlayer option={videoOptionsWithDefaults}></VideoPlayer>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
