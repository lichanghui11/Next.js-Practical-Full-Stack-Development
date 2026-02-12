// 这里是数据的仓库，数据层
// 封装增删查改的内部逻辑

import type { Post, Prisma } from '@prisma/client';

import { isNil, omit } from 'lodash';

import type { CategoryItem } from '@/server/modules/category/category.type';
import type { TagType } from '@/server/modules/tag/tag.type';

import { customMerge } from '@/app/utils/custom-merge';

import type { PageParams, PageResult } from '../types/pagination';

import { paginationAdapter } from '../adapters/pagination.adapter';
import prismaClient from '../client/app-client';

export type PostCreateInput = Omit<Prisma.PostCreateInput, 'thumb' | 'tags' | 'category'> & {
  tags?: TagType[];
  categoryId?: string;
};
export type PostUpdateInput = Omit<Prisma.PostUpdateInput, 'thumb' | 'tags' | 'category'> & {
  tags?: TagType[];
  categoryId?: string;
};

// 请求分页数据的参数的类型，加入了标签和分类的过滤条件
export type PostPaginationOptions = PageParams & {
  // 标签
  tag?: string;
  // 分类的ID或者slug
  category?: string;
};

// 查询一篇文章的默认请求参数
const defaultPostItemQueryOptions = {
  // 把 categoryId 这个标量字段从结果里去掉（不返回给前端）
  omit: {
    categoryId: true,
  },
  // 查询时把关联的 tags、category 一起带出来（类似 join/关联查询）
  include: {
    tags: true,
    category: true,
  },
} as const;

// 查询分页数据的默认请求参数，分页数据不需要 body
const defaultPostPaginationOptions = customMerge(defaultPostItemQueryOptions, {
  omit: { body: true },
});

