'use client';
import type { FC, MouseEventHandler } from 'react';

import { isNil } from 'lodash';
import { useCallback, useRef, useState } from 'react';
import { Button } from 'ui/button';

import type { PostItem } from '@/server/modules/blog/blog.type';

import type { BlogFormRef } from './types';

import { BlogForm } from './form';

/**
 * 博客详情页的表单
 * @param param0
 */
export const PostPageForm: FC<{ post?: PostItem }> = ({ post }) => {
  const ref = useRef<BlogFormRef | null>(null);
  const [pending, setPending] = useState(false);
  const handlePending = useCallback((value: boolean) => {
    setPending(value);
  }, []);
  // MouseEventHandler<HTMLButtonElement> 这个类型指的是里面包裹的函数的类型，即一个事件处理函数
  const handleSave = useCallback<MouseEventHandler<HTMLButtonElement>>(async (e) => {
    e.preventDefault();
    ref.current?.save && (await ref.current.save());
  }, []);

  /**
   * 	•	ref 是父组件创建的，传给子组件（子组件需 forwardRef 接收）。
	•	子组件用 useImperativeHandle(ref, () => ({ ... })) 决定 父组件看到的 ref.current 是什么。
	•	父组件通过 ref.current.xxx() 调用子组件暴露的方法；子组件负责实现和暴露，父组件负责使用。
	•	设计目的：让函数组件也能向外提供受控的命令式 API（如 save/focus/open），而不是暴露整个内部实现或 DOM。

  典型使用场景：
	•	focus()：父组件让子组件里的 input 聚焦
	•	scrollTo()：父组件控制子组件滚动
	•	submit()/save()：父组件触发表单提交/保存（你这种）
	•	open()/close()：父组件控制弹窗/抽屉打开关闭
   */

  return (
    <>
      <div className="flex justify-between">
        <Button onClick={handleSave} disabled={pending}>
          {pending ? '保存中...' : '保存'}
        </Button>
      </div>

      {isNil(post) ? (
        <BlogForm ref={ref} type="create" isPending={handlePending} />
      ) : (
        <BlogForm ref={ref} type="update" blog={post} isPending={handlePending} />
      )}
    </>
  );
};
