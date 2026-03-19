//  Hono 提供的“适配器/桥接函数”
import { handle } from 'hono/vercel';

import { serverRPC } from '@/server/main';

// 看起来每个请求都在创建 app，但实际上不是：
// serverRPC 是一个 Promise，只会执行一次
// 多次 await serverRPC 会返回
// 这个缓存特性是 js 原生支持的
const getServerRPC = async () => {
  const { app } = await serverRPC;
  return app;
};

// Next.js 会自动根据 HTTP 方法分发请求
// Next.js 的约定：
// 导出的函数名必须是大写的HTTP 方法名
// 支持：GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
// 如果请求方法没有对应的导出函数，返回 405 Method Not Allowed
export const GET = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
export const POST = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
export const PUT = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
export const DELETE = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
export const PATCH = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
export const OPTIONS = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
export const HEAD = async (req: Request) => {
  const app = await getServerRPC();
  return handle(app)(req);
};
