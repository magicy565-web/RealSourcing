/**
 * 统一的环境配置管理
 * 使用 zod 验证环境变量，确保所有必需的配置都存在
 */

import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  // 数据库
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // 认证
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_SECRET: z.string().optional(),
  
  // 声网
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),
  AGORA_CUSTOMER_ID: z.string().optional(),
  AGORA_CUSTOMER_SECRET: z.string().optional(),
  
  // 白板
  WHITEBOARD_AK: z.string().optional(),
  WHITEBOARD_SK: z.string().optional(),
  
  // AI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  
  // 阿里云 OSS
  OSS_BUCKET: z.string().optional(),
  OSS_REGION: z.string().optional(),
  OSS_ACCESS_KEY_ID: z.string().optional(),
  OSS_ACCESS_KEY_SECRET: z.string().optional(),
  OSS_ENDPOINT: z.string().optional(),
  
  // 应用配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  APP_URL: z.string().optional(),
});

// 验证环境变量
let config: z.infer<typeof envSchema>;

try {
  config = envSchema.parse(process.env);
  logger.info('Environment variables validated successfully');
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error({ errors: error.errors }, 'Environment variable validation failed');
    console.error('\n❌ Environment variable validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }
  throw error;
}

export { config };

// 导出常用配置
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
