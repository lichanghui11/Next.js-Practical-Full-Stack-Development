import Link from 'next/link';

import { Button } from '@/app/_components/shadcn/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">404 - 页面未找到</h2>
      <p className="text-muted-foreground">抱歉，我们找不到您要查找的资源。</p>
      <Link href="/">
        <Button variant="outline">返回首页</Button>
      </Link>
    </div>
  );
}
