// 编写种子数据的填充逻辑

import type { Category, Prisma } from '@prisma/client';

import { fakerZH_CN } from '@faker-js/faker';
import { isNil } from 'lodash';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { generateSlug } from '@/app/_components/blog-components/submit-form/utils';
import { createServerAuth } from '@/lib/auth/server';

import prisma from '../client/admin-client';

export const createSeedPosts = async () => {
  await prisma.post.$truncate();
  const blogImages = Array.from({ length: 11 }, (_, i) => `/blog-demo-images/blog-${i + 1}.png`);

  type Item = Pick<Prisma.PostCreateInput, 'title' | 'summary'> & {
    bodyPath: string;
    categoryName: string;
    tagNames?: string[];
  };

  const data: Item[] = [
    {
      title: 'Node.js环境搭建及应用初始化',
      summary:
        '本节课我们开始正式学习TS（Typescript）全栈开发。广义的TS全栈开发包含了许多领域，比如可以使用React Native开发移动APP，小程序也是使用TS开发的，甚至使用成熟的Electron框架还能开发跨平台的桌面软件（新版QQ就是Electron写的）。但我们的课程因为篇幅和精力有限，所以，目前只涉及狭义上的TS全栈开发，即TS web开发（包括react中后台管理系统开发、 Next.js全栈开发和网站前台开发、 Nestjs后端开发等）。不过整个TS的生态都是相通的，学会TS的web开发后，再去学习其他如React Native这些生态，也可以非常快速地掌握。',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/1.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'nextjs', 'hono.js'],
    },
    {
      title: 'Next.js应用初始化',
      summary:
        'react本身只是一个渲染层，并不是一个框架。所以一般我们开发react web应用（移动、桌面等除外）有这些比较流行的方案',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/2.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js'],
    },
    {
      title: 'React内置Hooks的使用与自定义详解',
      summary:
        '学习一些react自带的hooks以基本掌握react应用的简单开发。在这节课中，我们通过几个小案例（如黑暗主题切换，语言包选择等）详细深入地了解一下react编码的一个基本规则，为后面课程的前端部分的学习打下坚实的基础',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/3.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react'],
    },
    {
      title: 'Next.js中使用Zustand进行状态管理详解',
      summary:
        '前面我们已经学习了使用`contenxt`、`useReducer`等进行状态管理。但是这种方法略显麻烦，而且对代码感官和应用性能并不友好。所以，这节课，我们尝试使用更简洁好用的zustand进行状态管理。',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/4.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'zustand'],
    },
    {
      title: 'Next.js核心概念及应用构建',
      summary:
        '无论本篇后续的next.js相关章节还是更高级篇章的next.js课程都是基于这节课的应用进行扩展的，所以请务必确保掌握！',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/5.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js', 'tailwindcss', 'shadcn'],
    },
    {
      title: 'Server Action+Prsima全栈开发入门',
      summary: '学习如何使用 next.js 的 server action 结合 prsima orm 进行全栈开发',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/6.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js', 'prisma', 'orm'],
    },
    {
      title: 'Markdown编辑器与自研MDX渲染实现',
      summary: '实现使用mdx/markdown渲染文章内容以及markdown编辑器来编辑文章内容',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/7.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js', 'mdx', 'markdown'],
    },
    {
      title: '用户体验改进与SEO优化',
      summary: '本节课程我们不追究太多新功能，而是对应用进行优化以提升用户体验和SEO等',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/8.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js', 'seo', 'ssr'],
    },
    {
      title: 'Next.js+Hono.js实现全栈开发',
      summary:
        'next.js的server action由于其本身的一些特质，一般只适用于一些迷你型应用或简单demo的后端（比如一个带有少量动态数据的企业官网等）。而绝大多数情况下，我们需要一个比较好的功能完备且健全的后端框架来整合next.js，并公开API，以方面外部应用（如桌面app、移动app等）调用。',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/9.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js', 'hono.js'],
    },
    {
      title: 'Hono.js整合OpenAPI(Swagger)+Zod实现接口类型安全与可调试',
      summary:
        '本节课内容比较简单。为了能清晰的调试和查阅API，我们整合一下swagger（openapi）与Hono.js。这样，我们不仅能快速地在apifox、postman、insomnia等工具中调试api，也可以通过swagger web ui来查看和单点运行api',
      bodyPath: path.join(__dirname, '../fixture/ts-fullstack/10.md'),
      categoryName: 'TS全栈开发',
      tagNames: ['nodejs', 'typescript', 'react', 'next.js', 'hono.js', 'swagger', 'zod'],
    },
    {
      title: '我的计算机编码起始之路',
      summary: '记录07-13年之间，我学习计算机编程和创业的经历',
      bodyPath: path.join(__dirname, '../fixture/creative/1.md'),
      categoryName: '码农创业记',
      tagNames: ['创业', 'delphi', 'php'],
    },
    {
      title: '兜兜转转的创业史',
      summary: '记录13-22年之间，我创业和打工的经历',
      bodyPath: path.join(__dirname, '../fixture/creative/2.md'),
      categoryName: '码农创业记',
      tagNames: ['创业', '外包', '融资'],
    },
  ];
  for (const item of data) {
    const { title: titleTemp, summary, bodyPath, categoryName, tagNames } = item;
    const category = await prisma.category.findFirst({ where: { name: categoryName } });
    if (!category) {
      throw new Error(`Category ${categoryName} not found for post ${titleTemp}`);
    }
    let tags;
    if (!isNil(tagNames)) {
      tags = {
        connectOrCreate: tagNames.map((tagName) => ({
          where: { text: tagName },
          create: { text: tagName },
        })),
      };
    }
    await prisma.post.create({
      select: { id: true },
      data: {
        title: titleTemp,
        content: readFileSync(bodyPath, 'utf-8'),
        summary,
        thumbnail: fakerZH_CN.helpers.arrayElement(blogImages),
        slug: generateSlug(titleTemp),
        keywords: tagNames?.join(',') ?? '',
        description: summary,
        category: {
          connect: { id: category.id },
        },
        tags,
      },
    });
  }
};

