import type { FC, PropsWithChildren } from 'react';

const BlogLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
};

export default BlogLayout;
