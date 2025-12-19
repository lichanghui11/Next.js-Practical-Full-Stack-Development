// 这个客户端（Prisma Client）是用于 seeding 的客户端，有一些敏感操作（删除数据库表），实际的业务逻辑需要额外的创建一个客户端
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// 这个插件是复制的其他项目的源码，源码已经没有维护了，支持 sqlite postgresql mysql
import { truncateExt } from '../extentions/truncate';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }).$extends(truncateExt('postgres'));

export default prisma;
