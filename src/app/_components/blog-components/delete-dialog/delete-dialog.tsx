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

import { Spinner } from '@/app/_components/spinner';
import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';
import { fetchApi } from '@/lib/rpc.client';

import styles from '../shared/button-styles.module.css';

export const DeleteDialog: FC<{ id: string | number }> = ({ id }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleOpen = useCallback((val: boolean) => {
    setOpen(val);
  }, []);

  const handleCancel: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();
      if (!pending) setOpen(false);
    },
    [pending],
  );

  const handleDelete: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      e.preventDefault();
      setPending(true);
      const result = await fetchApi((honoClient) => {
        return honoClient.api.blogs[':id'].$delete({ param: { id: String(id) } });
      });
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

  return (
    <AlertDialog open={open} onOpenChange={handleOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(styles.iconButton, isMobile ? styles.mobile : styles.pc)}
        >
          <Trash2 className={styles.buttonIcon} />
          <span className={styles.buttonText}>删除</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onEscapeKeyDown={(e) => (pending ? e.preventDefault() : null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>确定删除吗？</AlertDialogTitle>
          <AlertDialogDescription>此操作将删除本篇文章</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={pending}>
            {pending ? <Spinner /> : '确定'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
