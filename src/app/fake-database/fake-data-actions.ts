// 假数据 文章的增删改查

import { isNil } from 'lodash';
import { v4 as uuid } from 'uuid';

import type { IPost } from './fake-data-types';
import type { PageResult } from './pagination-types';

import {
  readDbFile,
  resetDbFile,
} from './fake-data-generator';
import { paginate } from './pagination';

// 根据当前所在的页数、每页显示的文章数量查询数据
export const queryPosts = async (options: {
  page?: number;
  pageSize?: number;
}): Promise<PageResult<IPost>> => {
  const posts = (await readDbFile()).reverse();

  return paginate(posts, {
    currentPage: options?.page || 1,
    limit: options?.pageSize || 10,
  });
};

// 根据 limit 查询数据的总页数
export const queryPostTotalPage = async (options: {
  pageSize?: number;
}): Promise<number> => {
  const { meta } = await queryPosts(options);

  return meta.totalPages;
};

// 根据 id 查询文章信息
export const queryPostById = async (
  id: string,
): Promise<IPost | null> => {
  const posts = await readDbFile();

  return posts.find((post) => post.id === id) || null;
};

// 新增文章
export const addPost = async (
  post: Omit<IPost, 'id'>,
): Promise<IPost> => {
  const posts = await readDbFile();

  // 自动生成缺失的字段
  const newPost = {
    ...post,
    id: uuid(),
    // 如果没有 createdAt，使用当前时间
    createdAt: post.createdAt || new Date().toISOString(),
    // 如果没有 thumbnail，随机选择一张本地图片
    thumbnail:
      post.thumbnail ||
      `/blog-demo-images/blog-${Math.floor(Math.random() * 11) + 1}.png`,
  } as IPost;

  const newPosts = [...posts, newPost];

  await resetDbFile(newPosts);
  return newPost;
};

// 更新文章 (支持部分更新，只需要传入 id 和要更新的字段)
export const updatePost = async (
  post: Partial<IPost> & { id: string },
): Promise<IPost | null> => {
  const posts = await readDbFile();

  const currPost =
    posts.find((item) => item.id === post.id) || null;
  if (isNil(currPost))
    throw new Error('There is no such post!');
  const newPosts = posts.map((item) => {
    if (item.id === currPost.id) {
      // 合并现有数据和更新数据
      return { ...item, ...post };
    }
    return item;
  });

  await resetDbFile(newPosts);
  return (
    newPosts.find((item) => item.id === post.id) || null
  );
};

// 删除文章
export const deletePost = async (
  id: string,
): Promise<void> => {
  const posts = await readDbFile();
  const newPosts = posts.filter((post) => post.id !== id);
  resetDbFile(newPosts);
};
