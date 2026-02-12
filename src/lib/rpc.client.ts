import type { Hono } from 'hono';

import { hc } from 'hono/client';

import { appConfig } from '@/config/api.client';

// 在服务端组件里面创建 hono 客户端
// 需要类型+路由字符串来创建对应的客户端
export const buildClient = <T extends Hono<any, any, any>>(route?: string) =>
  hc<T>(`${appConfig.baseUrl}${appConfig.apiPath}${route}`);

export const fetchApi = async <
  T extends Hono<any, any, any>,
  F extends (c: C) => Promise<any>,
  C = ReturnType<typeof hc<T>>,
>(
  client: C,
  run: F,
): Promise<Awaited<ReturnType<F>>> => {
  // try {
  const result = await run(client);
  // 统一检查状态码
  // if (!result.ok) throw new Error('请求失败');
  // 统一记录日志
  // console.log('API 请求成功');
  return result;
  // } catch (error) {
  // 统一错误处理
  // console.error('API 请求出错', error);
  // throw error;
  // }
};
