# Prisma 数据表关联关系与 CRUD 操作指南

> 基于本项目的 Post、Tag、Category 三张表，系统讲解数据库关联关系的概念、Prisma 的实现方式、以及增删查改的完整操作。

---

## 一、三种关联关系

数据库表之间的关联关系只有三种，本项目全都用到了：

### 1. 一对多 / 多对一（Post ↔ Category）

一个分类下有多篇文章，一篇文章只属于一个分类。

```bash
Category (一)          Post (多)
┌──────────┐         ┌──────────────┐
│ id       │◄────────│ categoryId   │  (外键)
│ name     │         │ title        │
│ slug     │         │ content      │
│ posts[]  │         │ category     │  (虚拟关联字段)
└──────────┘         └──────────────┘
```

**Prisma Schema 定义**：

```prisma
model Post {
  categoryId  String?                                      // 真实的数据库列（外键）
  category    Category? @relation(fields: [categoryId], references: [id])
  //          ↑ 虚拟字段     ↑ 外键映射              ↑ 关联到 Category.id
}

model Category {
  id    String @id
  posts Post[]    // 反向关联：一个分类下的所有文章
}
```

**等价的 SQL**：

```sql
-- 创建表时
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),  -- 外键
  ...
);

-- 查询某分类下的文章
SELECT * FROM posts WHERE category_id = '分类ID';
```

### 2. 多对多（Post ↔ Tag）

一篇文章可以有多个标签，一个标签可以属于多篇文章。

```bash
Post (多)            中间表 (自动)         Tag (多)
┌──────────┐      ┌──────────────┐     ┌──────────┐
│ id       │◄─────│ postId       │     │ id       │
│ title    │      │ tagId        │────►│ text     │
│ tags[]   │      └──────────────┘     │ posts[]  │
└──────────┘      _post_to_tags        └──────────┘
```

**Prisma Schema 定义**：

```prisma
model Post {
  tags  Tag[]  @relation("post_to_tags")   // 多对多的一侧
}

model Tag {
  id    String @id
  text  String @unique
  posts Post[] @relation("post_to_tags")   // 多对多的另一侧
}
```

Prisma 会**自动创建中间表** `_post_to_tags`，你不需要手动管理。

**等价的 SQL**：

```sql
-- 中间表（Prisma 自动生成）
CREATE TABLE _post_to_tags (
  "A" UUID REFERENCES posts(id),   -- postId
  "B" UUID REFERENCES tags(id)     -- tagId
);

-- 查询某文章的所有标签
SELECT t.* FROM tags t
JOIN _post_to_tags pt ON t.id = pt."B"
WHERE pt."A" = '文章ID';

-- 查询含某标签的所有文章
SELECT p.* FROM posts p
JOIN _post_to_tags pt ON p.id = pt."A"
WHERE pt."B" = '标签ID';
```

#### 📖 SQL 语法拆解：关键字 vs 自定义名称

先看这条 SQL，搞清楚**哪些是 SQL 关键字，哪些是你自己取的名字**：

```sql
SELECT t.* FROM tags t JOIN _post_to_tags pt ON t.id = pt."B" WHERE pt."A" = 'post-1';
```

| 词                  | 类型           | 含义                                               |
| ------------------- | -------------- | -------------------------------------------------- |
| `SELECT`            | **SQL 关键字** | 选择要返回的列                                     |
| `t.*`               | 自定义         | `t` 是别名（见下方），`.*` 表示该表的所有列        |
| `FROM`              | **SQL 关键字** | 指定从哪张表查                                     |
| `tags`              | 自定义（表名） | 数据库里的 tags 表                                 |
| `t`                 | 自定义（别名） | 给 tags 表取个短名，后面用 `t.xxx` 代替 `tags.xxx` |
| `JOIN`              | **SQL 关键字** | 把另一张表拼接进来                                 |
| `_post_to_tags`     | 自定义（表名） | 中间表                                             |
| `pt`                | 自定义（别名） | 给中间表取的短名                                   |
| `ON`                | **SQL 关键字** | 指定两张表的拼接条件                               |
| `t.id = pt."B"`     | 自定义（条件） | tags 的 id 列 = 中间表的 B 列                      |
| `WHERE`             | **SQL 关键字** | 过滤条件                                           |
| `pt."A" = 'post-1'` | 自定义（条件） | 中间表的 A 列 = 指定的文章 ID                      |

> 💡 **简单记忆**：大写的都是 SQL 关键字（`SELECT`, `FROM`, `JOIN`, `ON`,
> `WHERE`），小写的都是你自己定义的表名、别名、列名。

### 3. 自关联 / 树形结构（Category 的父子关系）

本项目的 Category 使用 Materialized Path（物化路径）实现树形结构，通过 `prisma-extension-bark`
插件管理。

