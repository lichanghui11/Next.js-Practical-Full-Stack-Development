# Suspense 与骨架屏

本文记录博客列表页的骨架屏显示策略，以及 Suspense 的生效条件和常见坑点。

## 使用位置

### 路由级骨架屏（推荐）

在 App Router 中，页面段的 `loading.tsx` 会在该段加载时自动展示：

- 位置：`src/app/(pages)/blog/loading.tsx`
- 适用场景：首屏加载、路由跳转、服务端流式渲染未完成时
- 优点：无需额外包裹组件，框架自动处理

如果需要和列表位置一致，建议在 `loading.tsx` 中使用与列表相同的容器样式。

### Suspense 级骨架屏

`Suspense` 的 `fallback` 只会在其子树发生挂起（suspend）时触发：

- 数据请求必须发生在 `Suspense` 包裹的子组件内部
- 如果在 `Suspense` 之外先 `await` 了数据，`fallback` 不会显示

常见用法是把列表渲染拆成子组件，再用 `Suspense` 包裹它。

## 常见坑点

- `await setTimeout(() => {}, 3000)` 不会挂起渲染，因为它不是 Promise
- 只有子组件真正挂起时，`Suspense` 的 `fallback` 才会出现
- 骨架与列表不对齐，通常是容器宽度与内边距不一致导致的

## 相关文件

- 骨架组件：`src/app/_components/skeleton/index.tsx`
- 列表页：`src/app/(pages)/blog/page.tsx`
- 路由骨架：`src/app/(pages)/blog/loading.tsx`
