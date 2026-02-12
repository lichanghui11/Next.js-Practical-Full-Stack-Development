// 分类相关的请求和响应的数据结构体定义
import { z } from 'zod';

/**
 * 分类列表查询的请求数据结构
 *  API 示例:
 * GET /api/categories              → 返回所有根分类
 * GET /api/categories?parent=uuid  → 返回 uuid 下的子分类
 */
export const categoryListRequestParamsSchema = z.object({
  parentId: z.string().optional().meta({
    description: '父分类的 id ，不传则查询所有的根分类，传了查询这个 id 下面的直接子分类',
  }),
});

/**
 * 获取面包屑导航链，查询请求参数的数据结构
 * API 示例:
 * GET /api/categories/breadcrumb?lastId=uuid
 * → 返回: [Root, GrandParent, Parent, Current]
 */
export const categoryBreadcrumbRequestParamsSchema = z.object({
  lastId: z.string().meta({ description: '传入某个分类的 ID，返回从根节点到该分类的完整祖先链' }),
});

export const baseCategorySchema = z.object({
  id: z.string().meta({ description: '分类ID' }),
  name: z.string().meta({ description: '分类名称' }),
  slug: z.string().or(z.null()).meta({ description: '分类别名，一般是英文字母组成' }),
  path: z.string().meta({ description: '分类路径' }),
  depth: z.number().meta({ description: '分类深度' }),
  numchild: z.number().meta({ description: '子分类数量' }),
});

type Category = z.infer<typeof baseCategorySchema> & {
  children?: Category[]; // 这里的 Category 是递归引用自己;
};

/**
 * .extend() 在已有的 _baseCategorySchema 基础上添加新字段
 * z.ZodType<Category> 告诉 TS 这是 Category 类型(有递归时必须手动标注)
 * z.lazy() 是为了延迟求值，直接引用会报错，使用 lazy 后运行时才求值
 *
 * 分类查询的响应数据结构
 * 单个对象，有嵌套的 children 字段，查询单个分类详情及其子树
 */
export const categorySchema: z.ZodType<Category> = baseCategorySchema
  .extend({
    children: z
      // 这个函数在验证数据的时候才会调用，这个时候 categorySchema 已经定义完成了
      .lazy(() => z.array(categorySchema))
      .optional()
      .meta({ description: '子分类列表' }),
  })
  // id 为 OpenAPI 中的 Schema 名称（用于 $ref 引用）
  .meta({ description: '分类详情数据' });

/**
 * 分类列表查询响应数据结构
 * 扁平数组，没有嵌套的 children 字段，用于下拉选择器、表格等
 */
export const categoryListSchema = z.array(baseCategorySchema).meta({
  id: 'CategoryList',
  description: '分类列表数据，这是一个扁平数组，可以适用于下拉选择器，表格之类的用于显示这些分类',
});

/**
 * 分类树查询响应数据结构
 * 嵌套的数组，有嵌套的 children 字段，用于显示分类树，可以用于侧边栏菜单、树形管理等场景
 */
export const categoryTreeSchema = z.array(categorySchema).meta({
  id: 'CategoryTree',
  description:
    '分类树数据，这是一个嵌套的数组，有嵌套的 children 字段，用于显示分类树，可以用于侧边栏菜单、树形管理等场景',
});
