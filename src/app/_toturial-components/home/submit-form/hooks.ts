'use client';

import type { DeepNonNullable } from 'utility-types'; // 把所有的null undefined变为‘’空字符串

import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import type { IPost } from '@/app/fake-database/fake-data-types';

import {
  addPost,
  updatePost,
} from '@/app/fake-database/fake-data-actions';

import type {
  BlogFormProps,
  NewBlog,
  UpdateBlog,
} from './types';

// 根据传入的参数（创建/更新）创建表单数据
// TODO 后续增加 Zod 验证
export const useBlogForm = (params: BlogFormProps) => {
  const defaultValues = useMemo(() => {
    if (params.type === 'create') {
      // 创建新的博客
      return {
        title: '博客标题',
        content: '博客内容',
      } as DeepNonNullable<NewBlog>;
    } else if (params.type === 'update') {
      // 更新已有的博客
      return {
        id: params.blog.id,
        title: params.blog.title,
        content: params.blog.content,
        summary: isNil(params.blog.summary)
          ? ''
          : params.blog.summary,
      } as DeepNonNullable<UpdateBlog>;
    }
  }, [params, params.type]);

  return useForm<DeepNonNullable<NewBlog | UpdateBlog>>({
    defaultValues,
  });
};

// 一个专门用来清理数据中空白字段的清理工具函数
const cleanEmptyFields = <T extends Record<string, any>>(
  data: T,
) => {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([_, value]) =>
        !(typeof value === 'string' && value.trim() === ''),
    ),
  ) as Partial<T>;
};

// 根据传入的参数 create/update 和文章数据构建对应的提交表单的函数
// 提交是一个异步操作
export const useBlogSubmit = (params: BlogFormProps) => {
  const router = useRouter();
  return useCallback(
    async (data: NewBlog | UpdateBlog) => {
      // 先进行去前后空白操作
      let post: IPost | null = null;
      const cleanedData = cleanEmptyFields(data);
      try {
        if (params.type === 'create') {
          // 创建新的博客
          post = await addPost(cleanedData as NewBlog);
        } else if (params.type === 'update') {
          // 更新已有的博客
          post = await updatePost(
            cleanedData as UpdateBlog,
          );
        }
        if (!isNil(post))
          router.replace(`/blog/${post.id}`);
      } catch (e: any) {
        console.error(e);
      }
    },
    [params.type, router],
  );
};
