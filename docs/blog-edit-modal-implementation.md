# 博客编辑弹窗实现

## 功能概述

实现了一个用于编辑博客的弹窗组件，使用 Next.js 的拦截路由功能，当用户点击编辑按钮时，以弹窗形式展示编辑表单。

## 核心文件

```
(pages)/@modal/blog-edit/[id]/
├── page.tsx        # 拦截路由入口
└── blog-update.tsx # 编辑表单组件

_toturial-components/home/
├── modal/
│   ├── modal.tsx           # 弹窗 Provider
│   └── modal.module.css    # 弹窗样式
├── submit-form/
│   ├── blog-form.tsx       # 表单组件
│   └── blog-form.module.css
└── detail-summary/
    ├── detail-summary.tsx  # 折叠面板
    └── detail-summary.module.css
```

---

## 知识点

### 1. React Props 类型检查

**问题**：`Type '{ children: Element; }' is missing properties: title, matchedPath`

**原因**：组件定义了必需的 props，但使用时没有传递。

```tsx
// 类型定义
type ModalProps = PropsWithChildren<{
  title: string;        // 必需
  matchedPath: string[]; // 必需
  className?: string;   // 可选（有 ? 标记）
}>;

// 使用时必须传入 title 和 matchedPath
<ModalProvider title="编辑博客" matchedPath={['/blog-edit/*']}>
  <BlogUpdate id={id} />
</ModalProvider>
```

---

### 2. Next.js 15 动态路由参数

Next.js 15 中，页面组件的 `params` 变成了 Promise 类型：

```tsx
const Page: FC<{
  params: Promise<{ id: string }>;
}> = async ({ params }) => {
  const { id } = await params;
  // ...
};
```

---

### 3. CSS 玻璃拟态效果

```css
.dialogContent {
  /* 半透明渐变背景 */
  background: linear-gradient(
    135deg,
    oklch(100% 0 0deg / 95%) 0%,
    oklch(98% 0.002 240deg / 90%) 100%
  );
  /* 模糊效果 */
  backdrop-filter: blur(20px);
  /* 多层阴影 */
  box-shadow:
    0 25px 80px -12px oklch(20% 0.03 250deg / 25%),
    inset 0 1px 1px oklch(100% 0 0deg / 40%);
}
```

---

### 4. CSS 渐变文字

```css
.title {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

---

### 5. CSS Modules 暗色模式

使用 `:global()` 选择器匹配全局类名：

```css
:global(.dark) .dialogContent {
  background: oklch(18% 0.015 260deg / 95%);
}
```

---

### 6. Details 折叠动画

原生 `<details>` 标签不支持动画，需要手动控制：

```tsx
const openDetails = () => {
  detailsRef.current.setAttribute('open', '');
  contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
};

const closeDetails = () => {
  contentRef.current.style.maxHeight = '0';
  contentRef.current.addEventListener('transitionend', () => {
    detailsRef.current.removeAttribute('open');
  }, { once: true });
};
```

---

### 7. Husky 钩子 PATH 问题

**问题**：`pnpm: command not found`

**原因**：Git 钩子运行环境的 PATH 与终端不同。

**解决**：
```sh
#!/usr/bin/env sh
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
pnpm exec commitlint --edit "$1"
```

**关键点**：
- 使用 `which pnpm` 查看命令路径
- PATH 路径之间用 `:` 分隔
- PATH 指向目录，不是可执行文件

---

## oklch 颜色说明

```
oklch(L C H / A)
      │ │ │   └─ 透明度 (0-1 或 0%-100%)
      │ │ └───── 色相 (0-360deg)
      │ └─────── 色度 (0-0.4，越大越鲜艳)
      └────────── 亮度 (0%-100%)
```

示例：
- `oklch(100% 0 0deg)` = 纯白
- `oklch(0% 0 0deg)` = 纯黑
- `oklch(65% 0.2 260deg)` = 紫色
