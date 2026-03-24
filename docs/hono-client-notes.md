# Hono RPC 客户端学习笔记

## hono/client 和 Prisma client 的相似性

- 两者都提供"像函数调用一样的开发体验 + 类型安全"
- 但 hono/client **不是**"免请求调用"，它只是类型安全的 HTTP 客户端
- 每次调用仍然会发出真实的 HTTP 请求

---

## Next.js 中的两种数据请求方式

### 方式 1：内部模式（不走 HTTP）

```text
页面/组件（Next） → Server Actions → Prisma → DB
```

前端触发一个 Server Action，Server Action 在同一个 Next 进程里直接调用 Prisma，访问数据库。

**特点**：

- ✅ 不走 HTTP
- ✅ 调用链短、性能好
- ✅ 代码简单
- ⚠️ "对外 API"能力弱（如果未来要给其他客户端/服务用，就得再做一套 API）

### 方式 2：走 HTTP（引入 Hono 作为 API 层）

项目结构是 `app/api/[[...route]]` 把请求交给 Hono，然后 Hono 再调用 Prisma。

#### 链路 A：客户端请求

```text
Client（浏览器 fetch 或 hono/client） → Next /api/* route handler → Hono app → Prisma → DB
```

#### 链路 B：Server Component / Server Action 调用 API

```text
Server Action → HTTP 请求 /api/* → Hono → Prisma → DB
```

如果在 Server Action 里也用 hono/client 去打 `/api/*`，会出现一个问题：

> **同一个进程里绕了一次 HTTP**（明明可以直接调用 service/prisma，却走了网络层/序列化/路由匹配）

---

## `buildClient` 和 `fetchApi` 详解

> 来源：`src/lib/rpc.client.ts`

### `buildClient`：创建客户端（造遥控器）

`buildClient` 根据传入的**路由类型 + 路径字符串**，创建一个只管该模块的客户端对象：

```typescript
const blogClient = buildClient<PostApiType>('/blog');
// 内部执行：hc<PostApiType>('http://localhost:3000/api/blogs')
// 返回一个客户端对象（还没发任何请求！）

const tagClient = buildClient<TagApiType>('/tags');
// 内部执行：hc<TagApiType>('http://localhost:3000/api/tags')
```

返回的客户端对象可以理解为一个"遥控器"，上面有各种按钮：

```text
blogClient 对象结构（遥控器上的按钮）：
├── index
│   ├── $get()     → GET /api/blogs        （获取文章列表）
│   └── $post()    → POST /api/blogs       （创建文章）
├── ':item'
│   ├── $get()     → GET /api/blogs/:item  （获取单篇文章）
│   ├── $put()     → PUT /api/blogs/:item  （更新文章）
│   └── $delete()  → DELETE /api/blogs/:item（删除文章）
└── 'total-pages'
    └── $get()     → GET /api/blogs/total-pages（获取总页数）
```

### `fetchApi`：执行请求（按遥控器按钮）

`fetchApi` 接收一个客户端和一个回调函数，帮你执行请求并统一处理错误：

```typescript
// 使用方式
const result = await fetchApi(
  blogClient,                           // 参数 1：用哪个遥控器
  (client) => client.index.$get(),      // 参数 2：按哪个按钮
);
```

`fetchApi` 是**可选的**，你也可以直接使用客户端：

```typescript
// 直接使用（不经过 fetchApi）
const response = await blogClient.index.$get();

// 通过 fetchApi（多了统一的错误处理）
const response = await fetchApi(blogClient, (c) => c.index.$get());
```

### 完整的请求流程

```text
页面组件
  │
  ├─ buildClient<PostApiType>('/blog')        ← 创建客户端（不发请求）
  │     └─ 返回 blogClient 对象
  │
  ├─ fetchApi(blogClient, (c) => c.index.$get())  ← 执行请求
  │     │
  │     └─ 内部执行: blogClient.index.$get()
  │           │
  │           ├─ 发出 HTTP: GET /api/blogs
  │           │
  │           ▼
  │     Next.js API Route (app/api/[[...route]])
  │           │
  │           ▼
  │     Hono 路由匹配 → blog.api.ts
  │           │
  │           ▼
  │     blog.service.ts → post.repo.ts
  │           │
  │           ▼
  │     Prisma → 数据库查询
  │           │
  │           ▼
  │     数据返回（JSON）
  │
  └─ 页面拿到数据，渲染文章列表
```

### 为什么从旧方式改成新方式？

因为路由从一个全局模块拆分成了多个独立模块（`postApi`、`tagApi`、`categoryApi`）：

| 方面 | 旧方式（全局客户端） | 新方式（模块化客户端） |
| --- | --- | --- |
| 客户端 | 1 个 `honoApi`，包含所有路由 | 按模块创建：`blogClient`、`tagClient` 等 |
| 类型 | `AppType`（所有路由的联合类型） | 各模块独立类型（`PostApiType`） |
| `fetchApi` | 绑死全局客户端 | 客户端作为参数传入 |
| 适合场景 | 只有一个路由模块 | 多个独立路由模块 |
