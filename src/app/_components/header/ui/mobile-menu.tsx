import type { FC } from 'react';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { cn } from '@/app/utils/utils';

import Logo from './logo';
import $styles from './mobile-menu.module.css';
import { menus } from './pc-menu';

interface HeaderMiddleMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeaderMiddleMobile: FC<HeaderMiddleMobileProps> = ({
  isOpen,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close menu"
        className={cn(
          $styles.overlay,
          isOpen
            ? 'opacity-60 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      />
      {/* Sidebar */}
      <div
        ref={containerRef}
        className={cn(
          $styles.sideBar,
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className={cn($styles.sideBarHeader)}>
          <Logo />
          <X size={24} onClick={onClose} />
        </div>
        <div className="flex flex-col gap-4 mt-8">
          {menus.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={$styles.sideBarContent}
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
