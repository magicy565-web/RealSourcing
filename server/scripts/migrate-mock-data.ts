/**
 * 将Mock数据迁移到数据库
 * 这个脚本会将client/src/lib/mock-data.ts中的工厂数据迁移到数据库
 */

// 加载环境变量
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import { getDb } from '../db.js';
import * as schema from '../../drizzle/schema.js';
import { eq, sql } from 'drizzle-orm';

// Mock工厂数据
const mockFactories = [
  {
    name: "Shenzhen Electronics Co., Ltd.",
    location: "Shenzhen, Guangdong",
    category: "Electronics",
    description: "Leading manufacturer of consumer electronics and smart home devices with 15+ years of export experience.",
    score: 92,
    certifications: "ISO 9001, ISO 14001, CE, FCC",
    logo: "/logos/shenzhen-electronics.png",
    images: [
      "/factory-images/electronics1.jpg",
      "/factory-images/electronics2.webp",
      "/factory-images/workshop2.jpg",
      "/factory-images/workshop1.jpg"
    ],
    contact_email: "export@szelectronics.cn",
    contact_phone: "+86-755-8888-0001",
    employee_count: 2500,
    year_established: 2008,
  },
  {
    name: "Guangzhou Smart Home Ltd.",
    location: "Guangzhou, Guangdong",
    category: "Smart Home",
    description: "Specializing in IoT-enabled home automation products including smart locks, sensors, and control systems.",
    score: 88,
    certifications: "ISO 9001, CE, UL",
    logo: "/logos/guangzhou-smarthome.png",
    images: [
      "/factory-images/smarthome-1.jpg",
      "/factory-images/smarthome-2.jpg",
      "/factory-images/smarthome-3.png",
      "/factory-images/smarthome-4.jpg"
    ],
    contact_email: "sales@gzsmarthome.cn",
    contact_phone: "+86-20-8888-0002",
    employee_count: 800,
    year_established: 2015,
  },
  {
    name: "Dongguan Manufacturing Group",
    location: "Dongguan, Guangdong",
    category: "Consumer Goods",
    description: "Full-service OEM/ODM manufacturer for household products, kitchenware, and personal care items.",
    score: 85,
    certifications: "ISO 9001, BSCI, FDA",
    logo: "/logos/dongguan-manufacturing.png",
    images: [
      "/factory-images/consumer-1.jpg",
      "/factory-images/consumer-2.jpg",
      "/factory-images/consumer-3.jpg",
      "/factory-images/consumer-4.jpg"
    ],
    contact_email: "inquiry@dgmanufacturing.cn",
    contact_phone: "+86-769-8888-0003",
    employee_count: 3200,
    year_established: 2003,
  },
  {
    name: "Foshan Furniture Works",
    location: "Foshan, Guangdong",
    category: "Furniture",
    description: "Premium furniture manufacturer specializing in modern office and home furniture with sustainable materials.",
    score: 79,
    certifications: "ISO 9001, FSC, CARB",
    logo: "/logos/foshan-furniture.png",
    images: [
      "/factory-images/furniture-1.jpg",
      "/factory-images/furniture-2.jpg",
      "/factory-images/furniture-3.jpg",
      "/factory-images/furniture-4.jpeg"
    ],
    contact_email: "export@foshanfurniture.cn",
    contact_phone: "+86-757-8888-0004",
    employee_count: 1500,
    year_established: 2010,
  },
  {
    name: "Ningbo Textile Corp.",
    location: "Ningbo, Zhejiang",
    category: "Textiles",
    description: "High-quality textile and garment manufacturer with advanced dyeing and printing capabilities.",
    score: 91,
    certifications: "ISO 9001, OEKO-TEX, GOTS",
    logo: "/logos/ningbo-textiles.png",
    images: [
      "/factory-images/workshop1.jpg",
      "/factory-images/workshop2.jpg",
      "/factory-images/electronics1.jpg"
    ],
    contact_email: "trade@nbtextile.cn",
    contact_phone: "+86-574-8888-0005",
    employee_count: 4000,
    year_established: 2001,
  },
  {
    name: "Shanghai Medical Tech",
    location: "Shanghai, China",
    category: "Medical Devices",
    description: "High-tech medical device manufacturer specializing in diagnostic and surgical equipment.",
    score: 94,
    certifications: "ISO 13485, CE, FDA",
    logo: "/logos/shanghai-medical.png",
    images: [
      "/factory-images/medical1.png",
      "/factory-images/medical2.png",
      "/factory-images/workshop1.jpg",
      "/factory-images/workshop2.jpg"
    ],
    contact_email: "info@shanghaimedical.cn",
    contact_phone: "+86-21-8888-0006",
    employee_count: 1200,
    year_established: 2008,
  },
];

// 生成统计数据（基于score）
function generateStats(score: number, index: number) {
  const baseOrders = Math.floor(score / 10) + index * 2;
  const baseWebinars = Math.floor(score / 30) + 1;
  
  return {
    orders: baseOrders,
    completedOrders: Math.floor(baseOrders * 0.95),
    onTimeRate: Math.min(Math.floor(score + (Math.random() * 10 - 5)), 100),
    webinars: baseWebinars,
    qualityScore: Math.min(score + Math.floor(Math.random() * 5 - 2), 100),
    deliveryScore: Math.min(score + Math.floor(Math.random() * 5 - 2), 100),
    communicationScore: Math.min(score + Math.floor(Math.random() * 5 - 2), 100),
    pricingScore: Math.min(score + Math.floor(Math.random() * 5 - 2), 100),
    complianceScore: Math.min(score + Math.floor(Math.random() * 5 - 2), 100),
  };
}

