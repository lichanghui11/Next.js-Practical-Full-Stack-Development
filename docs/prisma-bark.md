# Prisma Bark 树形结构扩展学习笔记

这份笔记记录了在 `src/database/client/app-client.ts` 中接入 `prisma-extension-bark`
并基于它封装业务方法的过程与要点。目标是支持「分类树」这类层级结构，便于高效查询
祖先/后代、生成面包屑等。
> 无限分级指的是这棵树可以有无数子节点，一直往下延伸，并不是指循环嵌套

---

## 1. Bark 是什么

- Bark 实现的是 **Materialized Path（物化路径）** 模型
- 树形结构通过 `path` / `depth` / `numchild` 等字段"编码"在表内
- 优点是祖先/后代查询成本低，适合分类树、菜单、组织结构等场景

> **字段声明**：`path`、`depth`、`numchild` 这三个字段需要在对应的表（如 Category）中显式声明。

> **为什么查询成本低？**
>
> - 传统方式需要遍历树结构，涉及递归算法，时间/空间复杂度较高
> - 物化路径将每个节点的访问路径在**存储时就硬编码**下来
> - 查询时直接根据这个硬编码的路径获取数据，无需遍历树结构

---

## 2. 模型要求（以 Category 为例）

`Category` 模型满足 Bark 的最小字段要求：

```prisma
model Category {
  id       String @id @default(uuid())
  name     String @unique
  slug     String @unique
  path     String @unique   // Bark 必需
  depth    Int              // Bark 必需
  numchild Int    @default(0)  // Bark 必需

  posts    Post[]

  @@index([path])
  @@map("categories")
}
```

> **注意**：`path/depth/numchild` 是 Bark 扩展内部**固定约定**的字段名，不能随意修改。

---

## 3. Prisma Client 接入

在创建 Prisma Client 时挂载 Bark 扩展：

```ts
const client = new PrismaClient({ adapter })
  .$extends(withBark({ modelNames: ['category'] }));
```

`modelNames` 必须传 **Prisma Client 的模型名**（小写），不是数据库表名。

---

## 4. Bark 内置创建方法

### createRoot — 创建根节点

```ts
const root = await prisma.category.createRoot({
  data: { name: '技术文集', slug: 'tech' },
});
// 返回: { id, name, slug, path: '0001', depth: 1, numchild: 0 }
```

### createChild — 创建子节点

```ts
const child = await prisma.category.createChild({
  node: root,  // 父节点对象
  data: { name: '课程', slug: 'courses' },
});
// 返回: { id, name, slug, path: '00010001', depth: 2, numchild: 0 }
```

> `path` 和 `depth` 由 Bark 自动生成和维护，业务代码只需传入 `name` 和 `slug`。

---

## 5. 递归创建树形结构

### 数据结构定义

```ts
interface Item {
  name: string;
  children?: Item[];
}

const data: Item[] = [
  {
    name: '技术文集',
    children: [
      { name: '课程', children: [{ name: 'TS全栈开发' }, { name: 'React进阶' }] },
    ],
  },
];
```

### 递归函数实现

```ts
const createCategory = async (item: Item, parent?: Category) => {
  let category: Category;
  const { name, children } = item;

  if (isNil(parent)) {
    // 创建根节点
    category = await prisma.category.createRoot({
      data: { name, slug: generateSlug(name) },
    });
  } else {
    // ⚠️ 重要：必须重新从数据库获取父节点的最新状态
    const freshParent = await prisma.category.findUnique({ where: { id: parent.id } });
    if (!freshParent) throw new Error(`Parent ${parent.name} not found`);

    category = await prisma.category.createChild({
      node: freshParent,
      data: { name, slug: generateSlug(name) },
    });
  }

  // 递归处理子节点
  if (!isNil(children)) {
    for (const child of children) {
      await createCategory(child, category);
    }
  }
};
```

### 执行流程

| 步骤 | 操作 | 生成的 path |
|------|------|------------|
| 1 | 创建根节点「技术文集」 | `0001` |
| 2 | 创建子节点「课程」 | `00010001` |
| 3 | 创建孙节点「TS全栈开发」 | `000100010001` |
| 4 | 创建孙节点「React进阶」 | `000100010002` |

---

## 6. ⚠️ 常见坑点与解决方案

### 6.1 path 唯一约束冲突（深入解析）

**问题现象**：

```zsh
Unique constraint failed on the fields: (`path`)
```

#### Bark 的 path 生成规则

Bark 通过以下公式生成子节点的 path：

```text
子节点 path = 父节点 path + 格式化(numchild + 1)
```

#### `numchild` 是什么

`numchild` 是**数据库中当前已创建的直接子节点数量**，不是"将要创建的子节点数"。

