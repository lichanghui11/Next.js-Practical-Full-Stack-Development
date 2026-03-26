'use client';
import { isNil, trim } from 'lodash';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { toast } from 'sonner';
import { Button } from 'ui/button';
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
import { blogApi } from '@/api/post';
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
      return {
        save: blogForm.handleSubmit(onBlogSubmit, (errors) => {
          let errorMessage = '表单包含未填写的必填项或格式错误';

          const errorsRecord = errors as Record<string, any>;
          if (errorsRecord[''] && errorsRecord[''].type === 'unrecognized_keys') {
            errorMessage = '表单包含后端不被允许的字段映射';
          } else {
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
              errorMessage = String(firstError.message);
            }
          }

          toast.error('表单校验失败', { description: errorMessage });
        }),
      };
    }, [props.type, blogForm, onBlogSubmit]);

    const [isUploading, setIsUploading] = useState(false);

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
        <form onSubmit={blogForm.handleSubmit(onBlogSubmit)} className={styles.form}>
          <FormField
            control={blogForm.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel className={styles.formLabel}>文章封面（可选）</FormLabel>
                <FormControl className={styles.formControl}>
                  <div className="flex flex-col gap-4">
                    {field.value && (
                      <div className="relative w-40 h-40 overflow-hidden rounded-md border">
                        <Image
                          src={field.value}
                          fill
                          alt="缩略图"
                          className="object-cover w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => field.onChange('')}
                        >
                          移除
                        </Button>
                      </div>
                    )}
                    <label className="flex items-center gap-2 max-w-xs cursor-pointer rounded-md border bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent">
                      <Upload className="h-4 w-4" />
                      <span>{isUploading ? '上传中...' : '选择图片并上传'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        disabled={isUploading || blogForm.formState.isSubmitting}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setIsUploading(true);
                          try {
                            const res = await blogApi.upload(file);
                            if (res.ok) {
                              const data = await res.json();
                              field.onChange(data.url);
                              toast.success('上传成功');
                            } else {
                              toast.error('上传失败', { description: (await res.json()).message });
                            }
                          } catch (err) {
                            toast.error('上传出错', { description: err as string });
                          } finally {
                            setIsUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormMessage className={styles.formMessage} />
              </FormItem>
            )}
          />
          <FormField
            control={blogForm.control}
            name="title"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel className={styles.formLabel}>文章标题</FormLabel>
                <FormControl className={styles.formControl}>
                  <Input
                    {...field}
                    placeholder="请输入标题"
                    disabled={blogForm.formState.isSubmitting}
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
              <FormItem className={styles.formItem}>
                <FormLabel className={styles.formLabel}>摘要简述</FormLabel>
                <FormControl className={styles.formControl}>
                  <Textarea
                    {...field}
                    placeholder="请输入文章摘要"
                    disabled={blogForm.formState.isSubmitting}
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
                <FormItem className={styles.formItem}>
                  <FormLabel className={styles.formLabel}>唯一URL</FormLabel>
                  <FormControl className={styles.formControl}>
                    <Input
                      {...field}
                      value={slug}
                      onChange={handleSlug}
                      placeholder="请输入唯一URL"
                      disabled={blogForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className={styles.formDescription}>
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
                  <FormMessage className={styles.formMessage} />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={blogForm.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel className={styles.formLabel}>分类选择</FormLabel>
                <FormControl className={styles.formControl}>
                  <CategorySelect
                    {...field}
                    value={categoryId}
                    setValue={setCategoryId}
                    categories={allCategories}
                  />
                </FormControl>
                <FormDescription className={styles.formDescription}>
                  选择一个分类后,在读取该分类的父分类(如果有)时,列表中也会包含此文章
                </FormDescription>
                <FormMessage className={styles.formMessage} />
              </FormItem>
            )}
          />
          <FormField
            control={blogForm.control}
            name="tags"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel className={styles.formLabel}>标签</FormLabel>
                <FormControl className={styles.formControl}>
                  <TagInput
                    {...field}
                    tags={tags}
                    setTags={setTags}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    autocompleteOptions={allTags}
                  />
                </FormControl>
                <FormDescription className={styles.formDescription}>
                  每个标签之间请用英文逗号(,)分割,
                  如果单独不设置SEO关键字则会根据标签生成关键字用于SEO
                </FormDescription>
                <FormMessage className={styles.formMessage} />
              </FormItem>
            )}
          />
          <DetailSummary summary="SEO相关字段" defaultOpen={false}>
            <FormField
              control={blogForm.control}
              name="keywords"
              render={({ field }) => (
                <FormItem className={styles.formItem}>
                  <FormLabel className={styles.formLabel}>关键字</FormLabel>
                  <FormControl className={styles.formControl}>
                    <Input
                      {...field}
                      placeholder="请输入关键字,用逗号分割(关键字是可选的)"
                      disabled={blogForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className={styles.formDescription}>
                    关键字不会显示,仅在SEO时发挥作用.每个关键字之间请用英文逗号(,)分割
                  </FormDescription>
                  <FormMessage className={styles.formMessage} />
                </FormItem>
              )}
            />
            <FormField
              control={blogForm.control}
              name="description"
              render={({ field }) => (
                <FormItem className={styles.formItem}>
                  <FormLabel className={styles.formLabel}>文章描述</FormLabel>
                  <FormControl className={styles.formControl}>
                    <Textarea
                      {...field}
                      placeholder="请输入文章描述"
                      disabled={blogForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className={styles.formDescription}>
                    文章描述不会显示,仅在SEO时发挥作用
                  </FormDescription>
                  <FormMessage className={styles.formMessage} />
                </FormItem>
              )}
            />
          </DetailSummary>

          <FormField
            control={blogForm.control}
            name="content"
            render={({ field }) => (
              <div className="space-y-2">
                <MdxEditor
                  content={field.value}
                  setContent={field.onChange}
                  disabled={blogForm.formState.isSubmitting}
                />
                <FormMessage className={styles.formMessage} />
              </div>
            )}
          />
        </form>
      </Form>
    );
  },
);
