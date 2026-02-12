import { swaggerUI } from '@hono/swagger-ui'; // hono 自己整合的 swagger UI
import { Scalar } from '@scalar/hono-api-reference'; // hono 自己整合的 OpenAPI 生成器
import { openAPIRouteHandler } from 'hono-openapi';

import { createHonoApp } from './common/app'; // common 文件里面
import { postApi, postPath } from './modules/blog/blog.route';
import { categoryApi, categoryPath } from './modules/category/category.route';
import { tagApi, tagPath } from './modules/tag/tag.route';

const app = createHonoApp().basePath('api'); // 这个 app 里注册的所有路由，都会自动带上 /api 前缀。
// 1. 记录访问日志 中间件被统一在 server/common/app.ts 里管理
// 2. 美化 JSON 输出 中间件被统一在 server/common/app.ts 里管理出
app.get('/', (c) => c.text("welcome to Esti's API server")); // 这里其实匹配的是 /api/
app.get('/health', (c) => c.json({ status: 'ok', message: 'Hono is working' }));
// 3. 404 处理 被统一在 server/common/app.ts 里管理

const _routes = app
  .route(postPath, postApi) // 博客文章
  .route(tagPath, tagApi) // 标签
  .route(categoryPath, categoryApi); // 分类

// 下面三个是直接注册的路由，不是通过 route 注册的
app.get('/swagger', swaggerUI({ url: '/api/openapi' }));

app.get(
  '/docs',
  Scalar({
    theme: 'saturn',
    url: '/api/openapi',
  }),
);

app.get(
  '/openapi',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Next.js 实战全栈开发',
        version: '1.0.0',
        description: 'Esti 的博客后台服务 API 文档',
      },
      servers: [{ url: 'http://localhost:3000', description: 'Local Server' }],
    },
  }),
);
type AppType = typeof _routes;
export { app, type AppType };
