import type { User } from '@/server/modules/user/user.type';
export type AuthType = User | null | false;

export interface AuthContextType {
  auth: AuthType;
  setAuth: (auth: AuthType) => void;
}
