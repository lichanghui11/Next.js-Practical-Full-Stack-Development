'use client';

import { Calendar } from 'antd';

import ThemeProvider from '@/app/_components/theme';

export default function Home() {
  return (
    <>
      <ThemeProvider mode="system" compact={true}>
        <div>测试 theme 组件</div>
        <Calendar fullscreen={false} />
      </ThemeProvider>
    </>
  );
}
