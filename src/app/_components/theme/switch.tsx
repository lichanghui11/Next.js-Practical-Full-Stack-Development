'use client';
import type { FC } from 'react';

import { Moon, Sun } from 'lucide-react';
import { Button } from 'ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'ui/tooltip';

import {
  useThemeActions,
  useThemeMode,
} from './core/hooks';
const nextMap: Record<string, 'light' | 'dark'> = {
  light: 'dark',
  dark: 'light',
};
export const ThemeSwitch: FC = () => {
  const { mode } = useThemeMode();
  const dispatches = useThemeActions();
  const handleClick = () => {
    const current = mode ?? 'light';
    const next = nextMap[current] ?? 'light';
    dispatches.changeMode(next);
  };

  const Icon = mode === 'dark' ? Moon : Sun;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          aria-label={mode}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>切换模式</p>
      </TooltipContent>
    </Tooltip>
  );
};
