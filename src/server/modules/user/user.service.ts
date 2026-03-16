import type { EmailOTPType } from '@/server/modules/user/user.constants';
import type { ResetPasswordRequest, SignupRequest } from '@/server/modules/user/user.type';

import UserRepo from '@/database/repositories/user.repo';

// 获取当前用户会话信息
export const getCurrentSession = async (request: Request) => {
  return UserRepo.getCurrentSession(request);
};

// 用户登陆：支持用户名或邮箱
export const signIn = async (usernameOrEmail: string, password: string) => {
  console.log('server 层： usernameOrEmail', usernameOrEmail);
  console.log('server 层： password', password);
  return UserRepo.signIn(usernameOrEmail, password);
};

// 用户登出
export const signOut = async (request: Request) => {
  return UserRepo.signOut(request);
};

// 获取单个用户信息
export const getUser = async (request: Request) => {
  return UserRepo.getUser(request);
};

// 根据用户id、用户名、邮箱地址等多种凭证查询用户
export const queryUser = async (credential: string) => {
  return UserRepo.queryUser(credential);
};

// 根据用户名或邮箱地址查询用户
export const queryUserByUsernameOrEmail = async (usernameOrEmail: string) => {
  return UserRepo.queryUserByUsernameOrEmail(usernameOrEmail);
};

// 根据用户名查询用户
export const queryUserByUsername = async (username: string) => {
  return UserRepo.queryUserByUsername(username);
};

// 根据邮箱地址查询用户
export const queryUserByEmail = async (email: string) => {
  return UserRepo.queryUserByEmail(email);
};

// 根据用户id删除用户
export const deleteUser = async (userId: string) => {
  return UserRepo.deleteUser(userId);
};

// 邮箱密码重置：通过邮箱和OTP重置密码
export const resetPasswordByEmail = async (data: ResetPasswordRequest) => {
  return UserRepo.resetPasswordByEmail(data);
};

// 邮箱注册：通过邮箱和密码注册用户
export const signUpByEmail = async (data: Omit<SignupRequest, 'validateType'>) => {
  return UserRepo.signUpByEmail(data);
};

// 发送验证码
export const sendOTP = async (email: string, type: `${EmailOTPType}`) => {
  console.log('server 层： sendOTP', email, type);
  return UserRepo.sendOTP(email, type);
};
