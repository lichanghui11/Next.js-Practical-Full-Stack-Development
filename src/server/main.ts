import { swaggerUI } from '@hono/swagger-ui'; // hono 自己整合的 swagger UI
import { Scalar } from '@scalar/hono-api-reference'; // hono 自己整合的 OpenAPI 生成器
import { openAPIRouteHandler } from 'hono-openapi';
import { cors } from 'hono/cors';

import { createHonoApp } from './common/app'; // common 文件里面
import { blogRoutes, postPath } from './modules/blog/blog.route';
import { categoryPath, categoryRoutes } from './modules/category/category.route';
import { tagPath, tagRoutes } from './modules/tag/tag.route';
import { authRoutes, userPath } from './modules/user/user.route';

const app = createHonoApp().basePath('api'); // 这个 app 里注册的所有路由，都会自动带上 /api 前缀。
// 1. 记录访问日志 中间件被统一在 server/common/app.ts 里管理
// 2. 美化 JSON 输出 中间件被统一在 server/common/app.ts 里管理出
app.get('/', (c) => c.text("welcome to Esti's API server")); // 这里其实匹配的是 /api/
app.get('/health', (c) => c.json({ status: 'ok', message: 'Hono is working' }));
// 3. 404 处理 被统一在 server/common/app.ts 里管理

/**
 * 每个子路由文件里的 createHonoApp() 就像创建了一个"空白的路由登记表"，
 * 然后在上面注册自己模块的路由，最后通过 .route() 方法把这张登记表上交给主应用。
 */
const _routes = app
  .use(
    '*', // 应用到所有路由
    cors({
      origin: '*', // 允许任何域名访问（生产环境应该限制具体域名）
      allowHeaders: [
        // 允许客户端发送这些请求头
        'Content-Type',
        'Authorization', // 认证信息（如 Bearer token）
      ],
      exposeHeaders: [
        // 允许浏览器读取这些响应头
        'Content-Length', // 响应内容长度
      ],
      maxAge: 600, // 预检请求（OPTIONS）的缓存时间（秒）
      credentials: true, // 允许携带 Cookie 和认证信息
    }),
  )
  .route(postPath, blogRoutes) // 博客文章
  .route(tagPath, tagRoutes) // 标签
  .route(categoryPath, categoryRoutes) // 分类
  .route(userPath, authRoutes); // 用户认证

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

/**
 * 为什么需要 CORS？

  浏览器的同源策略会阻止前端（如 http://localhost:3000）访问不同源的后端 API（如 http://localhost:4000）。CORS 配置告诉浏览器："这个跨域请求是安全的，允许它通过"。

  安全建议：


  生产环境应该把 origin: '*' 改为具体域名：


  origin: 'https://yourdomain.com'
  // 或支持多个域名
  origin: ['https://yourdomain.com', 'https://admin.yourdomain.com']
  这样可以防止未授权的网站调用你的 API。
 */
