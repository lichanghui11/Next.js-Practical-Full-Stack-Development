import type { FC, JSX } from 'react';

import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from 'ui/timeline';

import type { FadeInMotionProps } from '@/app/_components/motion/fadeIn';

import { FadeInMotion } from '@/app/_components/motion/fadeIn';

export interface HomeTimelineType {
  title: string | JSX.Element;
  content: string | JSX.Element;
}

interface Props {
  data: HomeTimelineType[];
}

const getMotionSide = (side: 'left' | 'right' | null | undefined): FadeInMotionProps['side'] => {
  switch (side) {
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    default:
      return 'none';
  }
};

export const HomeTimeline: FC<Props> = ({ data }) => {
  return (
    <Timeline positions={'center'}>
      {data.map((item, idx) => (
        <TimelineItem key={idx.toFixed()} status="done">
          <TimelineHeading
            side={idx % 2 === 0 ? 'left' : 'right'}
            Wrapper={({ children, className, side }) => (
              <div className={className}>
                <FadeInMotion className={className} side={getMotionSide(side)}>
                  {children}
                </FadeInMotion>
              </div>
            )}
          ></TimelineHeading>

          <TimelineContent
            side={idx % 2 === 0 ? 'right' : 'left'}
            Wrapper={({ children, className, side }) => (
              <div className={className}>
                <FadeInMotion className={className} side={getMotionSide(side)}>
                  {children}
                </FadeInMotion>
              </div>
            )}
          >
            {item.content}
          </TimelineContent>

          <TimelineDot
            status="done"
            Wrapper={({ children, className }) => (
              <div className={className}>
                <FadeInMotion className={className} side="none">
                  {children}
                </FadeInMotion>
              </div>
            )}
          ></TimelineDot>

          <TimelineLine
            done
            Wrapper={({ children, className }) => (
              <div className={className}>
                <FadeInMotion className={className} side="none">
                  {children}
                </FadeInMotion>
              </div>
            )}
          ></TimelineLine>
        </TimelineItem>
      ))}
    </Timeline>
  );
};
