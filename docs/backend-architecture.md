# 后端架构说明（课程前置）

本文用于解释为什么在实际项目中通常需要一个相对完整的后端框架，以及本课程为什么更倾向于选择 hono.js 作为 Next.js 的后端配套方案。

## 背景：为什么不只用 Server Actions
>
> 但是，实际上使用hono.js在next.js中操作数据，本质上还是在利用server action，只是使用hono实例去代替next.js自己去操作数据而已

Next.js 的 Server Actions 对小型应用或轻量 demo 很方便，但它并不总是适合“完整后端”的需求，常见限制包括：

- 主要面向同一应用内调用，不适合作为公开 API
- 难以对外暴露统一的接口规范与鉴权体系
- 当需要服务多端（移动端/桌面端/小程序）时，缺少统一后端入口

因此在多数真实项目中，通常需要一个更完整的后端框架，提供稳定的 API 层、鉴权、日志、监控、限流、版本管理等能力。

## 框架选择建议（按规模与场景）

- **超大规模/复杂数据结构/强治理**：Java Spring 全家桶，生态成熟、商业化能力强
- **中大型团队、Node.js + TS 栈**：NestJS（企业级框架，模块化与依赖注入完整）
- **极致性能或高并发**：Go / Rust（适合高性能与微服务场景）
- **中小型应用、前端一体化、快速交付**：hono.js（轻量、TypeScript 友好）
- **PHP 生态成熟项目**：Laravel（工程化完善，适合快速开发）

## 什么是微服务

简单说：把一个“大应用”拆成多个“小应用”，每个小应用只负责一块业务，各自可以独立开发、部署和扩容。

### 直白例子

- **电商网站**
  - 用户服务：注册、登录、账号信息
  - 商品服务：商品列表、详情、库存
  - 订单服务：下单、订单状态
  - 支付服务：支付流程、支付回调
  这些服务可以各自升级，不会互相卡住。

- **外卖平台**
  - 商家服务：店铺信息、菜单
  - 订单服务：下单、配送状态
  - 配送服务：骑手位置、路线

### 什么时候会用到

当系统变得很大、团队变多、业务模块互相影响很大时，拆成微服务更容易扩展和维护。  
如果是个人项目、小团队、需求不复杂，通常一个单体后端就足够了。

## 为什么课程选择 hono.js

课程目标是“前后端一体化、TypeScript 贯通、可快速落地”。hono.js 的优势集中在：

- **TS/JS 同构**：前后端使用同一语言栈，减少上下文切换
- **轻量可扩展**：核心小，开发成本低，适合独立开发者或小团队
- **与 Next.js 易整合**：可通过 `route handlers` 集成到 Next.js 中，形成一个完整的前后端一体应用
- **生态逐步成熟**：虽不如 NestJS 完整，但在主流 Node.js 场景中足够实用

相比 NestJS，hono.js 避免了重量级框架的复杂配置与耦合成本，更适合作为课程中“替代 Server Actions 的 API 层”。

## 推荐的应用结构

### 方案 A：Next.js + Route Handlers + hono.js（同仓）

- Next.js 负责页面渲染、路由、组件
- hono.js 负责 API 业务逻辑
- 使用 `app/api/*/route.ts` 作为 hono 的入口
- 共享类型定义与 Zod 校验逻辑，保证前后端一致性

适用于单体应用或需要快速迭代的项目。

### 方案 B：Next.js + 独立 hono 服务（分离部署）

- Next.js 只负责前端与 SSR
- hono.js 作为独立 API 服务部署
- 可扩展为多服务或多团队协作

适用于对外开放 API、对部署与扩容有要求的项目。

## 调用方式对比：直连数据库 vs 经过 API

### 1) 内部模式（不走 HTTP）

- 链路：页面/组件（Next） → Server Actions → Prisma → DB  
- 特点：链路短、性能好、实现简单；但对外暴露 API 的能力弱，如需给移动端/第三方使用需要再补一层 API。

### 2) HTTP 模式（引入 Hono 作为 API 层）

