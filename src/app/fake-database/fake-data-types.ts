// 假数据中的文章的类型
export interface IPost extends Record<string, any> {
  id: string; // 文章 id
  title: string; // 文章标题
  content: string; // 文章内容
  createdAt: string; // 创建时间
  thumbnail?: string; // 文章缩略图
  summary?: string; // 文章摘要
}
