'use client';
import type { FC } from 'react';

import { useState } from 'react';

import { useScroll } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import $styles from './header.module.css';
import { HeaderRight } from './ui/header-right';
import { List } from './ui/list';
import Logo from './ui/logo';
import { HeaderMiddleMobile } from './ui/mobile-menu';
import { HeaderMiddlePc } from './ui/pc-menu';
import { Search } from './ui/search';
// 左侧 logo
// 中间： 首页、博客、其他。这部分在移动端变为侧边收缩栏
// 右侧： 登录、模式切换、API文档
const Header: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isScrolled = useScroll(50);
  return (
    <>
      <div
        className={cn($styles.header, { [$styles.headerScrolled]: isScrolled })}
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
        <div className="flex-1 flex justify-center max-w-[200px] mx-4">
          <Search />
        </div>
        <HeaderRight />
      </div>
      {/* Mobile Sidebar */}
      <HeaderMiddleMobile
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default Header;
