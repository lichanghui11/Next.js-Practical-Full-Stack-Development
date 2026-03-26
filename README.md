# Esti Blog

这是一个基于 Next.js 16 (App Router) 和 React
19 的现代博客项目学习实战。本项目旨在记录开发过程中的技术决策、架构思考以及遇到的挑战。

> **Note**: 这是一份学习笔记，记录一份完整的项目实践，文档和代码可能有出入，以实际代码为准。

## 📚 学习笔记与文档

为了保持清晰，我将详细的技术笔记拆分到了 `docs/` 目录下：

- **🎨 [样式架构设计 (CSS Architecture)](./docs/css-architecture.md)**
  - Tailwind v4 模块化配置
  - CSS Modules 与全局作用域

- **🌗 [主题配置 (Theme Architecture)](./docs/theme-architecture.md)**
  - 暗色模式实现
  - 主题切换逻辑

- **🔧 [工程化规范 (Engineering Standards)](./docs/engineering.md)**
  - Linting & Formatting (ESLint, Prettier, Stylelint)
  - Git 提交规范 (Conventional Commits)

- **🗄️ [数据库配置 (Database Setup)](./docs/database.md)**
  - Prisma 架构与分层
  - PostgreSQL Adapter 配置
  - Migration 工作流程

- **📘 [数据库学习笔记 (Database Guide)](./docs/database-guide.md)**
  - 全新 Mac 开发环境配置（Git/Node/SSH）
  - PostgreSQL 实例/数据库/schema/表的模型
  - `psql`/DBeaver 使用认知、Prisma 迁移与种子
  - 常用命令速查（终端、psql 元命令、SQL 管理语句）

- **🌳 [Prisma Bark 树形结构学习笔记](./docs/prisma-bark.md)**
  - Materialized Path（物化路径）模型
  - Category 树形扩展与面包屑/后代查询封装
  - 递归创建树形结构与常见坑点（path 冲突、undefined 处理）
  - **→ [物化路径示例：三叉树详解](./docs/materialized-path-example.md)**

- **📖 [Prisma 数据表关联关系与操作指南](./docs/prisma-relationships-guide.md)**
  - 一对多、多对一、多对多模型设计
  - Prisma CRUD 操作与关联数据加载

- **📝 [博客编辑弹窗实现](./docs/blog-edit-modal-implementation.md)**
  - 拦截路由与弹窗组件
  - CSS 玻璃拟态效果与暗色模式

- **📄 [MDX 功能开发学习笔记](./docs/mdx-architecture.md)**
  - MDX 序列化与水合架构
  - Remark/Rehype 插件系统
  - TOC 目录组件实现
  - CSS 高级技巧（sticky、color-mix、层叠上下文）
  - React Portal 应用

- **📝 [MDX 语法格式说明](./docs/mdx-syntax-guide.md)**
  - 基础 Markdown 语法
  - GFM 扩展（表格、任务列表、脚注）
  - 代码块与代码窗口
  - 自定义 Directive（Admonition、视频嵌入、文字高亮）
  - TOC 自动生成与阅读时间统计

- **🧩 [Prisma Pagination Patch 记录](./docs/prisma-pagination-patch.md)**
  - Prisma 7.2 的显式 `undefined` 校验问题
  - `pnpm patch` 修复第三方依赖流程

- **🧱 [Suspense 与骨架屏](./docs/suspense-skeleton.md)**
  - 路由级 loading 与 Suspense fallback 的适用场景
  - 骨架显示条件与常见坑点

- **🧭 [后端架构说明](./docs/backend-architecture.md)**
  - Server Actions 的适用边界与替代方案
  - 框架选型建议与 hono.js 选择理由

- **⚡ [use server 架构深度解析](./docs/use-server-deep-dive.md)**
  - Server Action 执行边界与双重打包问题
  - Next.js 与 Hono 结合的最佳实践架构

- **🐳 [Docker 完整学习笔记](./docs/docker.md)**
  - Docker 基础概念与架构
  - 镜像与容器管理命令大全
  - Dockerfile 详解与最佳实践
  - Docker Compose 多容器编排
  - 网络模式与数据持久化
  - 常用服务快速启动与开发环境配置

- **🏠 [首页功能实现](./docs/homepage-implementation.md)**
  - 视频播放器封装（Artplayer）
  - 时间线组件与鎏金边框效果
  - 堆叠卡片与背景效果系统
  - 鼠标跟随效果与文字动画

- **📰 [博客系统架构](./docs/blog-system-architecture.md)**
  - 文件路由结构与组件封装
  - 分类系统与标签系统实现
  - 面包屑导航与分页功能
  - 已知问题与待优化项

