# 样式架构设计 (CSS Architecture)

为了避免 `globals.css` 变得难以维护，以及更好地适应 Tailwind
CSS 的扩展，我采用了**分层架构**来管理样式文件。

## 目录结构

```text
app/styles/
├── index.css            # 样式入口文件，在 layout.tsx 中引入
├── app.css              # 应用级全局样式
├── tailwind.css         # Tailwind 指令入口
└── tailwind/
    ├── base.css         # 基础样式重置 (@layer base)
    └── utilities.css    # 自定义工具类 (@utility)
```

## 关键实践

- **自定义工具类**: 在 `utilities.css` 中使用 `@utility` 指令定义语义化的类名（如 `page-container`,
  `page-blank`），保持 HTML 的整洁，同时享受 Tailwind 的原子化优势。
- **深色模式支持**: 在自定义工具类中直接编写 `html.dark & { ... }` 逻辑，确保组件自带深色模式适配。

## CSS 核心逻辑与模块化 (Deep Dive)

样式管理取自其他已有的项目，此处复用的基础上进行自己的改造，并理解其架构原理：

1.  **文件拆分是给人看的 (Separation for Maintainability)**
    - 分文件管理（theme.css, shadcn.css, base.css）本质上是为了方便阅读和维护。
    - 浏览器最终只认合并后的结果。

2.  **入口决定一切 (Entry Point Matters)**
    - 最终样式的生效，取决于它们在入口文件（如 `tailwind.css`）中的 `@import` 顺序。
    - 后引入的文件会拥有更高的优先级（Cascading）。

3.  **`:root` 是真正的全局 (Global Variables)**
    - 只要在任意一个被引入的 CSS 文件的 `:root` 中定义了变量（如 `--color-primary: red`）。
    - 这个变量在全站任何地方（包括 CSS Modules）都可以通过 `var(--color-primary)` 读取到。

4.  **`@theme` 是 Tailwind 专属的全局定义 (Theme Config)**
    - 在 Tailwind v4 中，非 `inline` 的 `@theme` 块相当于全局配置注册。
    - 一旦在 `theme.css` 中定义了 `--color-brand: blue`，整个项目里的 `@apply text-brand` 或
      `class="text-brand"` 都会自动生效。

5.  **模块化 (CSS Modules)**
    - 目的是解决组件间的类名冲突（局部作用域）。
    - 但模块内部依然可以引用全局的变量和配置。
    - **重要技巧**: 在 CSS Module 中使用 Tailwind v4，推荐使用 `package.json`
      中配置的 imports 别名（如
      `@reference "#tailwind.css"`）。这样既能保持引用路径简洁，也能确保能够访问到入口文件中汇聚的所有配置。

6.  **全局定义通用性 (Universality of Definitions)**
    - 在本项目架构中，定义的物理位置不影响其全局性。
    - **`:root` 变量**: 无论写在 `base.css`、`theme.css` 还是
      `shadcn.css`，只要该文件被引入，变量就是全局的。
    - **`@theme` & `@utility`**: 同理，在**任意**被引入的文件中定义的非 `inline`
      主题和工具类，均为全局可用。页面中任何地方只要引入了 CSS
      (Next.js 默认全局注入)，就可以直接使用这些类名。

7.  **CSS Module 命名规范 (Naming Convention)**
    - Next.js 默认不开启 CSS Module 的自动驼峰转换 (`kebab-case` → `camelCase`)。
    - **决策**: 为了避免复杂的 Webpack/Turbopack 配置 hack，统一在 CSS Module 文件中使用
      **驼峰命名法 (camelCase)**。
    - **Example**:
      - CSS: `.topBody { ... }`
      - JS: `import styles from './xx.module.css'; className={styles.topBody}`
