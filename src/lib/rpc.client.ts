import { hc } from 'hono/client';

import type { AppType } from '@/server/main';

import { apiConfig } from '@/config/api.client';

// 创建 hono 客户端
// 这是 Hono 的类型安全客户端实例。
export const honoApi = hc<AppType>(apiConfig.baseUrl);

/**
 * 	•	hono/client 和 Prisma client：都提供“像函数调用一样的开发体验 + 类型安全”
    •	但：hono/client 不是“免请求调用”，它只是类型安全的 HTTP 客户端
 */

// 这个高价函数统一处理所有 api 的调用，如果有错误可以在这里集中处理，把结果正常返回。
type HonoClient = typeof honoApi;
export const fetchApi = async <F extends (c: HonoClient) => Promise<any>>(
  run: F,
): Promise<Awaited<ReturnType<F>>> => {
  return await run(honoApi);
};

/**
 * 此处对 Next.js 里面的内部请求（不走http）和外部请求（走 http）做一个学习说明：
 * 1) 内部模式
链路: 页面/组件（Next） → Server Actions → Prisma → DB
也就是：前端触发一个 server action，server action 在同一个 Next 进程里直接调用 Prisma，访问数据库。
特点
	•	✅ 不走 HTTP
	•	✅ 调用链短、性能好
	•	✅ 代码简单
	•	⚠️ “对外 API”能力弱（如果未来要给其他客户端/服务用，就得再做一套 API）
⸻
  * 2) 走HTTP（引入 Hono 作为 API 层）
现在项目的结构是：app/api/[[...route]] 把请求交给 Hono，然后 Hono 再调用 Prisma。
所以新的链路（最典型）应该是：
链路A. Client（浏览器 fetch 或 hono/client） → Next /api/* route handler → Hono app → Prisma → DB

链路B.（Server Component / Server Action 调用 API）
如果你在 server action 里也用 hono/client 去打 /api/*，那链路会变成：
Server Action → HTTP 请求 /api/* → Hono → Prisma → DB
这也能工作，但会出现一个问题：
同一个进程里绕了一次 HTTP（明明可以直接调用 service/prisma，却走了网络层/序列化/路由匹配）。
 */
