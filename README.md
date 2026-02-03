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

- [x] **项目初始化** / 工程规范 / 静态资源
- [x] **CSS & 主题架构** / UI 组件 / 博客编辑弹窗
- [x] **数据库层**：Prisma + PostgreSQL
- [x] **MDX & TOC**：序列化/水合拆分，阅读时间统计
- [x] **后端 API 层（Hono）**：路由集中在 `src/server`，`hono/client`
      生成类型安全客户端，`zValidator` 负责入参校验
- [x] **博客详情页**：MDX 渲染与元信息展示
- [ ] **待优化**：Header 动画细节、目录 sticky、移动端交互微调

## 📑 API 文档入口

- OpenAPI JSON：`/api/openapi`
- Swagger UI（Hono 内置）：`/api/swagger`
- Scalar API Referenc（Hono 内置）e：`/api/docs`

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
