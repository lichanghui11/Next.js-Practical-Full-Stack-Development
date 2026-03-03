import { isNil } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * useUrlQuery 用来拿到当前页面 URL 的查询字符串，并统一返回成：
 * 没有任何 query → 返回 ''
 * 有 query → 返回 '?a=1&b=2'（带问号）
 * 
 * 最终返回值是什么？
	•	URL 是 /blog → useUrlQuery() 返回 ''
	•	URL 是 /blog?tag=react → 返回 '?tag=react'
	•	URL 是 /blog?page=2&sort=hot → 返回 '?page=2&sort=hot'
 */
export const useUrlQuery = () => {
  // Next.js App Router 的 hook：读取当前 URL 的 search params（?a=1&b=2 这部分）。
  const searchParmas = useSearchParams();
  return useMemo(() => {
    // 这层“再包一次”通常是为了把它变成标准 URLSearchParams 再序列化（有时能保证格式一致、也能避免某些实现差异）。
    // 但多数情况下有点冗余，因为 searchParams.toString() 本身就够用了。这里跟教程保持一致
    const query = new URLSearchParams(searchParmas.toString()).toString();
    return isNil(query) ? '' : `?${query}`;
  }, [searchParmas]);
};
