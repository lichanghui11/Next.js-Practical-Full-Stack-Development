import type { NextRequest } from 'next/server';

import { isNil } from 'lodash';
import { NextResponse } from 'next/server';

import { authConfig } from './config/auth.config';
import { auth } from './lib/auth/server';

/**
 * 路由段（Route Segment）
 * Next.js 的路由是基于文件系统的，每个路由文件 / 文件夹都叫一个 “路由段”：
比如 app/page.tsx 对应根路由 / 的路由段；
app/api/otp/route.ts 对应 /api/otp 的路由段；
app/user/[id]/page.tsx 对应 /user/123 这类动态路由的路由段。
 */
export const config = {
  // proxy.ts 是特殊的系统级文件，它强制固定运行在 Node.js 运行时，不允许你通过 Route segment config 自定义运行时、渲染方式等规则
  // runtime: 'nodejs',
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|woff|woff2|ttf|eot|otf|css|scss|sass|less|js|mjs|pdf|doc|docx|txt|md|zip|rar|7z|tar|gz|mp3|mp4|avi|mov|wav|flac)$|sitemap\\.xml|robots\\.txt|manifest\\.json|sw\\.js|workbox-.*\\.js).*)',
  ],
};

/**
 *  
 * @param request 
 * 在URL是用户注册页面或找回密码页面时，做如下处理
      1. 判断用户是否已经登录
      2. 如果已经登录，那么，有url回调地址则跳转到该url，没有则跳转到首页
      3. 如果没有登录，则正常访问注册页或找回密码页
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 拿到配置里面的 需要认证的路由
  const protectedRoutes = authConfig.protectedPages;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // 需要认证的页面里面包含这个路径，检查用户是否已登录
    return authPageProtectedHandler(request);
  }

  if (pathname.startsWith('/auth/signin')) {
    // 登录页面，检查用户是否已登录
    return authSignInhandler(request);
  }

  if (pathname.startsWith('/auth/signup') || pathname.startsWith('/auth/forget-password')) {
    // 注册页或找回密码页
    return AuthenticatedProtectedHandler(request);
  }

  return NextResponse.next();
}
/**
 *
 * @param request
 * 1. 对需要认证之后才能访问的页面的处理函数
 * 2. 这个函数里面判断用户是否有权限，有权限则放行，没权限则重定向到登录页
 */
const authPageProtectedHandler = async (request: NextRequest) => {
  try {
    // 从请求头中获取用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    // 用户存在则登录
    const isAuthenticated = !isNil(session?.user);

    // 未登录：重定向到登录页 + 携带回调地址
    if (!isAuthenticated) {
      // 给予当前域名构建登录页 URL
      const signinUrl = new URL('/auth/signin', request.url);

      // 设置回调地址
      signinUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);

      // 重定向到登录页
      return NextResponse.redirect(signinUrl);
    }

    // 已登录则正常放行
    return NextResponse.next();
  } catch (e) {
    // 报错之后页重定向到首页
    console.error('认证中间件错误 | Auth middleware error: ', e);
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signinUrl);
  }
};

/**
 *
 * @param request
 * 1. 请求登录的时候，如果已经有经过认证的会话存在了，就不用再登录，直接放行
 * 2. 没有已经存在的凭证的话再跳转登录页
 * 3. 如果报错也直接跳转到登录页
 */
const authSignInhandler = async (request: NextRequest) => {
  try {
    // 获取用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const isAuthenticated = !isNil(session?.user);

    // 已登录：跳回到回调地址
    if (isAuthenticated) {
      const { callbackUrl } = request.nextUrl.searchParams as { callbackUrl?: string };

      // new URL(path, base)
      const redirectUrl = new URL(isNil(callbackUrl) ? '/' : callbackUrl, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    // 未登录：正常进入登录页
    return NextResponse.next();
  } catch (e) {
    console.error('认证中间件错误 | Auth middleware error: ', e);
    // 报错了也放行，让用户能看到登录页，而不是卡死
    return NextResponse.next();
  }
};

/**
 *
 * @param request
 * 1. 目标地址是 注册 和 找回密码 页面时，判断是否有已经存在的经过认证的会话
 * 2. 如果已经登录，有回调地址就跳转到回调地址，没有就跳转到首页
 * 3. 如果没有登录，正常访问注册页或找回密码页
 */
const AuthenticatedProtectedHandler = async (request: NextRequest) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const isAuthenticated = !isNil(session?.user);

    // 已登录：跳回到回调地址
    if (isAuthenticated) {
      const { callbackUrl } = request.nextUrl.searchParams as { callbackUrl?: string };

      // new URL(path, base)
      const redirectUrl = new URL(isNil(callbackUrl) ? '/' : callbackUrl, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    // 用户未认证，继续处理请求
    return NextResponse.next();
  } catch (error) {
    console.error('认证中间件错误 | Auth middleware error: ', error);
    // 报错了也放行，让用户能看到注册页或找回密码页，而不是卡死
    return NextResponse.next();
  }
};
