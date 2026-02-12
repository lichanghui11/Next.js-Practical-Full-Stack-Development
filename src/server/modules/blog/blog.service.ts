import type { Post } from '@prisma/client';

// 这里是数据的 action ，操作层，没有增删查改的内部逻辑，但是提供增删查改的接口
// 如果需要	权限判断 revalidateTag 日志，都统一加在这里
import { isNil } from 'lodash';

import type {
  PostCreateInput,
  PostPaginationOptions,
  PostUpdateInput,
} from '@/database/repositories/post.repo';
import type { PageParams, PageResult } from '@/database/types/pagination';

import PostRepo from '@/database/repositories/post.repo';

// 翻页查询
export const queryPosts = async (options: PageParams): Promise<PageResult<Post>> => {
  return PostRepo.queryPosts(options);
};

// 查询总页数
export const queryPostTotalPage = async (
  options: Omit<PostPaginationOptions, 'currentPage'>,
): Promise<number> => {
  return PostRepo.queryPostTotalPage(options);
};

// 根据 id 或 slug 查询文章信息
export const queryPostByIdOrSlug = async (item: string): Promise<Post | null> => {
  return PostRepo.queryPostByIdOrSlug(item);
};

// 根据 Slug 查询文章信息
export const queryPostBySlug = async (slug: string): Promise<Post | null | undefined> => {
  return PostRepo.queryPostBySlug(slug);
};

// 新增文章
export const addPost = async (post: PostCreateInput): Promise<Post | null> => {
  return PostRepo.addPost(post);
};

// 更新文章
export const updatePost = async (post: PostUpdateInput & { id: string }): Promise<Post | null> => {
  return PostRepo.updatePost(post);
};

// 删除文章
export const deletePost = async (id: string): Promise<Post | null> => {
  return PostRepo.deletePost(id);
};

/**
 * server 端专用检测 slug 唯一性的工具函数
 * 通过ID验证slug的唯一性
 * @param id
 */
export const isSlugUnique = async (id?: string) => async (slug?: string | null) => {
  if (isNil(slug) || !slug.length) return true;
  const post = await queryPostBySlug(slug);
  if (isNil(post) || post.id === id) return true;
  return false;
};
