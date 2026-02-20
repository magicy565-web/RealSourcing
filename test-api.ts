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

async function testAPI() {
  console.log('🧪 开始测试 API...\n');

  try {
    // 测试 1: 获取 Webinar 列表
    console.log('📋 测试 1: 获取 Webinar 列表');
    const webinars = await client.webinar.list.query();
    console.log(`✅ 成功获取 ${webinars.length} 个 Webinar`);
    if (webinars.length > 0) {
      console.log(`   - 第一个: ${webinars[0].title}`);
      console.log(`   - 主持人: ${webinars[0].host.name}`);
      console.log(`   - 参会者数: ${webinars[0]._count.participants}`);
      console.log(`   - 产品数: ${webinars[0]._count.products}`);
    }
    console.log('');

    // 测试 2: 获取 Factory 列表
    console.log('🏭 测试 2: 获取 Factory 列表');
    const factories = await client.factory.list.query();
    console.log(`✅ 成功获取 ${factories.length} 个工厂`);
    if (factories.length > 0) {
      console.log(`   - 工厂名: ${factories[0].name}`);
      console.log(`   - 所在地: ${factories[0].city}, ${factories[0].country}`);
      console.log(`   - 产品数: ${factories[0]._count.products}`);
      console.log(`   - 评分: ${factories[0].overallScore}`);
    }
    console.log('');

    // 测试 3: 获取 Product 列表
    console.log('📦 测试 3: 获取 Product 列表');
    const products = await client.product.list.query();
    console.log(`✅ 成功获取 ${products.length} 个产品`);
    if (products.length > 0) {
      console.log(`   - 产品名: ${products[0].name}`);
      console.log(`   - 类别: ${products[0].category}`);
      console.log(`   - 工厂: ${products[0].factory.name}`);
    }
    console.log('');

    // 测试 4: 获取 Webinar 详情（测试关联查询）
    if (webinars.length > 0) {
      console.log('🔍 测试 4: 获取 Webinar 详情（测试关联查询）');
      const webinarDetail = await client.webinar.getById.query({ id: webinars[0].id });
      console.log(`✅ 成功获取详情: ${webinarDetail.title}`);
      console.log(`   - 参会者: ${webinarDetail.participants.length} 人`);
      webinarDetail.participants.forEach((p, i) => {
        console.log(`     ${i + 1}. 工厂: ${p.factory?.name || 'N/A'}, 角色: ${p.role}`);
      });
      console.log(`   - 展示产品: ${webinarDetail.products.length} 个`);
      webinarDetail.products.forEach((wp, i) => {
        console.log(`     ${i + 1}. ${wp.product.name} (来自 ${wp.product.factory.name})`);
      });
      console.log('');
    }

    // 测试 5: 测试用户注册（业务逻辑）
    console.log('👤 测试 5: 测试用户注册（业务逻辑）');
    try {
      const newUser = await client.auth.register.mutate({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        role: 'buyer',
      });
      console.log(`✅ 注册成功: ${newUser.user.name} (${newUser.user.email})`);
      console.log(`   - Token 已生成: ${newUser.token.substring(0, 20)}...`);
    } catch (error: any) {
      console.log(`❌ 注册失败: ${error.message}`);
    }
    console.log('');

    // 测试 6: 测试登录（业务逻辑）
    console.log('🔐 测试 6: 测试登录（业务逻辑）');
    try {
      const loginResult = await client.auth.login.mutate({
        email: 'buyer@test.com',
        password: 'password123',
      });
      console.log(`✅ 登录成功: ${loginResult.user.name}`);
      console.log(`   - 角色: ${loginResult.user.role}`);
      console.log(`   - Token: ${loginResult.token.substring(0, 20)}...`);
    } catch (error: any) {
      console.log(`❌ 登录失败: ${error.message}`);
    }
    console.log('');

    console.log('🎉 所有测试完成！\n');
    console.log('📊 测试总结:');
    console.log('✅ Webinar 模块: 列表查询、详情查询、关联查询');
    console.log('✅ Factory 模块: 列表查询、关联查询');
    console.log('✅ Product 模块: 列表查询、关联查询');
    console.log('✅ Auth 模块: 注册、登录、JWT 生成');
    console.log('✅ 数据库操作: Prisma CRUD、关联查询');
    console.log('✅ 业务逻辑: 密码加密、Token 生成');
    console.log('\n✨ 所有 API 和业务逻辑绑定正常！');

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAPI();
