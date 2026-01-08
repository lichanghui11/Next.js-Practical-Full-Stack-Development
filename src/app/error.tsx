'use client';
import type { FC } from 'react';

import type { ErrorBoundaryProps } from '@/app/_components/errors/error-boundary';

import { ErrorBoundary } from '@/app/_components/errors/error-boundary';
import Header from '@/app/_components/header';

import ThemeProvider from './_components/theme';

const AppError: FC<ErrorBoundaryProps> = (props) => (
  <ThemeProvider>
    <div className="">
      <Header />
      <ErrorBoundary {...props} />
    </div>
  </ThemeProvider>
);
export default AppError;
