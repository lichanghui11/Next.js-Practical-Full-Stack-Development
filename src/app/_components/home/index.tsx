import type { FC } from 'react';

import { Suspense } from 'react';

import { homeConfig } from '@/config/home.config';

import { FadeInMotion } from '../motion/fadeIn';
import { TypedText } from '../text/typed';
import { HomeBackground } from './background';
import { HomeListCard } from './cards/list';
import { HomeVideoCard } from './cards/video';
import { HomeWelcomeCard } from './cards/welcome';
import { HomeBlockContainer, HomeLineContainer } from './container';
import { HomeSeketon } from './skeleton';
import $styles from './style.module.css';
import { HomeTimeline } from './timeline';

const { welcome, video, list, typed, timeline } = homeConfig;

export const Home: FC = () => {
  return (
    <>
      <HomeBackground />
      <Suspense fallback={<HomeSeketon />}>
        <div className={$styles.home}>
          {(welcome || video) && (
            <HomeLineContainer>
              {welcome && (
                <HomeBlockContainer>
                  <FadeInMotion>
                    <HomeWelcomeCard {...welcome}></HomeWelcomeCard>
                  </FadeInMotion>
                </HomeBlockContainer>
              )}
              {video && (
                <HomeBlockContainer>
                  <div className="flex h-auto w-full">
                    <FadeInMotion>
                      <HomeVideoCard {...video}></HomeVideoCard>
                    </FadeInMotion>
                  </div>
                </HomeBlockContainer>
              )}
            </HomeLineContainer>
          )}
          {typed && (
            <HomeLineContainer className="items-center justify-center space-y-2 md:flex-col">
              <div className="flex w-full items-center justify-center font-lxgw text-xl">
                {' '}
                <TypedText data={typed} />
              </div>
            </HomeLineContainer>
          )}
          {list && (
            <HomeLineContainer>
              <HomeBlockContainer className="lg:px-5">
                <div className="h-full w-full">
                  <FadeInMotion>
                    <HomeListCard {...list.first} />
                  </FadeInMotion>
                </div>
              </HomeBlockContainer>
              <HomeBlockContainer className="lg:px-5">
                <div className="h-full w-full">
                  <FadeInMotion>
                    <HomeListCard {...list.second} />
                  </FadeInMotion>
                </div>
              </HomeBlockContainer>
            </HomeLineContainer>
          )}
          {timeline && (
            <HomeLineContainer>
              <div className="h-full w-full">
                <HomeTimeline data={timeline} />
              </div>
            </HomeLineContainer>
          )}
        </div>
      </Suspense>
    </>
  );
};
