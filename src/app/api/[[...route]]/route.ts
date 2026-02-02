//  Hono 提供的“适配器/桥接函数”
import { handle } from 'hono/vercel';

import { app as apiApp } from '@/server/main';

export const GET = handle(apiApp);
export const POST = handle(apiApp);
export const PUT = handle(apiApp);
export const DELETE = handle(apiApp);
export const PATCH = handle(apiApp);
export const OPTIONS = handle(apiApp);
export const HEAD = handle(apiApp);
