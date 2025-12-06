# Esti Blog 学习笔记

- 这是一个基于 Next.js 和 React 的博客项目学习实战。记录开发过程中的技术决策、架构思考以及踩过的坑。
- 以下的所有内容均为项目过程中的笔记和思考，随着项目的推进，内容可能与项目的实际情况有所出入。

## 📅 当前进度

- [x] **项目初始化**: 使用 `create-next-app` 搭建基础环境。
- [x] **CSS 架构重构**: 摒弃默认单文件样式，采用模块化 Tailwind 配置。
- [x] **静态资源配置**: 完成自定义 Favicon/Logo 的配置与排查。
- [ ] **UI 组件开发**: 待开始...

---

## 📝 学习重点与技术细节

### 1. 样式架构设计 (CSS Architecture)

为了避免 `globals.css` 变得难以维护，以及更好地适应 Tailwind
CSS 的扩展，我采用了**分层架构**来管理样式文件。

**目录结构**:

```text
app/styles/
├── index.css            # 样式入口文件，在 layout.tsx 中引入
├── app.css              # 应用级全局样式
├── tailwind.css         # Tailwind 指令入口
└── tailwind/
    ├── base.css         # 基础样式重置 (@layer base)
    └── utilities.css    # 自定义工具类 (@utility)
```

**关键实践**:

- **自定义工具类**: 在 `utilities.css` 中使用 `@utility` 指令定义语义化的类名（如 `page-container`,
  `page-blank`），保持 HTML 的整洁，同时享受 Tailwind 的原子化优势。
- **深色模式支持**: 在自定义工具类中直接编写 `html.dark & { ... }` 逻辑，确保组件自带深色模式适配。

## 🔧 工程化规范 (Engineering Standards)

为了模拟真实的团队开发体验，本项目配置了完整的代码规范和提交约束。

### 1. 代码质量与格式化 (Linting & Formatting)

- **ESLint**: 负责 JavaScript/TypeScript 的代码质量检查 (使用 `@antfu/eslint-config` +
  Next.js 规则)。
- **Stylelint**: 负责 CSS/Tailwind 样式的规范检查与排序。
- **Prettier**: 负责所有文件的代码格式化 (空格、缩进、引号等)。
- **自动化**: 配置了 `husky` 和 `lint-staged`，在 git
  commit 时会自动对**暂存区**的文件执行修复和格式化，确保入库代码不仅正确而且美观。

### 2. Git 提交规范 (Conventional Commits)

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/)
规范，提交信息必须符合以下格式：

```text
type(scope): description
```

**常用 Type 说明**:

- `feat`: 新功能 (feature)
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式调整 (不影响逻辑)
- `refactor`: 代码重构 (无新功能，无 bug 修复)
- `chore`: 构建过程或辅助工具的变动

**示例**:

- `feat(auth): 增加用户登录功能`
- `fix(style): 修复移动端布局错乱`
- `docs(readme): 更新工程化规范说明`

> 💡 详细规则可参考项目根目录下的 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 2. Next.js 静态资源与 Metadata 配置

在配置网站图标 (Favicon) 时，探索了 Next.js App Router 的两种机制。

**方案**: 手动配置模式虽然 Next.js 支持直接把 `icon.png` 扔进 `app/`
目录的“自动魔法”，为了保持目录整洁，我选择了将资源放在 `public/` 目录，并在代码中显式声明。

**代码实现 (`app/layout.tsx`)**:

```typescript
export const metadata: Metadata = {
  title: 'Esti blog',
  // ...
  icons: {
    icon: '/logo.png', // 引用 public/logo.png
  },
};
```

**⚠️ 踩坑记录**:

- **浏览器缓存陷阱**: 这里的图标更新非常容易被浏览器缓存。
- **解决方案**:
  1. 即使删除了旧的 `favicon.ico`，浏览器标签页可能依然显示旧图标。
  2. 必须使用 **强制刷新** (`Shift + Cmd + R` / `Ctrl + F5`)。
  3. 或者使用**无痕/隐私模式**进行验证。

---

## 🛠️ 常用命令

```bash
# 启动开发服务器
pnpm run dev
```
