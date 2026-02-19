/**
 * 应用配置
 * 统一管理所有环境变量和配置常量
 */

// Directus API配置
export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || '';

// OSS配置
export const OSS_BASE_URL = import.meta.env.VITE_OSS_BASE_URL || 'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com';

// 应用配置
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'RealSourcing';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

// API端点
export const API_ENDPOINTS = {
  webinars: `${DIRECTUS_URL}/items/webinars`,
  factories: `${DIRECTUS_URL}/items/factories`,
  products: `${DIRECTUS_URL}/items/products`,
  assets: `${DIRECTUS_URL}/assets`,
} as const;

// 辅助函数：获取资源完整URL
export function getAssetUrl(assetId: string | null | undefined): string {
  if (!assetId) return '/placeholder.png';
  if (assetId.startsWith('http')) return assetId;
  return `${API_ENDPOINTS.assets}/${assetId}`;
}

// 辅助函数：获取OSS资源URL
export function getOssUrl(path: string): string {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${OSS_BASE_URL}/${path}`;
}
