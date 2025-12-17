'use server';
import { fakerZH_CN as faker } from '@faker-js/faker';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

import type { IPost } from './fake-data-types';
// 假数据生成需要用到 node 相关接口

// 生成假数据的内部函数（不导出）
const generateFakePosts = (): IPost[] => {
  return Array.from({ length: 30 })
    .fill(0)
    .map((_) => {
      return {
        id: uuid(),
        title: faker.lorem.sentence().replace(/\.$/, ''),
        content: faker.lorem.paragraphs(
          { min: 3, max: 6 },
          '\n\n',
        ),
        createdAt: faker.date
          .recent({ days: 90 })
          .toISOString(),
        summary:
          Math.random() < 0.5
            ? faker.lorem.sentences({ min: 1, max: 3 })
            : undefined,
        thumbnail: faker.image.urlPicsumPhotos({
          width: 640,
          height: 360,
        }),
      };
    });
};

const dbPath = path.join(process.cwd(), 'db.json');

// 检查 / 创建 db 文件
export const checkDbFile = async () => {
  if (!existsSync(dbPath)) {
    const fakePosts = generateFakePosts();
    await fs.writeFile(
      dbPath,
      JSON.stringify(fakePosts, null, 2),
      'utf-8',
    );
  }
};

// 读取数据库
export const readDbFile = async (): Promise<IPost[]> => {
  await checkDbFile();

  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('数据库文件损坏，重建中...', e);
    return [];
  }
};

// 重写数据库
export const resetDbFile = async (data: IPost[]) => {
  await checkDbFile();
  await fs.writeFile(
    dbPath,
    JSON.stringify(data, null, 2),
    'utf-8',
  );
};
