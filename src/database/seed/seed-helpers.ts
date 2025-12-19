import { fakerZH_CN } from '@faker-js/faker';

// 编写种子数据的填充逻辑
import prisma from '../client/admin-client';

export const createSeedPosts = async () => {
  await prisma.post.$truncate();
  const blogImages = Array.from({ length: 11 }, (_, i) => `/blog-demo-images/blog-${i + 1}.png`);
  for (let i = 0; i < 30; i++) {
    await prisma.post.create({
      select: { id: true },
      data: {
        title: fakerZH_CN.lorem.sentence().replace(/\.$/, ''),
        content: fakerZH_CN.lorem.paragraphs({ min: 3, max: 6 }, '\n\n'),
        summary: Math.random() < 0.5 ? fakerZH_CN.lorem.sentences({ min: 1, max: 3 }) : undefined,
        thumbnail: fakerZH_CN.helpers.arrayElement(blogImages),
      },
    });
  }
};
export const createSeedUsers = async () => {
  await prisma.user.$truncate();
  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      select: { id: true },
      data: {
        email: fakerZH_CN.internet.email(),
        name: fakerZH_CN.person.firstName(),
      },
    });
  }
};
