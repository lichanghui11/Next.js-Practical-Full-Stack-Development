// 编辑一个带有 金属流光边框 的堆叠卡片
import type { FC, PropsWithChildren } from 'react';

import { Card } from 'ui/card';

import { ShineBorder } from '@/app/_components/magicui/shine-border';
import { cn } from '@/app/utils/utils';

interface StackCardProps {
  className?: string;
  padding?: string;
  shine?: { open?: boolean; always?: boolean };
}

export const StackCard: FC<PropsWithChildren<StackCardProps>> = ({
  children,
  className,
  padding = '0.75rem',
  shine,
}) => {
  return (
    <div
      className={cn(
        `relative flex h-80 w-full items-center justify-center`,
        className,
        'w-[400px] h-[400px] ml-[20px]', // 视频卡片样式丢失了，这里强制覆盖
      )}
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-50 animate-pulse',
        )}
      ></div>
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-2xl opacity-50 animate-pulse',
        )}
      ></div>
      <div className="h-full w-full">
        <div className="relative h-full w-full">
          <Card
            className={cn(
              'absolute inset-0',
              'bg-card/20 backdrop-blur-sm',
              'rotate-[-4deg] translate-y-2',
              'rounded-sm!',
            )}
          />
          <Card
            className={cn(
              'absolute inset-0',
              'bg-card/30 backdrop-blur-sm',
              'rotate-[-2deg] translate-y-1',
              'rounded-sm!',
            )}
          />
          <Card className={cn('absolute inset-0', 'bg-card/40 backdrop-blur-sm', 'rounded-sm!')}>
            {' '}
            {shine ? (
              <ShineBorder
                className="relative h-full w-full rounded-sm"
                color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                always={shine.always}
                padding={padding}
              >
                {children}
              </ShineBorder>
            ) : (
              children
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
