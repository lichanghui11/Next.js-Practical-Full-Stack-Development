import type { FC } from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from 'ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'ui/command';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';

import type { CategoryList } from '@/server/modules/category/category.type';

import { cn } from '@/app/utils/utils';

// 当前组件接收的 props 的类型
interface CategorySelectProps {
  // 一个扁平 分类 数组
  categories: CategoryList;
  // 更改某个状态的 set 函数，由外层传进来，在这里进行调用，达到父组件管理状态，子组件更改后将变更通过这个函数进行更改的效果
  setValue: (value: string) => void;
  value: string;
}

// 这是一个 分类 选择器，
export const CategorySelect: FC<CategorySelectProps> = ({ categories, setValue, value }) => {
  // open 控制整个弹窗的开关
  const [open, setOpen] = useState(false);
  // 指向触发器的容器的 ref
  const triggerContainerRef = useRef<HTMLDivElement | null>(null);
  // 指向这个触发器本身的 ref
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // 指向弹窗内容部分的 ref
  const popoverContentRef = useRef<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>(0);

  // 默认情况下，PopoverContent 的宽度一般由内容决定（或者组件默认样式决定），不一定跟按钮一样宽。
  // 这段逻辑的目的就是：“下拉列表宽度 = 按钮外框宽度”，视觉更整齐。
  const handleOpenChange = useCallback((open: boolean) => {
    // 切换弹窗开关，同时测量触发器容器的宽度，应用到弹窗的内容元素上，保证对齐
    setOpen(open);
    if (open && triggerContainerRef.current) {
      const width = triggerContainerRef.current.offsetWidth;
      setPopoverWidth(width);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div
        ref={triggerContainerRef}
        className="relative flex items-center rounded-md border bg=transparent"
      >
        <PopoverTrigger asChild ref={triggerRef}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="mr-0 flex h-full justify-between border-0 bg-transparent shadow-none ring-0 hover:bg-transparent! focus-visible:ring-0! w-full"
          >
            {value ? categories.find((item) => item.id === value)?.name : '选择分类...'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent
        ref={popoverContentRef}
        side="bottom"
        align="start"
        // 这个属性保证弹窗关闭的时候也不会卸载，方便做动画
        forceMount
        className={cn(`p-0 relative`)}
        style={{
          width: `${popoverWidth}px`,
          minWidth: `${popoverWidth}px`,
          zIndex: 39,
        }}
      >
        <Command>
          <CommandInput placeholder="搜索分类..." className="h-9" />
          <CommandList>
            <CommandEmpty>未找到分类</CommandEmpty>
            <CommandGroup heading="分类">
              <CommandItem
                key="null"
                value=""
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}
              >
                不选择
                <Check
                  className={cn('ml-auto', value === '' ? 'opacity-100' : 'opacity-0')}
                ></Check>
              </CommandItem>
              {/* 用户点击某个分类
                  → Command 内部找到该 CommandItem 的 value（即 category.id）
                  → 作为参数传入 onSelect 回调
                  → currentValue = category.id ✅ 
                */}

              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {`${'- '.repeat(category.depth - 1)}${category.name}`}
                  <Check
                    className={cn('ml-auto', value === category.id ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
