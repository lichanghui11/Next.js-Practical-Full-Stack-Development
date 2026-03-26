import zlib from 'node:zlib';

import { uploadFile } from '@/lib/minio/client';

/**
 * HSL 转 RGB
 * 将颜色从色相(H)、饱和度(S)、亮度(L) 格式转换为红(R)、绿(G)、蓝(B) 格式
 * @param h 色相(0-360)，例如0是红色，120是绿色，240是蓝色
 * @param s 饱和度(0-100)，越高颜色越鲜艳
 * @param l 亮度(0-100)，越高越明亮
 * @returns RGB 值的数组 [R, G, B]，每个值都是 0-255 之间的整数
 */
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
};

/**
 * CRC32 查找表
 */
const crc32Table: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table.push(c);
}

/**
 * CRC32 计算
 * 计算给定缓冲区的 CRC32 校验和，用于 PNG 文件的完整性验证
 * @param buf 要计算校验和的数据缓冲区
 * @returns CRC32 校验和的32位无符号整数
 */
const crc32 = (buf: Buffer): number => {
  // 初始化 CRC 值为 0xffffffff（CRC32 标准初值）
  let c = 0xffffffff;
  // 遍历缓冲区中的每个字节
  for (let i = 0; i < buf.length; i++) {
    // 使用查找表进行快速 CRC32 计算
    // (c ^ buf[i]) & 0xff：取当前 CRC 和当前字节的异或，再只保留最低 8 位
    // (c >>> 8)：当前 CRC 右移 8 位
    c = (c >>> 8) ^ crc32Table[(c ^ buf[i]) & 0xff];
  }
  // 对最终结果进行异或操作(0xffffffff)，得到最终的 CRC32 值
  return (c ^ 0xffffffff) >>> 0;
};

/**
 * 创建 PNG chunk（PNG 文件结构中的数据块）
 * PNG 文件由多个 chunk 组成，每个 chunk 包含：长度、类型、数据、CRC 校验和
 * @param type 4 字符的 chunk 类型标识符，如 'IHDR'、'IDAT'、'IEND'
 * @param data chunk 的数据内容
 * @returns 完整的 PNG chunk（包含长度、类型、数据、CRC）
 */
const createChunk = (type: string, data: Buffer): Buffer => {
  // 创建 4 字节缓冲区用于存储数据长度（大端序）
  const length = Buffer.alloc(4);
  // 将数据长度写入缓冲区（writeUInt32BE 表示大端序32位无符号整数）
  length.writeUInt32BE(data.length);

  // 将 chunk 类型(字符串)转换为 ASCII 编码的缓冲区
  const typeBuffer = Buffer.from(type, 'ascii');

  // 合并类型和数据，用于计算 CRC 校验和
  // PNG 规范要求 CRC 是对"类型 + 数据"的校验
  const crcData = Buffer.concat([typeBuffer, data]);

  // 创建 4 字节缓冲区用于存储 CRC 校验和
  const crc = Buffer.alloc(4);
  // 计算 CRC 值并以大端序写入缓冲区
  crc.writeUInt32BE(crc32(crcData));

  // 组合完整的 chunk：长度(4字节) + 类型(4字节) + 数据 + CRC(4字节)
  return Buffer.concat([length, typeBuffer, data, crc]);
};

/**
 * 生成纯色的 PNG 图片（不依赖 canvas/sharp，使用原始 PNG 编码）
 * 生成一个 300x300 的纯色 PNG，用作用户的默认头像
 * @returns PNG 二进制数据缓冲区
 */
