import OSS from 'ali-oss';
import { ENV } from '../_core/env.js';

// 阿里云 OSS 客户端配置
const ossClient = new OSS({
  region: ENV.ossRegion,
  accessKeyId: ENV.ossAccessKeyId,
  accessKeySecret: ENV.ossAccessKeySecret,
  bucket: ENV.ossBucket,
});

/**
 * 上传文件到阿里云 OSS
 * @param fileName - 文件名（包含路径，如 'recordings/meeting-123.mp4'）
 * @param fileBuffer - 文件内容（Buffer 或 Stream）
 * @returns OSS 文件 URL
 */
export async function uploadToOSS(
  fileName: string,
  fileBuffer: Buffer | NodeJS.ReadableStream
): Promise<string> {
  try {
    const result = await ossClient.put(fileName, fileBuffer);
    console.log(`[OSS] File uploaded successfully: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error('[OSS] Upload failed:', error);
    throw new Error(`Failed to upload file to OSS: ${error}`);
  }
}

/**
 * 生成 OSS 文件的签名 URL（用于私有文件的临时访问）
 * @param fileName - 文件名（包含路径）
 * @param expiresInSeconds - 签名有效期（秒），默认 3600 秒（1 小时）
 * @returns 签名 URL
 */
export async function getSignedUrl(
  fileName: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  try {
    const url = ossClient.signatureUrl(fileName, {
      expires: expiresInSeconds,
    });
    console.log(`[OSS] Signed URL generated: ${url}`);
    return url;
  } catch (error) {
    console.error('[OSS] Failed to generate signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error}`);
  }
}

/**
 * 删除 OSS 中的文件
 * @param fileName - 文件名（包含路径）
 */
export async function deleteFromOSS(fileName: string): Promise<void> {
  try {
    await ossClient.delete(fileName);
    console.log(`[OSS] File deleted successfully: ${fileName}`);
  } catch (error) {
    console.error('[OSS] Delete failed:', error);
    throw new Error(`Failed to delete file from OSS: ${error}`);
  }
}

/**
 * 列出 OSS 中指定前缀的所有文件
 * @param prefix - 文件路径前缀（如 'recordings/'）
 * @returns 文件列表
 */
export async function listFiles(prefix: string): Promise<OSS.ObjectMeta[]> {
  try {
    const result = await ossClient.list({
      prefix,
      'max-keys': 100,
    });
    console.log(`[OSS] Listed ${result.objects?.length || 0} files with prefix: ${prefix}`);
    return result.objects || [];
  } catch (error) {
    console.error('[OSS] List files failed:', error);
    throw new Error(`Failed to list files from OSS: ${error}`);
  }
}

/**
 * 获取 OSS 文件的公共访问 URL（适用于公共读的 Bucket）
 * @param fileName - 文件名（包含路径）
 * @returns 公共访问 URL
 */
export function getPublicUrl(fileName: string): string {
  const bucket = ENV.ossBucket;
  const region = ENV.ossRegion;
  const endpoint = ENV.ossEndpoint || `${bucket}.${region}.aliyuncs.com`;
  
  // 如果配置了 CDN 域名，优先使用 CDN 域名
  if (ENV.ossCdnDomain) {
    return `https://${ENV.ossCdnDomain}/${fileName}`;
  }
  
  return `https://${endpoint}/${fileName}`;
}
