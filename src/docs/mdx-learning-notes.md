# MDX 功能开发学习笔记总结

基于项目实践和对话记录，整理 MDX 渲染系统的核心知识点。

---

## 一、MDX 三阶段处理模型

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

## 二、remark vs rehype 插件职责

| 阶段 | 操作对象 | 典型用途 |
|------|----------|----------|
| **remark** | Markdown AST | 语法扩展（GFM 表格、admonition） |
| **rehype** | HTML AST | DOM 结构改造、代码高亮 |

**记忆法**：remark 管"语义"，rehype 管"结构"。

### 实践：插件执行顺序

```typescript
// plugins.ts
export const mdxPlugins = {
  rehypePlugins: [
    rehypeCodeWindow,  // 先包装结构
    [rehypePrism, {}],  // 再进行高亮
  ],
  remarkPlugins: [remarkGfm],
};
```

**关键发现**：插件顺序决定处理结果！

---

## 三、rehypeCodeWindow 插件：DOM Contract 设计

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
    <div class="window-controls">
      <span class="control close"></span>
      <span class="control minimize"></span>
      <span class="control maximize"></span>
    </div>
    <span class="code-lang">TypeScript</span>
  </div>
  <div class="code-content">
    <pre><code>...</code></pre>
  </div>
</div>
```

### 语言提取逻辑改进

```typescript
// 1. 优先从 <pre> 获取
const preClasses = node.properties?.className;
// 2. 失败则从嵌套 <code> 获取
const codeNode = node.children.find(c => c.tagName === 'code');
// 3. 格式化：typescript → Typescript
const formatted = lang.charAt(0).toUpperCase() + lang.slice(1);
```

---

## 四、客户端增强：useCodeWindow Hook

### 职责分离

| 层 | 职责 |
|---|---|
| **rehype 插件** | 编译期生成静态结构 |
| **useCodeWindow** | 运行期注入交互能力 |

### 关键实现

```tsx
export const useCodeWindow = (ref, content) => {
  useEffect(() => {
    const wrapperEls = ref.current.querySelectorAll('.code-window');
    wrapperEls.forEach((el) => {
      const header = el.querySelector('.code-header');
      // 动态创建工具栏
      const toolsEl = document.createElement('div');
      toolsEl.className = 'code-tools';
      // 用 createRoot 挂载 React 组件
      createRoot(toolsEl).render(<CopyButton wrapperEl={el} />);
      header.appendChild(toolsEl);
    });
  }, [content]);
};
```

### 踩坑：ESLint set-state-in-effect

**问题**：在 effect 中同步调用 setState 导致级联渲染

#### 什么是级联渲染？

```
组件渲染 → useEffect 执行 → setState → 组件再次渲染 → useEffect 再次执行 → ...
```

**级联渲染**（Cascading Renders）是指：
1. React 完成一次渲染
2. `useEffect` 同步执行并调用 `setState`
3. 状态变化触发**立即重新渲染**
4. 新渲染完成后，`useEffect` 可能再次执行
5. 循环往复，造成性能问题

**影响**：
- 用户可能看到闪烁（多次重绘）
- 浪费 CPU 资源
- 严重时导致无限循环

#### 错误写法

```tsx
// ❌ 两个 effect + 中间状态
const [wrapperEls, setWrapperEls] = useState([]);

useEffect(() => {
  const els = ref.current.querySelectorAll('.code-window');
  setWrapperEls(els);  // 触发重新渲染
}, [content]);

useEffect(() => {
  wrapperEls.forEach(el => {
    // 操作 DOM
  });
}, [wrapperEls]);  // 依赖上一个 effect 的结果
```

#### 解决方案

**方案 1**：合并为单一 effect，直接操作 DOM

```tsx
// ✅ 单一 effect，不产生中间状态
useEffect(() => {
  const els = ref.current.querySelectorAll('.code-window');
  els.forEach(el => {
    // 直接操作 DOM，不需要 setState
  });
}, [content]);
```

**方案 2**：使用 `queueMicrotask` 延迟 setState

```tsx
// ✅ 延迟到下一个微任务，避免同步级联
useEffect(() => {
  queueMicrotask(() => {
    setHistoryLen(window.history.length);
  });
}, []);
```

**核心原则**：`useEffect` 应该用于"同步外部系统"，而不是"触发组件内部状态级联"。

---

## 五、Hydration Mismatch 问题

### 问题根源

```tsx
// ❌ 服务端与客户端返回不同值
const [historyLen] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.history.length;  // 客户端有值
  }
  return 0;  // 服务端返回 0
});
```

**结果**：`disabled` 属性服务端是 `true`，客户端是 `false`

### 解决方案

```tsx
const [historyLen, setHistoryLen] = useState(0);

