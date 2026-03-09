# Better-Auth 认证系统学习笔记

## 一、什么是 Better-Auth

Better-Auth 是一个专为 TypeScript 设计的全栈认证库，核心理念是**认证逻辑由服务端负责，客户端只负责发请求**。它将认证分为两个独立的部分：**认证服务端（auth server）** 和 **认证客户端（auth client）**，两者分工明确，各司其职。

---

## 二、Session 会话机制

Better-Auth 默认将 Session 存入数据库（而非服务器内存），整体流程如下：

1. 用户登录成功后，better-auth 生成一个唯一的 **token（令牌）**
2. 该 token 以 **cookie** 的形式写入浏览器
3. 同时将 token + 用户信息作为一条 **session 记录** 存入数据库的 `session` 表
4. 用户下次访问网站时，浏览器自动携带 cookie 发送到服务端
5. 服务端从数据库查找该 token 对应的 session，验证成功则判定用户已登录

> 与"内存 session"相比，存数据库的好处是：重启服务器后用户不需要重新登录，且支持多节点部署。

---

## 三、认证服务端（Auth Server）

**文件位置**：`src/lib/auth/server.ts`

认证服务端是 better-auth 的核心实例，运行在 **Node.js 服务端**，负责所有认证相关的实际业务：

- 验证密码（hash 比对）
- 创建/销毁 session
- 读写 `user`、`session`、`account` 等数据库表
- 提供可直接调用的内部 API（`auth.api.*`）

```typescript
export const auth = createServerAuth();
// 使用方式：在服务端直接调用
auth.api.signInEmail({ body: { email, password } })
auth.api.getSession({ headers: req.headers })
auth.api.signOut({ headers: req.headers })
```

### 配置说明

```typescript
betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }), // 使用 Prisma 连接数据库
  emailAndPassword: { enabled: true },                          // 开启邮箱密码登录
  basePath: '/api/auth',                                        // 认证路由前缀
  plugins: [
    username(),  // 支持用户名登录（扩展插件）
    openAPI(),   // 生成 OpenAPI 文档
  ],
})
```

### 为什么需要独立的连接池？

项目中存在两个 Prisma 实例，分别使用独立的数据库连接池：

- **业务 Prisma**（`src/database/client/app-client.ts`）：处理 posts、categories、tags 等业务查询
- **认证 Prisma**（`src/lib/auth/server.ts` 内部创建）：专门处理 user、session、account 的认证查询

两个连接池连接的是同一个数据库，但分开管理连接数，**避免业务查询和认证查询互相竞争连接资源**，提升系统稳定性。

---

## 四、认证客户端（Auth Client）

**文件位置**：`src/lib/auth/client.ts`

认证客户端运行在**浏览器端**，本质是一个封装好的 HTTP 请求工具，负责：

- 向服务端发送认证相关的 HTTP 请求
- 自动将服务端返回的 token 写入浏览器 cookie
- 自动在后续请求中携带 cookie

```typescript
export const authClient = createAuthClient({
  baseURL: appConfig.baseUrl,  // 服务器地址
  basePath: '/api/auth',       // 与服务端 basePath 保持一致
  plugins: [usernameClient()], // 客户端开启用户名登录支持
})

// 使用方式：在浏览器端调用，内部发出 HTTP 请求
authClient.signIn.username({ username, password })  // → POST /api/auth/sign-in/username
authClient.signOut()                                // → POST /api/auth/sign-out
authClient.getSession()                             // → GET /api/auth/get-session
```

### 插件需要客户端和服务端同时声明

以用户名登录插件为例：

| 位置   | 配置               | 作用                                          |
| ------ | ------------------ | --------------------------------------------- |
| 服务端 | `username()`       | 让 better-auth 具备处理用户名登录的能力       |
| 客户端 | `usernameClient()` | 让 `authClient` 上出现 `signIn.username()` 方法 |

两者缺一不可：缺少服务端插件，请求无法处理；缺少客户端插件，根本没有 `signIn.username()` 这个方法。

---

## 五、两者的关系与必要性

