import type { EmailOTPType } from '@/server/modules/user/user.constants';
import type { ResetPasswordRequest, SignupRequest } from '@/server/modules/user/user.type';

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

// 根据用户id、用户名、邮箱地址等多种凭证查询用户
export const queryUser = async (credential: string) => {
  return await UserRepo.queryUser(credential);
};

// 根据用户名或邮箱地址查询用户
export const queryUserByUsernameOrEmail = async (usernameOrEmail: string) => {
  return await UserRepo.queryUserByUsernameOrEmail(usernameOrEmail);
};

// 根据用户名查询用户
export const queryUserByUsername = async (username: string) => {
  return await UserRepo.queryUserByUsername(username);
};

// 根据邮箱地址查询用户
export const queryUserByEmail = async (email: string) => {
  return await UserRepo.queryUserByEmail(email);
};

// 根据用户id删除用户
export const deleteUser = async (userId: string) => {
  return await UserRepo.deleteUser(userId);
};

// 邮箱密码重置：通过邮箱和OTP重置密码
export const resetPasswordByEmail = async (data: ResetPasswordRequest) => {
  return await UserRepo.resetPasswordByEmail(data);
};

// 邮箱注册：通过邮箱和密码注册用户
export const signUpByEmail = async (data: Omit<SignupRequest, 'validateType'>) => {
  return await UserRepo.signUpByEmail(data);
};

// 发送验证码
export const sendOTP = async (email: string, type: `${EmailOTPType}`) => {
  return await UserRepo.sendOTP(email, type);
};
