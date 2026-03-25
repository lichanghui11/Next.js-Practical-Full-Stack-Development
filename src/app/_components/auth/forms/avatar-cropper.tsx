'use client';

import type { FC } from 'react';
import type { Area } from 'react-easy-crop';

import { Camera } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'ui/dialog';

import { getCroppedImg } from './crop-utils';

interface AvatarCropperProps {
  /** 当前头像预览（base64 或空字符串） */
  value: string;
  /** 裁剪完成后回调，传出 base64 */
  onChange: (base64: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 头像选择 + 裁剪组件
 * 点击圆形区域选择图片 → 弹出裁剪 Dialog → 确认后输出 base64
 */
export const AvatarCropper: FC<AvatarCropperProps> = ({ value, onChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 裁剪弹窗状态
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // 控制裁剪框左上角的坐标
  const [zoom, setZoom] = useState(1); // 控制裁剪框的放大倍数
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 选择文件
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FileReader 是浏览器自带的 API
    const reader = new FileReader();

    // onload 读取完成之后，会触发这个函数
    reader.onload = () => {
      // 把 Base64 文本数据拿到
      setImageSrc(reader.result as string);
      // 打开裁剪弹窗
      setOpen(true);
      // 重置裁剪参数
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };

    // 开始读取文件
    reader.readAsDataURL(file);

    // 清空 input 值，允许重复选择同一文件
    e.target.value = '';
  }, []);

  // 裁剪区域变化回调
  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 确认裁剪
  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onChange(croppedBase64);
      setOpen(false);
    } catch (err) {
      console.error('裁剪失败:', err);
    }
  }, [croppedAreaPixels, imageSrc, onChange]);

  return (
    <>
      {/* 头像预览区域 - 点击触发选择文件 */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {value ? (
            // 有头像预览
            <Image src={value} alt="头像预览" fill className="object-cover" />
          ) : (
            // 无头像 - 显示占位图标
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Camera className="h-6 w-6 text-gray-400 transition-colors group-hover:text-gray-500" />
            </div>
          )}

          {/* 悬停遮罩 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
            <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </button>

        <span className="text-xs text-gray-500">点击上传头像（可选）</span>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 裁剪弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>裁剪头像</DialogTitle>
            <DialogDescription>拖拽或缩放图片来调整头像区域</DialogDescription>
          </DialogHeader>

          {/* 裁剪区域 */}
          <div className="relative h-64 w-full overflow-hidden rounded-md bg-gray-900">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // 裁剪框的宽高比例
                cropShape="rect" // 裁剪框的形状
                showGrid={true} // 是否显示网格
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete} // 当用户拖拽和缩放完毕，松开鼠标的那一瞬间，这个事件会被触发。
              />
            )}
          </div>

          {/* 缩放控制 */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-sm text-gray-500">缩放</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 dark:bg-gray-700"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleConfirm}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