const generateSolidColorPNG = (): Buffer => {
  // 定义图片尺寸为 80x80 像素
  const size = 300;

  // 随机生成色相(0-360)，用于产生不同的颜色
  const hue = Math.floor(Math.random() * 360);
  // 随机生成饱和度(55-80%)，确保颜色不会太灰暗或太鲜艳
  const saturation = 55 + Math.floor(Math.random() * 25);
  // 随机生成亮度(45-65%)，确保颜色既不太深也不太浅
  const lightness = 45 + Math.floor(Math.random() * 20);

  // 将 HSL 颜色转换为 RGB 格式，hslToRgb 返回 [R, G, B] 数组
  const [r, g, b] = hslToRgb(hue, saturation, lightness);

  // 构建原始像素数据数组（PNG 的 raw 格式）
  const rawData: number[] = [];
  // 遍历图片的每一行(y轴)
  for (let y = 0; y < size; y++) {
    // PNG 扫描线的开始需要一个 filter byte，设为 0 表示不使用过滤
    rawData.push(0);
    // 遍历当前行的每一列(x轴)
    for (let x = 0; x < size; x++) {
      // 依次添加 R、G、B 三个颜色分量
      rawData.push(r, g, b);
    }
  }

  // 将数组转换为 Buffer（二进制数据）
  const rawBuf = Buffer.from(rawData);
  // 使用 zlib 压缩原始像素数据（PNG 要求对像素数据进行 deflate 压缩）
  const compressedData = zlib.deflateSync(rawBuf);

  // 创建数组用于存储所有 PNG chunks
  const pngChunks: Buffer[] = [];

  // PNG 文件签名（固定的 8 字节前缀，用于识别 PNG 文件格式）
  // 十六进制：89 50 4E 47 0D 0A 1A 0A
  pngChunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // 创建 IHDR chunk（Image Header，必须是第一个 chunk）
  // IHDR 包含图片的基本信息：宽度、高度、色深、颜色类型等
  const ihdr = Buffer.alloc(13);
  // 写入图片宽度(4字节，大端序)
  ihdr.writeUInt32BE(size, 0);
  // 写入图片高度(4字节，大端序)
  ihdr.writeUInt32BE(size, 4);
  // 写入位深度(1字节)：8 表示每个颜色分量占 8 比特
  ihdr.writeUInt8(8, 8);
  // 写入颜色类型(1字节)：2 表示 RGB 颜色类型（无 alpha 通道）
  ihdr.writeUInt8(2, 9);
  // 写入压缩方法(1字节)：0 表示 deflate 压缩
  ihdr.writeUInt8(0, 10);
  // 写入过滤方法(1字节)：0 表示 PNG 自适应过滤
  ihdr.writeUInt8(0, 11);
  // 写入隔行扫描方法(1字节)：0 表示无隔行扫描
  ihdr.writeUInt8(0, 12);
  // 将 IHDR 数据包装成完整的 chunk（包含长度、类型、数据、CRC）
  pngChunks.push(createChunk('IHDR', ihdr));

  // 创建 IDAT chunk（Image Data，包含压缩的像素数据）
  // 这是 PNG 文件中最重要的 chunk，包含所有的图片像素信息
  pngChunks.push(createChunk('IDAT', compressedData));

  // 创建 IEND chunk（Image Trailer，必须是最后一个 chunk）
  // IEND chunk 没有数据，仅用于标记 PNG 文件的结束
  pngChunks.push(createChunk('IEND', Buffer.alloc(0)));

  // 合并所有 chunks，返回完整的 PNG 二进制数据
  return Buffer.concat(pngChunks);
};

/**
 * 保存用户头像
 * - 如果提供了 base64 数据，解码并保存为文件
 * - 如果没有提供，生成一个随机纯色图片
 * @param userId 用户ID（用作文件名）
 * @param base64Image 可选的 base64 编码的图片数据（data:image/... 开头）
 * @returns 头像的 MinIO URL
 */
export const saveAvatar = async (userId: string, base64Image?: string): Promise<string> => {
  if (base64Image && base64Image.startsWith('data:image/')) {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) throw new Error('无效的图片数据格式');

    const ext = matches[1] === 'webp' ? 'webp' : 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const contentType = ext === 'webp' ? 'image/webp' : 'image/png';

    return uploadFile(`avatars/${userId}.${ext}`, buffer, contentType);
  }

  // 未提供 base64 数据，生成一个随机纯色的 PNG 图片作为默认头像
  const buffer = generateSolidColorPNG();
  return uploadFile(`avatars/${userId}.png`, buffer, 'image/png');
};
