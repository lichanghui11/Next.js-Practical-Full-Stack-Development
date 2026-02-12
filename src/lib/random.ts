// 编写一个函数，使其可以生成一个区间之间的随机数(含最大值，含最小值)

export const randomIntFrom = (min: number, max: number) => {
  const minc = Math.ceil(min);
  const maxc = Math.floor(max);
  return Math.floor(Math.random() * (maxc - minc + 1)) + minc;
};