- 入口：`app/api/[[...route]]` 将请求交给 Hono，再由 Hono 调用 Prisma。  
- 常见链路 A（浏览器或 hono/client）：Client → Next `/api/*` route handler → Hono app → Prisma → DB  
- 常见链路 B（Server Component / Server Action 里也走 API）：Server Action → HTTP 请求 `/api/*` → Hono → Prisma → DB  
- 注意：在同一进程里让 Server Action 也绕一次 HTTP 可行但多了一层网络/序列化/路由匹配开销；若场景只需内部调用，可直接用 Prisma 以减少跳数。

### hono/client 的定位

- hono/client 和 Prisma Client 都提供“函数式调用 + 类型安全”的开发体验。  
- 不同点：hono/client 仍然是 HTTP 客户端，它提供类型安全的请求封装，但不会省掉网络开销。

## 常见路由模式示例

### Query 参数（分页/筛选）

```ts
// 后端路由
app.get('/posts', (c) => {
  const { page, limit } = c.req.query()
})

// 客户端调用
await c.api.posts.$get({
  query: { page: '1', limit: '10' },
})
```

最终请求：`GET /api/posts?page=1&limit=10`  
适用：分页、筛选、排序、搜索等需要组合查询条件的场景。

### 路径参数（详情/更新/删除）

```ts
// 后端路由
app.get('/posts/:id', (c) => {
  const { id } = c.req.param()
})

// 客户端调用（hono/client）
await c.api.posts[':id'].$get({
  param: { id: '123' },
})
```

最终请求：`GET /api/posts/123`  
适用：访问某条资源的详情、更新特定记录、删除记录等。注意客户端使用 `[':id']` 访问是因为 `:id` 不是合法 JS 属性名。

### Hono 请求数据来源速记

- `param`：路径参数，匹配路由里的 `/:id`
- `query`：查询参数，对应 `?page=1`
- `json`：JSON 请求体，对应 `await c.req.json()`
- 其他：`form`/`formData`/`header` 等（视 Hono 版本与中间件而定），用于解析表单、文件或自定义头部

### `zValidator` 核心用法（Hono + Zod）

- 在哪里：`src/server/modules/blog/blog.api.ts`
- 做什么：在进入业务 handler 前校验请求数据；失败则短路返回，不会执行后续 handler。
- 签名：`zValidator(source, schema, errorHandler?)`
  - `source`（必填）：数据来源，固定枚举，不能自定义。取值：`param` | `query` | `json` | `form` | `formData` | `header`。
  - `schema`（必填）：Zod schema，用于解析 + 校验 + 类型推导（可使用 `z.coerce.*` 把字符串数字/日期自动转换）。
  - `errorHandler`（可选）：仅在 schema 校验失败时触发的自定义处理函数。校验通过不会调用；不传则用默认失败响应。项目里用 `defaultValidatorErrorHandler` 统一返回格式。
- 正确姿势：
  1) 把 `zValidator(...)` 放在路由链上、handler 之前：`app.get('/path', zValidator('query', schema, onError), handler)`;
  2) 在 handler 里优先用 `c.req.valid('query')` / `valid('param')` / `valid('json')` 取“已校验且已转换”的数据；避免再次 `c.req.query()`/`c.req.json()`；
  3) schema 字段名要和请求字段一致，否则会被拦截。
- 项目里的例子：
  - `zValidator('query', postPaginationQueryRequestSchema, defaultValidatorErrorHandler)`
  - `zValidator('param', postDetailByIdRequestSchema, defaultValidatorErrorHandler)`
  - `zValidator('json', buildPostRequestSchema(), defaultValidatorErrorHandler)`

## 后端部分目标

- 使用 Next.js `route handlers` 搭建 API 入口
- 用 hono.js 编写可复用、可测试的后端接口
- 使用 Zod 进行参数校验与类型推导
- 打通前后端类型，减少接口沟通成本

## 小结

Server Actions 适合轻量场景，但在面向多端、开放 API、复杂业务时，一个规范的后端框架更可靠。hono.js 以轻量与同构优势，成为本学习项目的主要后端选择。
