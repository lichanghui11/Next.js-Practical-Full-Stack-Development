# MDX 语法格式说明

本文档说明博客系统支持的 MDX 语法格式和自定义扩展。

---

## 📖 基础 Markdown 语法

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

**渲染效果**：
- 自动生成锚点 ID（通过 rehype-slug）
- 悬停显示 `#` 锚点链接（通过 rehype-autolink-headings）
- 自动加入 TOC 目录

### 段落与换行

```markdown
这是一个段落。

这是另一个段落。
```

### 强调

```markdown
*斜体* 或 _斜体_
**粗体** 或 __粗体__
***粗斜体*** 或 ___粗斜体___
~~删除线~~
```

### 列表

**无序列表**：
```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
```

**有序列表**：
```markdown
1. 第一项
2. 第二项
   1. 子项 2.1
   2. 子项 2.2
```

**任务列表**：
```markdown
- [x] 已完成任务
- [ ] 未完成任务
```

### 链接

```markdown
[链接文字](https://example.com)
[内部链接](/blog/post-id)
[锚点链接](#section-id)
```

**特性**：
- 外部链接自动添加 `target="_blank"` 和 `rel="noreferrer"`
- 内部链接使用 Next.js `<Link>` 组件
- 锚点链接支持平滑滚动

### 图片

```markdown
![图片描述](https://example.com/image.jpg)
![本地图片](/images/local.png)
```

**渲染效果**：
- 使用 Next.js `<Image>` 组件
- 自动优化和懒加载
- 支持响应式

### 引用

```markdown
> 这是一段引用文字
> 可以多行
>
> > 嵌套引用
```

---

## 📊 GFM 扩展语法

通过 `remark-gfm` 插件支持 GitHub Flavored Markdown。

### 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
```

**对齐方式**：
```markdown
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 左     | 中      | 右     |
```

**渲染效果**：
- 自动包裹在 `.tableWrapper` 容器中
- 响应式滚动（移动端）
- 自定义样式（斑马纹、边框）

### 脚注

```markdown
这是一个需要脚注的句子[^1]。

[^1]: 这是脚注内容。
```

### 自动链接

```markdown
https://www.example.com
user@example.com
```

---

## 💻 代码语法

### 行内代码

```markdown
使用 `const foo = 'bar'` 定义变量。
```

### 代码块

````markdown
```javascript
function hello() {
  console.log('Hello, World!');
}
```
````

**支持的语言**：
- JavaScript / TypeScript
- Python
- Java / C / C++
- HTML / CSS
- Shell / Bash
- JSON / YAML
- 等...（通过 Prism.js）

### 代码窗口（增强版）

代码块自动渲染为代码窗口，包含：

**功能**：
- **窗口装饰**：macOS 风格的红黄绿三色按钮
- **语言标签**：右上角显示编程语言
- **行号**：左侧自动显示行号
- **复制按钮**：右上角一键复制代码
- **语法高亮**：Prism.js 代码高亮（支持亮色/暗色主题）

**示例**：

````markdown
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
};
```
````

---

## 🎨 自定义 Directive 语法

通过 `remark-directive` 插件支持自定义指令。

### Admonition 提示框

**语法**：

```markdown
:::note
这是一个普通提示框
:::

:::tip
这是一个技巧提示框
:::

:::info
这是一个信息提示框
:::

:::warning
这是一个警告提示框
:::

:::danger
这是一个危险警告提示框
:::
```

**支持的类型**：
- `note` — 普通提示（蓝色）
- `tip` — 技巧提示（绿色）
- `info` — 信息提示（蓝色）
- `warning` — 警告（黄色）
- `danger` — 危险（红色）

**渲染效果**：
- 带图标（使用 lucide-react）
- 带背景色和边框
- 支持深色模式

### 文字高亮

**语法**：

```markdown
这是一段普通文字，:mark[这部分会被高亮]，然后继续普通文字。
```

**渲染效果**：
- 黄色背景高亮
- 支持深色模式（自动调整颜色）

### Bilibili 视频嵌入

**语法**：

```markdown
::bilibili{bvid=BV1xx411c7mD}
```

**参数**：
- `bvid` — Bilibili 视频的 BV 号（必需）

**渲染效果**：
- 16:9 响应式容器
- 内嵌 Bilibili 播放器

### YouTube 视频嵌入

**语法**：

```markdown
::youtube{id=dQw4w9WgXcQ}
```

**参数**：
- `id` — YouTube 视频 ID（必需）

**渲染效果**：
- 16:9 响应式容器
- 内嵌 YouTube 播放器

---

## 📑 自动功能

### 目录（TOC）

**自动生成**：通过 `remark-flexible-toc` 插件自动提取标题生成目录

**显示位置**：
- **桌面端**：右侧侧边栏，sticky 定位
- **移动端**：右侧抽屉，点击按钮打开

**功能**：
- 自动高亮当前阅读章节（IntersectionObserver）
- 点击平滑滚动到对应章节
- 支持多级标题（h2-h6）

### 阅读时间统计

**自动计算**：通过 `remark-reading-time` 插件自动统计

**显示内容**：
- 预计阅读时间（分钟）
- 字数统计

**显示位置**：文章顶部，目录上方

### 标题锚点

**自动生成**：
- 每个标题自动生成 ID（通过 rehype-slug）
- 悬停显示 `#` 锚点链接（通过 rehype-autolink-headings）

**用法**：
- 悬停在标题上会显示 `#` 图标
- 点击复制锚点链接

---

## 🔧 元数据（Frontmatter）

MDX 文件可以在顶部添加 YAML frontmatter：

```markdown
---
title: 文章标题
date: 2024-01-01
tags: [react, nextjs, mdx]
draft: false
---

# 正文开始...
```

**支持的字段**：
- `title` — 文章标题
- `date` — 发布日期
- `tags` — 标签数组
- `draft` — 是否草稿
- 等自定义字段...

---

## 💡 最佳实践

### 代码块语言标注

始终为代码块指定语言以获得最佳高亮效果：

````markdown
✅ 推荐
```typescript
const foo = 'bar';
```

❌ 不推荐
```
const foo = 'bar';
```
````

### 使用 Admonition 增强可读性

对于重要提示，使用 admonition 而不是普通引用：

```markdown
✅ 推荐
:::warning
这个操作不可逆，请谨慎！
:::

❌ 不推荐
> **警告**：这个操作不可逆，请谨慎！
```

### 视频嵌入而非链接

对于演示视频，直接嵌入而不是提供链接：

```markdown
✅ 推荐
::youtube{id=dQw4w9WgXcQ}

❌ 不推荐
观看演示视频：[点击这里](https://youtube.com/watch?v=dQw4w9WgXcQ)
```

---

## 🎯 完整示例

```markdown
---
title: MDX 完整功能演示
date: 2024-12-21
tags: [mdx, guide]
---

# MDX 完整功能演示

这篇文章展示了 MDX 的各种功能。

## 基础语法

这是一个段落，包含**粗体**和*斜体*文字。

### 代码示例

```typescript
interface Config {
  theme: 'light' | 'dark';
  language: string;
}
```

### 重要提示

:::warning
请在生产环境中谨慎使用此功能！
:::

## 视频演示

::youtube{id=dQw4w9WgXcQ}

## 总结

使用 :mark[MDX] 可以让文档更加生动！
```

---

## 📚 相关文档

- [MDX 官方文档](https://mdxjs.com/)
- [Remark 插件](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- [Rehype 插件](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md)
- [项目 MDX 学习笔记](./mdx-learning-notes.md)