const PostRepo = {
  /**
   * 查询文章列表
   * @param options 分页参数
   * @returns 分页结果
   *
   * 【学习笔记】prisma-extension-pagination 提供了两种 API 风格：
   *
   * 风格 1（本项目使用）：链式调用 .paginate().withPages()
   *   - .paginate() 里放 Prisma 原生参数（where、orderBy、include、omit 等）
   *   - .withPages() 里放分页参数（limit、page、includePageCount）
   *   - 返回值是元组 [数据数组, 元信息对象]，即 [Post[], { totalCount, pageCount, currentPage }]
   *   - 需要设置 includePageCount: true 才会返回 totalCount 和 pageCount（否则不做 count 查询以优化性能）
   *   - paginationAdapter 依赖 meta.totalCount 和 meta.pageCount 来计算 totalPages 等字段
   *
   * 风格 2（教程使用）：直接调用 .paginate({...})
   *   - 所有参数（Prisma 查询参数 + 分页参数）混在一起传入
   *   - 返回值是带 result 属性的对象 { result: [...], totalPages, ... }
   *   - 访问数据用 data.result，而不是 data[0]
   *
   * 两种风格底层做的事一样，只是 API 形式和返回值格式不同。
   */
  queryPosts: async (options: PostPaginationOptions): Promise<PageResult<Post>> => {
    console.log('进入 queryPosts, repositories post.repo.ts 查看参数：', options);
    const { tag, category, ...rest } = options;
    //    因为 tag/category 不是 Prisma 原生参数，需要手动转换成 where 条件
    const where: Prisma.PostWhereInput = {};
    if (!isNil(tag)) {
      where.tags = {
        some: {
          text: decodeURIComponent(tag),
        },
      };
    }
    if (!isNil(category)) {
      const categories = await prismaClient.category.getDescendantTreeWithSelf({
        where: { OR: [{ id: category }, { slug: decodeURIComponent(category) }] },
      });
      where.categoryId = { in: categories.map((it: CategoryItem) => it.id) };
    }
    const posts = await prismaClient.post
      .paginate({
        // Prisma 原生参数
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        ...where,
      })
      .withPages({
        includePageCount: true, // 必须开启，否则 paginationAdapter 拿不到 totalCount/pageCount
        // 分页专用参数
        ...defaultPostPaginationOptions,
        ...rest,
        limit: rest.limit || 10,
        page: rest.currentPage || 1,
      });

    for (let i = 0; i < posts[0].length; i++) {
      (posts[0][i] as ((typeof posts)[0] extends (infer ItemType)[] ? ItemType : never) & {
        categories: CategoryItem[];
      }) = {
        ...posts[0][i],
        categories: !isNil(posts[0][i].category?.id)
          ? await prismaClient.category.getAncestorChainWithSelf({
              where: { id: posts[0][i].category?.id },
            })
          : [],
      };
    }
    return paginationAdapter(posts);
  },

  // 根据 limit 查询数据的总页数，我的逻辑里面都使用了pageSize，含义和limit是一样的
  queryPostTotalPage: async (
    options: Omit<PostPaginationOptions, 'currentPage'>, // 只查总页数，不需要第几页的信息，所以下面默认给了第一页的参数 page: 1
  ): Promise<number> => {
    const [_, meta] = await prismaClient.post.paginate().withPages({
      limit: options.limit || 10,
      page: 1,
      includePageCount: true,
    });

    return meta.pageCount;
  },

  // 根据 id 或 slug  查询文章信息
  queryPostByIdOrSlug: async (item: string): Promise<Post | null> => {
    const post = await prismaClient.post.findFirst({
      where: {
        OR: [{ id: item }, { slug: item }],
      },
      ...defaultPostItemQueryOptions, // 这个默认参数里面有 tag category 相关的过滤信息
    });
    return post;
  },

  // 根据 Slug 查询文章信息
  queryPostBySlug: async (slug: string): Promise<Post | null | undefined> => {
    const post = await prismaClient.post.findUnique({
      where: {
        slug,
      },
      ...defaultPostItemQueryOptions,
    });
    // 如果查到了文章，就附加分类祖先链
    if (!isNil(post)) {
      return {
        ...post,
        categories: !isNil(post.category?.id) // 这里访问的是管理表 Category 的 id 字段，这个字段和 Post 表里面的 categoryId 是一样的
          ? await prismaClient.category.getAncestorChainWithSelf({
              where: { id: post.category?.id },
            })
          : [],
      };
    }

    return post;
  },

  // 新增文章
  addPost: async (post: PostCreateInput): Promise<Post | null> => {
    // ① 构建 Prisma 的 CreateInput 数据
    //    omit(post, ['tags', 'categoryId']) → 去掉 tags 和 categoryId
    //    因为 tags 是多对多关系、categoryId 是外键，不能直接塞进 create 里
    //    Prisma 要求用专门的关联操作语法（connectOrCreate / connect）来处理它们
    const createInput: Prisma.PostCreateInput = {
      ...omit(post, ['tags', 'categoryId']),
    };

    // ② 处理标签（多对多关系）
    if (!isNil(post.tags)) {
      createInput.tags = {
        // connectOrCreate：如果标签已存在就关联（connect），不存在就先创建再关联（create）
        // 这样前端传过来的标签不管是新的还是旧的，都能正确处理
        connectOrCreate: post.tags.map(({ id, text }) => ({
          where: { id }, // 用 id 查找是否已存在
          create: { text }, // 不存在则用 text 创建新标签
        })),
      };
    }

    // ③ 处理分类（多对一关系）
    if (!isNil(post.categoryId)) {
      createInput.category = {
        // connect：关联到一个已存在的分类，不创建新分类
        // 因为分类是预先创建好的，文章只是"选择"一个分类
        connect: { id: post.categoryId },
      };
    }

    // ④ 执行创建
    const newPost = await prismaClient.post.create({
      data: createInput,
    });

    // ⑤ 创建成功后，重新用 queryPostItemById 查一次
    //    为什么不直接返回 item？因为 create 返回的是裸数据，没有关联数据（tags, category, categories）
    //    重新查一次才能带上完整的关联数据返回给前端
    if (!isNil(newPost.id)) return PostRepo.queryPostByIdOrSlug(newPost.id);
    return newPost;
  },

  // 更新文章 (支持部分更新，只需要传入 id 和要更新的字段)
  updatePost: async (post: PostUpdateInput & { id: string }): Promise<Post | null> => {
    // ① 同样先去掉 tags 和 categoryId，剩余字段直接展开
    const updateInput: Prisma.PostUpdateInput = { ...omit(post, ['tags', 'categoryId']) };
    // ② 处理标签更新
    if (!isNil(post.tags)) {
      // set: [] 的含义
      // set: [] = 把当前所有关联设置为空列表 = 清空所有关联。
      // 它操作的是中间关联表（Prisma 自动管理的 _post_to_tags 表），不是 Tag 表本身：
      updateInput.tags = {
        set: [], // ← 关键！先把所有现有的标签关联清空
        //    如果不清空，新传的标签会"追加"而不是"替换"
        //    比如原来有 [React, Vue]，传入 [React, Next.js]
        //    不清空 → [React, Vue, Next.js]（错误）
        //    清空后 → [React, Next.js]（正确）
        connectOrCreate: post.tags.map(({ id, text }) => ({
          where: { id },
          create: { text },
        })),
      };
    }
    // ③ 处理分类更新（同创建逻辑）
    if (!isNil(post.categoryId)) {
      updateInput.category = {
        connect: { id: post.categoryId },
      };
    }
    // ④ 执行更新
    const updatedPost = await prismaClient.post.update({
      where: {
        id: post.id,
      },
      data: updateInput,
    });
    // ⑤ 同创建逻辑：重新查一次返回完整数据
    if (!isNil(updatedPost.id)) return PostRepo.queryPostByIdOrSlug(updatedPost.id);
    return updatedPost;
  },

  // 删除文章
  deletePost: async (id: string): Promise<Post | null> => {
    // ① 先查一次完整文章数据（带关联数据）
    //    为什么不直接删？因为 delete 之后数据就没了
    //    直接删除返回的数据是一份裸数据，没有关联数据（tags, category, categories）
    //    需要先保存一份完整数据，删除后返回给前端（前端可能需要显示"已删除 xxx"）
    const existPost = await PostRepo.queryPostByIdOrSlug(id);
    // ② 如果文章存在，才执行删除
    if (!isNil(existPost)) {
      await prismaClient.post.delete({
        where: {
          id,
        },
      });
      return existPost;
    }
    return null;
  },
};

export default PostRepo;
