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

const themeScript = `
  try {
    const key = 'theme-storage';
    const raw = window.localStorage.getItem(key);
    let mode = null;

    if (raw) {
      const obj = JSON.parse(raw);
      mode = obj?.state?.mode;
    }

    // 如果没存，就按系统偏好
    if (mode !== 'dark' && mode !== 'light') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mode = mql.matches ? 'dark' : 'light';
    }

    const classList = document.documentElement.classList;
    if (mode === 'dark') {
      classList.add('dark');
    } else {
      classList.remove('dark');
    }
  } catch (e) {
    // 失败就维持默认
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className={cn(styles.topBody)}>{children}</body>
    </html>
  );
}
