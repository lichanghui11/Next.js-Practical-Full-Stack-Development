// 生成随机数的工具函数

// 小于 N 的随机整数
export const getRandomInt = (N: number) =>
  Math.floor(Math.random() * N);

// 一定范围内的整数
export const getRandomIntInclusive = (
  min: number,
  max: number,
) => Math.floor(Math.random() * (max - min + 1)) + min;

// 只包含字母的一定长度的字符串
export const getRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return result;
};

// 从列表中获取一个随机项
export const getRandomList = <T>(list: T[]) => {
  const randomIndex = getRandomInt(list.length);
  return list[randomIndex];
};

// 获取多个 item 组成列表，如果有 id ，不能重复
export const getRandomLists = <
  T extends Record<string, any>,
>(
  list: T[],
) => {
  const result: T[] = [];
  for (let i = 0; i < list.length; i++) {
    const currList = getRandomList(list);
    const isUnique = !result.find((item) => {
      if (
        'id' in (currList as Record<string, any>) &&
        'id' in (item as Record<string, any>)
      ) {
        return item?.id === currList?.id;
      } else {
        return currList === item;
      }
    });
    if (!isUnique) {
      result.push(currList);
    }
  }
  return result;
};
