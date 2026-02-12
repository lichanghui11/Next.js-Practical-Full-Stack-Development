import prismaClient from '../client/app-client';

const tagRepo = {
  // 获取单个标签数据
  queryTagItem: async (idOrText: string) => {
    const tag = await prismaClient.tag.findUnique({
      where: {
        // id 是 uuid，不需要解码，当标签文本（text）作为 URL 的一部分传递时，特殊字符（如中文、空格、#、& 等）会被 URL 编码。
        OR: [{ id: idOrText }, { text: decodeURIComponent(idOrText) }],
      },
    });
    return tag;
  },

  // 获取标签数组
  queryTagList: async () => {
    return await prismaClient.tag.findMany();
  },
};

export default tagRepo;
