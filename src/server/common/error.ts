import type { Context } from 'hono';

import { isNil, isObject } from 'lodash';
// 这里编写的是用于响应服务端异常或错误消息的通用函数
// 因为是通用函数，所以放在 server/common 里面
/**
 * 异常响应生成
 * 该函数作用：把需要处理的 异常信息 传进来之后，会生成格式化后的信息，方便使用
 * @param title
 * @param error
 * @param code
 */
export const createErrorResult = (title: string, error?: any, code?: number) => {
  let message = title;
  if (!isNil(error)) {
    // 可以处理 错误对象 || 带有 message 字段的自定义的对象 || 一个纯字符串
    message =
      error instanceof Error || (isObject(error) && 'message' in error)
        ? `${title}:${error.message}`
        : `${title}:${error.toString()}`;
  }

  return {
    code,
    message,
  };
};
/**
 * 请求数据验证失败的默认响应
 * @param result
 * @param c
 * 当 !result.success 时，result.error 就是一个 ZodError，而 format() 就是 ZodError.prototype.format()，用来把错误信息整理成“按字段分组”的结构，方便前端展示。
 */
export const defaultValidatorErrorHandler = (result: any, c: Context) => {
  console.log('defaultValidatorErrorHandler: ', result);
  if (!result.success) {
    return c.json(
      {
        ...createErrorResult('请求数据验证失败', 400),
        errors: result.error.format(),
      },
      400,
    );
  }
  return result;
};