useEffect(() => {
  queueMicrotask(() => {
    setHistoryLen(window.history.length);
  });
}, []);
```

**要点**：
1. 初始值保持一致（都是 0）
2. 挂载后通过 effect 获取真实值
3. `queueMicrotask` 避免 ESLint 警告

---

## 六、CSS 主题切换

### Prism 代码高亮主题

**问题**：Turbopack 不识别 `:global()` 语法

```css
/* ❌ CSS Modules 语法，全局 CSS 中不能用 */
:global(.dark) .code-window { ... }

/* ✅ 全局 CSS 直接用选择器 */
.dark .code-window { ... }
```

**核心理解**：
- `:global()` 只能在 `*.module.css` 中使用
- 全局 CSS 中直接写选择器

---

## 七、SerializeResult 类型处理

`SerializeResult` 是联合类型：

```typescript
type SerializeResult = 
  | { compiledSource: string; frontmatter: Record; scope: Record }
  | { error: Error; frontmatter: Record; scope: Record };
```

### 正确处理

```tsx
if ('error' in compiledSource && compiledSource.error) {
  setError(compiledSource.error);
  return;
}

if ('compiledSource' in compiledSource) {
  const result = hydrate({
    compiledSource: compiledSource.compiledSource,
    ...options,
  });
}
```

---

## 八、项目架构总览

```
src/app/_components/mdx/mdx-client/
├── serialize.ts          # 序列化（服务端）
├── mdx-hydration.tsx     # 水合（客户端）
├── render.tsx            # 渲染入口（服务端组件）
├── plugins.ts            # 插件配置
├── component.tsx         # MDX 组件覆盖
├── component.module.css  # 组件样式
├── custom-plugins/
│   └── rehype-code-window.ts
└── hooks/
    └── code-window.tsx   # 复制按钮增强
```

---

## 九、关键收获

### 架构思维
- **编译期 vs 运行期**：重逻辑放编译期，交互放运行期
- **DOM Contract**：插件生成结构，CSS/JS 消费

---

## 十、自定义 MDX 插件与组件

基于 `remark-directive`，实现了多个自定义指令。

### 插件架构

```
remark-directive          # 解析 directive 语法
    ↓
自定义 remark 插件        # 转换为组件节点
    ↓
React 组件               # 渲染实际 UI
```

### 文件结构

```
custom-plugins/
├── remark-admonition.ts   # 提示框
├── remark-bilibili.ts     # B站视频
├── remark-youtube.ts      # YouTube视频
└── remark-mark.ts         # 文字高亮

components/
├── admonition.tsx
├── bilibili.tsx
├── youtube.tsx
└── mark.tsx
```

---

### 1. Admonition 提示框

**语法**：容器指令 `:::type`

```markdown
:::note
这是一个注意提示
:::

:::tip
这是一个技巧提示
:::

:::warning
这是一个警告
:::

:::danger
这是一个危险警告
:::
```

**类型**：`note` | `tip` | `info` | `warning` | `danger`

---

### 2. Bilibili 视频嵌入

**语法**：叶子指令 `::bilibili{bvid=xxx}`

```markdown
<!-- 基础用法 -->
::bilibili{bvid=BV1xx411c7mD}

<!-- 自定义高度 -->
::bilibili{bvid=BV1xx411c7mD height=500}

<!-- 完整参数 -->
::bilibili{bvid=BV1xx411c7mD width=100% height=400 title="视频标题"}
```

**参数**：
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `bvid` | 必填 | B站视频 BV 号 |
| `width` | `100%` | 宽度 |
| `height` | `400` | 高度 |
| `title` | `Bilibili Video` | iframe 标题 |

---

### 3. YouTube 视频嵌入

**语法**：叶子指令 `::youtube{id=xxx}`

```markdown
<!-- 基础用法 -->
::youtube{id=dQw4w9WgXcQ}

<!-- 自定义高度 -->
::youtube{id=dQw4w9WgXcQ height=500}
```

**参数**：
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `id` | 必填 | YouTube 视频 ID |
| `width` | `100%` | 宽度 |
| `height` | `400` | 高度 |
| `title` | `YouTube Video` | iframe 标题 |

---

### 4. Mark 文字高亮

**语法**：文本指令 `:mark[文字]`

```markdown
<!-- 基础用法 -->
这是一段 :mark[高亮文字] 的示例

<!-- 自定义颜色 -->
这是 :mark[红色文字]{color=red} 示例

<!-- 自定义背景 -->
这是 :mark[自定义背景]{bg=#ffeb3b} 示例
```

**参数**：
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `color` | `inherit` | 文字颜色 |
| `bg` | 黄色渐变 | 背景色 |

---

### 插件开发模式

```typescript
// 1. 创建 remark 插件
const remarkMyPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === 'leafDirective' && node.name === 'myDirective') {
      node.data = {
        hName: 'MyComponent',        // 组件名
        hProperties: { ...attrs },   // props
      };
    }
  });
};

