'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { DateToString } from '@/lib/types';
import type { PostItem } from '@/server/modules/blog/blog.type';

import { authApi } from '@/api/auth';
import { blogApi } from '@/api/post';
import { buildPostRequestSchema } from '@/server/modules/blog/blog.schema';

import type { BlogFormProps, PostFormData } from './types';

import { getDefaultValues } from '../../blog-components/submit-form/utils';
import { slugUniqueValidator } from '../../blog-components/submit-form/validation';

// 根据传入的参数（创建/更新）创建表单数据
export const useBlogForm = (params: { type: 'create' } | { type: 'update'; blog: PostItem }) => {
  const defaultValues = useMemo(() => {
    const values = getDefaultValues<PostItem, PostFormData>(
      ['title', 'content', 'summary', 'slug', 'description', 'keywords', 'id'],
      params,
    );
    if (params.type === 'update') {
      values.tags = isNil(params.blog.tags) ? [] : params.blog.tags;
      values.categoryId = isNil(params.blog.category) ? '' : params.blog.category.id;
    } else {
      values.tags = [];
      values.categoryId = '';
    }
    return values;
  }, [params, params.type]);

  return useForm<PostFormData>({
    mode: 'onBlur',
    resolver: zodResolver(
      buildPostRequestSchema(
        slugUniqueValidator(params.type === 'update' ? params.blog.id : undefined),
      ),
    ),
    defaultValues,
  });
};

// 一个专门用来清理数据中空白字段的清理工具函数
// 这个工具是在配置 zod 验证之前，把空字符串变为 undefined 的方法，
// 因为空字符串也是string，所以为了防止在数据库里面存入无意义的空字符串，手动写了这么一个工具函数，现在直接注释掉
// const cleanEmptyFields = <T extends Record<string, any>>(data: T) => {
//   return Object.fromEntries(
//     Object.entries(data).filter(
//       ([_, value]) => !(typeof value === 'string' && value.trim() === ''),
//     ),
//   ) as Partial<T>;
// };

// 根据传入的参数 create/update 和文章数据构建对应的提交表单的函数
// 提交是一个异步操作
export const useBlogSubmit = (params: BlogFormProps) => {
  const router = useRouter();
  return useCallback(
    async (data: PostFormData) => {
      // 先进行去前后空白操作
      let post: DateToString<PostItem> | null = null;
      // const cleanedData = cleanEmptyFields(data);
      if (params.type === 'create') {
        // 创建新的博客
        /**
           * 	•	param：路径参数（对应 /:id）
              •	query：查询参数（对应 ?page=1）
              •	json：JSON 请求体（对应 await c.req.json()）
              •	还有 form / formData / header 等（取决于版本）
           */
        console.log('before blogApi.create: data: ', data);
        const result = await blogApi.create(data);
        if (!result.ok) {
          toast.error('遇到服务器错误,请联系管理员处理', {
            id: 'post-save-error',
            description: (await result.json()).message,
          });
          return;
        }
        post = await result.json();
      } else if (params.type === 'update') {
        // 更新已有的博客
        const user = await authApi.getAuth();
        console.log('当前用户： ', user?.id);

        console.log('当前文章： ', params.blog.author.id);
        console.log('是不是同一个用户： ', user?.id === params.blog.author.id);
        if (isNil(user) || user.id !== params.blog.author.id) {
          toast.error('无权修改该文章，只允许文章作者进行修改');
          return;
        }

        const result = await blogApi.update(params.blog.id, data);
        console.log('更新文章之后的结果: ', result);
        if (!result.ok) {
          throw new Error((await result.json()).message);
        }
        post = await result.json();
      }
      // 此处的页面路由经过更改后更贴近教程的管理方式，
      // 之后的修改需要靠近教程的组件管理方式，这样方便迁移组件和逻辑梳理，
      // 否则我每次需要重新对照个人代码和项目代码，这会导致极大的困扰，容易让人放弃
      if (!isNil(post)) router.replace(`/blog/posts/${post.slug || post.id}`);
    },
    [params.type, router, params],
  );
};
