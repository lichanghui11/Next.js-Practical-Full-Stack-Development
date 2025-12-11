import type { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

const Logo: FC = () => {
  return (
    <>
      <Link href="/">
        <div className="relative h-[30px] w-[50px] flex-shrink-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="logo"
            fill
            className="object-cover"
            sizes="60px"
          />
        </div>
      </Link>
    </>
  );
};
export default Logo;
