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
  category: CategoryItem;
  // actives 是一条“从根到当前分类”的 id 路径（例如 ['a','b','c']）
  actives: string[];
  // 用于生成URL路径的字符串
  parentPath: string;
}

const TreeItem: FC<CategoryItemProps> = ({ category, actives, parentPath }) => {
  // 该分类是否有子分类
  const hasChildren = category.children && category.children.length > 0;

  const isActive =
    // 当前节点位于这条路径上（可能是根、中间父节点、也可能是最后那个节点）
    actives.includes(category.id) &&
    // 当前节点的子节点中，没有任何一个在 actives 路径上。
    !(category.children ?? []).some((cat) => actives.includes(cat.id));

  // 生成当前页面的路由路径
  const currentPath = useMemo(() => {
    return `${parentPath}/${category.slug || category.id}`;
  }, [parentPath, category.slug, category.id]);

  const itemRef = useRef<HTMLDivElement | null>(null);

  // 滚动到当前激活的分类
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  if (hasChildren) {
    return (
      <AccordionItem value={category.id} className="border-none" data-active={isActive}>
        <div ref={itemRef} className={cn($styles.FolderItem, isActive && $styles.active)}>
          <div
            className={cn($styles.folderLink, 'flex')}
            style={{
              paddingLeft: `${0.5 * (category.depth - 1)}rem`,
            }}
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            <AccordionTrigger
              className="flex flex-1 py-0 font-medium hover:no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={currentPath}
                className="ellips animate-decoration animate-decoration-sm mr-2"
              >
                {category.name}
              </Link>
            </AccordionTrigger>
          </div>
        </div>

        <AccordionContent className="pb-0!">
          <div className={$styles.children}>
            {category.children?.map((child) => {
              return (
                <TreeItem
                  key={child.id}
                  category={child}
                  actives={actives}
                  parentPath={currentPath}
                />
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div ref={itemRef} className={cn($styles.item, isActive && $styles.active)}>
      <div
        style={{
          paddingLeft: `${0.5 * (category.depth - 1)}rem`,
        }}
        className={$styles.itemLink}
      >
        <FileIcon className="mr-2 h-4 w-4"></FileIcon>
        <Link
          href={currentPath}
          key={category.id}
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className={$styles.container}>
      <Accordion type="multiple" className={cn($styles.accordion)} defaultValue={actives}>
        {categories.map((category) => (
          <TreeItem key={category.id} category={category} actives={actives} parentPath="/blog" />
        ))}
      </Accordion>
    </div>
  );
};
