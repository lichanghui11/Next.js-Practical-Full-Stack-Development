'use client'; // Error components must be Client Components

import { useEffect } from 'react';

import { Button } from '@/app/_components/shadcn/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在这里上报错误日志
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">出错了!</h2>
      <p className="text-muted-foreground">发生了意外错误。</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        重试
      </Button>
    </div>
  );
}
