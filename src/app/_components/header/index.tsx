'use client';
import type { FC } from 'react';

import { useEffect, useState } from 'react';

import { useScroll } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import $styles from './header.module.css';
import { HeaderRight } from './ui/header-right';
import { List } from './ui/list';
import Logo from './ui/logo';
import { HeaderMiddleMobile } from './ui/mobile-menu';
import { HeaderMiddlePc } from './ui/pc-menu';
// 左侧 logo
// 中间： 首页、博客、其他。这部分在移动端变为侧边收缩栏
// 右侧： 登录、模式切换、API文档
const Header: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isScrolled = useScroll(50);

  // 防止 Hydration 不匹配
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) {
    // 服务端渲染时返回简化版本，避免响应式类导致的不匹配
    return (
      <div
        className={cn($styles.header, {
          [$styles.headerScrolled]: isScrolled,
        })}
      >
        <div className="flex items-center gap-1">
          <Logo />
        </div>
        <HeaderRight />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn($styles.header, {
          [$styles.headerScrolled]: isScrolled,
        })}
      >
        <div className="flex items-center gap-1">
          <div className="md:hidden">
            <List size={18} onClick={() => setIsSidebarOpen(true)} />
          </div>
          <Logo />
          <div className="hidden md:block">
            <HeaderMiddlePc />
          </div>
        </div>
        <HeaderRight />
      </div>
      {/* Mobile Sidebar */}
      <HeaderMiddleMobile isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Header;
