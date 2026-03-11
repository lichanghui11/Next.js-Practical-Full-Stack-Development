import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { ForgetPasswordForm } from '@/app/_components/auth/forms/forget-password';
import { cn } from '@/app/utils/utils';

import $styles from './style.module.css';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
  return {
    title: `忘记密码 - ${(await parent).title?.absolute}`,
    description: '重置您的账户密码',
  };
};

const ForgetPasswordPage: FC = async () => (
  <div className="page-item">
    <div className={cn($styles.item, 'page-container page-block')} style={{ flex: 'none' }}>
      <div className="text-center text-xl font-bold">忘记密码</div>
      <ForgetPasswordForm />
    </div>
  </div>
);
export default ForgetPasswordPage;
