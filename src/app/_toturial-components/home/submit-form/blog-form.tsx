'use client';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';
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

import type {
  BlogFormRef,
  NewBlog,
  UpdateBlog,
} from '@/app/_toturial-components/home/submit-form/types';

import { Spinner } from '@/app/_components/spinner';
import { DetailSummary } from '@/app/_toturial-components/home/detail-summary/detail-summary';
import {
  useBlogForm,
  useBlogSubmit,
} from '@/app/_toturial-components/home/submit-form/hooks';

import styles from './blog-form.module.css';

// 这里是编辑博客的表单组件
export const BlogForm = forwardRef<
  BlogFormRef,
  NewBlog | UpdateBlog
>((props, ref) => {
  // 表单：这是 react-form 提供的表单组件
  const blogForm = useBlogForm(
    props.type === 'create'
      ? { type: 'create' }
      : { type: 'update', blog: props.blog },
  );

  // 提交函数
  const onBlogSubmit = useBlogSubmit(
    props.type === 'create'
      ? { type: 'create' }
      : { type: 'update', blog: props.blog },
  );
  useEffect(() => {
    if (props.type === 'create' && props.isPending) {
      props.isPending(blogForm.formState.isSubmitting);
    }
  }, []);
  useImperativeHandle(ref, () => {
    return props.type === 'create'
      ? { create: blogForm.handleSubmit(onBlogSubmit) }
      : {};
  }, [blogForm, onBlogSubmit]);
  return (
    <Form {...blogForm}>
      <form
        action=""
        onSubmit={blogForm.handleSubmit(onBlogSubmit)}
        className={styles.blogForm}
      >
        <FormField
          control={blogForm.control}
          name="title"
          render={({ field }) => (
            <FormItem className={styles.formItem}>
              <FormLabel className={styles.formLabel}>
                文章标题
              </FormLabel>
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

        <DetailSummary summary="摘要简述" defaultOpen>
          <FormField
            control={blogForm.control}
            name="summary"
            render={({ field }) => (
              <FormItem
                className={`${styles.formItem} mt-2 pb-1`}
              >
                <FormLabel className={styles.formLabel}>
                  摘要简述
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="请输入文章摘要"
                    disabled={
                      blogForm.formState.isSubmitting
                    }
                    className={styles.textarea}
                  />
                </FormControl>
                <FormDescription
                  className={styles.formDescription}
                >
                  摘要会显示在文章列表页
                </FormDescription>
                <FormMessage
                  className={styles.formMessage}
                />
              </FormItem>
            )}
          />
        </DetailSummary>

        <FormField
          control={blogForm.control}
          name="content"
          render={({ field }) => (
            <FormItem className={styles.formItem}>
              <FormLabel className={styles.formLabel}>
                文章内容
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="请输入内容"
                  {...field}
                  className={`${styles.textarea} ${styles.textareaContent}`}
                  disabled={blogForm.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage className={styles.formMessage} />
            </FormItem>
          )}
        />
        {props.type === 'update' && (
          <Button
            type="submit"
            disabled={blogForm.formState.isSubmitting}
            className={styles.submitButton}
          >
            {blogForm.formState.isSubmitting ? (
              <span className={styles.spinnerWrapper}>
                <Spinner />
                保存中...
              </span>
            ) : (
              '✨ 保存修改'
            )}
          </Button>
        )}
      </form>
    </Form>
  );
});
