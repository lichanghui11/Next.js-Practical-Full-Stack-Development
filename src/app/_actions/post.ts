'use server';
// 这里是数据的 action ，操作层，没有增删查改的内部逻辑，但是提供增删查改的接口
// 如果需要	权限判断 revalidateTag 日志，都统一加在这里

import type { Post } from '@prisma/client';

import type { PageParams, PageResult } from '@/database/types/pagination';

import PostRepo from '@/database/repositories/post.repo';

// 翻页查询
export const queryPosts = async (options: PageParams): Promise<PageResult<Post>> => {
  return PostRepo.queryPosts(options);
};

// 查询总页数
export const queryPostTotalPage = async (options: { pageSize?: number }): Promise<number> => {
  return PostRepo.queryPostTotalPage(options);
};

// 根据 id 或 slug 查询文章信息
export const queryPostByIdOrSlug = async (item: string): Promise<Post | null> => {
  return PostRepo.queryPostByIdOrSlug(item);
};

// 根据 Slug 查询文章信息
export const queryPostBySlug = async (slug: string): Promise<Post | null> => {
  return PostRepo.queryPostBySlug(slug);
};

// 新增文章
export const addPost = async (post: Omit<Post, 'id'>): Promise<Post> => {
  return PostRepo.addPost(post);
};

// 更新文章
export const updatePost = async (post: Partial<Post> & { id: string }): Promise<Post | null> => {
  return PostRepo.updatePost(post);
};

// 删除文章
export const deletePost = async (id: string): Promise<Post | null> => {
  return PostRepo.deletePost(id);
};