```bash
Category
┌──────────────────┐
│ id               │
│ name: "前端"      │
│ path: "0001"     │  ← 物化路径，标识在树中的位置
│ depth: 1         │
│ numchild: 2      │
├──────────────────┤
│ id               │
│ name: "React"    │
│ path: "00010001" │  ← 路径表示它是"0001"的子节点
│ depth: 2         │
│ numchild: 0      │
└──────────────────┘
```

---

## 二、查询中的关联操作

### 标量字段 vs 关联字段

理解这个区别是关键：

| 类型     | 例子                             | 数据库中                | 能直接传值？      |
| -------- | -------------------------------- | ----------------------- | ----------------- |
| 标量字段 | `title`, `content`, `categoryId` | 真实存在的列            | ✅ 可以           |
| 关联字段 | `category`, `tags`               | 不存在，Prisma 虚拟管理 | ❌ 必须用关联语法 |

### `include`：加载关联数据

默认查询只返回标量字段，关联数据需要用 `include` 主动加载：

```typescript
// ❌ 不带 include — 只有标量字段
const post = await prisma.post.findFirst({ where: { id } });
// post = { id, title, content, categoryId: "abc", ... }
// post.category → undefined
// post.tags → undefined

// ✅ 带 include — 关联数据也查出来了
const post = await prisma.post.findFirst({
  where: { id },
  include: {
    category: true, // 把关联的 Category 记录也查出来
    tags: true, // 把关联的 Tag 记录也查出来
  },
});
// post.category → { id: "abc", name: "前端", slug: "frontend", ... }
// post.tags → [{ id: "1", text: "React" }, { id: "2", text: "TypeScript" }]
```

**等价 SQL**：

```sql
-- 不带 include
SELECT * FROM posts WHERE id = '...';

-- 带 include: { category: true }（Prisma 内部会执行类似的 JOIN 或子查询）
SELECT p.*, c.* FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.id = '...';

-- 带 include: { tags: true }
SELECT p.*, t.* FROM posts p
LEFT JOIN _post_to_tags pt ON p.id = pt."A"
LEFT JOIN tags t ON pt."B" = t.id
WHERE p.id = '...';
```

### `omit`：排除不需要的字段

```typescript
const post = await prisma.post.findFirst({
  where: { id },
  omit: {
    categoryId: true, // 不返回外键（前端不需要）
    body: true, // 列表页不需要正文
  },
});
```

### 关联过滤：`some`、`every`、`none`

用于通过关联数据来过滤主表记录：

```typescript
// 查找"至少有一个标签叫 React"的文章
const posts = await prisma.post.findMany({
  where: {
    tags: {
      some: { text: 'React' }, // 至少有一个匹配
    },
  },
});

// 其他过滤方式：
// every: { text: "React" }   → 所有标签都叫 React（不常用）
// none: { text: "Draft" }    → 没有任何标签叫 Draft
```

**等价 SQL**：

```sql
-- some: 至少有一个标签匹配
SELECT p.* FROM posts p
WHERE EXISTS (
  SELECT 1 FROM _post_to_tags pt
  JOIN tags t ON pt."B" = t.id
  WHERE pt."A" = p.id AND t.text = 'React'
);
```

### `in` 操作符：匹配列表中的任意值

```typescript
// 查找 categoryId 在指定列表中的文章
const posts = await prisma.post.findMany({
  where: {
    categoryId: { in: ['id1', 'id2', 'id3'] },
  },
});
```

**等价 SQL**：

```sql
SELECT * FROM posts WHERE category_id IN ('id1', 'id2', 'id3');
```

---

## 三、写入中的关联操作

这是最容易混淆的部分。前端传来的是"扁平数据"，但 Prisma 要求用**关联操作语法**。

### 新增（Create）

```typescript
// 前端传来的数据
{ title: "Hello", content: "...", tags: [{id: "1", text: "React"}], categoryId: "abc" }

// 需要转换成 Prisma 的格式
await prisma.post.create({
  data: {
    title: "Hello",
    content: "...",

    // ❌ 不能这样写
    // categoryId: "abc",
    // tags: [{id: "1", text: "React"}],

    // ✅ 多对一：connect — 关联到已存在的记录
    category: {
      connect: { id: "abc" },
    },

    // ✅ 多对多：connectOrCreate — 存在就关联，不存在就创建
    tags: {
      connectOrCreate: [
        { where: { id: "1" }, create: { text: "React" } },
      ],
    },
  },
});
```

**等价 SQL**：

```sql
-- 插入文章（带外键）
INSERT INTO posts (id, title, content, category_id)
VALUES (uuid(), 'Hello', '...', 'abc');

-- 检查标签是否存在，不存在则创建
INSERT INTO tags (id, text) VALUES ('1', 'React') ON CONFLICT DO NOTHING;

-- 建立多对多关联
INSERT INTO _post_to_tags ("A", "B") VALUES ('新文章id', '1');
```

