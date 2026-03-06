'use client';
import type { Transition } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';

import { FadeInMotion } from '@/app/_components/motion/fadeIn';

import $styles from '../style.module.css';
export const PostListItemMotion: FC<PropsWithChildren> = ({
  children,
  // thumb,
}) => (
  <FadeInMotion
    className={$styles.item}
    // 传入css变量的封面图用于鼠标移动到此处后会出现不同颜色的光晕效果
    // style={{ '--bg-img': `url(${thumb})` } as any}
    side="none"
    otherProps={(props, inited) => {
      const transition: Transition = !inited
        ? {
            duration: 0.3,
            delay: props.delay || 0,
            ease: [0.21, 0.47, 0.32, 0.98],
          }
        : { duration: 0.05, ease: 'easeOut' };
      return {
        whileHover: {
          scale: 1.03,
          transition: {
            duration: 0.05,
            ease: 'easeIn',
          },
        },
        transition,
      };
    }}
  >
    {children}
  </FadeInMotion>
);
