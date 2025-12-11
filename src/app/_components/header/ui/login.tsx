import type { FC } from 'react';

import { User } from 'lucide-react';
import Link from 'next/link';
import { Button } from 'ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'ui/tooltip';

const Login: FC = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/login">
          <Button
            variant="ghost"
            size="icon"
            aria-label="login"
          >
            <User />
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>登录</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default Login;
