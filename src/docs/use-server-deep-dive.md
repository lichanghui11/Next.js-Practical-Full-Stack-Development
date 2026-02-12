# 深度解析：Next.js 中的 `'use server'` 与架构误区

## 1. 核心概念辨析

在 Next.js 的 App Router 架构中，代码的运行环境和调用方式经常容易混淆。最关键的误区在于将“后端代码”等同于“Server Action”。

### 三种角色的区别

| 角色 | 标记 | 运行环境 | 主要职责 | 典型文件 |
| :--- | :--- | :--- | :--- | :--- |
| **Server Action** | `'use server'` | Server (隔离环境) | **供前端直接调用**的后端接口。Next.js 会自动为其生成 API 代理。 | `actions.ts` |
| **后端模块** | **无标记** (默认) | Server (Node.js) | 真正的业务逻辑、数据库操作。前端**不可见**。 | `*.service.ts`, `*.repo.ts` |
| **客户端组件** | `'use client'` | Browser / Server(SSR) | 处理 UI 交互、状态、浏览器 API。 | `page.tsx`, `components/*.tsx` |

---

## 2. 这里的坑：为什么给 Repo/Service 加 `'use server'` 会报错？

在本项目中，我们遇到了 `Zod Schema ID duplicate` 错误，其根源在于**双重打包（Double Bundling）**。

### 错误场景还原

1. **代码结构**：
    * `src/server/modules/blog/blog.route.ts` (API 路由) -> 引用 `blog.service.ts` -> 引用 `post.repo.ts` -> 引用 `blog.schema.ts`
2. **错误操作**：给 `post.repo.ts` 或 `blog.service.ts` 加上了 `'use server'`。

### 发生过程

Next.js 的编译器为了让 `'use server'` 的函数能被前端调用，会对这些文件进行**特殊的打包处理**（创建一个独立的 Server Action Bundle）。

此时，`schema.ts` 文件被加载了两次：

1. **第一次加载**：作为 **普通后端代码**，被 API Route (`/api/blog`) 引用。-> **注册了一次 Schema ID**。
2. **第二次加载**：作为 **Server Action 依赖**，被 Next.js 的 Action 打包器引用。-> **又注册了一次 Schema ID**。

由于 Zod 注册表是单例的（Global Singleton），第二次注册时就会抛出 `ID already exists` 错误。

---

## 3. `src/api` 为什么不需要 `'use server'`？

`src/api/*.ts` (如 post.ts) 是 Hono RPC 的**客户端封装**。

```typescript
import type { PostApiType } from '@/server/modules/blog/blog.route';
const client = buildClient<PostApiType>('/api/blog');
```

* **它只导入了类型 (`import type`)**：它没有引入任何后端逻辑代码。
* **它是纯客户端代码**：它在运行时仅仅是执行 `fetch('http://...')`。
* **不需要 `'use server'`**：因为它不是 Server Action，它只是一个普通的 HTTP 请求发起者。

---

## 4. 本项目的最佳实践架构

鉴于本项目采用 **API Route + Hono RPC** 的模式，推荐遵循以下原则：

1. **Database / Repo (`src/database/repositories`)**
    * **标记**：❌ 无
    * **理由**：这是纯后端工具，不应该暴露给前端。

2. **Service (`src/server/modules/*.service.ts`)**
    * **标记**：❌ 无
    * **理由**：Service 层被 API Route 调用。如果加了 `'use server'`，会导致不必要的打包隔离和潜在的单例冲突。

3. **API Routes (`src/server/modules/*.route.ts`)**
    * **标记**：❌ 无
    * **理由**：这是 HTTP 接口定义，本身运行在服务端。

4. **RPC Client (`src/api/*.ts`)**
    * **标记**：❌ 无
    * **理由**：这是在浏览器运行的 `fetch` 封装。

### 什么时候使用 `'use server'`？

**只有**当你决定绕过 API Route，直接在 React 组件中触发表单提交或数据修改时：

```tsx
// src/app/login/actions.ts
'use server';

import { loginService } from '@/server/modules/auth/auth.service';

export async function loginAction(formData: FormData) {
  // 这里作为“入口”，调用 Service
  await loginService.login(...);
}
```

**总结：让 Service 和 Repo 保持纯净（无标记），只在“入口层”（API Route 或 Server Action 文件）决定如何暴露给前端。**
