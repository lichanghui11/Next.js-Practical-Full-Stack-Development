import { CreateButton } from '../../blog-components/create-button/create-button';
import { ThemeSwitch } from '../../theme/switch';
import ApiDoc from './api-doc';
import Login from './login';
export function HeaderRight() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <CreateButton />
      <ApiDoc />
      <ThemeSwitch />
      <Login />
    </div>
  );
}
