'use client';
import { useEffect, useState } from 'react';
import { useMedia } from 'react-use';

/**
 * 业务上常用的屏幕尺寸断点 (Breakpoints)
 * 基于通用的响应式设计标准 (Compatible with Tailwind CSS default breakpoints)
 */
export const SCREENS = {
  sm: 640, // Mobile Landscape / Small Tablet
  md: 768, // Tablet (iPad Portrait)
  lg: 1024, // Laptop / Tablet Landscape (iPad Pro)
  xl: 1280, // Desktop
  '2xl': 1536, // Large Desktop
} as const;

export enum DeviceType {
  Mobile = 'mobile', // < 768px
  Tablet = 'tablet', // 768px - 1023px
  Desktop = 'desktop', // >= 1024px
}

// 监听是否滚动
export const useScroll = (threshold = 0) => {
  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScroll(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);
  return isScroll;
};

export function useIsMobile() {
  return useMedia(`(max-width: ${SCREENS.md}px)`, false);
}

export function useIsPC() {
  return useMedia(`(min-width: ${SCREENS.xl + 1}px)`, false);
}
