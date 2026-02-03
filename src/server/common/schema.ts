import { z } from 'zod';

// 专门针对 error 的数据结构体
export const errorSchema = z
  .object({
    code: z.number().optional().meta({ type: 'number' }),
    message: z.string().meta({ type: 'string' }),
    errors: z.any().optional().meta({ type: 'object' }),
  })
  .strict();
