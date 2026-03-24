# MDX 功能开发学习笔记总结

基于项目实践和对话记录，整理 MDX 渲染系统的核心知识点、架构设计与工程实践。

> **注意**：本文档仅包含**架构与实现原理**。如需查看 MDX 写作语法，请参考 [MDX 语法格式说明](./mdx-syntax-guide.md)。

---

## 一、核心架构：MDX 三阶段处理模型

```
源文本（.md/.mdx）
      ↓ serialize（异步，服务端）
已编译结果（SerializeResult）
      ↓ hydrate（同步，客户端）
JSX.Element
      ↓ render（React 渲染）
页面显示
```

**核心理解**：序列化是"编译"，水合是"装配"，渲染是"显示"。

### 实践验证

在项目中实现了这个分离架构：

| 文件 | 阶段 | 运行环境 |
|------|------|----------|
| `serialize.ts` | serialize | Server (`'use server'`) |
| `mdx-hydration.tsx` | hydrate | Client (`'use client'`) |
| `render.tsx` | render | Server Component |

---

## 二、插件系统架构

### remark vs rehype 职责

| 阶段 | 操作对象 | 典型用途 |
|------|----------|----------|
| **remark** | Markdown AST | 语法扩展（GFM 表格、Admonition、Directive解析） |
| **rehype** | HTML AST | DOM 结构改造、代码高亮、添加属性 |

**记忆法**：remark 管"语义"，rehype 管"结构"。

### 插件执行顺序

```typescript
// plugins.ts
export const mdxPlugins = {
  rehypePlugins: [
    rehypeCodeWindow,  // 1. 先包装结构
    [rehypePrism, {}],  // 2. 再进行高亮
  ],
  remarkPlugins: [remarkGfm],
};
```

**关键发现**：插件顺序决定处理结果。例如代码高亮必须在代码块结构化之后或之前，取决于具体实现策略。

### 自定义插件开发模式

我们的自定义功能（Admonition, Video, Highlight）基于 `remark-directive` 实现。

**架构流向**：
```
remark-directive          # 解析 :::, ::, : 语法
    ↓
自定义 remark 插件        # 转换为 MDX 组件节点 (hName, hProperties)
    ↓
React 组件               # 运行时渲染实际 UI
```

**文件结构**：
```
custom-plugins/
├── remark-admonition.ts   
├── remark-bilibili.ts     
├── remark-youtube.ts      
└── remark-mark.ts         

components/ (客户端组件)
├── admonition.tsx
├── bilibili.tsx
├── youtube.tsx
└── mark.tsx
```

---

## 三、rehypeCodeWindow 插件设计：DOM Contract

### 核心理念

> ❌ 插件通过"匹配 class"生效  
> ✅ 插件"生成 class"供 CSS/JS 消费

这是**结构契约**（DOM Contract）思维：

```
rehype 插件 → 生成 DOM + class
    ↓
CSS / JS → 消费这些 class
```

### 生成的结构

```html
<div class="code-window">
  <div class="code-header">
    <div class="window-controls">...</div>
    <span class="code-lang">TypeScript</span>
  </div>
  <div class="code-content">
    <pre><code>...</code></pre>
  </div>
</div>
```

---

## 四、客户端增强 engineering

### useCodeWindow Hook

**职责分离**：
- **rehype 插件**：编译期生成静态结构（HTML/CSS）
- **useCodeWindow**：运行期注入动态交互能力（复制按钮）

### 复制按钮实现细节

使用了 `createRoot` 将 React 组件动态挂载到 DOM 节点中。

**移动端适配方案（Engineering Note）**：
- 项目中封装了 `useIsMobile` hook (`@/app/utils/browser`)。
- 复制按钮组件通过 JS 检测设备类型，并添加 `code-copy-mobile` 类。
- CSS 配合媒体查询或类名，实现"PC端Hover显示，移动端常驻显示"的交互策略。

---

