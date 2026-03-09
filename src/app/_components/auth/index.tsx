'use client';

import type { FC, JSX, PropsWithChildren } from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { User } from '@/server/modules/user/user.type';

import { authApi } from '@/api/auth';

import type { AuthType } from './types';

import { Spinner } from '../spinner';
import { AuthContext } from './constants';
import { useAuth, useSetAuth } from './hooks';

const DefaultLoading: FC = () => {
  return (
    <Spinner
      icon={false}
      className="rounded-sm bg-white/80 transition-opacity duration-300 dark:bg-black/50"
    />
  );
};

/**
 *
 * @param param0
 * 函数组件功能：页面初始化/登陆状态变化的时候，自动校验用户的登陆状态（拉取最新信息），并更新到 context(store) 里面
 */
const AuthSetter: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();
  const setAuth = useSetAuth();

  useEffect(() => {
    // useEffect 里面不能直接写顶部 async ，所以使用立即执行的异步函数

    (async () => {
      if (auth === false) {
        try {
          // 拿到当前登陆用户信息
          const authUser = await authApi.getAuth();
          setAuth(authUser);
        } catch (e) {
          toast.error('网络连接错误', {
            description: `${(e as Error).message}，请尝试刷新页面`,
          });
        }
      }
    })();
  }, [auth]);

  return <>{children}</>;
};

/**
 *
 * @param param0
 * 函数组件功能：设置全局的用户的认证状态
 * 不同的上下文实例会互相隔绝
 * AuthContext 是 AuthContext.Provider 的缩写
 */
export const Auth: FC<PropsWithChildren> = ({ children }) => {
  // 初始化用户的认证状态为 false
  const [auth, changeAuth] = useState<AuthType>(false);

  // 封装稳定的状态修改方法
  const setAuthUser = useCallback((value: AuthType) => changeAuth(value), [changeAuth]);

  // 组装要发布的上下文数据（缓存避免无用的重渲染）
  const value = useMemo(() => {
    return { auth, setAuth: setAuthUser };
  }, [auth]);

  return (
    <AuthContext value={value}>
      <AuthSetter>{children}</AuthSetter>
    </AuthContext>
  );
};

// 认证组件保护器
export const AuthChecker: FC<{
  loading?: JSX.Element;
  render: <P extends Record<string, any> & { auth: User | null }>(props: P) => JSX.Element;
}> = (props) => {
  const { loading = <DefaultLoading />, render } = props;
  const auth = useAuth();

  // 核心逻辑：
  // 1. 如果 auth === false（正在校验登录状态/未登录）→ 展示 loading
  // 2. 如果 auth 不是 false（已拿到登录状态：User 对象 或 null）→ 执行 render 函数，把 auth 传进去，渲染业务内容
  return auth === false ? loading : render({ auth });
};
