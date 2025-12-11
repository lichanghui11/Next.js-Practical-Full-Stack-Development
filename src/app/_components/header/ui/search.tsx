import type { FC } from 'react';

import { Search as LucideSearch } from 'lucide-react';
import { Input } from 'ui/input';

import $styles from './search.module.css';
const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const keyword = formData.get('q')?.toString().trim();
  // TODO: 触发搜索逻辑
};
export const Search: FC = () => {
  return (
    <form onSubmit={onSubmit} className="text-base">
      <div className="relative w-full max-w-xs">
        {/* 左侧放大镜图标 */}
        <LucideSearch className={$styles.search} />

        {/* 输入框本体 */}
        <Input
          placeholder="Search it"
          className={$styles.input}
        />
      </div>
    </form>
  );
};
