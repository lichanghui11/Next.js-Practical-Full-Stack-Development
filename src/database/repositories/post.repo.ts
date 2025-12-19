import type { Post } from '@prisma/client';

// 这里是数据的仓库，数据层
// 封装增删查改的内部逻辑
import type { PageParams, PageResult } from '../types/pagination';

import { paginationAdapter } from '../adapters/pagination.adapter';
import prismaClient from '../client/app-client';
const PostRepo = {
  /**
   * 查询文章列表
   * @param options 分页参数
   * @returns 分页结果
   */
  queryPosts: async (options: PageParams): Promise<PageResult<Post>> => {
    const posts = await prismaClient.post
      .paginate({
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      })
      .withPages({
        limit: options.limit || 10,
        page: options.currentPage || 1,
        includePageCount: true, // 这里手动配置这个值，让返回值始终都有页数相关的数据
      });

    return paginationAdapter(posts);
  },

  // 根据 limit 查询数据的总页数，我的逻辑里面都使用了pageSize，含义和limit是一样的
  queryPostTotalPage: async (options: { pageSize?: number }): Promise<number> => {
    const [_, meta] = await prismaClient.post.paginate().withPages({
      limit: options.pageSize || 10,
      page: 1,
      includePageCount: true,
    });

    return meta.pageCount;
  },

  // 根据 id 查询文章信息
  queryPostById: async (id: string): Promise<Post | null> => {
    const post = await prismaClient.post.findUnique({
      where: {
        id,
      },
    });
    return post;
  },

  // 新增文章
  addPost: async (post: Omit<Post, 'id'>): Promise<Post> => {
    const newPost = await prismaClient.post.create({
      data: post,
    });
    return newPost;
  },

  // 更新文章 (支持部分更新，只需要传入 id 和要更新的字段)
  updatePost: async (post: Partial<Post> & { id: string }): Promise<Post | null> => {
    const updatedPost = await prismaClient.post.update({
      where: {
        id: post.id,
      },
      data: post,
    });
    return updatedPost;
  },

  // 删除文章
  deletePost: async (id: string): Promise<Post | null> => {
    const deletedPost = await prismaClient.post.delete({
      where: {
        id,
      },
    });
    return deletedPost;
  },
};

export default PostRepo;
