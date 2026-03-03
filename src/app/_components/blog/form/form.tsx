'use client';
import { isNil, trim } from 'lodash';
import Link from 'next/link';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'ui/form';
import { Input } from 'ui/input';
import { Textarea } from 'ui/textarea';

import type { CategoryItem } from '@/server/modules/category/category.type';
import type { TagType as TagItem } from '@/server/modules/tag/tag.type';

import { categoryApi } from '@/api/category';
import { tagApi } from '@/api/tag';
import { CategorySelect } from '@/app/_components/blog/form/category/category-select';
import { useBlogForm, useBlogSubmit } from '@/app/_components/blog/form/hooks';
import { TagInput } from '@/app/_components/blog/form/tag/tag-input';
import { MdxEditor } from '@/app/_components/mdx/mdx-client/components/mdx-editor';

import type { BlogFormRef, NewBlogFormProps, UpdateBlogFormProps } from './types';

import { DetailSummary } from '../../blog-components/detail-summary/detail-summary';
import { generateSlug } from '../../blog-components/submit-form/utils';
import styles from './form.module.css';

// 这里是编辑博客的表单组件
export const BlogForm = forwardRef<BlogFormRef, NewBlogFormProps | UpdateBlogFormProps>(
  (props, ref) => {
    // 表单：这是 react-form 提供的表单组件
    const blogForm = useBlogForm(
      props.type === 'create' ? { type: 'create' } : { type: 'update', blog: props.blog },
    );
    // 提交函数
    const onBlogSubmit = useBlogSubmit(
      props.type === 'create' ? { type: 'create' } : { type: 'update', blog: props.blog },
    );

    /**
     * 对 isPending 这部分逻辑的说明
     *  - 本项目中原本只针对创建文章的时候有这个 isPending 函数，更新文章额外使用了单独的按钮，
     *  - 根据后续的教程学习，将这里将新建和更新文章的逻辑统一管理，
     *  - 只要传入了这个 prop ，就将表单里面的加载状态的变量传递进这个函数，
     */
    useEffect(() => {
      if (props.isPending) {
        props.isPending(blogForm.formState.isSubmitting);
      }
    }, []);

    /**
     * useImperativeHandle 这部分逻辑说明
     *  - 教程中这里只使用了一个 save 字段来存这个提交函数
     *  - 本文件使用了两个字段分别保存
     *  - 更新的时候不会使用到这里的方法
     *  - 根据后续的逻辑整理，会将新建和更新都合并到一个按钮上面，在外层调用
     *
     *  - 经过实际的测试之后，这里最终改成了只使用一个 save 字段来存这个提交函数
     */
    useImperativeHandle(ref, () => {
      return { save: blogForm.handleSubmit(onBlogSubmit) };
      // return props.type === 'create'
      //   ? { create: blogForm.handleSubmit(onBlogSubmit) }
      //   : { update: blogForm.handleSubmit(onBlogSubmit) };
    }, [props.type]);

    /**
     * slug
     */
    const [slug, setSlug] = useState<string>('');
    const handleSlug = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSlug(e.target.value);
    }, []);

    const {
      getValues,
      formState: { isSubmitting },
      setValue,
    } = blogForm;
    const generateTitleSlug: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
      (e) => {
        e.preventDefault();
        if (!isSubmitting) {
          const title = trim(getValues('title'));
          if (title) {
            const slug = generateSlug(title);
            setSlug(slug);
            // 点击的时候执行一次
            setValue('slug', slug);
          }
        }
      },
      [isSubmitting, getValues, setValue],
    );
    useEffect(() => {
      // 挂载的时候执行一次
      setValue('slug', slug);
    }, []);

    /**
     * 文章分类
     */
    const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
    const [categoryId, setCategoryId] = useState<string>(() =>
      props.type === 'create' || isNil(props.blog.category) ? '' : props.blog.category.id,
    );
    useEffect(() => {
      blogForm.setValue('categoryId', categoryId);
    }, [categoryId]);
    useEffect(() => {
      (async () => {
        const result = await categoryApi.list();
        if (!result.ok) {
          toast.warning('读取分类列表失败,请刷新', {
            id: 'category-list-error',
            description: (await result.json()).message,
          });
        } else {
          const data = await result.json();
          setAllCategories(data);
        }
      })();
    }, []);

    /**
     * 文章标签
     */
    const [allTags, setAllTags] = useState<TagItem[]>([]);
    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
    const [tags, setTags] = useState<TagItem[]>(
      props.type === 'create' ? [] : (props.blog.tags ?? []),
    );

    useEffect(() => {
      (async () => {
        const result = await tagApi.list();
        if (!result.ok) {
          toast.warning('读取标签列表失败,请刷新', {
            id: 'tag-list-error',
            description: (await result.json()).message,
          });
        } else {
          const data = await result.json();
          setAllTags(data);
        }
      })();
    }, []);

    useDeepCompareEffect(() => {
      blogForm.setValue('tags', tags);
    }, [tags]);

    return (
      <Form {...blogForm}>
        <form onSubmit={blogForm.handleSubmit(onBlogSubmit)} className={styles.blogForm}>
          <FormField
            control={blogForm.control}
            name="title"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel className={styles.formLabel}>文章标题 (*)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="请输入标题"
                    disabled={blogForm.formState.isSubmitting}
                    className={styles.input}
                  />
                </FormControl>
                <FormMessage className={styles.formMessage} />
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={blogForm.control}
            name="summary"
            render={({ field }) => (
              <FormItem className={`${styles.formItem} mt-2 pb-1`}>
                <FormLabel>摘要简述</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="请输入文章摘要"
                    disabled={blogForm.formState.isSubmitting}
                    className={styles.textarea}
                  />
                </FormControl>
                <FormMessage className={styles.formMessage} />
              </FormItem>
            )}
          />
          <div className="mt-2 border-b border-dashed pb-1">
            <FormField
              control={blogForm.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>唯一URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={slug}
                      onChange={handleSlug}
                      placeholder="请输入唯一URL"
                      disabled={blogForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    如果留空,则文章访问地址是id
                    <Link
                      className="ml-5 mr-1 text-black dark:text-white"
                      href="#"
                      aria-disabled={blogForm.formState.isSubmitting}
                      onClick={generateTitleSlug}
                    >
                      [点此]
                    </Link>
                    自动生成slug(根据标题使用&apos;-&apos;连接字符拼接而成,中文字自动转换为拼音)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={blogForm.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="mt-2 border-b border-dashed pb-1">
                <div className="w-full flex-col space-y-2">
                  <FormLabel className="block">分类选择</FormLabel>
                  <FormControl className="block pt-1">
                    <CategorySelect
                      {...field}
                      value={categoryId}
                      setValue={setCategoryId}
                      categories={allCategories}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  选择一个分类后,在读取该分类的父分类(如果有)时,列表中也会包含此文章
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={blogForm.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="mt-2 border-b border-dashed pb-1">
                <FormLabel>标签</FormLabel>
                <FormControl>
                  <TagInput
                    {...field}
                    placeholder="输入标签"
                    tags={tags}
                    setTags={setTags}
                    className="w-full"
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    autocompleteOptions={allTags}
                  />
                </FormControl>
                <FormDescription>
                  每个标签之间请用英文逗号(,)分割,
                  如果单独不设置SEO关键字则会根据标签生成关键字用于SEO
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DetailSummary summary="SEO相关字段" defaultOpen={false}>
            <FormField
              control={blogForm.control}
              name="keywords"
              render={({ field }) => (
                <FormItem className="mt-2 border-b border-dashed pb-1">
                  <FormLabel>关键字</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="请输入关键字,用逗号分割(关键字是可选的)"
                      disabled={blogForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    关键字不会显示,仅在SEO时发挥作用.每个关键字之间请用英文逗号(,)分割
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={blogForm.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-2 border-b border-dashed pb-1">
                  <FormLabel>文章描述</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="请输入文章描述"
                      disabled={blogForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>文章描述不会显示,仅在SEO时发挥作用</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </DetailSummary>

          <FormField
            control={blogForm.control}
            name="content"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <div className={styles.contentHeader}>
                  <FormLabel className={styles.formLabel}>文章内容 (*)</FormLabel>
                  {/*props.type === 'update' && (
                    <Button type="submit" disabled={blogForm.formState.isSubmitting}>
                      {blogForm.formState.isSubmitting ? '保存中...' : '保存修改'}
                    </Button>
                  )*/}
                </div>
                <FormControl>
                  <MdxEditor
                    content={field.value}
                    setContent={field.onChange}
                    disabled={blogForm.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage className={styles.formMessage} />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
);
