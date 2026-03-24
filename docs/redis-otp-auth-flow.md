# Redis + OTP 验证码系统设计文档

## 概述

本项目使用 Redis 作为 OTP（一次性验证码）发送的**频率限制存储**，并通过 **BullMQ** 作为任务队列异步发送邮件。整个认证体系基于 [Better Auth](https://www.better-auth.com/) 搭建，支持邮箱注册、用户名登录、忘记密码等功能。

---

## 目录结构（涉及文件）

```text
src/
├── config/
│   ├── redis.config.ts          # Redis 连接配置
│   ├── queue.config.ts          # BullMQ 队列配置
│   └── auth.config.ts           # 认证配置（OTP 超时、频率限制等）
├── lib/
│   ├── redis/
│   │   ├── client.ts            # Redis 客户端创建 & 获取
│   │   └── types.ts             # Redis 类型定义
│   ├── queue/
│   │   ├── utilis.ts            # 队列创建、Worker、addOTPQueue
│   │   └── types.ts             # 队列类型定义
│   └── auth/
│       └── server.ts            # Better Auth 实例（含 emailOTP 插件）
├── server/
│   ├── common/
│   │   └── app.ts               # 服务启动：初始化 Redis + 队列 + Worker
│   └── modules/user/
│       ├── user.constants.ts    # EmailOTPType 枚举
│       ├── user.otp.ts          # OTP 频率限制核心逻辑（Redis 读写）
│       ├── user.service.ts      # 业务层（薄封装，转发给 Repo）
│       └── user.route.ts        # Hono 路由定义
├── database/repositories/
│   └── user.repo.ts             # 数据层（注册/登录/发送OTP 实现）
└── app/_components/auth/hooks/
    └── otp.ts                   # 客户端 OTP 发送 Hook（含倒计时）
```

---

## 一、Redis 连接初始化

### 配置文件

**[src/config/redis.config.ts](../config/redis.config.ts)**

```ts
export const redisConfig: RedisConfig = {
  default: 'default',
  connections: [
    {
      name: 'default',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
      db: Number.parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: null,  // BullMQ 要求设为 null（无限重试）
    },
  ],
};
```

环境变量：`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`

### 客户端工厂

**[src/lib/redis/client.ts](../lib/redis/client.ts)**

- `createRedisClients()` — 遍历 `redisConfig.connections`，为每个连接创建一个 `ioredis` 实例，以 `name` 为 key 存入 Map
- `getRedisClient(clients, name?)` — 按名称取出对应 Redis 实例，不传 `name` 则取 `default`

---

## 二、BullMQ 队列初始化

### 队列配置

**[src/config/queue.config.ts](../config/queue.config.ts)**

```ts
export const queueConfig: QueueConfig = {
  OTP: {
    redis: 'default',          // 复用 default Redis 连接
    defaultJobOptions: {
      attempts: 5,             // 最多重试 5 次
      backoff: {
        type: 'exponential',   // 指数退避
        delay: 1000,           // 初始延迟 1s
      },
    },
  },
};
```

### 队列工具

**[src/lib/queue/utilis.ts](../lib/queue/utilis.ts)**

| 函数 | 作用 |
| ------ | ------ |
| `createQueue(redisClients)` | 遍历 `queueConfig`，为每个 key 创建 BullMQ `Queue`，复用外部 Redis 实例 |
| `getWorkerConnection(queueName, redisClients)` | 为 Worker 获取对应的 Redis 连接 |
| `addOTPQueue(email, code, type)` | 向队列添加 OTP 任务；若队列不存在则同步发送（降级兜底） |
| `addOTPWorker()` | 创建消费 `OTP` 队列的 Worker，调用 `sendOTPHandler` 处理任务 |
| `addUserQueueWorker()` | 服务启动时调用，初始化所有 Worker |

---

## 三、服务器启动时序

**[src/server/common/app.ts](../server/common/app.ts)**

```text
服务启动 (beforeServer)
  ├── createRedisClients()        → serverInstances.redis = { default: RedisInstance }
  ├── createQueue(redis)          → serverInstances.queues = { OTP: Queue }
  └── addUserQueueWorker()        → 启动 OTP Worker，开始消费队列
```

`serverInstances` 是模块级单例对象，在整个服务生命周期内持有 Redis 和 Queue 实例。

---

## 四、OTP 类型定义

**[src/server/modules/user/user.constants.ts](../server/modules/user/user.constants.ts)**

```ts
export enum EmailOTPType {
  SIGN_IN            = 'sign-in',
  FORGET_PASSWORD    = 'forget-password',
  EMAIL_VERIFICATION = 'email-verification',
  CHANGE_EMAIL       = 'change-email',
}
```

---

## 五、OTP 频率限制核心逻辑（Redis 读写）

**[src/server/modules/user/user.otp.ts](../server/modules/user/user.otp.ts)**

### Redis Key 格式

```text
otp:rate_limit:{type}:{email}

示例：otp:rate_limit:email-verification:user@example.com
      otp:rate_limit:forget-password:user@example.com
```

### 三个核心函数

#### 1. `checkOTPRateLimit(email, type)` — 检查是否可以发送

```text
redis.get("otp:rate_limit:{type}:{email}")
  ├── Key 不存在 → 首次发送，canSend: true
  ├── Key 存在，剩余时间 > 0 → canSend: false，返回 remainingTime
  └── Key 存在，已过期 → canSend: true
```

若 Redis 异常，**允许发送**（优雅降级，不因缓存故障影响用户）。

#### 2. `recordOTPSendTime(email, type)` — 记录发送时间

```text
redis.setex("otp:rate_limit:{type}:{email}", rateLimit秒, Date.now())
```

`SETEX` = SET + EXPIRE，Key 会在 `rateLimit` 秒后自动删除，无需手动清理。

- 开发环境：`rateLimit = 5秒`
- 生产环境：`rateLimit = 60秒`

#### 3. `getOTPSendStatus(credential, type)` — 查询当前发送状态

用于**页面刷新后**恢复倒计时。先通过 credential 查出邮箱，再调 `checkOTPRateLimit` 返回剩余时间。

### 邮件发送 `sendOTPHandler(data, type)`

根据 OTP 类型从 `authConfig` 读取对应邮件模板配置，调用邮件库发送（支持 SMTP / 阿里云 / 腾讯云三种 Provider）。

---

## 六、Better Auth 集成

**[src/lib/auth/server.ts](../lib/auth/server.ts)**

Better Auth 的 `emailOTP` 插件通过自定义 `sendVerificationOTP` 钩子，将 OTP 发送接入队列：

```ts
emailOTP({
  allowedAttempts: 5,    // 最多尝试次数
  expiresIn: 300,        // OTP 有效期（秒）
  async sendVerificationOTP({ email, otp, type }) {
    addOTPQueue(email, otp, type);  // 推入 BullMQ 队列，异步发送
  },
})
```

Better Auth 负责：

- OTP 代码的**生成**
- OTP 代码存储到数据库（PostgreSQL via Prisma）
- OTP **校验**（`checkVerificationOTP` / `resetPasswordEmailOTP`）

Redis 负责：

- OTP **发送频率限制**（防止短时间内重复请求）

---

## 七、API 路由

**[src/server/modules/user/user.route.ts](../server/modules/user/user.route.ts)**

| Method | Path | 功能 | 关键调用 |
| -------- | ------ | ------ | ---------- |
| `POST` | `/auth/sign-up` | 邮箱注册（含OTP验证） | `signUpByEmail()` |
| `POST` | `/auth/sign-in/username` | 用户名/邮箱登录 | `signIn()` |
| `POST` | `/auth/sign-out` | 退出登录 | `signOut()` |
| `POST` | `/auth/reset-password` | 重置密码 | `resetPasswordByEmail()` |
| `POST` | `/auth/otp/email-verification` | 发送注册验证码 | `sendOTP(email, EMAIL_VERIFICATION)` |
| `POST` | `/auth/otp/forget-password` | 发送忘记密码验证码 | `sendOTP(email, FORGET_PASSWORD)` |
| `POST` | `/auth/email-otp/status` | 查询OTP发送状态（刷新恢复） | `getOTPSendStatus()` |
| `GET` | `/auth/me` | 获取当前用户信息 | `getUser()` |
| `GET` | `/auth/get-session` | 获取当前会话信息 | `getCurrentSession()` |
| `POST` | `/auth/check/user-exists` | 检查用户是否存在 | `queryUserByUsernameOrEmail()` |
| `POST` | `/auth/check/username-unique` | 检查用户名唯一性 | `queryUserByUsername()` |
| `POST` | `/auth/check/email-unique` | 检查邮箱唯一性 | `queryUserByEmail()` |

---

## 八、完整流程图

### 8.1 注册流程（含邮箱验证）

```text
[前端注册表单]
      │
      ▼
POST /auth/otp/email-verification  { email }
      │
      ▼
UserRepo.sendOTP(email, 'email-verification')
      │
      ├─ checkOTPRateLimit(email, type)
      │     └─ Redis GET otp:rate_limit:email-verification:{email}
      │           ├─ 未过期 → 返回 429 + remainingTime（前端显示倒计时）
      │           └─ 可发送 ↓
      │
      ├─ auth.api.sendVerificationOTP({ email, type })
      │     └─ Better Auth 生成 OTP 代码，存入 PostgreSQL
      │           └─ 触发 sendVerificationOTP 钩子
      │                 └─ addOTPQueue(email, code, type)
      │                       └─ BullMQ Queue 添加任务
      │                             └─ Worker 消费 → sendOTPHandler → 邮件服务商发信
      │
      └─ recordOTPSendTime(email, type)
            └─ Redis SETEX otp:rate_limit:email-verification:{email} 60 {timestamp}

[用户收到邮件，填写验证码后提交注册表单]

POST /auth/sign-up  { username, email, password, otp }
      │
      ▼
UserRepo.signUpByEmail(data)
      │
      ├─ 检查邮箱/用户名唯一性（Prisma 查询）
      │
      ├─ auth.api.signUpEmail(...)    → 创建用户记录
      │
      ├─ auth.api.checkVerificationOTP({ email, otp, type: 'email-verification' })
      │     ├─ OTP 不匹配 → deleteUser(userId) → 返回 { result: false, message: '验证码错误' }
      │     └─ OTP 匹配 ↓
      │
      └─ prisma.user.update({ emailVerified: true })
            └─ 返回 { result: true, user }
```

### 8.2 忘记密码流程

```text
[前端忘记密码表单]
      │
      ▼
POST /auth/otp/forget-password  { credential }
      │
      ├─ queryUserByUsernameOrEmail(credential)  → 找不到用户 → 404
      │
      └─ UserRepo.sendOTP(user.email, 'forget-password')
            │（与注册流程相同的频率限制 + 队列发送逻辑）
            └─ 返回倒计时时间

[用户填写新密码 + OTP]

POST /auth/reset-password  { credential, password, otp }
      │
      ▼
UserRepo.resetPasswordByEmail(data)
      │
      ├─ queryUserByUsernameOrEmail(credential)  → 找不到 → { result: false }
      │
      └─ auth.api.resetPasswordEmailOTP({ email, otp, password })
            └─ Better Auth 校验 OTP，更新密码
                  └─ 返回 { result: true/false }
```

### 8.3 页面刷新后恢复倒计时

```text
[前端页面加载 / credential 变化]
      │
      ▼
useOTPSender (useEffect)
      │
      ▼
authApi.getOTPStatus({ credential, type })
      │
      ▼
POST /auth/email-otp/status
      │
      ▼
getOTPSendStatus(credential, type)
      │
      ├─ queryUserByUsernameOrEmail(credential)  → 找不到 → canSend: false
      │
      └─ checkOTPRateLimit(user.email, type)
            └─ Redis GET → 返回 { canSend, remainingTime }

[前端]
  ├─ canSend: false → setCountdown(remainingTime) → 继续倒计时
  └─ canSend: true  → setCountdown(0)             → 可立即发送
```

---

## 九、客户端 OTP Hook

**[src/app/_components/auth/hooks/otp.ts](../app/_components/auth/hooks/otp.ts)**

```ts
// 核心 Hook
useOTPSender(sendApi, credential, type)
  返回：{ sendOTP, buttonText, isLoading, countdown, canSend }

// 具体实例
useSendVerificationOTP(email)    // 注册验证码
useSendForgetPasswordOTP(email)  // 忘记密码验证码
```

**Hook 状态机：**

```text
初始化 → useEffect 调用 getOTPStatus → 还原倒计时状态
                                                │
                                    credential 变化时重置 initialized 标志
                                                │
用户点击"发送验证码"
  │
  ├─ countdown > 0 || isLoading → 直接 return（防重复）
  │
  ├─ 调用 sendApi → setIsLoading(true)
  │     ├─ 200 → toast.success + setCountdown(remainingTime)
  │     ├─ 429 → toast.warning + setCountdown(remainingTime)
  │     └─ 其他 → toast.error
  │
  └─ finally: setIsLoading(false)

倒计时：每秒 countdown - 1，直到归零
```

**按钮文案逻辑：**

| 状态 | 显示文本 |
| ----------- | ---------- |
| `isLoading` | `发送中...` |
| `countdown > 0` | `{n} 秒后重新发送` |
| 默认 | `发送验证码` |

---

## 十、关键设计决策

### 1. 为什么用 Redis 存频率限制，而不是数据库？

- Redis 的 `SETEX` 天然支持 TTL，Key 到期自动删除，无需定时清理任务
- 读写延迟低（< 1ms），适合每次发送 OTP 前的高频检查
- 即使 Redis 宕机，代码选择**允许发送**（优雅降级），不影响核心注册流程

### 2. 为什么用 BullMQ 队列而不是直接发邮件？

- 邮件发送是**慢 I/O**，可能因网络/服务商延迟阻塞请求响应
- 队列支持**5次指数退避重试**，提升发送成功率
- Worker 与 HTTP 请求解耦，API 可快速返回，用户无需等待邮件实际发出

### 3. OTP 代码存在哪里？

OTP 代码由 Better Auth 的 `emailOTP` 插件生成并存入 **PostgreSQL**（通过 Prisma），不存 Redis。Redis 只存**发送时间戳**用于频率限制。

### 4. 注册时 OTP 校验失败为什么要删除用户？

注册流程先调 `signUpEmail` 创建用户，再校验 OTP。若 OTP 不通过，需要回滚：删除刚创建的用户，保持数据一致性。

---

## 十一、环境变量汇总

| 变量名 | 默认值 | 说明 |
| -------- | -------- | ------ |
| `REDIS_HOST` | `localhost` | Redis 服务器地址 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | `""` | Redis 密码 |
| `REDIS_DB` | `0` | Redis 数据库编号 |
| `DATABASE_URL` | — | PostgreSQL 连接字符串 |
| `NODE_ENV` | — | `development` 时 rateLimit=5s, OTP超时=30s |

---

# 附录：Redis 基础学习笔记

## 一、Redis 简介

**Redis** = **RE**mote **DI**ctionary **S**erver（远程字典服务器）

### 为什么需要 Redis？

传统应用使用 MySQL 等关系型数据库，但随着用户量增长，磁盘 I/O 成为性能瓶颈。Redis 作为基于内存的存储系统，提供：

- 极快的读写速度（微秒级延迟）
- 丰富的数据结构支持
- 多种应用场景：数据库缓存、消息队列、会话存储、实时排行榜等

### 数据结构支持

Redis 支持多种数据结构：

**5 种基本类型：** String、Hash、List、Set、Sorted Set
**5 种高级类型：** Bitmap、HyperLogLog、Geo、Stream、Bloom Filter

### 使用方式

- **CLI**：redis-cli 命令行工具
- **API**：各语言客户端库（ioredis、redis-py 等）
- **GUI**：Redis Desktop Manager、VSCode 插件等可视化工具

---

## 二、Redis 存储模型

### 键值对数据库本质

Redis 本质上是一个**键值对数据库**，所有键都是**扁平存储**的：

```text
bull:OTP:meta
bull-OTP-meta
bullOTPmeta
```

以上三个键名在 Redis 底层都是**独立的字符串键**，没有任何嵌套关系。

### 命名规范：冒号分隔符

冒号 `:` 是**行业约定俗成的命名规范**，用于逻辑分组：

```text
otp:rate_limit:email-verification:user@example.com
user:session:abc123
cache:product:12345
```

**工具支持：** VSCode Redis 插件、Redis Desktop Manager 等工具会识别 `:` 并自动分组展示，形成「嵌套格式」的视觉效果，但这只是 UI 层面的展示，底层仍是扁平存储。

---

## 三、高级特性

### 3.1 发布订阅模式（Pub/Sub）

Redis 支持发布订阅模式，实现消息广播：

- `PUBLISH channel message` — 向指定频道发送消息
- `SUBSCRIBE channel` — 订阅指定频道

**特点：** 消息不持久化，订阅者离线时无法接收消息。

### 3.2 Stream 消息队列

Stream 是 Redis 5.0 引入的持久化消息队列数据结构，命令以 `X` 开头：

```bash
# 添加消息（* 表示自动生成唯一 ID）
XADD mystream * otp 123456

# 读取消息
XREAD STREAMS mystream 0
```

**消费者组（Consumer Group）：**

- 为 Stream 创建消费者组，实现任务分发
- 同一任务不会被组内多个消费者重复处理
- 任务处理中会被标记，防止重复消费
- 若消费者崩溃，任务可被其他消费者继续处理

### 3.3 HyperLogLog 基数统计

**问题场景：** 统计网站独立访客数（UV）

- 传统方案：使用 Set 存储所有用户 ID
  - 1000 万访客 ≈ 400MB 内存
  - 随访客增长，内存占用持续上升

**HyperLogLog 方案：**

- 固定使用 **~12KB** 内存
- 统计海量数据的不重复元素数量（基数）
- 允许 **0.81%** 的误差

**适用场景：** 精确度要求不高但数据量巨大的统计（UV、PV、去重计数等）

---

## 四、事务（Transaction）

### 事务基本概念

事务是一组操作的集合，核心要求：**这组操作要么全部执行成功，要么全部不执行**。

### Redis 事务特点

**与 MySQL 的区别：**

| 特性 | MySQL | Redis |
| ---- | ----- | ----- |
| 原子性 | 全部成功或全部失败（自动回滚） | 部分命令可能失败，其他继续执行 |
| 回滚机制 | 自动回滚 | **无自动回滚** |

**Redis 事务保证：**

1. 执行 `EXEC` 前，所有命令缓存在队列中
2. 执行 `EXEC` 后，开始顺序执行队列中的命令
3. 任何一个命令失败，其他命令依然会执行
4. 事务执行期间，其他客户端请求不会插入

### 事务命令

```bash
MULTI              # 开启事务
SET key1 value1    # 命令进入队列
SET key2 value2    # 命令进入队列
EXEC               # 执行事务中的所有命令
DISCARD            # 取消事务
```

---

## 五、持久化机制

Redis 是基于内存的数据库，持久化至关重要，否则断电后所有数据丢失。

### 5.1 RDB（Redis Database Backup）快照

**工作原理：** 在指定时间间隔内，将内存中的数据快照写入磁盘，保存某一时间点的完整数据副本。

**配置方式：**

```bash
# redis.conf 配置示例
save 900 1      # 900秒内至少1次修改，触发保存
save 300 10     # 300秒内至少10次修改，触发保存
save 60 10000   # 60秒内至少10000次修改，触发保存
```

**手动触发：**

- `SAVE` — 同步保存，阻塞所有客户端请求（生产环境慎用）
- `BGSAVE` — 后台保存，fork 子进程执行，主进程继续处理请求

**优缺点：**

- ✅ 恢复速度快（直接加载完整数据文件）
- ✅ 适合定期备份
- ❌ 快照间隔内的数据可能丢失（如快照后宕机）
- ❌ `SAVE` 会阻塞服务，`BGSAVE` 消耗额外性能

### 5.2 AOF（Append Only File）日志

**工作原理：** 以日志形式追加记录 Redis 执行过的所有**写命令**（SET、HSET、DEL 等），重启时重新执行这些命令恢复数据。

**记录规则：**

- ✅ 记录：所有修改数据的命令
- ❌ 不记录：读命令（GET、HGET、BITCOUNT 等）

**刷盘策略（appendfsync 配置）：**

| 策略 | 说明 | 数据安全性 | 性能 |
| ---- | ---- | ---------- | ---- |
| `always` | 每次写命令都刷盘 | 零丢失 | 极低（频繁磁盘 I/O） |
| `everysec`（默认） | 每秒刷盘 1 次 | 最多丢失 1 秒数据 | 平衡 |
| `no` | 由操作系统决定 | 丢失风险高 | 最高 |

**恢复机制：** Redis 重启时读取 AOF 文件，按顺序重新执行所有写命令，相当于「重放」操作历史。

**优缺点：**

- ✅ 数据安全性高（everysec 模式最多丢 1 秒）
- ✅ 日志可读，便于分析和修复
- ❌ 文件体积大（记录所有写操作）
- ❌ 恢复速度慢（需重放所有命令）

### 5.3 混合持久化（推荐）

Redis 4.0+ 支持 RDB + AOF 混合模式：

- 定期生成 RDB 快照（快速恢复基础数据）
- 增量记录 AOF 日志（补充快照后的修改）
- 兼顾恢复速度和数据安全性

---

## 六、高可用架构

### 6.1 主从复制（Master-Slave Replication）

**架构模式：** 将一个 Redis 节点的数据复制到其他 Redis 节点。

**角色划分：**

- **主节点（Master）：** 负责写操作，并将数据同步给从节点
- **从节点（Slave）：** 只负责读操作，分摊读取压力

**特点：**

- 一个主节点可以有多个从节点
- 每个从节点只能有一个主节点
- 数据复制是单向的（Master → Slave）

**优势：** 通过多个从节点分摊读请求，提升系统吞吐量。

### 6.2 哨兵模式（Sentinel）

**问题场景：** 主节点宕机后，需要将某个从节点提升为新的主节点。

**哨兵作用：** 以独立进程运行，监控 Redis 集群的健康状态。

**核心功能：**

1. **监控（Monitoring）：** 不断发送命令检查各节点是否正常运行
2. **通知（Notification）：** 发现节点异常时，通过发布订阅模式通知其他节点
3. **故障转移（Failover）：** 主节点宕机时，自动从从节点中选举新的主节点，并通知其他从节点切换

**优势：** 实现 Redis 的自动故障恢复，提升系统可用性。

---

## 七、总结

本文档涵盖了 Redis 在本项目中的实际应用（OTP 频率限制 + BullMQ 队列）以及 Redis 的核心概念和高级特性。

**关键要点：**

- Redis 作为内存数据库，适合高频读写场景
- 合理使用持久化机制保障数据安全
- 主从复制 + 哨兵模式提升系统可用性
- 根据业务场景选择合适的数据结构和特性
