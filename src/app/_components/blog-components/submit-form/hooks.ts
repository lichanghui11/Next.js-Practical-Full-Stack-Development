'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { DateToString } from '@/lib/types';
import type { PostItem } from '@/server/modules/blog/blog.type';

import { fetchApi } from '@/lib/rpc.client';
import { buildPostRequestSchema } from '@/server/modules/blog/blog.schema';

import type { BlogFormProps, PostFormData } from './types';

import { getDefaultBlogFormValues } from './utils';
import { slugUniqueValidator } from './validation';

// 根据传入的参数（创建/更新）创建表单数据
export const useBlogForm = (params: { type: 'create' } | { type: 'update'; blog: PostItem }) => {
  const defaultValues = useMemo(() => {
    const values = getDefaultBlogFormValues<PostItem, PostFormData>(
      ['title', 'content', 'summary', 'slug', 'description', 'keywords', 'id'],
      params,
    );
    return values;
  }, [params, params.type]);

  return useForm<PostFormData>({
    mode: 'all',
    resolver: zodResolver(
      buildPostRequestSchema(
        slugUniqueValidator(params.type === 'update' ? params.blog.id : undefined),
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
    async (data: PostFormData) => {
      // 先进行去前后空白操作
      let post: DateToString<PostItem> | null = null;
      const cleanedData = cleanEmptyFields(data);
      if (params.type === 'create') {
        // 创建新的博客
        /**
           * 	•	param：路径参数（对应 /:id）
              •	query：查询参数（对应 ?page=1）
              •	json：JSON 请求体（对应 await c.req.json()）
              •	还有 form / formData / header 等（取决于版本）
           */
        const result = await fetchApi((honoClient) => {
          return honoClient.api.blogs.$post({ json: cleanedData });
        });
        if (!result.ok) {
          toast.error('遇到服务器错误,请联系管理员处理', {
            id: 'post-save-error',
            description: (await result.json()).message,
          });
        }
      } else if (params.type === 'update') {
        // 更新已有的博客
        const result = await fetchApi((honoClient) => {
          return honoClient.api.blogs[':id'].$patch({
            param: { id: params.blog.id },
            json: cleanedData,
          });
        });
        if (!result.ok) {
          throw new Error((await result.json()).message);
        }
        post = await result.json();
      }
      if (!isNil(post)) router.replace(`/blog/${post.slug || post.id}`);
    },
    [params.type, router, params],
  );
};
