# Better Auth 使用说明

> 本文档记录项目中 Better Auth 的使用方式、架构设计和最佳实践

## 📋 目录

- [架构概览](#架构概览)
- [服务端使用](#服务端使用)
- [客户端使用](#客户端使用)
- [插件配对规则](#插件配对规则)
- [请求流程](#请求流程)
- [常见问题](#常见问题)

---

## 架构概览

### 核心设计思路

项目采用**"Better Auth 作为底层引擎 + 自定义业务层"**的混合架构：

```text
┌─────────────────────────────────────────┐
│  自定义 Hono 路由层                      │
│  - 灵活的业务逻辑                        │
│  - 统一的错误处理                        │
│  - OpenAPI 文档生成                      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Better Auth 核心                        │
│  - 密码哈希和验证                          │
│  - Session 管理                          │
│  - Cookie 处理                           │
│  - 数据库存储                             │
└─────────────────────────────────────────┘
```

### 使用比例

| 功能层 | Better Auth 官方 | 项目实际使用 | 使用比例 |
| -------- | ----------------- | ------------- | --------- |
| 服务端配置 | ✅ | ✅ | 100% |
| 服务端路由 | ✅ 自动生成 | ❌ 自己实现 | 0% |
| 服务端 API | ✅ auth.api.* | ✅ | 100% |
| 客户端配置 | ✅ | ✅ | 100% |
| 客户端调用 | ✅ authClient.* | ⚠️ 部分使用 | 30% |

---

## 服务端使用

### 1. 服务端(server)配置层

**文件：** `src/lib/auth/server.ts`

```typescript
export const auth = betterAuth({
  // 数据库配置
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // 邮箱密码登录
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  // API 路径
  basePath: '/api/auth',

  // 插件配置
  plugins: [
    username(),        // 用户名登录
    openAPI(),         // API 文档
    emailOTP({         // 邮箱验证码
      allowedAttempts: 3,
      expiresIn: 300,
      async sendVerificationOTP({ email, otp, type }) {
        // 自定义发送逻辑（使用消息队列）
        await addOTPQueue(email, otp, type);
      }
    })
  ]
});
```

### 2. Repository 层

**文件：** `src/database/repositories/user.repo.ts`

使用 `auth.api.*` 调用 Better Auth 的内部 API：
> 这里演示的时候全部使用了 better-auth 内部的api，实际项目里面部分逻辑是自己实现的，比如注册

```typescript
const UserRepo = {
  // 获取会话
  getCurrentSession: async (req: Request) => {
    return auth.api.getSession({ headers: req.headers });
  },

  // 登录
  signIn: async (usernameOrEmail: string, password: string) => {
    const user = await prismaClient.user.findFirst({
      where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] }
    });

    return auth.api.signInEmail({
      body: { email: user.email, password }
    });
  },

  // 注册
  signUpByEmail: async (data) => {
    const res = await auth.api.signUpEmail({
      body: { username, email, password }
    });

    // 验证 OTP
    const checkOtp = await auth.api.checkVerificationOTP({
      body: { email, type: 'email-verification', otp }
    });

    return res;
  },

  // 发送验证码
  sendOTP: async (email: string, type: string) => {
    return auth.api.sendVerificationOTP({
      body: { email, type }
    });
  }
};
```

### 3. 路由层

**文件：** `src/server/modules/user/user.route.ts`

**为什么不用 Better Auth 的自动路由？**

Better Auth 提供了自动路由（如 `/api/auth/sign-in/email`），但项目选择自己实现：

**原因：**

1. ✅ 支持用户名或邮箱登录（Better Auth 默认只支持邮箱）
2. ✅ 统一的错误处理格式
3. ✅ 生成 OpenAPI 文档
4. ✅ 自定义业务逻辑（如注册时验证 OTP）
5. ✅ 额外的验证接口（检查用户名/邮箱唯一性）

**示例：**

```typescript
export const authRoutes = app
  .post('/sign-up', async (c) => {
    const { username, email, password, otp } = c.req.valid('json');

    // 自定义逻辑：先注册，再验证 OTP
    const res = await signUpByEmail({ username, email, password, otp });

    return c.json(res, 201);
  })

  .post('/sign-in/username', async (c) => {
    const { username, password } = c.req.valid('json');

    // 自定义逻辑：支持用户名或邮箱登录
    const result = await signIn(username, password);

    return c.json(result, 200);
  });
```

---

## 客户端使用

### 1. 客户端(client)配置层

**文件：** `src/lib/auth/client.ts`

```typescript
export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  basePath: '/api/auth',
  plugins: [
    usernameClient(),   // 对应服务端 username()
    emailOTPClient()    // 对应服务端 emailOTP()
  ]
});
```

### 2. API 封装层

**文件：** `src/api/auth.ts`

采用**混合调用模式**：

```typescript
export const authApi = {
  // ✅ 使用 Better Auth 客户端
  signIn: async (data) => {
    return authClient.signIn.username({
      username: data.username,
      password: data.password
    });
  },

  signOut: async () => {
    return authClient.signOut();
  },

  getSession: async () => {
    return authClient.getSession();
  },

  // ❌ 不使用 Better Auth，调用自定义 API
  signUp: async (data) => {
    return authClientRpc['sign-up'].$post({ json: data });
  },

  sendEmailVerificationOTP: async (email) => {
    return authClientRpc.otp['email-verification'].$post({ json: { email } });
  },

  checkUsernameUnique: async (username) => {
    return authClientRpc.check['username-unique'].$post({ json: { username } });
  }
};
```

### 为什么混合使用？

| 功能 | 使用方式 | 原因 |
|------|---------|------|
| 登录 | ✅ authClient | Better Auth 自带 Cookie 管理 |
| 登出 | ✅ authClient | 自动清理会话 |
| 获取会话 | ✅ authClient | 自动处理 headers |
| 注册 | ❌ 自定义 API | 需要验证 OTP |
| 发送验证码 | ❌ 自定义 API | 自定义频率限制 |
| 检查唯一性 | ❌ 自定义 API | Better Auth 没有这个功能 |

---

## 插件配对规则

### 需要配对的插件

Better Auth 的某些插件需要**服务端和客户端同时配置**才能正常工作。

#### 1. username() ↔ usernameClient()

**服务端：**

```typescript
plugins: [username()]
```

**客户端：**

```typescript
plugins: [usernameClient()]
```

**配对后获得：**

- `authClient.signIn.username()` 方法
- TypeScript 类型提示
- 自动请求到 `/api/auth/sign-in/username`

**不配对会怎样：**

```typescript
// ❌ 如果客户端没有 usernameClient()
authClient.signIn.username  // undefined
// TypeScript 报错：属性不存在
```

#### 2. emailOTP() ↔ emailOTPClient()

**服务端：**

```typescript
plugins: [emailOTP({ ... })]
```

**客户端：**

```typescript
plugins: [emailOTPClient()]
```

**配对后获得：**

- `authClient.sendVerificationOTP()` - 发送验证码
- `authClient.verifyEmail()` - 验证邮箱

**项目实际情况：**
⚠️ 虽然配置了 `emailOTPClient()`，但实际没用，而是调用自定义 API。

### 不需要配对的插件

#### 3. openAPI() - 只需服务端

**作用：**

- 生成 API 文档
- 提供 `/api/auth/reference` 路由

**为什么不需要客户端：**

- 这是开发者工具，用于查看 API 文档
- 客户端不需要知道文档的存在

**访问方式：**

```
http://localhost:3000/api/auth/reference
```

### 判断规则

**简单规则：**

1. **插件名带 "Client" 后缀** → 需要配对
   - `usernameClient()` ↔ `username()`
   - `emailOTPClient()` ↔ `emailOTP()`
   - `organizationClient()` ↔ `organization()`

2. **插件提供 UI/文档功能** → 不需要配对
   - `openAPI()` - 文档
   - `admin()` - 管理界面

3. **基础认证功能** → 不需要配对
   - `emailAndPassword` - 内置功能
   - `session` - 内置功能

### 配对的本质

```text
服务端插件 = 添加 API 端点 + 数据库逻辑
    ↓
客户端插件 = 添加类型安全的调用方法
    ↓
两者配合 = 端到端类型安全
```

---

## 请求流程

### 完整的认证请求流程

以用户登录为例：

```text
1. 用户提交表单
   ↓
2. 前端调用 authApi.signIn()
   ↓
3. authClient.signIn.username()
   ↓
4. POST /api/auth/sign-in/username
   ↓
5. Next.js 捕获请求 → route.ts
   ↓
6. handle(app)(req) → Hono
   ↓
7. Hono 路由到 authRoutes
   ↓
8. 调用 signIn() service
   ↓
9. UserRepo.signIn()
   ↓
10. auth.api.signInEmail()
    ↓
11. Better Auth 验证密码
    ↓
12. 创建 Session + 设置 Cookie
    ↓
13. 返回响应 → 前端
    ↓
14. 前端更新状态 + 跳转
```

### 路由映射

| 前端调用 | HTTP 请求 | Hono 路由 | Better Auth API |
|---------|----------|----------|----------------|
| `authApi.signIn()` | `POST /api/auth/sign-in/username` | `authRoutes` | `auth.api.signInEmail()` |
| `authApi.signOut()` | `POST /api/auth/sign-out` | Better Auth 自动 | `auth.api.signOut()` |
| `authApi.signUp()` | `POST /api/auth/sign-up` | `authRoutes` | `auth.api.signUpEmail()` |
| `authApi.getSession()` | `GET /api/auth/get-session` | Better Auth 自动 | `auth.api.getSession()` |

---

## 常见问题

### Q1: 为什么不完全使用 Better Auth 的自动路由？

**A:** 项目需要更灵活的业务逻辑：

- 支持用户名或邮箱登录
- 注册时需要验证 OTP
- 自定义错误处理格式
- 生成 OpenAPI 文档
- 额外的验证接口（检查唯一性）

### Q2: 客户端为什么混合使用 authClient 和自定义 API？

**A:**

- **使用 authClient**：登录、登出、获取会话（Better Auth 自带 Cookie 管理）
- **使用自定义 API**：注册、发送验证码、检查唯一性（需要自定义逻辑）

### Q3: emailOTPClient() 配置了但没用，需要移除吗？

**A:** 建议移除，因为：

- 项目使用自定义 API 发送验证码
- 不调用 `authClient.sendVerificationOTP()`
- 保留会造成混淆

**优化方案：**

```typescript
// src/lib/auth/client.ts
plugins: [
  usernameClient()  // 只保留实际使用的
]
```

### Q4: 如何判断插件是否需要配对？

**A:** 简单规则：

- 如果你在客户端调用 `authClient.xxx()` 方法 → 需要配对
- 如果只是自己实现 API 调用 → 不需要客户端插件

### Q5: auth.api.*和 authClient.* 有什么区别？

**A:**

- `auth.api.*` - 服务端使用，直接调用 Better Auth 内部 API
- `authClient.*` - 客户端使用，通过 HTTP 请求调用服务端 API

---

## 最佳实践

### 1. 服务端

✅ **推荐：**

- 使用 `auth.api.*` 调用 Better Auth 核心功能
- 在 Repository 层封装认证逻辑
- 在路由层处理业务逻辑和错误

❌ **避免：**

- 直接在路由层调用 `auth.api.*`
- 绕过 Better Auth 自己实现密码哈希

### 2. 客户端

✅ **推荐：**

- 登录/登出使用 `authClient`（自动处理 Cookie）
- 自定义功能使用 Hono RPC 客户端
- 在 `src/api/auth.ts` 统一封装

❌ **避免：**

- 直接在组件中调用 `authClient`
- 混用多种 API 调用方式

### 3. 插件配置

✅ **推荐：**

- 只配置实际使用的插件
- 服务端和客户端插件保持一致
- 定期检查未使用的配置

❌ **避免：**

- 配置了但不使用的插件
- 服务端有插件但客户端没有对应配置

---

## 相关文件

### 服务端

- `src/lib/auth/server.ts` - Better Auth 配置
- `src/database/repositories/user.repo.ts` - 用户数据访问
- `src/server/modules/user/user.route.ts` - 认证路由
- `src/server/modules/user/user.service.ts` - 业务逻辑

### 客户端

- `src/lib/auth/client.ts` - Better Auth 客户端配置
- `src/api/auth.ts` - API 封装
- `src/app/_components/auth/hooks/` - 认证相关 Hooks

### 路由

- `src/app/api/[[...route]]/route.ts` - Next.js API 路由入口
- `src/server/main.ts` - Hono 应用主入口

---

## 更新日志

- **2026-03-18**: 初始版本，记录项目中 Better Auth 的使用方式
