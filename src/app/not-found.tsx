import { clsx } from 'clsx';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className={clsx('page-blank p-10 text-center')}>
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold text-red-500">404</h2>
          <p className="mt-2 text-xl text-zinc-600 dark:text-zinc-400">
            页面未找到 / Page Not Found
          </p>
          <p className="mt-4 text-sm text-zinc-500">抱歉，您访问的页面不存在或已被移除。</p>

          <Link
            href="/"
            className="mt-8 rounded-full bg-zinc-900 px-6 py-2 text-white transition-transform hover:scale-105 dark:bg-zinc-100 dark:text-zinc-900"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
