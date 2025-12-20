import type { PropsWithChildren } from 'react';
export type ModalProps = PropsWithChildren<{
  title: string;
  matchedPath: string[]; // 只要匹配这里的路由才显示弹窗
  className?: string;
}>;
