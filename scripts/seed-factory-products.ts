/**
 * 批量导入工厂产品测试数据
 * 用于AI功能测试和展示
 */

import { getDb } from '../server/db.js';
import * as schema from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { calculateBatchViralPotential, type Product } from '../server/services/ai/index.js';

// 测试产品数据
const testProducts = [
  {
    name: 'USB-C Fast Charging Cable',
    category: 'Electronics',
    description: 'High-quality USB-C cable with fast charging support, durable braided design',
    minOrderQuantity: 100,
    priceRange: '$2.50-$3.50',
    leadTime: '7-10 days',
    customizable: 1,
    status: 'published' as const,
    // AI评分所需字段
    price: 2.99,
    moq: 100,
    factoryRating: 4.5,
    leadTime: 7,
    viewCount: 1500,
    inquiryCount: 25,
    orderCount: 12,
    reviewCount: 50,
  },
  {
    name: 'Wireless Qi Charger',
    category: 'Electronics',
    description: '15W fast wireless charger compatible with all Qi-enabled devices',
    minOrderQuantity: 50,
    priceRange: '$14.00-$18.00',
    leadTime: '5-7 days',
    customizable: 1,
    status: 'published' as const,
    price: 15.99,
    moq: 50,
    factoryRating: 4.8,
    leadTime: 5,
    viewCount: 3000,
    inquiryCount: 60,
    orderCount: 30,
    reviewCount: 120,
  },
  {
    name: 'Bluetooth Earbuds TWS',
    category: 'Electronics',
    description: 'True wireless stereo earbuds with noise cancellation and 24h battery life',
    minOrderQuantity: 200,
    priceRange: '$8.00-$12.00',
    leadTime: '10-15 days',
    customizable: 1,
    status: 'published' as const,
    price: 9.99,
    moq: 200,
    factoryRating: 4.6,
    leadTime: 12,
    viewCount: 5000,
    inquiryCount: 100,
    orderCount: 45,
    reviewCount: 200,
  },
  {
    name: 'Smart Watch Fitness Tracker',
    category: 'Electronics',
    description: 'Multi-functional smartwatch with heart rate monitor, sleep tracking, and notifications',
    minOrderQuantity: 100,
    priceRange: '$25.00-$35.00',
    leadTime: '15-20 days',
    customizable: 1,
    status: 'published' as const,
    price: 29.99,
    moq: 100,
    factoryRating: 4.7,
    leadTime: 18,
    viewCount: 8000,
    inquiryCount: 150,
    orderCount: 60,
    reviewCount: 300,
  },
  {
    name: 'Portable Power Bank 20000mAh',
    category: 'Electronics',
    description: 'High-capacity power bank with dual USB ports and LED display',
    minOrderQuantity: 150,
    priceRange: '$12.00-$16.00',
    leadTime: '7-12 days',
    customizable: 1,
    status: 'published' as const,
    price: 13.99,
    moq: 150,
    factoryRating: 4.4,
    leadTime: 10,
    viewCount: 2500,
    inquiryCount: 40,
    orderCount: 18,
    reviewCount: 80,
  },
  {
    name: 'LED Desk Lamp with USB Charging',
    category: 'Home & Office',
    description: 'Adjustable LED desk lamp with touch control and USB charging port',
    minOrderQuantity: 80,
    priceRange: '$18.00-$24.00',
    leadTime: '10-14 days',
    customizable: 1,
    status: 'published' as const,
    price: 20.99,
    moq: 80,
    factoryRating: 4.5,
    leadTime: 12,
    viewCount: 1800,
    inquiryCount: 30,
    orderCount: 15,
    reviewCount: 60,
  },
  {
    name: 'Silicone Phone Case',
    category: 'Accessories',
    description: 'Soft silicone phone case with shockproof design, available in multiple colors',
    minOrderQuantity: 500,
    priceRange: '$1.50-$2.50',
    leadTime: '5-8 days',
    customizable: 1,
    status: 'published' as const,
    price: 1.99,
    moq: 500,
    factoryRating: 4.3,
    leadTime: 6,
    viewCount: 4000,
    inquiryCount: 80,
    orderCount: 35,
    reviewCount: 150,
  },
  {
    name: 'Stainless Steel Water Bottle',
    category: 'Home & Office',
    description: 'Insulated stainless steel water bottle, keeps drinks cold for 24h or hot for 12h',
    minOrderQuantity: 200,
    priceRange: '$8.00-$12.00',
    leadTime: '12-18 days',
    customizable: 1,
    status: 'published' as const,
    price: 9.99,
    moq: 200,
    factoryRating: 4.6,
    leadTime: 15,
    viewCount: 3500,
    inquiryCount: 70,
    orderCount: 28,
    reviewCount: 110,
  },
  {
    name: 'Yoga Mat with Carrying Strap',
    category: 'Sports & Fitness',
    description: 'Non-slip yoga mat made from eco-friendly TPE material, 6mm thickness',
    minOrderQuantity: 100,
    priceRange: '$10.00-$15.00',
    leadTime: '10-15 days',
    customizable: 1,
    status: 'published' as const,
    price: 12.99,
    moq: 100,
    factoryRating: 4.5,
    leadTime: 12,
    viewCount: 2200,
    inquiryCount: 45,
    orderCount: 20,
    reviewCount: 75,
  },
  {
    name: 'Laptop Stand Adjustable',
    category: 'Home & Office',
    description: 'Ergonomic aluminum laptop stand with adjustable height and angle',
    minOrderQuantity: 60,
    priceRange: '$22.00-$28.00',
    leadTime: '8-12 days',
    customizable: 1,
    status: 'published' as const,
    price: 24.99,
    moq: 60,
    factoryRating: 4.7,
    leadTime: 10,
    viewCount: 2800,
    inquiryCount: 55,
    orderCount: 25,
    reviewCount: 95,
  },
];

