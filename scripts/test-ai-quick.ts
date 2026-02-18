/**
 * Quick AI Provider Test
 */

import { loadEnv } from './load-env.js';
import { callAI } from '../server/services/ai/ai-provider.js';

loadEnv();

console.log('🚀 快速AI提供商测试\n');

async function quickTest() {
  // 测试国内场景 (阿里云百炼)
  console.log('🇨🇳 测试国内场景 (阿里云百炼)...');
  try {
    const response = await callAI(
      [
        { role: 'system', content: '你是RealSourcing的AI助手,专注于跨境电商采购。' },
        { role: 'user', content: '请简单介绍一下你的功能。' }
      ],
      {
        region: 'cn',
        retryOnFailure: true,
      }
    );
    
    console.log(`✅ 提供商: ${response.provider} (${response.model})`);
    console.log(`响应: ${response.content.substring(0, 150)}...\n`);
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}\n`);
  }
  
  // 测试海外场景 (Google Gemini)
  console.log('🌍 测试海外场景 (Google Gemini)...');
  try {
    const response = await callAI(
      [
        { role: 'system', content: 'You are RealSourcing AI assistant for cross-border e-commerce.' },
        { role: 'user', content: 'Please briefly introduce your features.' }
      ],
      {
        region: 'global',
        retryOnFailure: true,
      }
    );
    
    console.log(`✅ 提供商: ${response.provider} (${response.model})`);
    console.log(`响应: ${response.content.substring(0, 150)}...\n`);
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}\n`);
  }
  
  console.log('✅ 测试完成!');
}

quickTest();
