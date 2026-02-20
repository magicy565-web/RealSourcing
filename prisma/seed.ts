import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充数据...');

  // 创建测试用户
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      openId: nanoid(),
      email: 'buyer@test.com',
      passwordHash,
      name: 'Test Buyer',
      role: 'buyer',
      status: 'active',
    },
  });
  console.log('✅ 创建买家用户:', buyer.email);

  const factory = await prisma.user.upsert({
    where: { email: 'factory@test.com' },
    update: {},
    create: {
      openId: nanoid(),
      email: 'factory@test.com',
      passwordHash,
      name: 'Test Factory',
      role: 'factory',
      status: 'active',
    },
  });
  console.log('✅ 创建工厂用户:', factory.email);

  // 创建工厂
  const factoryData = await prisma.factory.upsert({
    where: { slug: 'shenzhen-electronics' },
    update: {},
    create: {
      userId: factory.id,
      name: '深圳电子制造有限公司',
      slug: 'shenzhen-electronics',
      category: 'Electronics',
      country: 'China',
      city: 'Shenzhen',
      description: '专业的电子产品制造商，拥有20年经验',
      status: 'verified',
      overallScore: 4.5,
    },
  });
  console.log('✅ 创建工厂:', factoryData.name);

  // 创建产品
  const product1 = await prisma.product.create({
    data: {
      factoryId: factoryData.id,
      name: 'LED灯泡',
      slug: 'led-bulb-' + nanoid(6),
      category: 'Lighting',
      description: '高效节能LED灯泡，使用寿命长达50000小时',
      status: 'active',
    },
  });
  console.log('✅ 创建产品:', product1.name);

  const product2 = await prisma.product.create({
    data: {
      factoryId: factoryData.id,
      name: '智能开关',
      slug: 'smart-switch-' + nanoid(6),
      category: 'Electronics',
      description: '支持WiFi控制的智能开关',
      status: 'active',
    },
  });
  console.log('✅ 创建产品:', product2.name);

  // 创建 Webinar
  const webinar = await prisma.webinar.create({
    data: {
      hostId: buyer.id,
      title: 'LED照明产品采购洽谈会',
      slug: 'led-lighting-webinar-' + nanoid(6),
      description: '探讨最新的LED照明技术和采购方案',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
      duration: 60,
    },
  });
  console.log('✅ 创建 Webinar:', webinar.title);

  // 添加参会者
  await prisma.webinarParticipant.create({
    data: {
      webinarId: webinar.id,
      factoryId: factoryData.id,
      role: 'presenter',
      status: 'accepted',
    },
  });
  console.log('✅ 添加参会者');

  // 添加产品到 Webinar
  await prisma.webinarProduct.createMany({
    data: [
      { webinarId: webinar.id, productId: product1.id },
      { webinarId: webinar.id, productId: product2.id },
    ],
  });
  console.log('✅ 添加产品到 Webinar');

  console.log('\n🎉 数据填充完成！');
  console.log('\n📝 测试账号:');
  console.log('买家: buyer@test.com / password123');
  console.log('工厂: factory@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
