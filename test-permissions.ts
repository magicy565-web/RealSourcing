/**
 * 权限验证测试脚本
 * 测试游客、买家、工厂三种角色的 API 访问权限
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers/index.js';
import fetch from 'node-fetch';

// 创建 tRPC 客户端（游客模式 - 无 token）
const guestClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/api/trpc',
      fetch: fetch as any,
    }),
  ],
});

// 创建 tRPC 客户端（认证模式 - 带 token）
function createAuthClient(token: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3001/api/trpc',
        fetch: fetch as any,
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    ],
  });
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function testGuestAccess() {
  console.log('\n🌍 测试游客访问权限...\n');

  // 测试工厂列表
  try {
    const factories = await guestClient.factory.list.query({ limit: 5 });
    logTest('游客可以查看工厂列表', true);
  } catch (error: any) {
    logTest('游客可以查看工厂列表', false, error.message);
  }

  // 测试工厂详情
  try {
    const factory = await guestClient.factory.getById.query({ id: 1 });
    logTest('游客可以查看工厂详情', !!factory);
  } catch (error: any) {
    logTest('游客可以查看工厂详情', false, error.message);
  }

  // 测试工厂图片
  try {
    const images = await guestClient.factory.getImages.query({ factoryId: 1 });
    logTest('游客可以查看工厂图片', true);
  } catch (error: any) {
    logTest('游客可以查看工厂图片', false, error.message);
  }

  // 测试工厂认证
  try {
    const certs = await guestClient.factory.getCertifications.query({ factoryId: 1 });
    logTest('游客可以查看工厂认证', true);
  } catch (error: any) {
    logTest('游客可以查看工厂认证', false, error.message);
  }

  // 测试工厂产品
  try {
    const products = await guestClient.factory.getProducts.query({ factoryId: 1 });
    logTest('游客可以查看工厂产品', true);
  } catch (error: any) {
    logTest('游客可以查看工厂产品', false, error.message);
  }

  // 测试工厂评价
  try {
    const reviews = await guestClient.factory.getReviews.query({ factoryId: 1 });
    logTest('游客可以查看工厂评价', true);
  } catch (error: any) {
    logTest('游客可以查看工厂评价', false, error.message);
  }

  // 测试产品列表
  try {
    const products = await guestClient.product.list.query({ limit: 5 });
    logTest('游客可以查看产品列表', true);
  } catch (error: any) {
    logTest('游客可以查看产品列表', false, error.message);
  }

  // 测试产品详情
  try {
    const product = await guestClient.product.getById.query({ id: 55 });
    logTest('游客可以查看产品详情', !!product);
  } catch (error: any) {
    logTest('游客可以查看产品详情', false, error.message);
  }

  // 测试 Webinar 列表
  try {
    const webinars = await guestClient.webinar.listAll.query({ limit: 5 });
    logTest('游客可以查看 Webinar 列表', true);
  } catch (error: any) {
    logTest('游客可以查看 Webinar 列表', false, error.message);
  }

  // 测试 Webinar 详情
  try {
    const webinar = await guestClient.webinar.getById.query({ id: 1 });
    logTest('游客可以查看 Webinar 详情', !!webinar);
  } catch (error: any) {
    logTest('游客可以查看 Webinar 详情', false, error.message);
  }

  // 测试 Webinar 产品列表
  try {
    const products = await guestClient.webinarProduct.listByWebinar.query({ 
      webinarId: 1,
      includeDetails: true,
    });
    logTest('游客可以查看 Webinar 产品列表', true);
  } catch (error: any) {
    logTest('游客可以查看 Webinar 产品列表', false, error.message);
  }

  // 测试游客不能创建 Webinar
  try {
    await guestClient.webinar.create.mutate({
      title: 'Test Webinar',
      scheduledAt: new Date().toISOString(),
      duration: 60,
    } as any);
    logTest('游客不能创建 Webinar', false, '应该被拒绝但成功了');
  } catch (error: any) {
    logTest('游客不能创建 Webinar', true);
  }

  // 测试游客不能添加产品到 Webinar
  try {
    await guestClient.webinarProduct.addProduct.mutate({
      webinarId: 1,
      productId: 55,
    } as any);
    logTest('游客不能添加产品到 Webinar', false, '应该被拒绝但成功了');
  } catch (error: any) {
    logTest('游客不能添加产品到 Webinar', true);
  }
}

async function testAuthenticatedAccess() {
  console.log('\n🔐 测试认证用户访问权限...\n');
  console.log('⚠️  需要有效的 JWT token 才能测试，跳过此部分');
  console.log('   请在实际环境中使用真实用户 token 进行测试');
}

async function runTests() {
  console.log('🧪 RealSourcing 权限验证测试\n');
  console.log('=' .repeat(60));

  try {
    await testGuestAccess();
    await testAuthenticatedAccess();
  } catch (error: any) {
    console.error('\n❌ 测试执行失败:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果汇总:\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${failed}/${total}`);
  console.log(`📈 成功率: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ 失败的测试:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      if (r.error) {
        console.log(`     ${r.error}`);
      }
    });
  }

  console.log('\n✅ 测试完成！\n');
}

// 运行测试
runTests().catch(console.error);