| 概念 | 说明 |
|------|------|
| **输入数据的 `children` 数组** | 你**计划创建**的子节点列表（Item 对象里的） |
| **数据库的 `numchild` 字段** | **已经创建**的直接子节点数量（Bark 自动维护） |

#### 问题场景

假设要创建这样的树：

```text
技术文集
├── 课程
│   ├── TS全栈开发
│   └── React进阶    ← 在这里报错
```

#### 时间线对比

| 时间点 | 操作 | 数据库中「课程」的 numchild | 内存中 parent 对象的 numchild |
|--------|------|---------------------------|------------------------------|
| T1 | 创建「课程」| **0**（刚创建，还没有子节点）| **0** |
| T2 | 创建「TS全栈开发」| **1**（Bark 自动 +1）| 0（还是 T1 的快照）|
| T3 | 创建「React进阶」| 1 | 0（还是 T1 的快照）❌ |

#### 出错的流程（修复前）

```text
1. 创建「课程」
   → 返回: { path: '00010001', numchild: 0 }

2. 创建「TS全栈开发」，传入 parent = 课程（numchild: 0）
   → Bark 计算: path = '00010001' + '0001' = '000100010001'
   → 数据库更新: 课程.numchild = 1
   → ✅ 创建成功

3. 创建「React进阶」，传入 parent = 课程（还是旧对象，numchild: 0）
   → Bark 计算: path = '00010001' + '0001' = '000100010001'  ← 和上面重复！
   → ❌ Unique constraint failed
```

#### 正确的流程（修复后）

```text
3. 创建「React进阶」
   → 先查询: freshParent = 数据库中最新的「课程」{ numchild: 1 }
   → Bark 计算: path = '00010001' + '0002' = '000100010002'  ← 唯一的 path
   → ✅ 创建成功
```

#### 错误示例

```ts
// ❌ 错误：直接使用递归传入的 parent 对象
category = await prisma.category.createChild({
  node: parent,  // parent.numchild 是创建时的快照，已过时
  data: { name, slug },
});
```

#### 正确做法

```ts
// ✅ 正确：每次创建子节点前，重新从数据库获取父节点
const freshParent = await prisma.category.findUnique({ where: { id: parent.id } });
category = await prisma.category.createChild({
  node: freshParent,  // 包含最新的 numchild 值
  data: { name, slug },
});
```

#### 一句话总结

**Bark 依赖父节点的 `numchild` 计算子节点 path，但递归传递的对象是"创建时的快照"，不会自动反映数据库更新。每次 `createChild` 前都要重新查询父节点。**

### 6.2 Prisma 不允许显式 undefined

**问题现象**：

```zsh
Invalid value for argument `data`: explicitly `undefined` values are not allowed.
```

**原因**：Prisma 不允许传入显式的 `undefined` 值。

**解决方案**：

- 如果数据中可能有 `undefined`，需要预处理转换为 `null`
- 或者在代码中直接使用 `null` 替代 `undefined`

```ts
// ❌ 错误
{ summary: condition ? value : undefined }

// ✅ 正确
{ summary: condition ? value : null }
```

### 6.3 Seed 脚本清空表的方式

在开发阶段的 seed 脚本中，推荐使用原生 SQL `TRUNCATE` 彻底清空表：

```ts
await prisma.$executeRaw`TRUNCATE TABLE posts, categories, users, tags RESTART IDENTITY CASCADE`;
```

`TRUNCATE ... RESTART IDENTITY CASCADE` 会：

- 删除所有数据
- 重置自增序列（如果有）
- 级联处理有外键关系的表

> **替代方案**：本项目中也可以使用 `$truncate` 扩展方法或 `deleteMany()`，根据需要选择。

---

## 7. 业务侧封装方法

为了方便业务调用，可以在 `category` 上扩展便捷方法：

```ts
// 获取祖先链 + 当前节点（适合面包屑）
async getAncestorChainWithSelf(params) {
  const current = await client.category.findFirst({ where: params.where });
  if (isNil(current)) return [];
  const ancestors = await client.category.findAncestors({ where: { id: current.id } });
  return [...(ancestors || []), current];
}

// 获取后代集合 + 当前节点（适合树形展示）
async getDescendantTreeWithSelf(params) {
  const current = await client.category.findFirst({ where: params.where });
  if (isNil(current)) return [];
  const descendants = await client.category.findDescendants({ where: { id: current.id } });
  return [current, ...(descendants || [])];
}
```

---

## 8. 相关文件

| 文件 | 说明 |
|------|------|
| `src/database/client/admin-client.ts` | Seed 专用 Prisma Client |
| `src/database/client/app-client.ts` | 业务 Prisma Client |
| `src/database/prisma/models/category.prisma` | Category 模型定义 |
| `src/database/seed/seed-helpers.ts` | Seed 辅助函数 |
| `src/database/seed/index.ts` | Seed 入口 |
