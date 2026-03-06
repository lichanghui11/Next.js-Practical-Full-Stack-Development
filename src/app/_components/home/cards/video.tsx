'use client';
import type { FC } from 'react';

import { Play } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/app/utils/utils';

import { StackCard } from '../../cards/stack';
import { VideoModal } from '../../modal/video';
import $styles from './video.module.css';

export interface HomeVideoCardType {
  image: string;
  videoUrl: string;
}

// B 区组件，放置视频卡片
export const HomeVideoCard: FC<HomeVideoCardType> = ({ image, videoUrl }) => {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  return (
    <>
      <StackCard shine={{ open: true, always: true }} className="h-auto ">
        <div className={cn(`relative flex h-80 w-full items-center justify-center`)}>
          <div className={$styles.main} style={{ backgroundImage: image }}>
            <button onClick={openModal} type="button" className={$styles.openBtn}>
              <Play className="size-8! text-white" />
            </button>
          </div>
        </div>
      </StackCard>
      <VideoModal videoOptions={{ url: videoUrl }} open={open} setOpen={setOpen} />
    </>
  );
};
