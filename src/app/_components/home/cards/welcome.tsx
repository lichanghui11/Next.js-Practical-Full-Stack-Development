import type { FC } from 'react';

import { isNil } from 'lodash';
import Link from 'next/link';

import { RainbowButton } from '@/app/_components/magicui/rainbow-button';
import { TextAnimate } from '@/app/_components/text/animate';
import { SparklesText } from '@/app/_components/text/sparkles';

import $styles from './welcome.module.css';

export interface HomeWelcomeCardType {
  title: string;
  colorTitle?: string;
  content: string;
}

// A 区组件
export const HomeWelcomeCard: FC<HomeWelcomeCardType> = ({ title, colorTitle, content }) => {
  let contents: string[] = [];
  if (!isNil(content)) {
    contents = content.split('\n');
  }
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-center text-3xl lg:justify-start lg:text-left lg:text-5xl">
        {title}
        <SparklesText
          as={<span>{colorTitle && <span className={$styles.colorTitle}>{colorTitle}</span>}</span>}
        />
      </div>
      <div className="mt-5 flex-auto py-3 font-lxgw text-xl leading-8! lg:pr-16 px-4">
        {contents?.map((item, index) => (
          <TextAnimate key={index.toFixed()}>{item}</TextAnimate>
        ))}
      </div>
      <div className="flex w-full items-center justify-center py-3 lg:justify-start lg:py-1">
        <RainbowButton>
          <Link href="#" target="_blank">
            自定义跳转特定的地址
          </Link>
        </RainbowButton>
      </div>
    </div>
  );
};
