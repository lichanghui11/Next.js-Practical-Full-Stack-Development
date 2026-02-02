// 这里定义博客提交的表单的类型
// 分为 新建 和 更新 两个常规的逻辑

import type { Post } from '@prisma/client';
import type { BaseSyntheticEvent } from 'react';
// import type { z } from 'zod';

import type { PostCreateOrUpdateData } from '@/server/modules/blog/blog.type';

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

// 使用 server 端的 schema 结构来统一表示 新建/更新 的文章类型
export type PostFormData = PostCreateOrUpdateData;

// 将两种表单参数类型合并
export type BlogFormProps = NewBlogFormProps | UpdateBlogFormProps;
/**
 * 文章创建表单的Ref,配合useImperativeHandle可以在表单外部页面调用表单提交函数
 */
export interface BlogFormRef {
  create?: (e?: BaseSyntheticEvent) => Promise<void>;
}
