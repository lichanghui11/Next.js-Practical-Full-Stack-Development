import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, FC } from 'react';

import { AlertTriangle, Flame, Info, LightbulbIcon, NotebookPen } from 'lucide-react';
import React from 'react';

import type { AdmonitionType } from '../custom-plugins/remark-admonition';

interface AdmonitionStyle {
  icon: LucideIcon;
  title: string;
  containerStyle: CSSProperties;
  containerStyleDark: CSSProperties;
  iconColor: string;
  iconColorDark: string;
}

const ADMONITION_CONFIG: Record<AdmonitionType, AdmonitionStyle> = {
  note: {
    icon: NotebookPen,
    title: '注意',
    containerStyle: { background: 'rgba(253, 253, 254, 0.4)', borderLeftColor: '#d4d5d8' },
    containerStyleDark: { background: 'rgba(71, 71, 72, 0.3)', borderLeftColor: '#a1a1a4' },
    iconColor: '#3578e5',
    iconColorDark: '#2b60b8',
  },
  tip: {
    icon: LightbulbIcon,
    title: '提示',
    containerStyle: { background: 'rgba(230, 246, 230, 0.4)', borderLeftColor: '#009400' },
    containerStyleDark: { background: 'rgba(20, 83, 45, 0.3)', borderLeftColor: '#2a8c2a' },
    iconColor: '#009400',
    iconColorDark: '#2a8c2a',
  },
  info: {
    icon: Info,
    title: '信息',
    containerStyle: { background: 'rgba(238, 243, 253, 0.4)', borderLeftColor: '#3578e5' },
    containerStyleDark: { background: 'rgba(23, 37, 84, 0.3)', borderLeftColor: '#2b60b8' },
    iconColor: '#3578e5',
    iconColorDark: '#2b60b8',
  },
  warning: {
    icon: AlertTriangle,
    title: '警告',
    containerStyle: { background: 'rgba(255, 248, 230, 0.4)', borderLeftColor: '#e6a700' },
    containerStyleDark: { background: 'rgba(113, 63, 18, 0.3)', borderLeftColor: '#b88a00' },
    iconColor: '#e6a700',
    iconColorDark: '#b88a00',
  },
  danger: {
    icon: Flame,
    title: '危险',
    containerStyle: { background: 'rgba(255, 227, 227, 0.4)', borderLeftColor: '#fa383e' },
    containerStyleDark: { background: 'rgba(127, 29, 29, 0.3)', borderLeftColor: '#c82333' },
    iconColor: '#fa383e',
    iconColorDark: '#c82333',
  },
};

interface AdmonitionProps {
  type: AdmonitionType;
  title?: string;
  children: React.ReactNode;
}

export const Admonition: FC<AdmonitionProps> = ({ type, title, children }) => {
  const config = ADMONITION_CONFIG[type];
  const Icon = config.icon;

  // 检测是否为暗色模式（通过 CSS 变量方式）
  const containerBaseStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    margin: '1rem 0',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    ...config.containerStyle,
  };

  return (
    <div className="admonition" style={containerBaseStyle} data-type={type}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon style={{ width: '1.25rem', height: '1.25rem', color: config.iconColor }} />
        <span style={{ fontWeight: 600, color: config.iconColor }}>{title || config.title}</span>
      </div>
      <div style={{ paddingLeft: '1.75rem' }}>{children}</div>
    </div>
  );
};
