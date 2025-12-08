import './styles/index.css';
import type { Metadata } from 'next';

import styles from './layout.module.css';
import { cn } from './utils/utils';
export const metadata: Metadata = {
  title: {
    template: '%s | Next.js 全栈项目实践',
    default: 'Next.js 全栈项目实践',
  },
  description: 'Next.js 全栈项目实践',
  keywords: [
    '全栈项目',
    'Next.js',
    'React',
    'TypeScript',
    'Node.js',
    'Postgress',
    'Tailwind CSS',
    'Prisma',
  ],
  creator: 'lichanghui11',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body className={cn(styles.topBody)}>{children}</body>
    </html>
  );
}
