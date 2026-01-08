'use client';

import type { Post } from '@prisma/client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { DBFormData } from '@/database/types/prisma-clean';

import { addPost, updatePost } from '@/app/_actions/post';

import type { BlogFormProps, FormValidatedData, NewBlog, UpdateBlog } from './types';

import { getDefaultBlogFormValues } from './utils';
import { formValidator } from './validation';

// 根据传入的参数（创建/更新）创建表单数据
export const useBlogForm = (params: BlogFormProps) => {
  const defaultValues = useMemo(() => {
    const values = getDefaultBlogFormValues<Post, DBFormData<NewBlog | UpdateBlog>>(
      ['title', 'content', 'summary', 'slug', 'description', 'keywords', 'id'],
      params,
    );
    return values;
  }, [params, params.type]);

  return useForm<FormValidatedData>({
    mode: 'all',
    resolver: zodResolver(
      formValidator(
        params.type === 'update' ? (params as BlogFormProps & { blog: Post }).blog.id : undefined,
      ),
    ),
    defaultValues,
  });
};

// 一个专门用来清理数据中空白字段的清理工具函数
const cleanEmptyFields = <T extends Record<string, any>>(data: T) => {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([_, value]) => !(typeof value === 'string' && value.trim() === ''),
    ),
  ) as Partial<T>;
};

// 根据传入的参数 create/update 和文章数据构建对应的提交表单的函数
// 提交是一个异步操作
export const useBlogSubmit = (params: BlogFormProps) => {
  const router = useRouter();
  return useCallback(
    async (data: FormValidatedData) => {
      // 先进行去前后空白操作
      let post: Post | null = null;
      const cleanedData = cleanEmptyFields(data);
      try {
        if (params.type === 'create') {
          // 创建新的博客
          post = await addPost(cleanedData as NewBlog);
        } else if (params.type === 'update') {
          // 更新已有的博客
          post = await updatePost({ ...(cleanedData as UpdateBlog), id: params.blog.id });
        }
        if (!isNil(post)) router.replace(`/blog/${post.slug || post.id}`);
      } catch (error: any) {
        toast.error('遇到服务器错误,请联系管理员处理', {
          id: 'post-save-error',
          description: (error as Error).message,
        });
      }
    },
    [params.type, router, params],
  );
};
