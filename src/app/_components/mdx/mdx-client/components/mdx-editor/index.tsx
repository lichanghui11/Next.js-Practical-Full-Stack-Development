import type { FC } from 'react';

import MDEditor, { commands } from '@uiw/react-md-editor';
import { isNil } from 'lodash';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useThemeMode } from '@/app/_components/theme/core/hooks';
import { useIsMobile } from '@/app/utils/browser';
import { cn } from '@/app/utils/utils';

import type { MdxEditorProps, MdxHydrateProps } from '../../types';

import { MdxHydration } from '../../mdx-hydration';
import { serializeMdx } from '../../serialize';

export const MdxEditor: FC<MdxEditorProps> = (props) => {
  const { content, setContent, disabled } = props;
  const [serialized, setSerialized] = useState<MdxHydrateProps['compiledSource']>();
  const theme = useThemeMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState<number>(400);
  const isMobile = useIsMobile();
  // 防抖效果，减少序列化次数
  const debouncedSerialize = useMemo(
    () =>
      debounce(async (text: string) => {
        const serialized = await serializeMdx(text);
        setSerialized(serialized);
      }, 1000),
    [],
  );

  // 处理内容变化，触发 debounce
  useEffect(() => {
    if (!isNil(content)) {
      debouncedSerialize(content);
    }
  }, [content, debouncedSerialize]);

  // 清理 debounce
  useEffect(() => {
    return () => {
      debouncedSerialize.cancel();
    };
  }, [debouncedSerialize]);

  const updateHeight = useCallback(() => {
    if (containerRef.current) {
      const parentHeight = containerRef.current.clientHeight;
      if (parentHeight) {
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setEditorHeight(parentHeight);
      }
    }
  }, []);

  useEffect(() => {
    if (!isNil(serialized)) updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [serialized, updateHeight]);
  const extraCommands = useMemo(() => {
    let data = [commands.codeEdit];
    if (!isMobile) data.push(commands.codeLive);
    data = [...data, commands.codePreview, commands.fullscreen];
    return data;
  }, [isMobile]);

  if (isNil(serialized)) {
    return <div ref={containerRef} className={cn('wmde-markdown-var')} />;
  }

  return (
    <div data-color-mode={theme} ref={containerRef} style={{ height: '100%' }}>
      <div>
        <div className="wmde-markdown-var"> </div>
        <MDEditor
          preview={isMobile ? 'edit' : 'live'}
          extraCommands={extraCommands}
          value={content}
          onChange={setContent}
          height={editorHeight}
          minHeight={editorHeight}
          textareaProps={{ disabled }}
          visibleDragbar
          components={{
            preview: () => <MdxHydration compiledSource={serialized} toc={false} />,
          }}
        />
      </div>
    </div>
  );
};