// -------------------------------------
const auth = createServerAuth();
export const createSeedUsers = async () => {
  // 使用 better-auth 内部 API 创建用户， 创建一个固定用户（管理员/默认用户）
  const res = await auth.api.signUpEmail({
    body: {
      name: 'lichanghui', // 用户名
      email: 'weeesti470@gmail.com',
      password: 'weeesti470@gmail.com',
      username: 'lichanghui', // 登陆用的用户名
      displayUsername: 'lichanghui', // 展示用的用户名
    },
  });

  // 再添加一个用户
  const res1 = await auth.api.signUpEmail({
    body: {
      name: 'weeesti', // 用户名
      email: '1769444976@qq.com',
      password: 'hui8449600004',
      username: 'weeesti', // 登陆用的用户名
      displayUsername: 'weeesti', // 展示用的用户名
    },
  });

  // 将这个固定用户设置为“邮箱已验证” （跳过邮箱验证步骤）
  if (res?.user?.email) {
    await prisma.user.update({
      where: { email: res1.user.email }, // 根据邮箱找到这个用户
      data: { emailVerified: true }, // 直接将这个用户的 邮箱验证情况 标记为已验证
    });
  }
  // 将这个固定用户设置为“邮箱已验证” （跳过邮箱验证步骤）
  if (res1?.user?.email) {
    await prisma.user.update({
      where: { email: res.user.email }, // 根据邮箱找到这个用户
      data: { emailVerified: true }, // 直接将这个用户的 邮箱验证情况 标记为已验证
    });
  }

  // 循环创建12个随机测试用户
  for (let i = 0; i < 12; i++) {
    // 生成随机用户名（用于后续字段填充）
    const username = fakerZH_CN.internet.username();
    // 调用Better Auth的注册API创建随机用户
    const result = await auth.api.signUpEmail({
      body: {
        name: username, // 随机用户名
        email: fakerZH_CN.internet.email(), // 随机邮箱
        password: fakerZH_CN.internet.password(), // 随机密码
        username, // 随机登录用户名
        displayUsername: fakerZH_CN.internet.displayName(), // 随机展示名
      },
    });

    // 第四步：随机标记部分用户为“邮箱已验证”（模拟真实场景：部分用户验证邮箱，部分未验证）
    if (result?.user?.email && fakerZH_CN.number.int({ min: 0, max: 1 }) === 1) {
      await prisma.user.update({
        where: { email: result.user.email },
        data: { emailVerified: true },
      });
    }
  }
};

// -------------------------------------

type Item = Pick<Prisma.CategoryCreateInput, 'name'> & { children?: Item[] };
const data: Item[] = [
  { name: '技术文集', children: [{ name: '课程', children: [{ name: 'TS全栈开发' }] }] },
  { name: '创业笔记', children: [{ name: '码农创业记' }] },
  { name: '生活随笔' },
  { name: '探索世界' },
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
    category = await prisma.category.createRoot({
      data: { name, slug: generateSlug(name) },
    });
  } else {
    // 创建子节点前，先从数据库重新获取父节点的最新状态
    // 因为父节点的 numchild 可能已经被之前的 createChild 更新了
    const freshParent = await prisma.category.findUnique({ where: { id: parent.id } });
    if (!freshParent) throw new Error(`Parent ${parent.name} not found`);

    category = await prisma.category.createChild({
      node: freshParent,
      data: { name, slug: generateSlug(name) },
    });
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
