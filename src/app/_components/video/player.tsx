'use client';
// 封装这个播放器组件，使用自己的容器，不使用第三方包的容器
import type { Option } from 'artplayer';
import type { FC } from 'react';

import Artplayer from 'artplayer';
import { isNil } from 'lodash';
import { useEffect, useRef } from 'react';

import { cn } from '@/app/utils/utils';

import $styles from './player.module.css';

export const VideoPlayer: FC<{
  option: Omit<Option, 'container'>;
  getInstance?: any;
  className?: string;
}> = ({ option, getInstance, className, ...rest }) => {
  const artRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let art: Artplayer;
    if (!isNil(artRef.current)) {
      art = new Artplayer({
        fullscreen: true, // 开启全屏
        fullscreenWeb: true, // 开启全屏（Web）
        playsInline: true, // 开启内联播放
        fastForward: true, // 开启快进
        airplay: true, // 开启AirPlay
        autoplay: false, // 开启自动播放
        autoSize: true, // 开启自动调整大小
        muted: true, // 是否默认静音播放,开启后自动播放更容易生效（浏览器策略）
        ...option,
        container: artRef.current,
      });
      art.on('ready', () => {
        art.autoSize();
        art.autoHeight();
      });
      art.on('resize', () => {
        art.autoSize();
        art.autoHeight();
      });
      art.on('video:ended', () => {
        // 视频播放结束之后，重置进度条，设置封面图
        art.currentTime = 0; // 重置播放进度到0秒

        if (!isNil(option.poster)) art.poster = option.poster; // 如果有poster，重置封面图

        const posterEl = artRef.current?.getElementsByClassName(
          'art-poster',
        ) as HTMLCollectionOf<HTMLDivElement>;

        if (posterEl && posterEl.length > 0) {
          posterEl[0].style.display = 'block'; // 显示封面图，只使用第一个元素，理论上应该只会有一个元素
        }
        if (getInstance && typeof getInstance === 'function') {
          // 将这个 实例 传给外层组件使用
          getInstance(art);
        }
      });
    }

    return () => {
      if (art && art.destroy) {
        // - false（默认）：仅销毁实例、解绑事件、清空容器内的播放器 DOM，但保留你挂载的根容器（artRef.current）；
        // - true：除了销毁实例，还会把根容器（artRef.current）从 DOM 树中完全移除。
        art.destroy(false); // 销毁播放器实例，保留DOM元素
      }
    };
  }, [option.poster]);

  return <div ref={artRef} className={cn($styles.container, className)} {...rest} />;
};
