/**
 * 前端环境配置
 * 统一管理所有环境变量
 */

/**
 * API 配置
 */
export const API_CONFIG = {
  // tRPC API 地址
  baseUrl: import.meta.env.VITE_API_URL || (
    import.meta.env.MODE === 'development' 
      ? 'http://localhost:3001/api/trpc'  // 本地开发环境
      : 'https://api.cnsubscribe.xyz/api/trpc'  // 生产环境
  ),
  
  // 超时时间（毫秒）
  timeout: 30000,
};

/**
 * Directus CMS 配置
 */
export const DIRECTUS_CONFIG = {
  url: import.meta.env.VITE_DIRECTUS_URL || '',
  assetsUrl: `${import.meta.env.VITE_DIRECTUS_URL || ''}/assets`,
};

/**
 * 声网配置
 */
export const AGORA_CONFIG = {
  appId: import.meta.env.VITE_AGORA_APP_ID || '0deed6e0ce284935b09babccaa5eb882',
};

/**
 * 白板配置
 */
export const WHITEBOARD_CONFIG = {
  appId: import.meta.env.VITE_WHITEBOARD_APP_ID || 'An5FAAdKEfGBPUteaMCQZA/HawDYn5_ZHWEOg',
};

/**
 * 应用配置
 */
export const APP_CONFIG = {
  name: 'RealSourcing',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

/**
 * 验证必需的环境变量
 */
function validateEnv() {
  const required = [
    'VITE_API_URL',
    'VITE_AGORA_APP_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0 && APP_CONFIG.isProduction) {
    console.warn('⚠️ Missing environment variables:', missing);
  }
}

// 在生产环境验证环境变量
if (APP_CONFIG.isProduction) {
  validateEnv();
}
