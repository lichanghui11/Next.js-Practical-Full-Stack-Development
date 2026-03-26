import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { minioConfig } from '@/config/minio.config';

/**
 * S3 客户端（MinIO 兼容 S3 API）
 */
const s3Client = new S3Client({
  endpoint: `${minioConfig.useSSL ? 'https' : 'http'}://${minioConfig.endpoint}:${minioConfig.port}`,
  region: 'us-east-1', // MinIO 不关心 region，但 SDK 要求必须传
  credentials: {
    accessKeyId: minioConfig.accessKey,
    secretAccessKey: minioConfig.secretKey,
  },
  forcePathStyle: true, // MinIO 必须使用 path-style（http://host/bucket/key）
});

// 内存标记，确保每次应用启动后只执行一次 Bucket 校验和权限配置
let isBucketEnsured = false;

/**
 * 确保 bucket 存在，并始终赋予公开读权限
 */
export const ensureBucket = async (bucket?: string): Promise<void> => {
  if (isBucketEnsured) return;

  const bucketName = bucket || minioConfig.bucket;

  // 1. 确保 Bucket 存在
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch {
    // Bucket 不存在，创建它
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
  }

  // 2. 无论 Bucket 是新的还是旧的，都强制赋予公开读策略
  const policy = JSON.stringify({
    Version: '2012-10-17', // 不能改
    Statement: [
      // 规则声明数组
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  });

  try {
    await s3Client.send(new PutBucketPolicyCommand({ Bucket: bucketName, Policy: policy }));
  } catch (error) {
    console.warn(
      `[MinIO] 无法设置 Bucket [${bucketName}] 的权限，它可能无法通过公开 URL 访问:`,
      error,
    );
  }

  // 标记为已校验，后续上传就不用再重复走这一步了
  isBucketEnsured = true;
};

/**
 * 上传文件到 MinIO
 * @param key 对象的 key（路径），例如 'avatars/userId.webp'
 * @param buffer 文件二进制数据
 * @param contentType MIME 类型，例如 'image/webp'
 * @param bucket 可选，指定 bucket 名称
 * @returns 文件的完整访问 URL
 */
export const uploadFile = async (
  key: string,
  buffer: Buffer,
  contentType: string,
  bucket?: string,
): Promise<string> => {
  const bucketName = bucket || minioConfig.bucket;

  // 确保 bucket 存在
  await ensureBucket(bucketName);

  // 上传文件
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  // 返回完整的访问 URL
  const protocol = minioConfig.useSSL ? 'https' : 'http';
  return `${protocol}://${minioConfig.endpoint}:${minioConfig.port}/${bucketName}/${key}`;
};

/**
 * 从 MinIO 删除文件
 * @param key 对象的 key（路径）
 * @param bucket 可选，指定 bucket 名称
 */
export const deleteFile = async (key: string, bucket?: string): Promise<void> => {
  const bucketName = bucket || minioConfig.bucket;
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

export { minioConfig, s3Client };