| 对比项     | 认证服务端（auth server）              | 认证客户端（auth client）                    |
| ---------- | -------------------------------------- | -------------------------------------------- |
| 运行环境   | Node.js 服务端                         | 浏览器                                       |
| 调用方式   | 直接函数调用（`auth.api.*`）           | 发出 HTTP fetch 请求                         |
| 主要职责   | 验密、建 session、写数据库             | 发请求、自动管理 cookie                      |
| 是否可缺少 | 不可缺少（核心逻辑）                   | 不可缺少（浏览器无法直接调用服务端函数）     |

> **为什么不能只用一个？**
> 浏览器和服务端是两个完全隔离的运行环境，浏览器无法直接执行 Node.js 代码，只能通过 HTTP 通信。认证客户端解决了"浏览器如何发起认证请求"的问题，认证服务端解决了"服务器如何执行认证逻辑"的问题。

---

## 六、完整的登录请求链路

本项目采用**自定义 Hono 路由 + better-auth 服务端 API** 的组合方案（而非直接使用 better-auth 的原生路由），这样可以在 repo 层插入业务逻辑（如同时支持用户名/邮箱登录）。

```text
浏览器端
─────────────────────────────────────────────────────────────────
① 用户填写用户名/邮箱 + 密码，点击登录

② LoginForm (src/app/_components/auth/forms/login.tsx)
   触发 form.handleSubmit → 校验通过后调用 submitHandler

③ useLoginSubmit (src/app/_components/auth/hooks.ts)
   调用 authApi.signIn(params, { onSuccess, onError })

④ authApi.signIn (src/api/auth.ts)
   调用 authClient.signIn.username({ username, password })
   → 发出 HTTP 请求：POST /api/auth/sign-in/username
   → 响应成功后，authClient 自动将 token 写入浏览器 cookie

服务端
─────────────────────────────────────────────────────────────────
⑤ Next.js 路由入口 (src/app/api/[[...route]]/route.ts)
   所有 /api/* 请求统一交给 Hono 处理

⑥ Hono 主应用 (src/server/main.ts)
   .route('/auth', authRoutes)
   → 匹配到 /api/auth/*，转发给 user.route.ts

⑦ Hono 子路由 (src/server/modules/user/user.route.ts)
   .post('/sign-in/username', handler)
   → 验证请求体格式（Zod）
   → 调用 signIn(username, password) 服务函数

⑧ 服务层 (src/server/modules/user/user.service.ts)
   透传调用 UserRepo.signIn(username, password)

⑨ 数据仓库层 (src/database/repositories/user.repo.ts)
   1. 用业务 Prisma 实例查找用户：
      db.user.findFirst({ where: { OR: [{ username }, { email }] } })
      → 支持用户名或邮箱登录（better-auth 原生不支持此扩展）
   2. 找到用户后，调用认证服务端内部 API：
      auth.api.signInEmail({ body: { email: user.email, password } })

⑩ Better-Auth 服务端引擎 (src/lib/auth/server.ts)
   → 用认证专属 Prisma 实例验证密码（hash 比对）
   → 创建 session 记录写入数据库
   → 返回 token + user + session 数据

⑪ PostgreSQL 数据库
   → 读取 user 表验证用户存在
   → 写入 session 表存储会话
```

### 关键设计点

在第 ⑨ 步，`user.repo.ts` 先用**业务 Prisma** 查出用户，再把 `email` 传给 `auth.api.signInEmail()`。
这样做的原因：better-auth 原生的用户名登录端点不支持"用户名或邮箱二选一"，通过自定义路由在外层先做一次查询，可以灵活扩展登录方式，而验密和建 session 仍然交给 better-auth 内部完成，保证安全性。

---

## 七、前端登录状态管理（React Context）

登录成功后，用户信息需要在整个前端应用中共享（比如显示用户头像、控制按钮显示/隐藏）。项目使用 **React Context** 来管理这个全局登录状态。

### 各文件职责

| 文件 | 职责 |
| ---- | ---- |
| `constants.ts` | 创建 Context，并设置默认值（备用，正常不会用到） |
| `index.tsx` (`Auth`) | 持有真实数据（`useState`），向子树广播 |
| `index.tsx` (`AuthSetter`) | 页面初始化时拉取登录状态并写入 Context |
| `hooks.ts` | 封装读取/修改 Context 的工具函数，供外部调用 |

### 数据流向