- **🔐 [认证系统 (Better-Auth)](./docs/better-auth.md)**
  - Better-Auth 服务端/客户端双端架构
  - Session 会话机制与数据库存储
  - 自定义 Hono 路由 + Better-Auth 内部 API 的完整登录链路
  - React Context 前端登录状态管理

- **📓 [Better-Auth 使用细节笔记](./docs/better-auth-notes.md)**
  - 服务端与客户端接口封装
  - 插件配对规则解析
  - 请求流程映射与常见问题

- **📧 [邮件推送模块 (Mail Push)](./docs/mail-push.md)**
  - 多平台统一抽象（SMTP / 阿里云 / 腾讯云 SES）
  - 类型系统设计与客户端工厂函数
  - Pug 模板渲染与云平台预设模板
  - customMerge 深度合并工具

- **📥 [邮件与 OTP 链路说明](./docs/mail-otp-guide.md)**
  - SMTP、阿里云、腾讯云多通道邮件发送
  - 邮件 OTP 与发送流程设计

- **🔐 [Redis + OTP 验证码系统设计](./docs/redis-otp-auth-flow.md)**
  - Redis 频率限制与存储
  - BullMQ 异步邮件发送机制应用
  - 客户端与服务端挂起状态一致性维持

- **☁️ [MinIO 与对象存储核心笔记](./docs/min-io-note.md)**
  - S3 / MinIO 核心概念与区别
  - Bucket 权限配置与划分策略
  - AWS SDK 初始化与容错机制

- **🌐 [Hono RPC 客户端学习笔记](./docs/hono-client-notes.md)**
  - hono/client 和 Prisma 客户端比较
  - client/server RPC 通信流程梳理

- **🧠 [React 三大经典模式详解](./docs/react-classic-patterns.md)**
  - Render Props 模式原理及应用
  - 高阶组件 (HOC) 及自定义 Hook 对比梳理

- **💡 [async/await 使用规则](./docs/async-await-return.md)**
  - no-return-await 约束与适用场景解析

- **🐞 [API 调试与排错 (分类返回空数组)](./docs/category-api-debug.md)**
  - 路由匹配排序错误与无效参数过滤

- **🗺️ [Next.js Modal Router 设计](./docs/modal-router-design.md)**
  - 拦截路由与并行路由基本模型结构

---

## 项目中比较严重的几个bug发现

- **Better-Auth 注册验证码行为**
  - 官方默认防枚举策略：当邮箱不存在时直接返回 `{ success: true }`，不会触发
    `sendVerificationOTP`。这不是 bug，而是安全设计。
  - 项目流程是“先验证邮箱，再创建用户”，因此需要自定义一条“预注册发送验证码”的路由/服务，绕过默认必须先建用户再发码的限制。
- **分页查询关联数据缺失（已修复）**
  - 使用 `prisma-extension-pagination` 时曾把 `include` 放在 `paginate()` 里同时开启
    `includePageCount`，导致插件在 `count` 时也带 `include`，Prisma 报错。
  - 现已改为：分页查询时仅取数据，`count` 单独用 `where` 计算，再回填
    `totalCount/pageCount`，列表页可正常返回分类与标签。

---

## 🗂️ 项目结构

```bash
.
├── src
│   ├── app                    # Next.js App Router
│   │   ├── api/[[...route]]   # Hono 入口（统一后端路由挂载点）
│   │   ├── (pages)            # 页面分组
│   │   ├── _components        # UI/业务组件
│   │   ├── styles
│   │   └── utils
│   ├── server                 # 后端（Hono + 业务分层）
│   │   ├── main.ts            # 汇总所有模块并设置 /api 前缀
│   │   ├── common             # createHonoApp、错误处理等中间件
│   │   └── modules
│   │       ├── blog           # blog.api / blog.service / blog.schema / blog.type
│   │       └── user           # 预留用户模块
│   ├── config                 # api.client.ts（前端 Hono 客户端配置）
│   ├── lib                    # rpc.client.ts（fetchApi 封装）、types
│   ├── database               # Prisma + Repositories + Seed
│   ├── docs                   # 项目文档
│   └── mdx-env.d.ts
├── public                     # 静态资源
├── patches                    # pnpm patch 生成的补丁
├── next.config.ts
├── package.json
└── ...
```

## 📅 当前进度

> 💡 本轮重构：后端逻辑整合到 Hono（App Router 的 `app/api/[[...route]]` 入口），前端通过
> `hono/client` + `fetchApi` 统一调用，表单校验用 `zValidator + Zod`。

