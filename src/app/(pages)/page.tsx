import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { Home } from '@/app/_components/home';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => ({
  title: `Home | ${(await parent).title?.absolute}`,
});
const HomePage: FC = () => <Home />;
export default HomePage;
