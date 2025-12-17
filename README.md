# Esti Blog

这是一个基于 Next.js 16 (App Router) 和 React
19 的现代博客项目学习实战。本项目旨在记录开发过程中的技术决策、架构思考以及遇到的挑战。

> **Note**: 这是一份学习笔记，记录一份完整的项目实践，文档和代码可能有出入，以实际代码为准。

## 📚 学习笔记与文档

为了保持清晰，我将详细的技术笔记拆分到了 `docs/` 目录下：

- **🎨
  [样式架构设计 (CSS Architecture)](./docs/css-architecture.md)**
  - Tailwind v4 模块化配置
  - CSS Modules 与全局作用域

- **🔧
  [工程化规范 (Engineering Standards)](./docs/engineering.md)**
  - Linting & Formatting (ESLint, Prettier, Stylelint)
  - Git 提交规范 (Conventional Commits)

- **📝
  [博客编辑弹窗实现](./docs/blog-edit-modal-implementation.md)**
  - 拦截路由与弹窗组件
  - CSS 玻璃拟态效果与暗色模式

---

## 📅 当前进度

> 💡
> **当前提交说明**：本提交完成了博客编辑弹窗的 UI 和交互逻辑，数据层使用本地 JSON 模拟（假数据），尚未接入真实后端 API。

- [x] **项目初始化**: 使用 `create-next-app` 搭建基础环境。
- [x] **CSS 架构重构**: 模块化 Tailwind v4 配置，解决 CSS
      Module 引用问题。
- [x] **工程化配置**: 完善的代码规范检查与提交约束。
- [x] **静态资源**: 完成 Favicon/Logo 配置。
- [x] **UI 组件开发**: 弹窗组件、表单组件、折叠面板组件。
- [x] **博客编辑功能**: 拦截路由弹窗编辑，玻璃拟态样式。`(Mock Data)`
- [ ] **后端 API 对接**: 待开始...
- [ ] **博客详情页**: 待开始...

## 🛠️ 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000)
查看项目。
