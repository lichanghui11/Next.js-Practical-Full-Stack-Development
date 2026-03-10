import type { Category, Prisma } from '@prisma/client';

import { isNil } from 'lodash';

import { generateSlug } from '@/app/_components/blog-components/submit-form/utils';

import prisma from '../../client/admin-client';

type Item = Pick<Prisma.CategoryCreateInput, 'name'> & { children?: Item[] };
const data: Item[] = [
  { name: '技术文集', children: [{ name: '课程', children: [{ name: 'TS全栈开发' }] }] },
  { name: '创业笔记', children: [{ name: '码农创业记' }] },
  { name: '生活随笔' },
  { name: '探索世界' },
];

/**
 * 这个递归函数产生的副作用就是把数据存入数据库，并没有返回任何数据
 * @param item
 * @param parent
 */
const createCategory = async (item: Item, parent?: Category) => {
  let category: Category;
  const { name, children } = item;
  if (isNil(parent)) {
    // 创建根节点（没有父节点）
    // 这里创建节点的同时也已经把这个节点存进了数据库
    console.log(`Creating root: ${name}`);
    category = await prisma.category.createRoot({
      data: { name, slug: generateSlug(name) },
    });
    console.log(`Created root: ${name}, path: ${category.path}`);
  } else {
    // 创建子节点前，先从数据库重新获取父节点的最新状态
    // 因为父节点的 numchild 可能已经被之前的 createChild 更新了
    const freshParent = await prisma.category.findUnique({ where: { id: parent.id } });
    if (!freshParent) throw new Error(`Parent ${parent.name} not found`);

    console.log(
      `Creating child: ${name}, parent: ${freshParent.name}, numchild: ${freshParent.numchild}`,
    );
    category = await prisma.category.createChild({
      node: freshParent,
      data: { name, slug: generateSlug(name) },
    });
    console.log(`Created child: ${name}, path: ${category.path}`);
  }

  if (!isNil(children)) {
    for (const child of children) {
      await createCategory(child, category);
    }
  }
};
export const createSeedCategories = async () => {
  for (const item of data) {
    await createCategory(item);
  }
};
