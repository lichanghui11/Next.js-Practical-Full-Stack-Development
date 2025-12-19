import 'dotenv/config';

import prisma from '../client/admin-client';
import { createSeedPosts, createSeedUsers } from './seed-helpers';

async function main() {
  try {
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
