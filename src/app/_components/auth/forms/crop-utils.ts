/**
 * Canvas 裁剪工具函数
 * 用于配合 react-easy-crop 将裁剪区域导出为 base64 图片
 */

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 加载图片并返回 HTMLImageElement
 * @parmas url 是用户选中的本地图片的完整数据
 */
const createImage = async (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image(); // 这只是一个画布，没有任何图片数据
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));

    /**
     * 这里不是设置的请求头，只是设置了图片元素的一个属性
     * 浏览器的行为：看到这个属性时，会在加载图片的时候自动添加相应跨域请求头，这个请求头是给浏览器看的
     *  > 浏览器看到这个 anonymous ，就会自动把本网站的地址放到请求资源的头部，告诉目标网站服务器，这个网站请求访问资源
     * 设置 crossOrigin: anonymous 的使用，浏览器在请求图片的时候，会自动添加 origin: 本网站域名 这个请求头，告诉目标网站，这个请求读取资源的网站是什么
     * 目标网站的服务器看到这个请求头后，返回的响应头里面需要包括 Access-Control-Allow-Origin: 请求资源的网站域名 ，表示目标网站服务器允许这个网站读取资源，浏览器读取这个响应头，如果网站在允许列表里面，则允许读取这个资源，否则阻止且抛错
     */
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * 根据 react-easy-crop 返回的裁剪区域，使用 Canvas 裁剪并导出为 base64
 * @param imageSrc - 原始图片的 URL 或 base64
 * @param pixelCrop - react-easy-crop onCropComplete 回调中的 croppedAreaPixels
 * @param outputSize - 输出图片的尺寸（正方形），默认 80
 * @returns base64 格式的裁剪后图片
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize = 300,
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  // 设置输出尺寸
  canvas.width = outputSize;
  canvas.height = outputSize;

  // 将裁剪区域绘制到 canvas 上，缩放到目标尺寸
  ctx.drawImage(
    image,
    // 源图片的坐标和尺寸
    pixelCrop.x, // 左上角 x 坐标
    pixelCrop.y, // 左上角 y 坐标
    pixelCrop.width,
    pixelCrop.height,

    // cavas 目标区域（放到哪里 + 缩放到多大）
    0, // cavas里面 x 坐标
    0, // cavas里面 y 坐标
    outputSize, // cavas里面的宽度
    outputSize, // cavas里面的高度
  );

  // 导出为 webp 格式的 base64（体积更小），85% 压缩率
  return canvas.toDataURL('image/webp', 0.85); // 返回一个Data URL格式的字符串
};
