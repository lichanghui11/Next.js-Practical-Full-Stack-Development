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

interface CategorySelectProps {
  categories: CategoryList;
  setValue: (value: string) => void;
  value: string;
}

export const CategorySelect: FC<CategorySelectProps> = (props) => {
  const { categories, value, setValue } = props;
  const [open, setOpen] = useState(false);
  const triggerContainerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverContentRef = useRef<HTMLDivElement | null>(null);

  const [popoverWidth, setPopoverWidth] = useState<number>(0);
  const handleOpenChange = useCallback((open: boolean) => {
    if (open && triggerContainerRef.current) {
      // getBoundingClientRect 用于获取元素的大小及其相对于视口的位置。
      // 在此处用于动态获取触发器容器的宽度，以确保弹出层（Popover）与输入框宽度保持一致。
      /**
       * // 返回值：
       * {
       *   x: 100,       // 元素左边距视口左边的距离
       *   y: 200,       // 元素顶部距视口顶部的距离
       *   width: 300,   // 元素的宽度（包括 padding 和 border）
       *   height: 50,   // 元素的高度（包括 padding 和 border）
       *   top: 200,     // 同 y
       *   left: 100,    // 同 x
       *   right: 400,   // left + width
       *   bottom: 250,  // top + height
       * }
       */
      const { width } = triggerContainerRef.current.getBoundingClientRect();
      setPopoverWidth(width);
    }
    setOpen(open);
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div
        className="relative flex items-center rounded-md border bg-transparent"
        ref={triggerContainerRef}
      >
        <PopoverTrigger asChild ref={triggerRef}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="mr-0 flex h-full w-full justify-between border-0 bg-transparent shadow-none ring-0 hover:bg-transparent! focus-visible:ring-0!"
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
        forceMount
        className={cn(`p-0 relative`)}
        style={{
          width: `${popoverWidth}px`,
          minWidth: `${popoverWidth}px`,
          zIndex: 39,
        }}
      >
        <Command>
          <CommandInput placeholder="选择分类..." className="h-9" />
          <CommandList>
            <CommandEmpty>无分类可选</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="null"
                value=""
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  //       ↑ 如果点击的和当前选中的一样 → 取消选择（设为 ''）
                  //         否则 → 选中这个新的
                  setOpen(false);
                }}
              >
                不选择
                <Check className={cn('ml-auto', value === '' ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
              {categories.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {`${'- '.repeat(item.depth - 1)}${item.name}`}
                  <Check
                    className={cn('ml-auto', value === item.id ? 'opacity-100' : 'opacity-0')}
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