### 已完成模块

- [x] **项目初始化**
  - 工程规范配置（ESLint、Prettier、Stylelint）
  - Git 提交规范（Conventional Commits）
  - 静态资源管理

- [x] **样式系统**
  - Tailwind v4 模块化配置
  - CSS Modules 与全局作用域
  - 暗色模式与主题切换

- [x] **数据库层**
  - Prisma + PostgreSQL 配置
  - 树形结构实现（Materialized Path）
  - Migration 与 Seed 工作流

- [x] **后端 API 层（Hono）**
  - 路由模块化设计（`src/server`）
  - 类型安全客户端（`hono/client`）
  - 表单校验（`zValidator + Zod`）
  - OpenAPI 文档生成

- [x] **MDX 内容系统**
  - 序列化/水合架构拆分
  - Remark/Rehype 插件系统
  - TOC 目录自动生成
  - 阅读时间统计

- [x] **首页功能**
  - 视频播放器封装（Artplayer）
  - 时间线组件与鎏金边框效果
  - 堆叠卡片与背景渐变
  - 鼠标跟随效果与文字动画

- [x] **博客系统**
  - 文件路由（列表/详情/创建/编辑）
  - 分类树形结构与面包屑导航
  - 标签过滤与分页功能
  - MDX 渲染与元信息展示

- [x] **认证系统（Better-Auth）**
  - 邮箱密码 + 用户名双模式登录
  - Session 数据库持久化存储
  - 自定义 Hono 路由与 Better-Auth 内部 API 协同
  - React Context 前端登录状态管理

- [x] **邮件推送模块**
  - 统一接口封装（SMTP / 阿里云 / 腾讯云 SES）
  - Pug 模板渲染（验证码、忘记密码）
  - 多平台参数适配与环境变量配置

- [x] **缓存与队列系统（Redis & BullMQ）**
  - Redis 基础应用与限制
  - 基于 Redis 的 OTP 频率控制设计
  - 基于 BullMQ 的异步邮件发送防阻塞机制

- [x] **对象存储系统（MinIO & S3 支持）**
  - AWS SDK (S3) 标准接口对接
  - 头像由于图片资源的云端托管
  - React-Easy-Crop 客户端图片裁剪与导出交互

### 后续学习计划

- [ ] **缓存层深入（Redis）**
  - 会话存储分离
  - 数据缓存策略
  - 热点数据优化

- [ ] **功能优化**
  - Header 动画细节
  - 目录 sticky 定位
  - 移动端交互优化
  - 博客列表数据完整性修复

## ⚠️ 已知问题

### 博客列表数据缺失

**问题**: 博客列表页无法正确获取文章的标签（tags）和分类（categories）关联数据

**影响**: 列表页文章卡片的标签和分类区域可能显示不完整

**位置**: `src/app/_components/blog/list/index.tsx:34` - `blogApi.list()`

**待解决**:

- [ ] 检查后端 API 返回数据结构
- [ ] 确认数据库查询是否包含关联查询（include）
- [ ] 验证前端类型定义匹配

详见 [博客系统架构文档](./docs/blog-system-architecture.md#已知问题与遗留任务)

## 📑 API 文档入口

项目启动后，可以通过以下地址访问 API 文档：

| 地址           | 说明                                         |
| -------------- | -------------------------------------------- |
| `/api`         | API 服务欢迎页                               |
| `/api/openapi` | OpenAPI JSON 规范                            |
| `/api/swagger` | Swagger UI（交互式文档）                     |
| `/api/docs`    | Scalar API Reference（现代化文档界面，推荐） |

> 💡 推荐使用 **Scalar**（`/api/docs`），界面更现代，支持深色模式和代码示例自动生成。

## 🛠️ 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 启动基础设施容器 (PostgreSQL, Redis, MinIO)
# 前提：确保宿主机已安装 Docker Desktop 或 Docker Engine
# 注意：该命令会在后台启动所需环境，Postgres 容器会自动创建所需的 esti_blog_db 数据库
pnpm run infra:up

# 3. 环境变量配置
# 确保基于 .env.example 创建配套的 .env 文件，数据库等链接指向本地容器即可

# 4. 生成 Prisma Client
pnpm run db:generate

# 5. 运行数据库迁移 (初始化表结构)
pnpm run db:dev:migrate

# 6. 填充种子数据 (生成分类、标签、管理员等测试数据)
pnpm run db:dev:seed

# 7. 启动开发服务器
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看项目。
