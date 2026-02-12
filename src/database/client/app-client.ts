/* eslint-disable vars-on-top */
// 这里定义专门用于业务层的 Prisma Client
import 'dotenv/config';
import type { Category, Prisma } from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { isNil } from 'lodash';
import { Pool } from 'pg';
import { withBark } from 'prisma-extension-bark';
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
    max: 30, // 最大连接数
    idleTimeoutMillis: 60000, // 连接空闲超时
    connectionTimeoutMillis: 2000, // 连接超时
  });
/**
 	•	✅ dev 热更新不会重复 new Pool / PrismaClient
	•	✅ DATABASE_URL 缺失直接报错
	•	✅ 业务端只拥有 pagination（不带 truncate）
   */
interface CategoryTreeParams {
  where: Prisma.CategoryWhereInput;
  select?: Prisma.CategorySelect | null;
}
function createPrisma() {
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter })
    .$extends(pagination())
    .$extends(withBark({ modelNames: ['category'] }));
  return client.$extends({
    modal: {
      category: {
        async getAncestorChainWithSelf(params: CategoryTreeParams): Promise<Category[]> {
          // 祖先链 + 自己
          const current = await client.category.findFirst({
            where: params.where,
            select: params.select,
          });
          if (isNil(current)) return [];
          const ancestors = await client.category.findAncestors({
            where: { id: current.id },
          });
          return [...(ancestors || []), current];
        },
        async getDescendantTreeWithSelf(params: CategoryTreeParams): Promise<Category[]> {
          // 后代树 + 自己
          const current = await client.category.findFirst({
            where: params.where,
            select: params.select,
          });
          if (isNil(current)) return [];
          const descendants = await client.category.findDescendants({
            where: { id: current.id },
          });
          return [current, ...(descendants || [])];
        },
      },
    },
  });
}
const prisma = globalThis.prismaApp ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPool = pool;
  globalThis.prismaApp = prisma;
}

export default prisma;
