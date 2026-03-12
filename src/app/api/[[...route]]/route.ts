//  Hono 提供的“适配器/桥接函数”
import { handle } from 'hono/vercel';

import { serverRPC } from '@/server/main';

const getServerRPC = async () => {
  const { app } = await serverRPC;
  return app;
};

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
