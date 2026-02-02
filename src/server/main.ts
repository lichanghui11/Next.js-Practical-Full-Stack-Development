import { createHonoApp } from './common/app'; // common 文件里面
import { postApi } from './modules/blog/blog.api';

const app = createHonoApp().basePath('api'); // 这个 app 里注册的所有路由，都会自动带上 /api 前缀。
// 1. 记录访问日志 中间件被统一在 server/common/app.ts 里管理
// 2. 美化 JSON 输出 中间件被统一在 server/common/app.ts 里管理出
app.get('/', (c) => c.text("welcome to Esti's API server")); // 这里其实匹配的是 /api/
// 3. 404 处理 被统一在 server/common/app.ts 里管理
const _routes = app.route('/blogs', postApi);
type AppType = typeof _routes;
export { app, type AppType };
