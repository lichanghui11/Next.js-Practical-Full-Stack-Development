/* eslint-disable vars-on-top */
// 这里定义专门用于业务层的 Prisma Client
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
// 使用了一个分页扩展
import { pagination } from 'prisma-extension-pagination';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

// 把类型挂到全局
declare global {
  var pgPool: Pool | undefined;
  var prismaApp: ReturnType<typeof createPrisma> | undefined;
}
const pool =
  globalThis.pgPool ??
  new Pool({
    connectionString,
  });
/**
 	•	✅ dev 热更新不会重复 new Pool / PrismaClient
	•	✅ DATABASE_URL 缺失直接报错
	•	✅ 业务端只拥有 pagination（不带 truncate）
   */
function createPrisma() {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter }).$extends(pagination());
}
const prisma = globalThis.prismaApp ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPool = pool;
  globalThis.prismaApp = prisma;
}

export default prisma;
