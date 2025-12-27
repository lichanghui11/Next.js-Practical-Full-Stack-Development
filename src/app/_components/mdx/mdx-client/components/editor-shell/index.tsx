'use client';
import '@uiw/react-md-editor/markdown-editor.css';
import type { FC } from 'react';

import { commands } from '@uiw/react-md-editor';
import { debounce, isNil } from 'lodash';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useThemeMode } from '@/app/_components/theme/core/hooks';
import { cn } from '@/app/utils/utils';

import type { EditorMode, EditorShellProps, MdxHydrateProps } from '../../types';

import { serializeMdx } from '../../serialize';
import { EditorPreview } from '../editor-preview';
import styles from './editor-shell.module.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

/**
 * 编辑器外壳组件
 * 职责：
 * - 管理布局模式 (split/edit/preview)
 * - 管理分栏比例
 * - 处理内容序列化
 * - 协调编辑器和预览区
 */
export const EditorShell: FC<EditorShellProps> = ({ content, setContent, disabled }) => {
  const theme = useThemeMode();
  const [mode, setMode] = useState<EditorMode>('split');
  const [ratio, setRatio] = useState(55); // 左侧编辑器占比
  const [serialized, setSerialized] = useState<MdxHydrateProps['compiledSource'] | null>(null);
  const [isSerializing, setIsSerializing] = useState(false);

  // 异步乱序保护
  const serializeIdRef = useRef(0);

  // Debounced 序列化
  const debouncedSerialize = useMemo(
    () =>
      debounce(async (content: string) => {
        const currentId = ++serializeIdRef.current;
        setIsSerializing(true);

        try {
          const result = await serializeMdx(content);
          // 只有当前请求是最新的才更新
          if (currentId === serializeIdRef.current) {
            setSerialized(result);
          }
        } catch (error) {
          console.error('MDX serialization error:', error);
        } finally {
          if (currentId === serializeIdRef.current) {
            setIsSerializing(false);
          }
        }
      }, 1000),
    [],
  );

  useEffect(() => {
    if (!isNil(content)) {
      debouncedSerialize(content);
    }
  }, [content, debouncedSerialize]);

  useEffect(() => {
    return () => debouncedSerialize.cancel();
  }, [debouncedSerialize]);

  // 拖拽调整比例
  const [isDragging, setIsDragging] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !shellRef.current) return;

      const containerRect = shellRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const newRatio = (mouseX / containerRect.width) * 100;

      // 限制在 20-80% 之间
      setRatio(Math.min(80, Math.max(20, newRatio)));
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 使用 UIW MDEditor 内置命令的图标
  const { codeLive, codeEdit, codePreview, fullscreen } = commands;
  const LiveIcon = codeLive.icon;
  const EditIcon = codeEdit.icon;
  const PreviewIcon = codePreview.icon;
  const FullscreenIcon = fullscreen.icon;
  return (
    <div
      data-color-mode={theme.mode}
      className={cn(styles.shell, {
        [styles.dragging]: isDragging,
      })}
      ref={shellRef}
    >
      {/* CSS 变量加载 */}
      <div className="wmde-markdown-var" />

      {/* 模式切换按钮 */}
      <div className={styles.toolbar}>
        <button
          type="button"
          className={cn(styles.modeButton, { [styles.active]: mode === 'edit' })}
          onClick={() => setMode('edit')}
          title="编辑模式"
        >
          {EditIcon}
        </button>
        <button
          type="button"
          className={cn(styles.modeButton, { [styles.active]: mode === 'split' })}
          onClick={() => setMode('split')}
          title="分栏模式"
        >
          {LiveIcon}
        </button>
        <button
          type="button"
          className={cn(styles.modeButton, { [styles.active]: mode === 'preview' })}
          onClick={() => setMode('preview')}
          title="预览模式"
        >
          {PreviewIcon}
        </button>
        <button
          type="button"
          className={cn(styles.modeButton, { [styles.active]: mode === 'preview' })}
        >
          {FullscreenIcon}功能待完善
        </button>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* 编辑器面板 */}
        {mode !== 'preview' && (
          <div
            className={styles.editorPane}
            style={{
              flexBasis: mode === 'split' ? `${ratio}%` : '100%',
            }}
          >
            <MDEditor
              value={content}
              onChange={setContent}
              preview="edit"
              extraCommands={[]}
              hideToolbar={false}
              height="100%"
              textareaProps={{ disabled }}
              visibleDragbar={false}
            />
          </div>
        )}

        {/* 拖拽分隔条 */}
        {mode === 'split' && (
          <div
            role="button"
            tabIndex={0}
            aria-label="调整编辑器和预览区域的大小"
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.resizeHandleBar} />
          </div>
        )}

        {/* 预览面板 */}
        {mode !== 'edit' && (
          <div
            className={styles.previewPane}
            style={{
              flexBasis: mode === 'split' ? `${100 - ratio}%` : '100%',
            }}
          >
            <EditorPreview serialized={serialized} loading={isSerializing} />
          </div>
        )}
      </div>
    </div>
  );
};
