// 格式化时间
export function formatDate(
  input: Date | string | number,
  options?: {
    withTime?: boolean; // 是否显示时分
    withSeconds?: boolean;
    fallback?: string; // 无效时间的兜底
  },
) {
  const fallback = options?.fallback ?? '';

  const date =
    input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return fallback;

  const pad = (n: number) => String(n).padStart(2, '0');

  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const D = pad(date.getDate());

  if (!options?.withTime) {
    return `${Y}-${M}-${D}`;
  }

  const h = pad(date.getHours());
  const m = pad(date.getMinutes());

  if (!options.withSeconds) {
    return `${Y}-${M}-${D} ${h}:${m}`;
  }

  const s = pad(date.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