async function seedFactoryProducts() {
  console.log('🌱 开始导入工厂产品数据...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ 数据库连接失败');
    process.exit(1);
  }

  try {
    // 1. 检查是否已有工厂数据
    const factories = await db.select().from(schema.factories).limit(1);
    
    let factoryId: number;
    
    if (factories.length === 0) {
      console.log('📝 未找到工厂数据，创建测试工厂...');
      
      // 创建测试工厂
      const [newFactory] = await db.insert(schema.factories).values({
        userId: 1, // 假设存在userId=1的用户
        name: 'Shenzhen Electronics Manufacturing Co., Ltd.',
        legalName: 'Shenzhen Electronics Manufacturing Co., Ltd.',
        slug: 'shenzhen-electronics',
        category: 'Electronics',
        country: 'China',
        province: 'Guangdong',
        city: 'Shenzhen',
        address: 'No. 123, Innovation Road, Nanshan District',
        phone: '+86-755-12345678',
        email: 'contact@sz-electronics.com',
        website: 'https://www.sz-electronics.com',
        established: 2010,
        employees: '500-1000',
        description: 'Leading electronics manufacturer specializing in consumer electronics and accessories',
        status: 'verified',
        overallScore: '4.6',
        qualityScore: '4.7',
        deliveryScore: '4.5',
        communicationScore: '4.6',
        pricingScore: '4.5',
        complianceScore: '4.8',
      }).$returningId();
      
      factoryId = newFactory.id;
      console.log(`✅ 创建测试工厂成功 (ID: ${factoryId})\n`);
    } else {
      factoryId = factories[0].id;
      console.log(`✅ 使用现有工厂 (ID: ${factoryId})\n`);
    }

    // 2. 清空现有产品数据（可选）
    console.log('🗑️  清理现有产品数据...');
    await db.delete(schema.factoryProducts).where(eq(schema.factoryProducts.factoryId, factoryId));
    console.log('✅ 清理完成\n');

    // 3. 批量插入产品
    console.log('📦 开始插入产品数据...');
    
    const insertedProducts = [];
    
    for (const product of testProducts) {
      const [inserted] = await db.insert(schema.factoryProducts).values({
        factoryId,
        name: product.name,
        category: product.category,
        description: product.description,
        minOrderQuantity: product.minOrderQuantity,
        priceRange: product.priceRange,
        leadTime: product.leadTime,
        customizable: product.customizable,
        status: product.status,
        viewCount: product.viewCount || 0,
        inquiryCount: product.inquiryCount || 0,
      }).$returningId();
      
      insertedProducts.push({
        id: inserted.id,
        name: product.name,
        category: product.category,
        price: product.price,
        moq: product.moq,
        factoryRating: product.factoryRating,
        leadTime: product.leadTime,
        viewCount: product.viewCount,
        inquiryCount: product.inquiryCount,
        orderCount: product.orderCount,
        reviewCount: product.reviewCount,
      });
      
      console.log(`  ✓ ${product.name}`);
    }
    
    console.log(`\n✅ 成功插入 ${insertedProducts.length} 个产品\n`);

    // 4. 计算AI爆款评分
    console.log('🤖 计算AI爆款评分...');
    
    const viralScores = calculateBatchViralPotential(insertedProducts as Product[]);
    
    console.log('\n📊 爆款评分结果：\n');
    insertedProducts.forEach((product) => {
      const score = viralScores.get(product.id);
      if (score) {
        console.log(`${product.name}`);
        console.log(`  总分: ${score.totalScore}/100 (${score.level})`);
        console.log(`  市场需求: ${score.breakdown.marketDemand}`);
        console.log(`  竞争优势: ${score.breakdown.competition}`);
        console.log(`  利润空间: ${score.breakdown.profitMargin}`);
        console.log(`  供应稳定: ${score.breakdown.supplyStability}`);
        console.log(`  营销难度: ${score.breakdown.marketingEase}`);
        console.log('');
      }
    });

    console.log('✅ 数据导入完成！\n');
    console.log(`📈 统计信息：`);
    console.log(`  - 工厂ID: ${factoryId}`);
    console.log(`  - 产品数量: ${insertedProducts.length}`);
    console.log(`  - 分类: ${new Set(insertedProducts.map(p => p.category)).size} 个`);
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    throw error;
  }
}

// 执行导入
seedFactoryProducts()
  .then(() => {
    console.log('\n🎉 所有任务完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 发生错误:', error);
    process.exit(1);
  });
