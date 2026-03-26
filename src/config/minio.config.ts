/**
 * MinIO 配置，从环境变量读取
 */
export const minioConfig = {
  endpoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: Number.parseInt(process.env.MINIO_PORT || '9000', 10),
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'admin123456',
  useSSL: process.env.MINIO_USE_SSL === 'true',
  bucket: process.env.MINIO_BUCKET || 'esti-blog',
};

export type MinioConfig = typeof minioConfig;
