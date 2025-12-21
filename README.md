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

- **📝 [博客编辑弹窗实现](./src/docs/blog-edit-modal-implementation.md)**
  - 拦截路由与弹窗组件
  - CSS 玻璃拟态效果与暗色模式

- **📄 [MDX 功能开发学习笔记](./src/docs/mdx-learning-notes.md)**
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

---

## 📅 当前进度

> 💡 **当前提交说明**：完成 MDX 渲染系统、TOC 目录组件、Header 滚动效果、移动端响应式抽屉。

- [x] **项目初始化**: 使用 `create-next-app` 搭建基础环境。
- [x] **CSS 架构重构**: 模块化 Tailwind v4 配置，解决 CSS Module 引用问题。
- [x] **工程化配置**: 完善的代码规范检查与提交约束。
- [x] **静态资源**: 完成 Favicon/Logo 配置。
- [x] **UI 组件开发**: 弹窗组件、表单组件、折叠面板组件。
- [x] **博客编辑功能**: 拦截路由弹窗编辑，玻璃拟态样式。
- [x] **数据库集成**: Prisma ORM + PostgreSQL，配置 Adapter 架构。
- [x] **MDX 渲染系统**:
  - 序列化/水合分离架构
  - 代码窗口组件（rehype-code-window）
  - 阅读时间统计
- [x] **TOC 目录组件**:
  - 桌面端侧边栏（IntersectionObserver 活跃追踪）
  - 移动端抽屉（侧滑 + 遮罩）
  - 响应式布局切换
- [x] **Header 滚动效果**:
  - 滚动时高度变化 (50px → 60px)
  - 背景透明度渐变 (color-mix)
- [ ] **待优化**:
  - [ ] 完善 Header 滚动动画
  - [ ] 移动端目录按钮图标旋转动画
  - [ ] PC 端目录 sticky 定位完整实现
- [ ] **后端 API 对接**: 待开始...
- [ ] **博客详情页**: 待开始...

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
