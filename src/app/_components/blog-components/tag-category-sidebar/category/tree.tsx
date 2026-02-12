'use client';

import type { FC } from 'react';

import { FileIcon, FolderIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'ui/accordion';

import type { CategoryItem, CategoryTree } from '@/server/modules/category/category.type';

import { cn } from '@/app/utils/utils';

import $styles from './tree.module.css';

interface CategoryItemProps {
  category: CategoryItem; // 当前分类的数据

  // 这是一个从顶层传下来的、不变的数组，包含当前应该高亮的分类 ID。
  actives: string[]; // 当前激活的分类 ID 列表
  parentPath: string; // 父级的 URL 路径
}

const Item: FC<CategoryItemProps> = ({ category, actives, parentPath }) => {
  const hasChildren = category.children && category.children.length > 0;
  const isActive =
    actives.includes(category.id) && !(category.children ?? []).some((c) => actives.includes(c.id));
  const itemRef = useRef<HTMLDivElement>(null);
  const currentPath = useMemo(
    () => `${parentPath}/${category.slug || category.id}`,
    [parentPath, category.slug, category.id],
  );

  // 滚动到视图
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  if (hasChildren) {
    return (
      <AccordionItem value={category.id} className="border-none" data-active={isActive}>
        <div ref={itemRef} className={cn($styles.folderItem, isActive && $styles.active)}>
          <div
            className={$styles.folderLink}
            style={{ paddingLeft: `${0.5 * (category.depth - 1)}rem` }}
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            <AccordionTrigger
              className="flex flex-1 py-0 font-medium hover:no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                className="ellips animate-decoration animate-decoration-sm mr-2"
                href={currentPath}
              >
                {category.name}
              </Link>
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent className="pb-0!">
          <div className={$styles.children}>
            {category.children?.map((child) => (
              <Item key={child.id} category={child} actives={actives} parentPath={currentPath} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div ref={itemRef} className={cn($styles.item, isActive && $styles.active)}>
      <div className={$styles.itemLink} style={{ paddingLeft: `${0.5 * (category.depth - 1)}rem` }}>
        <FileIcon className="mr-2 h-4 w-4" />
        {/* <span className="font-medium">{category.name}</span> */}
        <Link
          key={category.id}
          href={currentPath}
          className="ellips animate-decoration animate-decoration-sm"
        >
          {category.name}
        </Link>
      </div>
    </div>
  );
};

export const CategoryTreeComponent: FC<{ categories: CategoryTree; actives: string[] }> = ({
  categories,
  actives,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className={cn($styles.container)}>
      <Accordion type="multiple" className={$styles.accordion} defaultValue={actives}>
        {categories.map((category) => (
          <Item key={category.id} category={category} actives={actives} parentPath="" />
        ))}
      </Accordion>
    </div>
  );
};
