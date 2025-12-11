'use client';

import type { FC } from 'react';

import { Home, PenSquare } from 'lucide-react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from 'ui/navigation-menu';

import { cn } from '@/app/utils/utils';

import $styles from './pc-menu.module.css';

export const menus = [
  { href: '/', label: '首页', icon: Home },
  { href: '/blog', label: '博客', icon: PenSquare },
];

export const HeaderMiddlePc: FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex gap-8 list-none">
        {menus.map((item) => {
          const Icon = item.icon;
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link href={item.href} className={cn($styles.menuItem)}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
