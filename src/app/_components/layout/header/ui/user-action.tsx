import type { FC } from 'react';

import { isNil } from 'lodash';
import { Loader2, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useState } from 'react';
import { useMount } from 'react-use';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from 'ui/avatar';
import { Button } from 'ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui/tooltip';

import type { User } from '@/server/modules/user/user.type';

import { authApi } from '@/api/auth';
import { AuthChecker } from '@/app/_components/auth';
import { useSetAuth } from '@/app/_components/auth/hooks';

// 工程化工具会将 svg 处理为静态资源，并生成一个唯一的 URL 地址
import UserAvatar from './avatar.svg';
import $styles from './user-action.module.css';

// 使用头像控制登陆登出
export const HandleButton: FC<{ auth: User | null }> = ({ auth }) => {
  const router = useRouter();
  const setAuth = useSetAuth();
  const [mounted, setMounted] = useState(false);

  useMount(() => {
    // 这个是对 useEffect 的封装，组件挂载之后只执行一次，相当于依赖是空数组
    setMounted(true);
  });

  const handleLogout = useCallback(async () => {
    try {
      await authApi.signOut({
        onSuccess: () => {
          toast.success('退出登录成功');
          // 退出登录成功之后，将用户信息置空
          setAuth(null);
          router.refresh();
        },
      });
    } catch (e) {
      toast.error('退出登录失败', {
        description: (e as Error).message || '服务器错误',
      });
    }
  }, [router, setAuth]);

  return !mounted || isNil(auth) ? (
    <div className={$styles.user}>
      <Suspense>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="ml-auto" size="icon" variant="outline">
                <Link href="/auth/signin">
                  <UserIcon></UserIcon>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>登录</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Suspense>
    </div>
  ) : (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className={$styles.avatar}>
          <AvatarImage src={UserAvatar.src} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56 text-center text-stone-500">
        <DropdownMenuLabel className="justify-center">我的</DropdownMenuLabel>
        <DropdownMenuSeparator></DropdownMenuSeparator>
        <DropdownMenuItem>
          <Link href="#" onClick={handleLogout}>
            退出登录
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const UserActionButton: FC = () => {
  return (
    <AuthChecker
      loading={
        <Button disabled className="ml-auto" size="icon" variant="outline">
          <Loader2 className="animate-spin" />
        </Button>
      }
      render={(props) => {
        return <HandleButton {...props} />;
      }}
    />
  );
};
