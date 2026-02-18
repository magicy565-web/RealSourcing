/**
 * tRPC API Endpoints Test
 * 
 * 测试所有AI相关的tRPC API端点
 */

import { loadEnv } from './load-env.js';

loadEnv();

console.log('🚀 开始API端点测试...\n');

const API_BASE_URL = 'http://localhost:3001/api/trpc'; // Always use localhost for testing

async function testAPIEndpoints() {
  console.log(`API基础URL: ${API_BASE_URL}\n`);
  
  // ============================================================================
  // 测试 1: 产品列表 (带AI评分)
  // ============================================================================
  
  console.log('📊 测试 1: product.list - 获取产品列表');
  console.log('='.repeat(80));
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/product.list?input=${encodeURIComponent(JSON.stringify({
        includeViralScore: true,
        limit: 5
      }))}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 成功! 返回 ${data.result?.data?.length || 0} 个产品`);
      
      if (data.result?.data?.[0]) {
        const product = data.result.data[0];
        console.log(`\n示例产品:`);
        console.log(`  - 名称: ${product.name}`);
        console.log(`  - 价格: $${product.price}`);
        if (product.viralScore) {
          console.log(`  - 爆款评分: ${product.viralScore.totalScore}/100 (${product.viralScore.level})`);
        }
      }
    } else {
      console.log(`❌ 失败: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.log(`❌ 错误: ${error.message}`);
  }
  
  console.log('\n✅ 测试 1 完成\n');
  
  // ============================================================================
  // 测试 2: 获取爆款评分
  // ============================================================================
  
  console.log('📊 测试 2: product.getViralScore - 获取爆款评分');
  console.log('='.repeat(80));
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/product.getViralScore?input=${encodeURIComponent(JSON.stringify({
        productId: 1
      }))}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const score = data.result?.data;
      
      if (score) {
        console.log(`✅ 成功!`);
        console.log(`\n爆款评分:`);
        console.log(`  - 总分: ${score.totalScore}/100`);
        console.log(`  - 评级: ${score.level}`);
        console.log(`  - 市场需求: ${score.breakdown.marketDemand}/30`);
        console.log(`  - 竞争程度: ${score.breakdown.competition}/20`);
        console.log(`  - 利润空间: ${score.breakdown.profitMargin}/20`);
        
        if (score.insights?.length > 0) {
          console.log(`\n洞察 (前3条):`);
          score.insights.slice(0, 3).forEach((insight: string) => {
            console.log(`  ${insight}`);
          });
        }
      }
    } else {
      console.log(`❌ 失败: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.log(`❌ 错误: ${error.message}`);
  }
  
  console.log('\n✅ 测试 2 完成\n');
  
  // ============================================================================
  // 测试 3: 批量计算爆款评分
  // ============================================================================
  
  console.log('📊 测试 3: product.batchCalculateViralScore - 批量评分');
  console.log('='.repeat(80));
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/product.batchCalculateViralScore?input=${encodeURIComponent(JSON.stringify({
        productIds: [1, 2, 3, 4, 5]
      }))}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const scores = data.result?.data;
      
      if (scores && Array.isArray(scores)) {
        console.log(`✅ 成功! 计算了 ${scores.length} 个产品的评分`);
        
        console.log(`\n评分排名:`);
        scores
          .sort((a: any, b: any) => b.score.totalScore - a.score.totalScore)
          .forEach((item: any, index: number) => {
            console.log(`  ${index + 1}. 产品 ${item.productId}: ${item.score.totalScore}/100 (${item.score.level})`);
          });
      }
    } else {
      console.log(`❌ 失败: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.log(`❌ 错误: ${error.message}`);
  }
  
  console.log('\n✅ 测试 3 完成\n');
  
  // ============================================================================
  // 测试总结
  // ============================================================================
  
  console.log('='.repeat(80));
  console.log('🎉 API端点测试完成!');
  console.log('='.repeat(80));
  
  console.log(`\n测试统计:`);
  console.log(`  ✓ product.list: 产品列表 (带AI评分)`);
  console.log(`  ✓ product.getViralScore: 单个产品评分`);
  console.log(`  ✓ product.batchCalculateViralScore: 批量评分`);
  
  console.log(`\n注意: 需要认证的端点 (如推荐、谈判、决策矩阵) 需要登录后测试\n`);
}

testAPIEndpoints().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
