# 首页功能实现文档

## 概述

首页是一个现代化的交互式页面，集成了多种视觉效果和动画组件，包括视频播放、时间线展示、鎏金边框、渐进动画、鼠标跟随效果等功能。

## 核心功能模块

### 1. 视频播放器 (VideoPlayer)

**文件位置**: `src/app/_components/video/player.tsx`

**技术实现**:

- 基于 `artplayer` 封装的自定义视频播放器
- 支持全屏播放、内联播放、快进、AirPlay 等功能
- 默认静音播放以符合浏览器自动播放策略
- 自动调整尺寸和高度适配容器

**核心特性**:

```typescript
- fullscreen: 全屏支持
- fullscreenWeb: Web 全屏
- playsInline: 内联播放
- fastForward: 快进功能
- autoSize/autoHeight: 自动尺寸调整
- muted: 默认静音（提高自动播放成功率）
```

**生命周期管理**:

- `ready` 事件: 播放器就绪后自动调整尺寸
- `resize` 事件: 窗口调整时重新计算尺寸
- `video:ended` 事件: 播放结束后重置进度并显示封面

### 2. 时间线组件 (Timeline)

**文件位置**: `src/app/_components/shadcn/ui/timeline.tsx`

**组件结构**:

- `Timeline`: 时间线容器，支持左/右/居中三种布局
- `TimelineItem`: 时间线项目
- `TimelineDot`: 时间点标记，支持多种状态（default/current/done/error/custom）
- `TimelineHeading`: 标题组件
- `TimelineContent`: 内容区域
- `TimelineLine`: 连接线

**布局模式**:

```typescript
positions: 'left' | 'right' | 'center'
```

**状态类型**:

```typescript
status: 'default' | 'current' | 'done' | 'error' | 'custom'
```

### 3. 鎏金边框效果 (ShineBorder)

**文件位置**: `src/app/_components/magicui/shine-border.tsx`

**视觉效果**:

- 动态流光边框动画
- 支持多色渐变配置
- 可配置动画时长和边框宽度
- 支持悬停触发或持续显示

**配置参数**:

```typescript
{
  borderRadius: string;    // 边框圆角
  borderWidth: number;     // 边框宽度
  duration: number;        // 动画时长（秒）
  color: string | string[]; // 边框颜色（支持渐变）
  always: boolean;         // 是否持续显示
  padding: string;         // 内边距
}
```

**实现原理**:

- 使用 CSS 变量动态控制样式
- 径向渐变 + mask 实现流光效果
- `animate-shine` 动画类实现移动效果

### 4. 堆叠卡片 (StackCard)

**文件位置**: `src/app/_components/cards/stack.tsx`

**视觉特点**:

- 三层卡片堆叠效果，每层有不同的旋转角度和透明度
- 背景装饰光晕（蓝色和橙色）
- 可选的鎏金边框效果
- 毛玻璃背景（backdrop-blur）

**层级结构**:

```typescript
第一层: rotate-[-4deg] + bg-card/20
第二层: rotate-[-2deg] + bg-card/30
第三层: rotate-[0deg] + bg-card/40 + 可选 ShineBorder
```

### 5. 背景效果系统

**文件位置**: `src/app/_components/home/background/`

#### 5.1 静态渐变背景

```typescript
// 右上角橙色光晕
<div className="absolute right-0 top-0 h-[30rem] w-[30rem]
     bg-orange-500/10 blur-[100px]" />

// 左下角蓝色光晕
<div className="absolute bottom-0 left-0 h-[30rem] w-[30rem]
     bg-blue-500/10 blur-[100px]" />
```

#### 5.2 鼠标跟随效果 (MouseMoveEffect)

**文件位置**: `src/app/_components/home/background/mouse-move-effect.tsx`

**实现机制**:

- 监听全局 `mousemove` 事件
- 实时更新鼠标位置状态
- 使用径向渐变跟随鼠标移动
- 根据主题模式调整透明度（暗色模式 0.07，亮色模式 0.15）

**渐变配置**:

```typescript
radial-gradient(
  600px at ${x}px ${y}px,
  rgba(220, 231, 69, ${opacity}),
  transparent 80%
)
```

