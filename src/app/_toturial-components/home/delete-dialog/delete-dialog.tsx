'use client';
import type { FC, MouseEventHandler } from 'react';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
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
import { deletePost } from '@/app/fake-database/fake-data-actions';

export const DeleteDialog: FC<{ id: string | number }> = ({
  id,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const handleOpen = useCallback((val: boolean) => {
    setOpen(val);
  }, []);
  const handleCancel: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        if (!pending) setOpen(false);
      },
      [pending],
    );
  const handleDelete: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      async (e) => {
        try {
          e.preventDefault();
          setPending(true);
          await deletePost(String(id));
          setOpen(false);
          router.refresh();
        } catch (error) {
          console.error(error);
        } finally {
          setPending(false);
        }
      },
      [id],
    );

  return (
    <AlertDialog open={open} onOpenChange={handleOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <FaTrashAlt />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onEscapeKeyDown={(e) =>
          pending ? e.preventDefault() : null
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>确定删除吗？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将删除本篇文章
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? <Spinner /> : '确定'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
