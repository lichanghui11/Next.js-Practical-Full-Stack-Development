import tagRepo from '@/database/repositories/tag.repo';

// 获取单个标签
export const queryTagItem = async (idOrText: string) => {
  return await tagRepo.queryTagItem(idOrText);
};

// 获取标签列表
export const queryTagList = async () => {
  return await tagRepo.queryTagList();
};
