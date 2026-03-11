import type { FC, PropsWithChildren } from 'react';

import { Skeleton } from 'ui/skeleton';

const baseSkeletonClass = 'bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm';

const AuthFormCard: FC<PropsWithChildren> = ({ children }) => (
  <div className="mx-auto flex w-full max-w-xl flex-col space-y-8 rounded-md px-5 py-9 shadow-md lg:w-auto">
    <Skeleton className={`mx-auto h-7 w-28 md:w-32 lg:w-80 ${baseSkeletonClass}`} />
    {children}
  </div>
);

const InputSkeleton: FC = () => <Skeleton className={`h-11 w-full ${baseSkeletonClass}`} />;
const ButtonSkeleton: FC = () => <Skeleton className={`h-11 w-full ${baseSkeletonClass}`} />;

const LinkSkeleton: FC = () => (
  <div className="flex justify-end">
    <Skeleton className={`h-4 w-24 ${baseSkeletonClass}`} />
  </div>
);

export const AuthFormSkeleton: FC = () => (
  <AuthFormCard>
    <div className="space-y-3">
      <InputSkeleton />
      <InputSkeleton />
      <LinkSkeleton />
      <div className="space-y-3 pt-2">
        <ButtonSkeleton />
        <ButtonSkeleton />
      </div>
    </div>
  </AuthFormCard>
);
