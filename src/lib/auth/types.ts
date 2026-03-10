import type { z } from 'zod';
export interface AuthConfig {
  protectedPages: string[];
  validates: {
    username: z.ZodString;
    password: z.ZodString;
  };
}