async function createFactoryImagesTable(db: any) {
  console.log('📋 检查并创建factory_images表...');
  
  try {
    // 使用原始SQL创建表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS factory_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        factoryId INT NOT NULL,
        url VARCHAR(500) NOT NULL,
        type ENUM('factory', 'product', 'certification') NOT NULL DEFAULT 'factory',
        category VARCHAR(50),
        displayOrder INT DEFAULT 0,
        isPrimary TINYINT DEFAULT 0,
        caption VARCHAR(255),
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_factoryId (factoryId),
        INDEX idx_type (type),
        INDEX idx_displayOrder (displayOrder)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ factory_images表已创建或已存在\n');
  } catch (error: any) {
    console.log('⚠️  factory_images表可能已存在:', error.message);
  }
}

async function migrateFactories() {
  console.log('🚀 开始迁移Mock工厂数据到数据库...\n');
  
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('无法连接到数据库');
    }

    // 创建factory_images表
    await createFactoryImagesTable(db);

    // 获取或创建默认用户
    const defaultUser = await db.select().from(schema.users).where(eq(schema.users.email, 'admin@realsourcing.com')).limit(1);
    let userId = 1;
    
    if (defaultUser.length === 0) {
      console.log('创建默认管理员用户...');
      const result = await db.insert(schema.users).values({
        openId: 'admin_openid_' + Date.now(),
        email: 'admin@realsourcing.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
      });
      userId = result[0].insertId;
      console.log(`✅ 创建默认用户 ID: ${userId}\n`);
    } else {
      userId = defaultUser[0].id;
      console.log(`✅ 使用现有用户 ID: ${userId}\n`);
    }

    // 清空现有的工厂数据（可选）
    console.log('🗑️  清空现有工厂数据...');
    await db.execute(sql`DELETE FROM factory_images WHERE factoryId IN (SELECT id FROM factories WHERE userId = ${userId})`);
    await db.execute(sql`DELETE FROM factory_certifications WHERE factoryId IN (SELECT id FROM factories WHERE userId = ${userId})`);
    await db.execute(sql`DELETE FROM factories WHERE userId = ${userId}`);
    console.log('✅ 清空完成\n');

    // 迁移每个工厂
    for (let i = 0; i < mockFactories.length; i++) {
      const factory = mockFactories[i];
      const stats = generateStats(factory.score, i);
      
      console.log(`[${i + 1}/${mockFactories.length}] 迁移工厂: ${factory.name}`);
      
      // 解析location
      const locationParts = factory.location.split(',').map(s => s.trim());
      const city = locationParts[0] || '';
      const province = locationParts[1] || '';
      
      // 插入工厂基本信息
      const factoryData = {
        userId: userId,
        name: factory.name,
        legalName: factory.name,
        logo: factory.logo,
        category: factory.category,
        country: 'China',
        province: province,
        city: city,
        address: factory.location,
        phone: factory.contact_phone,
        email: factory.contact_email,
        established: factory.year_established,
        employees: factory.employee_count.toString(),
        description: factory.description,
        status: factory.score >= 90 ? 'verified' as const : 'pending' as const,
        overallScore: factory.score.toString(),
        qualityScore: stats.qualityScore.toString(),
        deliveryScore: stats.deliveryScore.toString(),
        communicationScore: stats.communicationScore.toString(),
        pricingScore: stats.pricingScore.toString(),
        complianceScore: stats.complianceScore.toString(),
        orderCount: stats.orders,
        reviewCount: Math.floor(stats.orders * 0.3),
        viewCount: stats.orders * 10,
      };

      const factoryResult = await db.insert(schema.factories).values(factoryData);
      const factoryId = factoryResult[0].insertId;
      
      console.log(`  ✅ 工厂ID: ${factoryId}, 评分: ${factory.score}, 订单: ${stats.orders}`);
      
      // 插入认证信息
      const certList = factory.certifications.split(',').map(c => c.trim());
      for (const cert of certList) {
        await db.insert(schema.factoryCertifications).values({
          factoryId: factoryId,
          type: cert.includes('ISO') ? 'iso' : 'other',
          name: cert,
          status: 'verified',
          issuedAt: new Date(factory.year_established, 0, 1),
        });
      }
      console.log(`  ✅ 插入 ${certList.length} 个认证`);
      
      // 插入工厂图片
      if (factory.images && factory.images.length > 0) {
        for (let j = 0; j < factory.images.length; j++) {
          await db.execute(sql`
            INSERT INTO factory_images (factoryId, url, type, displayOrder, isPrimary)
            VALUES (${factoryId}, ${factory.images[j]}, 'factory', ${j}, ${j === 0 ? 1 : 0})
          `);
        }
        console.log(`  ✅ 插入 ${factory.images.length} 张图片`);
      }
      
      console.log('');
    }

    console.log('✅ 所有工厂数据迁移完成！');
    console.log(`\n📊 统计:`);
    console.log(`  - 工厂数量: ${mockFactories.length}`);
    console.log(`  - 总认证数: ${mockFactories.reduce((sum, f) => sum + f.certifications.split(',').length, 0)}`);
    console.log(`  - 总图片数: ${mockFactories.reduce((sum, f) => sum + (f.images?.length || 0), 0)}`);
    
  } catch (error: any) {
    console.error('❌ 迁移失败:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

// 运行迁移
migrateFactories();
