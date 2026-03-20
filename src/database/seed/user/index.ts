import { fakerZH_CN } from '@faker-js/faker';

import { createServerAuth } from '@/lib/auth/server';

import prisma from '../../client/admin-client';

const auth = createServerAuth();
export const createSeedUsers = async () => {
  // 使用 better-auth 内部 API 创建用户， 创建一个固定用户（管理员/默认用户）
  const res = await auth.api.signUpEmail({
    body: {
      name: 'lichanghui', // 用户名
      email: 'weeesti470@gmail.com',
      password: 'hui8449600004',
      username: 'lichanghui', // 登陆用的用户名
      displayUsername: 'lichanghui', // 展示用的用户名
      image: '/logo.png',
    },
  });
  // 将这个固定用户设置为“邮箱已验证” （跳过邮箱验证步骤）
  if (res?.user?.email) {
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
