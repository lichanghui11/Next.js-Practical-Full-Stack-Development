import type { HomeListCardType } from './cards/list';
import type { HomeVideoCardType } from './cards/video';
import type { HomeWelcomeCardType } from './cards/welcome';
import type { HomeTimelineType } from './timeline';

// 这里的的区块说明可以参考home-page.md
export interface HomePageConfig {
  // 顶部欢迎块,对应上图A区
  welcome?: HomeWelcomeCardType;
  // 顶部介绍视频,对应上图B区
  video?: HomeVideoCardType;
  // 中间区域的文字列表块,对应上图D区
  list?: HomeListCardType;
  // 中间区域打字机文字,对应上图C区
  typed?: string[];
  // 底部时间线,对应上图E区
  timeline?: HomeTimelineType[];
}
