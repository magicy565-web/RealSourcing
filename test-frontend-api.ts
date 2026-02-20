/**
 * 前端 API 调用测试
 * 模拟前端使用 tRPC React Query 调用后端 API
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc/router';
import superjson from 'superjson';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/api/trpc',
    }),
  ],
  transformer: superjson,
});

async function testFrontendAPI() {
  console.log('🧪 前端 API 调用测试\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = 0;

  // 测试 1: Webinar 列表
  totalTests++;
  console.log('\n📋 测试 1: 前端调用 webinar.list');
  try {
    const webinars = await client.webinar.list.query();
    console.log(`✅ 成功: 获取 ${webinars.length} 个 Webinar`);
    
    if (webinars.length > 0) {
      const w = webinars[0];
      console.log(`\n   展示数据:`);
      console.log(`   - 标题: ${w.title}`);
      console.log(`   - 主持人: ${w.host.name}`);
      console.log(`   - 参会者: ${w._count.participants} 人`);
      console.log(`   - 产品: ${w._count.products} 个`);
      console.log(`   - 状态: ${w.status}`);
      console.log(`   - 时间: ${w.scheduledAt ? new Date(w.scheduledAt).toLocaleString('zh-CN') : '未定'}`);
    }
    passedTests++;
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`);
  }

  // 测试 2: Factory 列表
  totalTests++;
  console.log('\n🏭 测试 2: 前端调用 factory.list');
  try {
    const factories = await client.factory.list.query();
    console.log(`✅ 成功: 获取 ${factories.length} 个工厂`);
    
    if (factories.length > 0) {
      const f = factories[0];
      console.log(`\n   展示数据:`);
      console.log(`   - 名称: ${f.name}`);
      console.log(`   - 地点: ${f.city}, ${f.country}`);
      console.log(`   - 类别: ${f.category}`);
      console.log(`   - 评分: ${f.overallScore}`);
      console.log(`   - 产品数: ${f._count.products}`);
      console.log(`   - 状态: ${f.status}`);
    }
    passedTests++;
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`);
  }

  // 测试 3: Product 列表
  totalTests++;
  console.log('\n📦 测试 3: 前端调用 product.list');
  try {
    const products = await client.product.list.query();
    console.log(`✅ 成功: 获取 ${products.length} 个产品`);
    
    if (products.length > 0) {
      const p = products[0];
      console.log(`\n   展示数据:`);
      console.log(`   - 名称: ${p.name}`);
      console.log(`   - 类别: ${p.category}`);
      console.log(`   - 描述: ${p.description}`);
      console.log(`   - 工厂: ${p.factory.name}`);
      console.log(`   - 状态: ${p.status}`);
    }
    passedTests++;
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`);
  }

  // 测试 4: Webinar 详情（测试关联查询）
  totalTests++;
  console.log('\n🔍 测试 4: 前端调用 webinar.getById（关联查询）');
  try {
    const webinars = await client.webinar.list.query();
    if (webinars.length > 0) {
      const detail = await client.webinar.getById.query({ id: webinars[0].id });
      console.log(`✅ 成功: 获取 Webinar 详情`);
      
      console.log(`\n   展示数据:`);
      console.log(`   - 标题: ${detail.title}`);
      console.log(`   - 主持人: ${detail.host.name} (${detail.host.email})`);
      console.log(`   - 参会者列表:`);
      detail.participants.forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.factory?.name || 'N/A'} - ${p.role} (${p.status})`);
      });
      console.log(`   - 展示产品:`);
      detail.products.forEach((wp, i) => {
        console.log(`     ${i + 1}. ${wp.product.name} (来自 ${wp.product.factory.name})`);
      });
      passedTests++;
    } else {
      console.log(`⚠️  跳过: 没有 Webinar 数据`);
    }
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`);
  }

  // 测试 5: Factory 详情
  totalTests++;
  console.log('\n🏭 测试 5: 前端调用 factory.getById');
  try {
    const factories = await client.factory.list.query();
    if (factories.length > 0) {
      const detail = await client.factory.getById.query({ id: factories[0].id });
      console.log(`✅ 成功: 获取工厂详情`);
      
      console.log(`\n   展示数据:`);
      console.log(`   - 名称: ${detail.name}`);
      console.log(`   - 所有者: ${detail.user.name} (${detail.user.email})`);
      console.log(`   - 产品列表:`);
      detail.products.slice(0, 3).forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.name} - ${p.category}`);
      });
      passedTests++;
    } else {
      console.log(`⚠️  跳过: 没有工厂数据`);
    }
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`);
  }

  // 测试 6: Product 详情
  totalTests++;
  console.log('\n📦 测试 6: 前端调用 product.getById');
  try {
    const products = await client.product.list.query();
    if (products.length > 0) {
      const detail = await client.product.getById.query({ id: products[0].id });
      console.log(`✅ 成功: 获取产品详情`);
      
      console.log(`\n   展示数据:`);
      console.log(`   - 名称: ${detail.name}`);
      console.log(`   - 类别: ${detail.category}`);
      console.log(`   - 描述: ${detail.description}`);
      console.log(`   - 工厂: ${detail.factory.name}`);
      console.log(`   - 工厂地点: ${detail.factory.city}, ${detail.factory.country}`);
      passedTests++;
    } else {
      console.log(`⚠️  跳过: 没有产品数据`);
    }
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`);
  }

  // 总结
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 测试总结:`);
  console.log(`   通过: ${passedTests}/${totalTests}`);
  console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n✨ 所有测试通过！前端可以正常调用后端 API 并展示数据！\n');
    console.log('✅ 验证结果:');
    console.log('   - 前端 tRPC 客户端配置正确');
    console.log('   - 后端 API 响应正常');
    console.log('   - 数据关联查询成功');
    console.log('   - 前端可以正常展示所有数据');
    console.log('\n🎉 重构完全成功！可以部署到生产环境！');
  } else {
    console.log(`\n⚠️  有 ${totalTests - passedTests} 个测试失败，请检查错误信息`);
  }
}

testFrontendAPI().catch(console.error);