```text
① Auth 组件 (index.tsx)
   useState 持有真实数据：auth（User | null | false）、setAuth
   └── <AuthContext value={{ auth, setAuth }}>
           │ 向整个子树广播数据
           ▼
       ② AuthSetter 组件 (index.tsx)
          useAuthUser()  → use(AuthContext) → 读取 auth
          useSetAuth()   → use(AuthContext) → 读取 setAuth
          │
          └── useEffect（auth === false 时触发）
                  │ 调用 authApi.getAuth() 从服务端拉取登录状态
                  ▼
              setAuth(user)  →  触发 Auth 组件的 setState
                  │
                  ▼
              所有订阅了 AuthContext 的组件同步重新渲染
```

### auth 字段的三种状态

```typescript
type AuthType = User | null | false;
```

| 值 | 含义 |
| -- | ---- |
| `false` | 初始值，尚未检查登录状态（页面刚加载） |
| `null` | 已检查，未登录 |
| `User` | 已检查，已登录，值为用户信息对象 |

`AuthSetter` 正是利用 `auth === false` 这个初始状态作为触发条件，在页面加载时执行一次登录状态检查，避免重复请求。

### 为什么 AuthSetter 和其他组件用的是同一个 Context？

`Auth` 组件用 `<AuthContext value={...}>` 包裹了子树，**只要是它的子组件**，调用 `use(AuthContext)` 拿到的就是同一份 `useState` 数据：

```tsx
// index.tsx
export const Auth: FC = ({ children }) => {
  const [auth, changeAuth] = useState<AuthType>(false); // 真实数据住在这里

  return (
    <AuthContext value={{ auth, setAuth: setAuthUser }}>  {/* 向下广播 */}
      <AuthSetter>          {/* 能拿到同一份数据 */}
        {children}          {/* children 里的任意组件也能拿到 */}
      </AuthSetter>
    </AuthContext>
  );
};
```

`constants.ts` 里的默认值只是安全兜底（当组件树中没有 `<AuthContext value=...>` 包裹时才生效），正常使用中不会触发。

### hooks 作为统一调用入口

`hooks.ts` 将 `use(AuthContext)` 封装成独立的工具函数，其他组件不直接操作 Context，而是通过 hook 调用：

```typescript
// 读取登录用户
(() => {
  const auth = useAuthUser();

  // 修改登录用户
  const setAuth = useSetAuth();
  setAuth(user);   // 登录
  setAuth(null);   // 登出
})()
```

好处：如果未来把状态管理从 Context 换成 Zustand 或其他方案，只需修改 `hooks.ts` 内部实现，其他调用方无需改动。

---

## 八、实现步骤记录

1. 创建 better-auth 服务端（`src/lib/auth/server.ts`），利用 better-auth CLI 生成用户相关数据表
2. 添加 users 相关的种子工具函数（`src/database/seed/seed-helpers.ts`），预置管理员账户
3. 在服务端（`src/server/modules/user/`）添加相关 Zod schema 定义
4. 在数据库层（`src/database/repositories/user.repo.ts`）定义数据访问函数
5. 在服务端（`src/server/modules/user/user.service.ts`）添加服务层
6. 在服务端编辑路由（`src/server/modules/user/user.route.ts`），注意 `userPath` 需与 `authClient.basePath` 保持一致（均为 `/auth`）
7. 创建认证客户端（`src/lib/auth/client.ts`），配置与服务端匹配的插件
8. 封装 API 接口层（`src/api/auth.ts`），供 React 组件调用

---

## 八、常见坑点

### `userPath` 与 `basePath` 必须一致

`authClient` 的 `basePath` 是 `/api/auth`，所以 Hono 子路由的挂载路径必须是 `/auth`：

```typescript
// user.route.ts
export const userPath = '/auth'; // 必须与 authClient.basePath 的后半段一致
```

如果设置为 `/user`，则 `authClient` 发出的请求（`/api/auth/*`）在 Hono 中找不到匹配路由，导致登录 404 失败。

### 种子数据的 bug

`seed-helpers.ts` 中创建第二个用户后标记邮箱已验证时，`where` 条件要用 `res1.user.email` 而非 `res.user.email`，否则只会重复更新第一个用户，第二个用户的邮箱始终未验证。
