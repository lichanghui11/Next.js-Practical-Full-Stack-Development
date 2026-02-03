// 将响应结构体的返回进行封装
// src/server/common/response.ts
import type { ZodType } from 'zod';

import { resolver } from 'hono-openapi';

import { errorSchema } from './schema';

/**
 * 创建OpenAPI响应信息
 * @param schema 需要显示的结构体
 * @param status 当前响应的HTTP状态码
 * @param description 对当前这个响应的描述信息kkk
 */
export const createResponse = <T extends ZodType, S extends number>(
  schema: T,
  status: S,
  description: string,
) => {
  return {
    [status]: {
      description,
      // resolver 是 hono-openapi 提供的可以将 zod 结构体转换成 OpenAPI 识别的 schema 的函数
      content: { 'application/json': { schema: resolver(schema) } },
    },
  };
};

/**
 * 创建OpenAPI成功响应信息
 * @param schema
 * @param description
 */
export const createSuccessResponse = <T extends ZodType>(schema: T, description?: string) => {
  return createResponse(schema, 200, description ?? '请求成功');
};
/**
 * 创建OpenAPI 201 成功响应信息
 * @param schema
 * @param description
 */
export const create201SuccessResponse = <T extends ZodType>(schema: T, description?: string) => {
  return createResponse(schema, 201, description ?? '请求成功');
};

/**
 * 创建OpenAPI异常响应信息
 * @param description
 * @param status
 */
export const createErrorResponse = <S extends number>(description: string, status: S) => {
  return {
    [status]: {
      description,
      content: { 'application/json': { schema: resolver(errorSchema) } },
    },
  };
};

/**
 * 此处教程封装了很多类似的函数，可以是出于教学需要，我全部也写了一遍，但是实际上我只使用了 createResponse ，这里对目前的项目而言有些过度封装了，一个已经够用了，多了看得眼花缭乱。
 */
