# 博客系统架构文档

## 概述

博客系统经过组件重构和迁移，采用模块化设计，实现了博客的创建、编辑、列表展示、详情查看等完整功能。系统使用 Next.js App Router 的文件路由和服务端组件特性。

## 文件路由结构

### 路由配置

```
src/app/(pages)/blog/
├── [[...categories]]/page.tsx    # 博客列表页（支持分类过滤）
├── posts/[item]/page.tsx          # 博客详情页
├── create/page.tsx                # 创建博客页
├── edit/[id]/page.tsx             # 编辑博客页
├── layout.tsx                     # 博客布局
└── loading.tsx                    # 加载状态
```

### 路由说明

#### 1. 博客列表页 `[[...categories]]/page.tsx`

**路由模式**: 可选捕获所有路由（Optional Catch-all Routes）

**支持的 URL 格式**:

- `/blog` - 显示所有博客
- `/blog/frontend` - 显示 frontend 分类下的博客
- `/blog/frontend/react` - 显示 frontend/react 嵌套分类下的博客
- `/blog?tag=typescript` - 按标签过滤
- `/blog?page=2&limit=10` - 分页参数

**参数接收**:

```typescript
{
  searchParams: { tag?, page?, limit? }
  params: { categories?: string[] }
}
```

#### 2. 博客详情页 `posts/[item]/page.tsx`

**路由模式**: 动态路由

**URL 格式**: `/blog/posts/{slug-or-id}`

**功能**:

- 支持通过 slug 或 id 访问文章
- 自动生成面包屑导航
- 显示文章元信息（标签、分类、更新时间）
- MDX 内容渲染

#### 3. 创建博客页 `create/page.tsx`

**URL**: `/blog/create`

**功能**: 使用统一的 `PostPageForm` 组件，type 为 `create`

#### 4. 编辑博客页 `edit/[id]/page.tsx`

**URL**: `/blog/edit/{id}`

**特性**:

- 使用 `force-dynamic` 强制 SSR
- 预加载文章数据传递给表单
- 使用统一的 `PostPageForm` 组件，type 为 `update`

## 组件封装架构

### 核心组件层级

```
BlogIndex (列表页)
├── BlogBreadcrumb (面包屑)
├── PostListItems (文章列表)
│   ├── PostListItemMotion (动画包装)
│   ├── TagLink (标签链接)
│   └── PostActions (操作按钮)
│       ├── PostEditButton
│       └── DeleteDialog
├── BlogListPagination (分页)
└── Sidebar (侧边栏)
    ├── CategoryTreeWidget (分类树)
    └── TagListWidget (标签列表)

BlogDetail (详情页)
├── BlogBreadcrumb (面包屑)
├── Image (缩略图)
├── MdxRenderer (MDX 渲染器)
└── PostEditButton (编辑按钮)

PostPageForm (表单页)
├── BlogForm (表单组件)
└── Button (保存按钮)
```

### 组件职责说明

#### 1. BlogIndex 组件

**位置**: `src/app/_components/blog/list/index.tsx`

**职责**:

- 接收路由参数（分类、标签、分页）
- 调用 API 获取博客列表数据
- 处理面包屑数据生成
- 协调子组件渲染

**数据流**:

```typescript
params + searchParams
  → getBreadcrumbCategories()
  → blogApi.list()
  → 渲染列表和侧边栏
```

#### 2. PostListItems 组件

**位置**: `src/app/_components/blog/list/items/index.tsx`

**职责**:

- 渲染博客卡片网格
- 显示文章标题、摘要、分类、标签
- 集成编辑/删除操作按钮

**特性**:

- 使用 CSS 变量设置背景图 `--bg-img`
- 支持标签高亮显示（activeTag）
- 响应式网格布局

#### 3. BlogDetail 组件

**位置**: `src/app/_components/blog/item/index.tsx`

**职责**:

- 通过 ID 获取文章详情
- 渲染文章头部（标题、元信息）
- 使用 MdxRenderer 渲染文章内容
- 显示缩略图和摘要

**元信息显示**:

- 更新时间（优先）或创建时间
- 标签列表（可点击跳转）
- 分类面包屑

#### 4. PostPageForm 组件

**位置**: `src/app/_components/blog/form/index.tsx`

**设计模式**: 命令式 API（useImperativeHandle）

**职责**:

- 封装创建和编辑的统一表单
- 通过 ref 暴露 `save()` 方法
- 管理保存状态（pending）

**使用方式**:

```typescript
// 创建模式
<PostPageForm />

// 编辑模式
<PostPageForm post={existingPost} />
```

#### 5. BlogBreadcrumb 组件

**位置**: `src/app/_components/blog/breadcrumb/index.tsx`

**职责**:

- 渲染面包屑导航
- 支持分类层级展示
- 支持标签显示

**数据结构**:

```typescript
interface IBlogBreadcrumbItem {
  id: string;
  link?: string;  // 有 link 则可点击
  text: string;
}
```

#### 6. Sidebar 组件

**位置**: `src/app/_components/blog/list/sidebar/index.tsx`

**职责**:

