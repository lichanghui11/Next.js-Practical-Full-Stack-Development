import type { Category, Prisma } from '@prisma/client';

import { fakerZH_CN } from '@faker-js/faker';
import { isNil } from 'lodash';

import { generateSlug } from '@/app/_components/blog-components/submit-form/utils';
import { randomIntFrom } from '@/lib/random';

// 编写种子数据的填充逻辑
import prisma from '../client/admin-client';
const tags = [
  // 前端框架
  'React',
  'Vue',
  'Next.js',
  'Nuxt',
  'Svelte',
  'Angular',
  'Solid.js',

  // 后端/运行时
  'Node.js',
  'Deno',
  'Bun',
  'Express',
  'Hono.js',
  'NestJS',
  'Fastify',

  // 语言
  'TypeScript',
  'JavaScript',
  'Python',
  'Go',
  'Rust',
  'Java',

  // 数据库
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'SQLite',
  'Prisma',
  'Drizzle',

  // 云服务/部署
  'Docker',
  'Kubernetes',
  'Vercel',
  'AWS',
  'Cloudflare',
  'Supabase',

  // 工具链
  'Vite',
  'Webpack',
  'ESLint',
  'Prettier',
  'pnpm',
  'Turborepo',

  // 概念/实践
  'GraphQL',
  'REST API',
  'WebSocket',
  'SSR',
  'SSG',
  'PWA',
  'Monorepo',
  'CI/CD',
  '微服务',
  '性能优化',
  '单元测试',
  'E2E测试',

  // AI相关
  'OpenAI',
  'LangChain',
  'LLM',
  'RAG',
  'Prompt工程',

  // 其他热门
  'TailwindCSS',
  'Shadcn/ui',
  'Zustand',
  'React Query',
  'tRPC',
  'Zod',
];
const categories = [
  // 根分类
  '技术文集',
  '创业笔记',
  '生活随笔',
  '探索世界',
  '设计与体验',
  '写作工坊',
  '效率系统',
  '产品日志',
  'AI实验室',
  '架构思考',
  '数据之道',
  '开源纪行',
  '个人成长',
  '行业观察',

  // 技术文集 子分类
  '课程',
  'TS全栈开发',
  'React进阶',
  '数据库实战',
  '工程化',
  'Monorepo实践',
  'CI/CD流程',

  // 创业笔记 子分类
  '码农创业记',
  '产品冷启动',
  '融资备忘',

  // 生活随笔 子分类
  '日常碎片',
  '读书札记',

  // 探索世界 子分类
  '城市漫游',
  '山野徒步',
  '海边旅行',

  // 设计与体验 子分类
  '交互设计',
  '信息架构',
  '可用性测试',
  '视觉语言',
  '配色实践',
  '排版系统',

  // 写作工坊 子分类
  '标题方法论',
  '长文结构',
  '叙事技巧',

  // 效率系统 子分类
  '时间管理',
  '任务拆解',
  '复盘方法',

  // 产品日志 子分类
  '需求洞察',
  '版本迭代',
  '用户反馈',

  // AI实验室 子分类
  '提示词工程',
  '模型评测',
  '应用案例',

  // 架构思考 子分类
  '服务拆分',
  '缓存策略',
  '一致性方案',

  // 数据之道 子分类
  '数据建模',
  '指标体系',
  '数据可视化',

  // 开源纪行 子分类
  '贡献指南',
  '社区治理',
  '许可证选型',

  // 个人成长 子分类
  '技能地图',
  '职业规划',
  '学习方法',

  // 行业观察 子分类
  'SaaS趋势',
  'B端产品',
  '出海记录',
];
export const createSeedPosts = async () => {
  await prisma.post.$truncate();
  const blogImages = Array.from({ length: 11 }, (_, i) => `/blog-demo-images/blog-${i + 1}.png`);
  for (let i = 0; i < 30; i++) {
    const categoryIdx = randomIntFrom(0, categories.length - 1);
    const titleTemp = fakerZH_CN.lorem.sentence().replace(/\.$/, '');
    const categoryName = categories[categoryIdx];
    /**
     * 这里模拟的是根据已经存进去的分类数据进行查询的
     */
    const category = await prisma.category.findFirst({
      where: { name: categoryName },
    });
    if (isNil(category)) {
      throw new Error(`Category ${categoryName} not found`);
    }
    const tagsInput = {
      // connectOrCreate 是一个关键字
      connectOrCreate: tags.map((tag) => ({
        where: { text: tag },
        create: { text: tag },
      })),
    };

    const summary = Math.random() < 0.5 ? fakerZH_CN.lorem.sentences({ min: 1, max: 3 }) : null;
    await prisma.post.create({
      select: { id: true },
      data: {
        title: titleTemp,
        content: fakerZH_CN.lorem.paragraphs({ min: 3, max: 6 }, '\n\n'),
        summary,
        thumbnail: fakerZH_CN.helpers.arrayElement(blogImages),
        slug: generateSlug(titleTemp),
        keywords: fakerZH_CN.lorem.words({ min: 3, max: 6 }).split(' ').join(','),
        description: fakerZH_CN.lorem.sentences({ min: 1, max: 3 }),
        category: {
          connect: { id: category.id },
        },
        tags: tagsInput,
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
type Item = Pick<Prisma.CategoryCreateInput, 'name'> & { children?: Item[] };
const data: Item[] = [
  {
    name: '技术文集',
    children: [
      {
        name: '课程',
        children: [{ name: 'TS全栈开发' }, { name: 'React进阶' }, { name: '数据库实战' }],
      },
      { name: '工程化', children: [{ name: 'Monorepo实践' }, { name: 'CI/CD流程' }] },
    ],
  },
  {
    name: '创业笔记',
    children: [{ name: '码农创业记' }, { name: '产品冷启动' }, { name: '融资备忘' }],
  },
  { name: '生活随笔', children: [{ name: '日常碎片' }, { name: '读书札记' }] },
  {
    name: '探索世界',
    children: [{ name: '城市漫游' }, { name: '山野徒步' }, { name: '海边旅行' }],
  },
  {
    name: '设计与体验',
    children: [
      { name: '交互设计', children: [{ name: '信息架构' }, { name: '可用性测试' }] },
      { name: '视觉语言', children: [{ name: '配色实践' }, { name: '排版系统' }] },
    ],
  },
  {
    name: '写作工坊',
    children: [{ name: '标题方法论' }, { name: '长文结构' }, { name: '叙事技巧' }],
  },
  {
    name: '效率系统',
    children: [{ name: '时间管理' }, { name: '任务拆解' }, { name: '复盘方法' }],
  },
  {
    name: '产品日志',
    children: [{ name: '需求洞察' }, { name: '版本迭代' }, { name: '用户反馈' }],
  },
  {
    name: 'AI实验室',
    children: [{ name: '提示词工程' }, { name: '模型评测' }, { name: '应用案例' }],
  },
  {
    name: '架构思考',
    children: [{ name: '服务拆分' }, { name: '缓存策略' }, { name: '一致性方案' }],
  },
  {
    name: '数据之道',
    children: [{ name: '数据建模' }, { name: '指标体系' }, { name: '数据可视化' }],
  },
  {
    name: '开源纪行',
    children: [{ name: '贡献指南' }, { name: '社区治理' }, { name: '许可证选型' }],
  },
  {
    name: '个人成长',
    children: [{ name: '技能地图' }, { name: '职业规划' }, { name: '学习方法' }],
  },
  { name: '行业观察', children: [{ name: 'SaaS趋势' }, { name: 'B端产品' }, { name: '出海记录' }] },
];

/**
 * 这个递归函数产生的副作用就是把数据存入数据库，并没有返回任何数据
 * @param item
 * @param parent
 */
const createCategory = async (item: Item, parent?: Category) => {
  let category: Category;
  const { name, children } = item;
  if (isNil(parent)) {
    // 创建根节点（没有父节点）
    // 这里创建节点的同时也已经把这个节点存进了数据库
    console.log(`Creating root: ${name}`);
    category = await prisma.category.createRoot({
      data: { name, slug: generateSlug(name) },
    });
    console.log(`Created root: ${name}, path: ${category.path}`);
  } else {
    // 创建子节点前，先从数据库重新获取父节点的最新状态
    // 因为父节点的 numchild 可能已经被之前的 createChild 更新了
    const freshParent = await prisma.category.findUnique({ where: { id: parent.id } });
    if (!freshParent) throw new Error(`Parent ${parent.name} not found`);

    console.log(
      `Creating child: ${name}, parent: ${freshParent.name}, numchild: ${freshParent.numchild}`,
    );
    category = await prisma.category.createChild({
      node: freshParent,
      data: { name, slug: generateSlug(name) },
    });
    console.log(`Created child: ${name}, path: ${category.path}`);
  }

  if (!isNil(children)) {
    for (const child of children) {
      await createCategory(child, category);
    }
  }
};
export const createSeedCategories = async () => {
  for (const item of data) {
    await createCategory(item);
  }
};
