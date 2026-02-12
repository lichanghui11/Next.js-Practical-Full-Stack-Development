import 'dotenv/config';

import prisma from '../client/admin-client';
import { createSeedCategories, createSeedPosts, createSeedUsers } from './seed-helpers';

async function main() {
  try {
    // 先删除有外键依赖的表
    await prisma.post.$truncate();
    await prisma.category.$truncate();
    await prisma.user.$truncate();

    await createSeedCategories();
    await createSeedPosts();
    await createSeedUsers();
    console.log('✅ Seed data created successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect(); // 关闭数据库连接
    process.exit(); // 退出进程
  }
}

main();