- 显示分类树（CategoryTreeWidget）
- 显示标签列表（TagListWidget）
- 高亮当前激活的分类和标签

## 核心功能实现

### 1. 分类系统

**嵌套分类支持**:

- 使用 `getBreadcrumbCategories()` 验证分类路径
- 通过最后一个分类 ID 查询完整分类链
- 验证 URL 分类顺序与数据库一致性

**实现逻辑** (`src/app/_components/blog/utils.ts`):

```typescript
// 输入: ['frontend', 'react']
// 输出: [{ id, name, slug }, { id, name, slug }]
// 验证: URL 顺序必须与数据库父子关系一致
```

### 2. 标签系统

**标签过滤**:

- 通过 URL query 参数 `?tag=xxx` 过滤
- 标签列表显示在侧边栏
- 支持标签高亮显示

**标签链接**:

- 列表页: 点击标签跳转到 `/blog?tag=xxx`
- 详情页: 点击标签跳转到 `/blog?tag=xxx`

### 3. 分页系统

**组件**: `BlogListPagination`

**实现**:

- 基于 API 返回的 meta 数据
- 支持页码跳转
- 自动隐藏单页情况

**Meta 数据结构**:

```typescript
{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
```

### 4. 面包屑生成

**两种模式**:

1. **breadcrumb 模式** (默认):
   - 最后一项不可点击
   - 用于列表页

2. **post 模式**:
   - 所有项都可点击
   - 用于详情页

**生成函数**: `getBreadcrumbLinks()`

### 5. 表单系统

**命令式 API 设计**:

```typescript
// 父组件
const ref = useRef<BlogFormRef>(null);
const handleSave = () => ref.current?.save();

// 子组件
useImperativeHandle(ref, () => ({
  save: async () => { /* 保存逻辑 */ }
}));
```

**优势**:

- 父组件控制保存时机
- 统一的保存按钮状态管理
- 解耦表单逻辑和 UI 控制

### 6. 操作按钮

**PostActions 组件**:

- 编辑按钮: 跳转到编辑页
- 删除按钮: 弹窗确认后删除

**权限控制**: 需要登录后才显示操作按钮

## 已知问题与遗留任务

### ⚠️ 重要问题：博客列表数据缺失

**问题描述**:
博客列表页面无法正确获取文章的标签（tags）和分类（categories）数据。

**影响范围**:

- 列表页文章卡片无法显示完整的标签和分类信息
- 可能导致前端渲染错误或数据不完整

**问题位置**:

- 文件: `src/app/_components/blog/list/index.tsx:34`
- API 调用: `blogApi.list()`

**可能原因**:

1. 后端 API 返回数据未包含关联的 tags 和 categories
2. 数据库查询未正确 join 关联表
3. 序列化过程中丢失了关联数据

**临时方案**:
当前列表页仍可显示，但标签和分类区域可能为空或显示不完整

**待解决**:

- [ ] 检查后端 `blogApi.list()` 的数据返回结构
- [ ] 确认数据库查询是否包含 `include` 关联查询
- [ ] 验证前端数据类型定义是否匹配
- [ ] 测试修复后的数据完整性

**相关代码**:

```typescript
// src/app/_components/blog/list/index.tsx:34-40
const result = await blogApi.list({
  page,
  limit,
  tag,
  category: lastCategory?.id,
  orderBy: 'desc',
});
```

## 技术特性

### 1. 服务端组件优先

**优势**:

- SEO 友好
- 首屏加载快
- 减少客户端 JavaScript

**使用场景**:

- 博客列表页（BlogIndex）
- 博客详情页（BlogDetail）
- 侧边栏组件（Sidebar）

### 2. 客户端组件

**使用场景**:

- 表单交互（BlogForm）
- 动画效果（PostListItemMotion）
- 面包屑导航（BlogBreadcrumb）

### 3. 数据获取策略

**API 层**:

- 统一的 `blogApi` 封装
- 错误处理和状态码检查
- 支持 SSR 和 CSR

**缓存策略**:

- 列表页: 默认缓存
- 详情页: 默认缓存
- 编辑页: `force-dynamic` 强制 SSR

### 4. 错误处理

**404 处理**:

```typescript
if (result.status === 404) return notFound();
```

**重定向**:

```typescript
if (currentPage > totalPages) return redirect('/');
```

**错误抛出**:

```typescript
if (!result.ok) throw new Error(message);
```

## 样式架构

### CSS Modules

**命名规范**:

- 文件名: `style.module.css`
- 类名: camelCase

**使用示例**:

```typescript
import $styles from './style.module.css';
<div className={$styles.blogCard} />
```

### Tailwind CSS

**使用场景**:

- 快速布局和间距
- 响应式设计
- 状态变化（hover、active）

### 组合使用

```typescript
<div className={cn($styles.container, 'page-container')} />
```

## 性能优化

1. **Suspense 边界**: 列表和详情页使用 Suspense 包裹
2. **骨架屏**: 提供加载状态反馈
3. **图片优化**: 使用 Next.js Image 组件
4. **动态导入**: 按需加载组件
5. **分页加载**: 限制单页数据量
