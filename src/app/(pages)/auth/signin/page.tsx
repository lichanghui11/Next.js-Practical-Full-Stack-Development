import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { AuthSigninForm } from '@/app/_components/auth/forms/signin';
import { cn } from '@/app/utils/utils';

import $styles from './style.module.css';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
  return {
    title: `登录 - ${(await parent).title?.absolute}`,
    description: '用户登陆页面',
  };
};

const AuthSigninPage: FC = () => {
  return (
    <div className="page-item">
      <div className={cn($styles.item, 'page-container page-block')} style={{ flex: 'none' }}>
        <div className="text-center text-xl font-bold">用户登录</div>
        <AuthSigninForm />
      </div>
    </div>
  );
};

export default AuthSigninPage;
