'use client';

import type { FC } from 'react';

import type { ErrorBoundaryProps } from '@/app/_components/errors/error-boundary';

import { ErrorBoundary } from '@/app/_components/errors/error-boundary';

const ErrorPage: FC<ErrorBoundaryProps> = (props) => <ErrorBoundary {...props} />;

export default ErrorPage;
