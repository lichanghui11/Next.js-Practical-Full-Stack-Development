import { isNil } from 'lodash';

import type { BaseCategory, CategoryItem } from '@/server/modules/category/category.type';

// 这里是分类相关数据的数据仓库，封装对分类信息的相关数据库操作
import prismaClient from '../client/app-client';

// 树形结构 <--> 扁平结构 的转换，只在这个仓库中内部使用
const buildTree = (categories: BaseCategory[]): CategoryItem[] => {
  if (categories.length === 0) return [];
  // 按照路径长度排序，理论上 depth 越大的路径越长，根节点深度为1，路径最短
  // 这里将数据进行了复制，写逻辑的时候应该保证函数的纯粹性，不要更改输入的数据
  const sortedNodes = [...categories].sort((a, b) => a.path.length - b.path.length);
  const map: { [path: string]: CategoryItem } = {}; // 这里定义了一个节点映射到字符串路径的map
  const roots: CategoryItem[] = []; // 根节点数组，只有一个节点的时候这个数组长度为1

  // 开始构建这棵树
  for (const node of sortedNodes) {
    const currentNode: CategoryItem = { ...node };
    const path = currentNode.path;
    map[path] = currentNode;
    if (currentNode.depth === sortedNodes[0].depth) {
      // 如果当前节点是排序后的第一个节点，说明这个是一个根节点
      // 这里是可以处理多个根节点的，只要某个根节点的深度为1，就是根节点
      roots.push(currentNode);
    } else {
      // 子节点的处理 -> 找父节点并挂载
      const parentPath = currentNode.path.slice(0, -4);
      const parentNode = map[parentPath];
      if (parentNode) {
        // 这里要考虑还有其他子节点，不要直接把这个节点进行赋值
        parentNode.children = parentNode.children ?? [];
        parentNode.children.push(currentNode);
      }
    }
  }
  return roots;
};

/**
 *
 * @param roots
 * @returns 一个扁平数组
 */
const getFlatTree = (roots: CategoryItem[]): BaseCategory[] => {
  return roots.reduce((acc: BaseCategory[], item: CategoryItem) => {
    // 通过解构的方式，在扁平数组里面去掉 children 属性
    const { children, ...base } = item;
    if (!isNil(children)) {
      return [...acc, base, ...getFlatTree(children)];
    }
    return [...acc, base];
  }, []);
};

const CategoryRepo = {
  /**
   *
   * @param parentId 参数是可选的，可以是 id || slug
   * @returns 返回的是扁平化的分类数组，
   * { id: "2", name: "课程", path: "00010001", depth: 2, numchild: 2 }[]，每份数据里面存了结构相关的信息
   */
  queryCategoryDescendants: async (parentId?: string): Promise<BaseCategory[]> => {
    // 传了 parentId ，获取这个指定的节点，否则获取所有根节点，根节点深度均为1
    const categories = await prismaClient.category.findMany({
      where: parentId ? { OR: [{ id: parentId }, { slug: parentId }] } : { depth: 1 },
    });
    const result = (
      await Promise.all(
        categories.map(async (category: BaseCategory) => {
          //findDescendants	所有直接 + 间接后代	❌ 不包含自己
          //findChildren	只有直接子节点	❌ 不包含自己
          //findAncestors	所有祖先节点	❌ 不包含自己
          const children = await prismaClient.category.findDescendants({
            where: { id: category.id },
          });
          // 返回节点自身 + 其所有子节点 [[A, B], [C, D], [E, F]
          return [category, ...(isNil(children) ? [] : children)];
        }),
      )
    ).reduce((acc: Array<BaseCategory>, item: Array<BaseCategory>) => {
      // [A, B, C, D, E, F]
      return [...acc, ...item];
    }, []);
    return result;
  },

  /**
   *
   * @param parentId
   * @returns 树结构组成的数组
   */
  queryCategoryTree: async (parentId?: string): Promise<CategoryItem[]> => {
    const categories = await CategoryRepo.queryCategoryDescendants(parentId);
    return buildTree(categories);
  },

  /**
   * 此处没有直接从数据库里面拿到扁平化的数组进行处理，（这里其实也可以使用path的内容来排序）
   * 而是先进行了树的构建，再进行扁平化，
   * 在扁平化的过程中用到了 DFS 算法，
   * 这个顺序是为了使层级关系表现一致，方便前端缩进展示
   *
   * @param parentId
   * @returns 返回的不带children属性的扁平数组
   */
  queryCategoryList: async (parentId?: string): Promise<BaseCategory[]> => {
    const trees = await CategoryRepo.queryCategoryTree(parentId);
    return getFlatTree(trees);
  },

  /**
   *
   * @param latest 某个分类节点的 id ,这个分类节点是这个链路上面的最后一个，所以这样起名
   * @returns
   */
  queryCategoryBreadcrumb: async (latest: string): Promise<BaseCategory[]> => {
    // 查出这个分类节点
    const category = await prismaClient.category.findFirst({
      where: { OR: [{ id: latest }, { slug: latest }] },
    });

    if (isNil(category)) {
      return [];
    }
    // 调用封装好的自定义方法
    const ancestors = await prismaClient.category.getAncestorChainWithSelf({
      where: { id: category.id },
    });
    return ancestors;
  },
};

export default CategoryRepo;

/**
 * 分类数据里面涉及到扁平数组和树的结构转换，
 * 这是常见的数据处理模式，行业的标准做法，
 * 在数据库存储的是“扁平结构”，关系型数据库天然适合存储扁平表，
 * 层级关系已经通过 path/depth/numchild 或某个表自己定义的逻辑进行硬编码了，
 * 但是前端需要的是“嵌套结构”，方便菜单、目录等的递归渲染
 *
 * 一个项目总体会分为三层：
 *  数据库（存的是扁平表）、
 *  服务端（这里可以按照业务逻辑把数据取出来进行转换，此处转换成了树状结构）、
 *  前端（拿到嵌套树，进行渲染）
 *
 */
