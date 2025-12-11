'use client'; // 必须是 Client Component

import { clsx } from 'clsx';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在这里记录错误日志到服务商 (如 Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className={clsx('page-blank p-10 text-center')}>
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold text-red-500">
            Something went wrong!
          </h2>
          <p className="mt-2 text-xl text-zinc-600 dark:text-zinc-400">
            应用程序遇到错误
          </p>
          <p className="mt-4 max-w-md text-wrap break-words text-sm text-red-400/80">
            {error.message || '未知错误'}
          </p>

          <button
            type="button"
            onClick={
              // 尝试恢复
              () => reset()
            }
            className="mt-8 rounded-full bg-red-600 px-6 py-2 text-white transition-transform hover:scale-105 hover:bg-red-700"
          >
            尝试重试 (Try again)
          </button>
        </div>
      </div>
    </div>
  );
}
