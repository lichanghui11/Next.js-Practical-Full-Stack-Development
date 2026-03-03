import type { Metadata } from 'next';

import { Toaster } from 'ui/sonner';

import { Footer } from '../_components/layout/footer';
import Header from '../_components/layout/header';

export const metadata: Metadata = {
  title: 'next app',
  description: 'Next.js 全栈项目完整实践',
};

export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
      {modal}
      <Toaster />
    </div>
  );
}
