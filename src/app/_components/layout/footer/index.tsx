import type { FC } from 'react';

import Link from 'next/link';

export const Footer: FC = () => {
  return (
    <footer className="flex w-full flex-none justify-center self-end  border-t bg-white/30 py-3 dark:bg-black/30">
      <div className="page-container mb-0 flex h-auto flex-col items-center justify-between space-y-4 lg:flex-row lg:space-y-0">
        <div className="flex flex-col items-center space-x-0 space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
          <span>© {new Date().getFullYear()} XiHuan studio. All rights reserved.</span>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            浙ICP备xxxxxxxxxx号-1
          </Link>
          <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            浙公网安备 xxxxxxxxx号
          </Link>
        </div>
        <div>
          <span>
            Powered by
            <Link
              href="https://nextjs.org/"
              className="mx-2 font-semibold transition-colors hover:text-gray-900"
              target="_blank"
            >
              next.js
            </Link>
            &&
            <Link
              href="https://hono.dev/"
              className="ml-2 font-semibold transition-colors hover:text-gray-900"
              target="_blank"
            >
              hono
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};
