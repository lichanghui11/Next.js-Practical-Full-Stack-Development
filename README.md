# Esti Blog

这是一个基于 Next.js 16 (App Router) 和 React
19 的现代博客项目学习实战。本项目旨在记录开发过程中的技术决策、架构思考以及遇到的挑战。

> **Note**: 本项目不仅是一个博客系统，更是一份**活的技术文档**。所有的架构决策和踩坑记录都已整理为详细文档。

## 📚 学习笔记与文档

为了保持清晰，我将详细的技术笔记拆分到了 `docs/` 目录下：

- **🎨 [样式架构设计 (CSS Architecture)](./docs/css-architecture.md)**
  - Tailwind v4 模块化配置
  - CSS Modules 与全局作用域
  - Meriad 架构图与命名规范

- **🔧 [工程化规范 (Engineering Standards)](./docs/engineering.md)**
  - Linting & Formatting (ESLint, Prettier, Stylelint)
  - Git 提交规范 (Conventional Commits)

- **🖼️ [Next.js 资源配置](./docs/nextjs-resources.md)**
  - Metadata API
  - Favicon 与静态资源最佳实践

---

## 📅 当前进度

- [x] **项目初始化**: 使用 `create-next-app` 搭建基础环境。
- [x] **CSS 架构重构**: 模块化 Tailwind v4 配置，解决 CSS Module 引用问题。
- [x] **主题系统**: 实现系统级深色模式 (Dark Mode) 自动跟随。
- [x] **工程化配置**: 完善的代码规范检查与提交约束。
- [x] **静态资源**: 完成 Favicon/Logo 配置。
- [ ] **UI 组件开发**: 待开始...

## 🛠️ 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看项目。
