# Esti Blog

这是一个基于 Next.js 16 (App Router) 和 React
19 的现代博客项目学习实战。本项目旨在记录开发过程中的技术决策、架构思考以及遇到的挑战。

> **Note**: 这是一份学习笔记，记录一份完整的项目实践，文档和代码可能有出入，以实际代码为准。

## 📚 学习笔记与文档

为了保持清晰，我将详细的技术笔记拆分到了 `docs/` 目录下：

- **🎨 [样式架构设计 (CSS Architecture)](./src/docs/css-architecture.md)**
  - Tailwind v4 模块化配置
  - CSS Modules 与全局作用域

- **🌗 [主题配置 (Theme Architecture)](./src/docs/theme-architecture.md)**
  - 暗色模式实现
  - 主题切换逻辑

- **🔧 [工程化规范 (Engineering Standards)](./src/docs/engineering.md)**
  - Linting & Formatting (ESLint, Prettier, Stylelint)
  - Git 提交规范 (Conventional Commits)

- **🗄️ [数据库配置 (Database Setup)](./src/docs/database.md)**
  - Prisma 架构与分层
  - PostgreSQL Adapter 配置
  - Migration 工作流程

- **📘 [数据库学习笔记 (Database Guide)](./src/docs/database-guide.md)**
  - 全新 Mac 开发环境配置（Git/Node/SSH）
  - PostgreSQL 实例/数据库/schema/表的模型
  - `psql`/DBeaver 使用认知、Prisma 迁移与种子
  - 常用命令速查（终端、psql 元命令、SQL 管理语句）

- **🌳 [Prisma Bark 树形结构学习笔记](./src/docs/prisma-bark.md)**
  - Materialized Path（物化路径）模型
  - Category 树形扩展与面包屑/后代查询封装
  - 递归创建树形结构与常见坑点（path 冲突、undefined 处理）
  - **→ [物化路径示例：三叉树详解](./src/docs/materialized-path-example.md)**

- **📝 [博客编辑弹窗实现](./src/docs/blog-edit-modal-implementation.md)**
  - 拦截路由与弹窗组件
  - CSS 玻璃拟态效果与暗色模式

- **📄 [MDX 功能开发学习笔记](./src/docs/mdx-architecture.md)**
  - MDX 序列化与水合架构
  - Remark/Rehype 插件系统
  - TOC 目录组件实现
  - CSS 高级技巧（sticky、color-mix、层叠上下文）
  - React Portal 应用

- **📝 [MDX 语法格式说明](./src/docs/mdx-syntax-guide.md)**
  - 基础 Markdown 语法
  - GFM 扩展（表格、任务列表、脚注）
  - 代码块与代码窗口
  - 自定义 Directive（Admonition、视频嵌入、文字高亮）
  - TOC 自动生成与阅读时间统计

- **🧩 [Prisma Pagination Patch 记录](./src/docs/prisma-pagination-patch.md)**
  - Prisma 7.2 的显式 `undefined` 校验问题
  - `pnpm patch` 修复第三方依赖流程

- **🧱 [Suspense 与骨架屏](./src/docs/suspense-skeleton.md)**
  - 路由级 loading 与 Suspense fallback 的适用场景
  - 骨架显示条件与常见坑点

- **🧭 [后端架构说明](./src/docs/backend-architecture.md)**
  - Server Actions 的适用边界与替代方案
  - 框架选型建议与 hono.js 选择理由

- **🐳 [Docker 完整学习笔记](./src/docs/docker.md)**
  - Docker 基础概念与架构
  - 镜像与容器管理命令大全
  - Dockerfile 详解与最佳实践
  - Docker Compose 多容器编排
  - 网络模式与数据持久化
  - 常用服务快速启动与开发环境配置

- **🏠 [首页功能实现](./src/docs/homepage-implementation.md)**
  - 视频播放器封装（Artplayer）
  - 时间线组件与鎏金边框效果
  - 堆叠卡片与背景效果系统
  - 鼠标跟随效果与文字动画

- **📰 [博客系统架构](./src/docs/blog-system-architecture.md)**
  - 文件路由结构与组件封装
  - 分类系统与标签系统实现
  - 面包屑导航与分页功能
  - 已知问题与待优化项

- **🔐 [认证系统 (Better-Auth)](./src/docs/better-auth.md)**
  - Better-Auth 服务端/客户端双端架构
  - Session 会话机制与数据库存储
  - 自定义 Hono 路由 + Better-Auth 内部 API 的完整登录链路
  - React Context 前端登录状态管理

- **📧 [邮件推送模块 (Mail Push)](./src/docs/mail-push.md)**
  - 多平台统一抽象（SMTP / 阿里云 / 腾讯云 SES）
  - 类型系统设计与客户端工厂函数
  - Pug 模板渲染与云平台预设模板
  - customMerge 深度合并工具

---

## 项目中比较严重的几个bug发现

- better-auth 在发送注册验证码的时候，如果用户不存在，就会直接返回一个 {success:
  true}，不会执行better-auth服务端的emailOTP插件里面的sendVerificationOTP回调函数，这可能是为了防止枚举攻击
- 这个问题排查了很久，由于这个回调一直不触发，而前后的逻辑里面的日志都在正常打印，我一度觉得见鬼了
- 使用 better-auth 内部的发送验证码的功能需要用户已经存在，也就是发送之前需要创建用户，验证之后不通过就需要删除用户，但是我的项目中的实际流程是先验证邮箱，再创建用户，所以需要把这个功能拿出来自己写

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

### 后续学习计划

- [ ] **缓存层（Redis）**
  - Redis 基础配置
  - 会话存储
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

详见 [博客系统架构文档](./src/docs/blog-system-architecture.md#已知问题与遗留任务)

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
# 安装依赖
pnpm install

# 配置数据库
# 1. 确保 PostgreSQL 已安装并运行
# 2. 创建数据库：CREATE DATABASE esti_blog;
# 3. 配置 .env 文件中的 DATABASE_URL

# 生成 Prisma Client
pnpm run db:generate

# 运行数据库迁移
pnpm run db:dev:migrate

# 填充种子数据
pnpm run db:dev:seed

# 启动开发服务器
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看项目。
