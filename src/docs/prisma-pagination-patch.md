# Prisma Pagination Patch 记录

## 背景

在使用 `prisma-extension-pagination` 进行分页时，Prisma 7.2 会因为显式传入 `undefined` 字段而抛出 `PrismaClientValidationError`。报错位置通常指向 `.next` 打包后的依赖代码，但根因在该第三方库内部。

## 触发原因

该库在 `count` 调用时合并了重置对象，里面包含显式 `undefined` 字段：

- `resetSelection`: `select/include/omit: undefined`
- `resetOrdering`: `orderBy: undefined`

Prisma 7.2 不允许显式 `undefined` 值，因此抛错。

## 修复方案（pnpm patch）

使用 `pnpm patch` 为依赖创建补丁，避免直接改 `node_modules`：

1) 创建补丁工作区

```bash
pnpm patch prisma-extension-pagination@0.7.6
```

2) 在补丁目录中修改文件

- `dist/helpers.js`
- 可选：`dist/helpers.d.ts`（类型同步）

将重置对象从“显式 undefined”改为空对象：

```js
exports.resetSelection = {};
exports.resetOrdering = {};
```

3) 提交补丁

```bash
pnpm patch-commit /path/to/tmp/pnpm-patch-XXXX
```

## 产物与落地

补丁提交后会产生：

- `patches/prisma-extension-pagination@0.7.6.patch`
- `package.json` 中新增 `pnpm.patchedDependencies`

后续 `pnpm install` 会自动应用补丁，无需再次手动修改依赖。

## 注意事项

- 升级 `prisma-extension-pagination` 版本后需要重新生成补丁。
- 如果 Prisma/插件后续发布了兼容版本，可以考虑移除补丁。