## 五、关键工程问题与解决方案

### 1. ESLint set-state-in-effect 与级联渲染

**问题**：在 effect 中同步调用 setState 导致级联渲染（Cascading Renders）。

**错误模式**：
```tsx
useEffect(() => {
  const els = querySelector(...);
  setWrapperEls(els);  // ❌ 触发重新渲染 -> effect再次执行
}, [content]);
```

**解决方案**：
1. **单一 Effect**：直接在 effect 中操作 DOM，不存储中间状态。
2. **Microtask**：使用 `queueMicrotask` 延迟状态更新。

### 2. Hydration Mismatch

**问题**：`window` 对象在服务端不存在，导致服务端渲染结果（无）与客户端（有）不一致。

**解决方案**：
```tsx
const [val, setVal] = useState(INITIAL_VALUE); // 初始值保持一致

useEffect(() => {
  queueMicrotask(() => {
    setVal(window.value); // 仅在客户端更新
  });
}, []);
```

### 3. CSS 主题切换与 Turbopack

**知识点**：
- `:global()` 只能在 `*.module.css` 中使用。
- 全局 CSS 文件（如 `code-window.css`）中直接写选择器 `.dark .selector`。
- 本项目的 `code-window.css` 通过 `layout.tsx` -> `index.css` -> `mdx.css` 全局引入，因此可以直接使用类名，无需 CSS Modules。

### 4. SerializeResult 类型守卫

`SerializeResult` 是联合类型（成功或错误）。使用 Type Guard 进行处理：

```tsx
if ('error' in compiledSource && compiledSource.error) {
  // 处理错误
} else {
  // hydrate(compiledSource.compiledSource)
}
```

---

## 六、TOC 目录组件架构

**架构设计**：
- **插件**：`remark-flexible-toc` 提取目录数据。
- **渲染**：分离为 `DesktopToc` (Sticky Sidebar) 和 `MobileToc` (Fixed Drawer)。

### CSS 高级技巧

1. **Sticky 失效排查**：祖先元素不能有 `overflow: auto/hidden`。
2. **color-mix**：`background-color: color-mix(in srgb, var(--background) 70%, transparent 30%);` 实现透明度。
3. **inset**：`inset: 0` 等同于 `top/right/bottom/left: 0`。

### 层叠上下文 (Stacking Context) 问题

**现象**：TOC 的 z-index 再高也无法覆盖 Header。
**原因**：TOC 处于 Main 容器内，Header 处于 Body 下，Main 形成了新的层叠上下文。
**解决**：
- 移动端 TOC 使用 `position: fixed` 脱离文档流。
- 或者使用 React Portal 将组件渲染到 `document.body`。

---

## 七、问题排查日志 (Troubleshooting Log)

### 1. 移动端 TOC 遮挡问题 (Pointer Events)

**问题**：移动端 TOC 容器 `fixed` 且 `width: 100%`，收起时虽然透明不可见，但阻挡了下方页面交互（如复制按钮点击）。
**解决**：使用了 `pointer-events`。
- 收起时：`pointer-events: none`（允许点击穿透）。
- 展开时：`pointer-events: auto`。
- 按钮：始终 `pointer-events: auto`。

### 2. 复制按钮点击无效

**问题**：父容器 `.code-tools` 设置了 `pointer-events: none`，导致子元素按钮虽设置了 auto 但被中间层阻断。
**解决**：在中间层 `.code-copy-wrapper` 显式设置 `pointer-events: auto` 以恢复事件捕获。

---

## 八、待办事项 (ToDo)

* [ ] 顶部的 Header 组件 Sticky 效果优化
* [ ] PC 端 Toc 目录 Sticky 定位优化 (考虑 Portal)
* [ ] 返回按钮路由逻辑重构
* [ ] PC 端顶部菜单样式优化
* [ ] MDX 语法说明页面改用后端序列化渲染 (已列入计划)
* [ ] 移动端目录按钮交互样式设计