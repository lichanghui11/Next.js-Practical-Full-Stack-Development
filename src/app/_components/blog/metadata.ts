import type { Metadata, ResolvingMetadata } from 'next';

import { isNil } from 'lodash';
import { cache } from 'react';

import type { CategoryItem } from '@/server/modules/category/category.type';
import type { TagType } from '@/server/modules/tag/tag.type';

import { categoryApi } from '@/api/category';
import { blogApi } from '@/api/post';
import { tagApi } from '@/api/tag';

//这个类型用于博客列表的元数据，这里面包括捕获路由参数 categories
export interface IBlogMetadata {
  params: Promise<{ categories?: string[] }>; // 动态路由参数
  searchParams: Promise<{ tag?: string }>; //URL 查询参数
  parent: ResolvingMetadata; // 父布局的元数据解析器
}

// 这个类型用于 单篇博客 详情页面的元数据
export interface IPostMetadata {
  params: Promise<{ item: string }>;
  parent: ResolvingMetadata;
}

// 缓存
const getBreadcrumbs = cache(async (lastId: string) => categoryApi.breadcrumb(lastId));
const getTagDetail = cache(async (tag: string) => tagApi.detail(tag));
const getPostDetail = cache(async (id: string) => blogApi.detailById(id));

/**
 *
 * @param param0
 * 文章列表数据页面的 元数据 获取
 *  1. 拼接标题
 *  2. 收集关键字
 */
export const getBlogListMetadata = async ({
  params,
  searchParams,
  parent,
}: IBlogMetadata): Promise<Metadata> => {
  let title = '博客 ｜ ';
  let keywords = (await parent).keywords ?? [];
  const { categories } = await params;
  const { tag } = await searchParams;

  if (!isNil(categories) && categories.length > 0) {
    const result = await getBreadcrumbs(categories[categories.length - 1]);
    if (!result.ok) return {};
    const data = await result.json();
    if (data.length > 0) {
      title = `${data[data.length - 1].name} | `;
      keywords = [...keywords, ...data.map((i: CategoryItem) => i.name)];
    }
  }
  if (!isNil(tag)) {
    const result = await getTagDetail(tag);
    if (result.ok) {
      const data = await result.json();
      if (!isNil(data)) {
        title = `${title + data.text} | `;
        keywords.push(tag);
      }
    }
  }

  title = `${title}${(await parent).title?.absolute}`;
  return { title, keywords };
};

/**
 *
 * @param param0
 * 单篇文章详情页面的 元数据 的获取
 */
export const getPostItemMetadata = async ({ params, parent }: IPostMetadata): Promise<Metadata> => {
  const { item } = await params;
  const result = await getPostDetail(item);
  if (!result.ok) return {};
  const post = await result.json();
  const title = `${post.title} - ${(await parent).title?.absolute}`;
  const keywords =
    isNil(post.keywords) || post.keywords.length === 0
      ? (post.tags || []).map((it: TagType) => it.text).join(',')
      : post.keywords;
  const description =
    isNil(post.description) || post.description.length === 0 ? post.summary : post.description;
  return { title, keywords, description };
};