// 2. 创建 React 组件
export const MyComponent = (props) => <div {...props} />;

// 3. 注册插件（plugins.ts）
remarkPlugins: [remarkDirective, remarkMyPlugin, ...]

// 4. 注册组件（component.tsx）
export const mdxComponents = { ..., MyComponent };
```

---

### Directive 语法类型

| 类型 | 语法 | 用途 |
|------|------|------|
| **Container** | `:::name ... :::` | 块级内容（Admonition） |
| **Leaf** | `::name{attrs}` | 独立元素（视频嵌入） |
| **Text** | `:name[内容]{attrs}` | 行内元素（高亮文字） |

---

## 十一、TOC 目录组件与 CSS 高级技巧

### TOC 实现架构

**插件配置**：使用 `remark-flexible-toc` 自动生成目录

```typescript
// plugins.ts
remarkPlugins: [remarkFlexibleToc]

// mdx.serialization.config.ts
vfileDataIntoScope: ['toc', 'readingTime']
```

**组件分离**：

| 组件 | 职责 | 显示条件 |
|------|------|----------|
| `DesktopToc` | 桌面端侧边栏 | width > 768px |
| `MobileToc` | 移动端抽屉 | width ≤ 768px |
| `TocList` | 通用列表渲染 | 两者共用 |

### CSS Sticky 定位踩坑

**问题 1**：祖先元素 `overflow` 属性影响

```css
/* ❌ overflow: auto 会破坏 sticky */
body { overflow-y: auto; }

/* ✅ 设为 visible */
body { overflow-y: visible; }
```

**问题 2**：被 Header 遮挡

```css
/* ✅ 考虑 Header 高度 */
.toc {
  top: calc(60px + 1rem);
  max-height: calc(100vh - 60px - 2rem);
}
```

### CSS color-mix() 函数

处理颜色透明度的现代方案：

```css
/* ❌ HSL 语法对 OKLCH 变量无效 */
background-color: hsl(var(--background) / 70%);

/* ✅ 使用 color-mix */
background-color: color-mix(in srgb, var(--background) 70%, transparent 30%);
```

**应用**：Header 滚动渐变效果

```css
.header {
  background-color: color-mix(in srgb, var(--background) 70%, transparent 30%);
  transition: background-color 300ms ease-in-out;
}

.headerScrolled {
  background-color: color-mix(in srgb, var(--background) 90%, transparent 10%);
}
```

### CSS inset 属性

`inset: 0` = `top: 0; right: 0; bottom: 0; left: 0;`

```css
.overlay {
  position: fixed;
  inset: 0;  /* 四边锚定，自动填充宽高 */
}
```

**优势**：不需显式设置 `width/height`，浏览器自动计算

---

## 十二、层叠上下文（Stacking Context）

### 核心问题

**z-index 只在同一层叠上下文中比较**

```html
<body>
  <header z-index="40"></header>
  <main z-index="10">
    <!-- 即使设 z-index: 999，也低于 header -->
    <div class="toc" z-index="999"></div>
  </main>
</body>
```

### 创建层叠上下文的属性

```css
/* 1. position + z-index */
position: relative; z-index: 1;

/* 2. fixed/sticky 自动创建 */
position: fixed;

/* 3. transform/filter/backdrop-filter */
transform: translateX(0);
backdrop-filter: blur(10px);

/* 4. opacity < 1 */
opacity: 0.99;

/* 5. will-change */
will-change: transform;
```

### 解决方案

**React Portal**：脱离 DOM 层级限制

```tsx
import { createPortal } from 'react-dom';

const MobileToc = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="toc">...</div>,
    document.body
  );
};
```

**Portal 使用场景**：

| 场景 | 是否需要 | 原因 |
|-----|---------|------|
| Modal/Drawer | 是 | 全屏遮罩，避免层叠上下文 |
| Tooltip | 是 | 溢出容器，需要 fixed 定位 |
| Dropdown | 视情况 | 容器有 overflow: hidden 时需要 |

---

## 待办事项（TODO）

### 顶部 Header 优化

- [ ] 完善 Header 滚动动画效果
- [ ] 调整移动端 Header 布局
- [ ] 优化深色模式过渡

### 移动端目录按钮

- [ ] 实现打开/关闭状态的图标旋转动画
- [ ] 优化按钮位置和大小
- [ ] 添加触觉反馈（振动）

### PC 端目录

- [ ] 实现桌面端 TOC 完整的 sticky 定位
- [ ] 优化目录高度自适应算法
- [ ] 添加平滑滚动到章节功能

### 其他改进

- [ ] Admonition 插件集成（remark-directive）
- [ ] MDX 组件库复用机制
- [ ] 服务端实时预览架构