# 分类 API 返回空数组问题排查与修复

## 问题描述

分类数据请求总是返回空数组，包括：
- `/api/categories` - 分类列表
- `/api/categories/tree` - 分类树

数据库中有数据，但 API 返回 `[]`。

## 问题排查过程

### 1. 数据库验证
```sql
SELECT * FROM categories LIMIT 5;
```
确认数据库中有 5 条分类数据，数据正常。

### 2. 发现的问题

#### 问题 1：Prisma Client 扩展拼写错误
**位置**：`src/database/client/app-client.ts:45`

```typescript
// ❌ 错误
return client.$extends({
  modal: {  // 拼写错误
    category: {
      async getAncestorChainWithSelf() { ... }
    }
  }
});

// ✅ 修复
return client.$extends({
  model: {  // 正确拼写
    category: {
      async getAncestorChainWithSelf() { ... }
    }
  }
});
```

**影响**：自定义的 Prisma 扩展方法没有正确注册，导致 `getAncestorChainWithSelf` 等方法无法使用。

#### 问题 2：路由匹配顺序错误
**位置**：`src/server/modules/category/category.route.ts`

```typescript
// ❌ 错误顺序
export const categoryApi = app
  .get('/:parentId?', ...)        // 通用路由在前
  .get('/tree/:parentId?', ...)   // 具体路由在后

// ✅ 修复顺序
export const categoryApi = app
  .get('/tree/:parentId?', ...)   // 具体路由在前
  .get('/:parentId?', ...)        // 通用路由在后
```

**影响**：访问 `/api/categories/tree` 时，被第一个路由 `/:parentId?` 匹配，`tree` 被当作 `parentId` 参数，导致查询不到数据。

#### 问题 3：API 文档占位符参数处理
**位置**：`src/server/modules/category/category.route.ts`

API 文档发送请求时，URL 中包含占位符 `{parentId}` 或字符串 `"undefined"`，需要过滤：

```typescript
// ✅ 修复
const validParentId =
  parentId && parentId !== 'undefined' && !parentId.includes('{')
    ? parentId
    : undefined;
```

## 修复方案

### 修复 1：更正 Prisma 扩展拼写
```typescript
// src/database/client/app-client.ts
return client.$extends({
  model: {  // modal → model
    category: { ... }
  }
});
```

### 修复 2：调整路由顺序
```typescript
// src/server/modules/category/category.route.ts
export const categoryApi = app
  .get('/tree/:parentId?', ...)      // 先匹配具体路径
  .get('/:parentId?', ...)           // 再匹配通用路径
  .get('/breadcrumb/:lastId', ...);
```

### 修复 3：过滤无效参数
```typescript
const validParentId =
  parentId && parentId !== 'undefined' && !parentId.includes('{')
    ? parentId
    : undefined;
```

## 验证结果

修复后测试：
```bash
curl http://localhost:3000/api/categories
# 返回 7 条数据

curl http://localhost:3000/api/categories/tree
# 返回 4 条树形数据
```

## 关键知识点

1. **Hono 路由匹配规则**：按注册顺序匹配，具体路径应在通用路径之前
2. **Prisma Client 扩展**：使用 `model` 而非 `modal`
3. **API 参数验证**：需要过滤 API 文档生成的占位符参数

## 相关文件

- `src/database/client/app-client.ts` - Prisma Client 配置
- `src/server/modules/category/category.route.ts` - 分类路由
- `src/database/repositories/category.repo.ts` - 分类数据仓库
