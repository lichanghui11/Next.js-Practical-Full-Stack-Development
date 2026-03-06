'use client';
import type { FC, ReactNode } from 'react';

import { isNil } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';

import { cn } from '@/app/utils/utils';

/**
 * 
 * @param param0 
 * 执行流程
    1. 初始状态：show = false，字符串源容器隐藏

    2. Typed 初始化：读取 el 中的所有 <span>，提取文本

    3. 开始打字：触发 onStart，设置 show = true（显示字符串源）

    4. 循环打字：依次打出每个字符串，然后删除，再打下一个

    5. 完成：触发 onComplete，移除光标元素
*/
export const TypedText: FC<{ className?: string; data: (string | ReactNode)[] }> = ({
  className,
  data,
}) => {
  // 打字机输出的容器
  const ref = useRef<HTMLDivElement>(null);

  // 储存要打字的字符串列表
  const el = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);

  useEffect(() => {
    let typed: Typed | undefined;

    if (!isNil(ref.current) && !isNil(el.current)) {
      typed = new Typed(ref.current, {
        stringsElement: el.current, // 从这个元素读取要打字的内容
        typeSpeed: 50,
        backDelay: 1700,
        smartBackspace: true,
        startDelay: 500,
        onStart: (_a, _s) => {
          setShow(true);
        },
        onComplete: (_self) => {
          const cursor = document.getElementsByClassName('typed-cursor');
          if (cursor.length) cursor[0].remove();
        },
      });
    }

    return () => {
      if (typed) {
        typed.destroy();
      }
    };
    // 只初始化一次
  }, []);

  return (
    <div className={cn(className)}>
      {/**打字机在这里输出 */}
      <div ref={ref} className="inline-block"></div>

      {/**隐藏的字符串源 */}
      <div ref={el} className="hidden">
        {data.map((item, index) => (
          <p key={index.toFixed()}>{item}</p>
        ))}
      </div>
    </div>
  );
};
