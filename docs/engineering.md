# 工程化规范 (Engineering Standards)

为了模拟真实的团队开发体验，本项目配置了完整的代码规范和提交约束。

## 1. 代码质量与格式化 (Linting & Formatting)

- **ESLint**: 负责 JavaScript/TypeScript 的代码质量检查 (使用 `@antfu/eslint-config` +
  Next.js 规则)。
- **Stylelint**: 负责 CSS/Tailwind 样式的规范检查与排序。
- **Prettier**: 负责所有文件的代码格式化 (空格、缩进、引号等)。
- **自动化**: 配置了 `husky` 和 `lint-staged`，在 git
  commit 时会自动对**暂存区**的文件执行修复和格式化，确保入库代码不仅正确而且美观。

## 2. Git 提交规范 (Conventional Commits)

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

> 💡 详细规则可参考项目根目录下的 [CONTRIBUTING.md](../CONTRIBUTING.md)。
