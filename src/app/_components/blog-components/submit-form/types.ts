// 这里定义博客提交的表单的类型
// 分为 新建 和 更新 两个常规的逻辑

import type { Post } from '@prisma/client';
import type { BaseSyntheticEvent } from 'react';
import type { z } from 'zod';

import type { formValidator } from './validation';

// 创建 博客 的组件只有一个，但是分为 新建 和 更新 两个逻辑
// 创建 Blog 的组件参数类型，
export interface NewBlogFormProps {
  type: 'create';
  isPending?: (val: boolean) => void; // 文章正在创建时的动画效果
}

// 更新 Blog 的组件参数类型
export interface UpdateBlogFormProps {
  type: 'update';
  blog: Post; // 更新文章时，需要传入文章的详细信息
}

// 提交新建博客的表单参数类型： id 后端生成的，前端不允许携带
export type NewBlog = Omit<Post, 'id'>;

// 提交更新博客的表单参数类型： id 是必填的，其他参数都是可选的
export type UpdateBlog = Partial<NewBlog> & { id: string };

// 将两种表单参数类型合并
export type BlogFormProps = NewBlogFormProps | UpdateBlogFormProps;

/**
 * 文章创建表单的Ref,配合useImperativeHandle可以在表单外部页面调用表单提交函数
 */
export interface BlogFormRef {
  create?: (e?: BaseSyntheticEvent) => Promise<void>;
}

// 表单验证过后的数据类型
export type FormValidatedData = z.infer<ReturnType<typeof formValidator>>;