### 更新（Update）

更新时多对多关系需要先清空再重建：

```typescript
await prisma.post.update({
  where: { id: '文章id' },
  data: {
    title: '新标题',

    // 更新分类
    category: {
      connect: { id: '新分类id' },
    },

    // 更新标签 — 注意 set: [] 清空旧关联
    tags: {
      set: [], // 第一步：清空中间表中该文章的所有关联
      connectOrCreate: [
        // 第二步：建立新关联
        { where: { id: '1' }, create: { text: 'React' } },
        { where: { id: '2' }, create: { text: 'Next.js' } },
      ],
    },
  },
});
```

**等价 SQL**：

```sql
-- 更新文章标量字段
UPDATE posts SET title = '新标题', category_id = '新分类id' WHERE id = '文章id';

-- 清空旧的标签关联
DELETE FROM _post_to_tags WHERE "A" = '文章id';

-- 确保标签存在
INSERT INTO tags (id, text) VALUES ('1', 'React') ON CONFLICT DO NOTHING;
INSERT INTO tags (id, text) VALUES ('2', 'Next.js') ON CONFLICT DO NOTHING;

-- 建立新关联
INSERT INTO _post_to_tags ("A", "B") VALUES ('文章id', '1');
INSERT INTO _post_to_tags ("A", "B") VALUES ('文章id', '2');
```

### 为什么更新需要 `set: []` 而创建不需要？

| 操作 | 中间表初始状态           | 不清空的后果           |
| ---- | ------------------------ | ---------------------- |
| 创建 | 空（新文章没有任何关联） | 不会有问题             |
| 更新 | 已有旧关联               | 新标签会追加而不是替换 |

### 删除（Delete）

```typescript
// Prisma 会自动处理中间表的关联删除
await prisma.post.delete({ where: { id } });
// 中间表 _post_to_tags 中该文章的关联记录会自动删除
// 但 Tag 记录本身不会被删除
```

**等价 SQL**：

```sql
-- Prisma 自动执行（级联删除中间表关联）
DELETE FROM _post_to_tags WHERE "A" = '文章id';
-- 然后删除文章本身
DELETE FROM posts WHERE id = '文章id';
-- 注意：tags 表中的标签记录不会被删除
```

---

## 四、Prisma 关联操作语法速查表

### 多对一（Post → Category）

| 语法                    | 含义                 | 使用场景                         |
| ----------------------- | -------------------- | -------------------------------- |
| `connect: { id }`       | 关联到已存在的记录   | 创建/更新文章时选择分类          |
| `disconnect: true`      | 解除关联（不删记录） | 取消文章的分类                   |
| `create: { name, ... }` | 创建新记录并关联     | 创建文章时同时创建新分类（少用） |

### 多对多（Post ↔ Tag）

| 语法                                 | 含义                     | 使用场景                         |
| ------------------------------------ | ------------------------ | -------------------------------- |
| `connect: [{ id }]`                  | 关联到已存在的记录       | 添加已有标签                     |
| `connectOrCreate: [{where, create}]` | 存在就关联，不存在就创建 | 前端传来的标签可能是新的         |
| `set: []`                            | 替换所有关联为空列表     | 更新前清空旧关联                 |
| `set: [{ id: "1" }, { id: "2" }]`    | 替换为指定列表           | 用已知 id 直接替换（不自动创建） |
| `disconnect: [{ id }]`               | 解除指定关联             | 移除某些标签但保留其他           |

---

## 五、本项目的查询模式总结

### 数据流转图

```bash
前端请求 → API 层 → Service 层 → Repository 层 → Prisma Client → 数据库
                                       ↓
                               omit 剥离关联字段
                               connect / connectOrCreate 构建关联语法
                               include 加载关联数据
                               getAncestorChain 附加面包屑
```

### 转译模式

每次写入操作都遵循这个模式：

```typescript
// 1. 剥离关联字段
const data = omit(input, ['tags', 'categoryId']);

// 2. 用关联语法重新构建
if (input.tags)       data.tags = { connectOrCreate: [...] };
if (input.categoryId) data.category = { connect: { id: ... } };

// 3. 执行操作
const result = await prisma.post.create({ data });

// 4. 重新查询返回完整数据（带 include + 面包屑）
return queryPostById(result.id);
```

### 动态 where 构建模式

每次查询操作根据传入参数按需构建过滤条件：

```typescript
const where = {};
if (tag) where.tags = { some: { text: tag } }; // 关联过滤
if (category) where.categoryId = { in: [...子孙分类ids] }; // 列表匹配
// 不传参数 → where = {} → 查全部
```

这种模式的好处是**一个函数适配多种查询场景**，避免为每种过滤条件写一个单独的查询函数。
