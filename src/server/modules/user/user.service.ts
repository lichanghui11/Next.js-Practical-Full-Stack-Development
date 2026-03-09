import UserRepo from '@/database/repositories/user.repo';

// 获取当前用户会话信息
export const getCurrentSession = async (request: Request) => {
  return await UserRepo.getCurrentSession(request);
};

// 用户登陆：支持用户名或邮箱
export const signIn = async (usernameOrEmail: string, password: string) => {
  return await UserRepo.signIn(usernameOrEmail, password);
};

// 用户登出
export const signOut = async (request: Request) => {
  return await UserRepo.signOut(request);
};

// 获取单个用户信息
export const getUser = async (request: Request) => {
  return await UserRepo.getUser(request);
};
