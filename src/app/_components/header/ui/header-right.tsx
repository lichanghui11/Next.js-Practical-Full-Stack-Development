import { ThemeSwitch } from '../../theme/switch';
import ApiDoc from './api-doc';
import Login from './login';
export function HeaderRight() {
  return (
    <div className="flex w-[100px] items-center justify-evenly">
      <ApiDoc />
      <ThemeSwitch />
      <Login />
    </div>
  );
}
