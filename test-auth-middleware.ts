/**
 * 测试认证中间件
 * 验证protectedProcedure是否正确拦截未认证请求
 */

import { trpc } from '@trpc/client';
import { httpBatchLink } from '@trpc/client';

const API_URL = 'https://api.cnsubscribe.xyz/api/trpc';

// 创建不带认证的客户端
const unauthenticatedClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: API_URL,
    }),
  ],
});

async function testAuthentication() {
  console.log('🧪 开始测试认证中间件...\n');

  // 测试1: 公开API应该可以访问
  console.log('测试1: 调用公开API (product.list)');
  try {
    const products = await unauthenticatedClient.product.list.query();
    console.log('✅ 公开API调用成功');
    console.log(`   返回 ${products.length} 个产品\n`);
  } catch (error: any) {
    console.log('❌ 公开API调用失败:', error.message, '\n');
  }

  // 测试2: 受保护的API应该返回401
  console.log('测试2: 调用受保护API (product.getRecommendations)');
  try {
    const recommendations = await unauthenticatedClient.product.getRecommendations.query({ limit: 10 });
    console.log('❌ 受保护API调用成功 - 这是一个安全漏洞!');
    console.log(`   返回 ${recommendations.length} 个推荐\n`);
  } catch (error: any) {
    if (error.data?.code === 'UNAUTHORIZED') {
      console.log('✅ 受保护API正确拒绝未认证请求');
      console.log(`   错误码: ${error.data.code}\n`);
    } else {
      console.log('⚠️ 受保护API返回了意外的错误:', error.message, '\n');
    }
  }

  console.log('🏁 测试完成');
}

testAuthentication().catch(console.error);