### 6. 文字动画效果

#### 6.1 渐进文字动画 (TextAnimate)

**文件位置**: `src/app/_components/text/animate.tsx`

**动画类型**:

- `fadeIn`: 淡入效果
- `blurIn/blurInUp/blurInDown`: 模糊渐入
- `slideUp/slideDown/slideLeft/slideRight`: 滑动效果
- `scaleUp/scaleDown`: 缩放效果

**分割模式**:

```typescript
by: 'text' | 'word' | 'character' | 'line'
```

**特性**:

- 支持视口触发动画 (`startOnView`)
- 可配置交错延迟 (stagger)
- 支持自定义动画变体

#### 6.2 闪烁文字效果 (SparklesText)

**文件位置**: `src/app/_components/text/sparkles.tsx`

**效果描述**:

- 文字周围随机生成闪烁星星
- 星星具有随机位置、颜色、缩放和生命周期
- 使用 Framer Motion 实现平滑动画

**动画参数**:

```typescript
opacity: [0, 1, 0]
scale: [0, random, 0]
rotate: [75, 120, 150]
duration: 1.8s (无限循环)
```

### 7. 容器布局系统

**文件位置**: `src/app/_components/home/container/index.tsx`

#### HomeLineContainer

- 行容器，用于包裹首页的横向区域
- 应用 `page-container` 全局容器样式
- 支持自定义类名扩展

#### HomeBlockContainer

- 块容器，用于放置卡片组件
- 提供统一的块级布局样式

### 8. 渐入动画包装器 (FadeInMotion)

**使用场景**:

- 包裹首页各个卡片组件
- 提供统一的入场动画效果
- 基于 Framer Motion 实现

## 首页整体结构

**文件位置**: `src/app/_components/home/index.tsx`

```
Home
├── HomeBackground (背景效果层)
│   ├── 静态渐变光晕
│   └── MouseMoveEffect (鼠标跟随)
│
└── 内容区域
    ├── 第一行: Welcome + Video
    │   ├── HomeWelcomeCard (欢迎卡片)
    │   └── HomeVideoCard (视频卡片 + StackCard + ShineBorder)
    │
    ├── 第二行: TypedText (打字机效果)
    │
    ├── 第三行: List Cards
    │   ├── HomeListCard (列表卡片 1)
    │   └── HomeListCard (列表卡片 2)
    │
    └── 第四行: Timeline (时间线)
```

## 技术栈

- **React 19**: 组件框架
- **Next.js**: 应用框架
- **Framer Motion**: 动画库
- **Artplayer**: 视频播放器
- **Tailwind CSS**: 样式框架
- **TypeScript**: 类型系统

## 性能优化

1. **懒加载**: 使用 `Suspense` 包裹内容，提供骨架屏
2. **事件清理**: 鼠标事件监听器正确清理，避免内存泄漏
3. **播放器销毁**: 视频播放器组件卸载时正确销毁实例
4. **CSS 变量**: 使用 CSS 变量实现动态样式，减少 JS 计算
5. **条件渲染**: 根据配置按需渲染组件

## 配置文件

**位置**: `src/config/home`

首页内容通过配置文件统一管理，包括：

- `welcome`: 欢迎卡片配置
- `video`: 视频卡片配置
- `typed`: 打字机文本配置
- `list`: 列表卡片配置
- `timeline`: 时间线数据配置

## 样式特点

1. **毛玻璃效果**: `backdrop-blur-sm` 实现半透明模糊背景
2. **渐变色系**: 橙色、蓝色、紫色为主色调
3. **动态光效**: 多层光晕叠加营造氛围感
4. **响应式设计**: 适配不同屏幕尺寸
5. **暗色模式**: 支持主题切换，自动调整透明度

## 交互体验

- **平滑过渡**: 所有动画使用缓动函数，避免生硬
- **视觉反馈**: 悬停、点击等操作有明确的视觉响应
- **渐进增强**: 基础功能优先，动画效果作为增强
- **无障碍支持**: 使用语义化标签和 ARIA 属性
