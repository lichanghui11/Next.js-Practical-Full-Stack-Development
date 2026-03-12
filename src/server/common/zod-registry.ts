import { z } from 'zod';

// 在一些zod的schema中配置了ID，但因为zod v4使用Registry把ID注册到全局。
// 而由于next.js开发环境下hmr热更新问题，会导致ID重复注册问题。
// 所以需要在hono服务端被next.js每次热更新时，先把全局的ID清理掉
export const clearZodRegistry = () => {
  if (process.env.NODE_ENV === 'development') {
    z.globalRegistry.clear();
  }
};

clearZodRegistry();
