'use client';
import type { FC, MouseEventHandler } from 'react';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'ui/alert-dialog';
import { Button } from 'ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui/tooltip';

import { blogApi } from '@/api/post';
import { Spinner } from '@/app/_components/spinner';

export const DeleteDialog: FC<{ id: string | number }> = ({ id }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  // 开关
  const handleOpen = useCallback((val: boolean) => {
    setOpen(val);
  }, []);

  // 关闭
  const handleCancel: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();
      if (!pending) setOpen(false);
    },
    [pending],
  );

  // 删除
  const handleDelete: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      e.preventDefault();
      setPending(true);
      const result = await blogApi.delete(String(id));
      if (!result.ok) {
        toast.warning('删除失败', {
          id: 'post-delete-error',
          description: (await result.json()).message,
        });
      }
      setOpen(false);
      router.refresh(); // 删除文章后刷新页面
      setPending(false);
    },
    [id, router],
  );

  const openDialog: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault();
    handleOpen(true);
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={handleOpen}>
      <AlertDialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="text-xs" variant="secondary" size="sm" onClick={openDialog}>
                <Trash2 />
                删除
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>删除文章</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </AlertDialogTrigger>

      {/** 此处只在 pending 的时候阻止使用 ESC 键关闭对话框 */}
      <AlertDialogContent onEscapeKeyDown={(e) => (pending ? e.preventDefault() : null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>确定删除该文章吗？</AlertDialogTitle>
          <AlertDialogDescription>当前不支持软删除，删除文章后无法恢复</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={pending}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={pending}>
            {pending ? <Spinner /> : '确定删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
