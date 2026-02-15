#!/usr/bin/env node

/**
 * 数据库种子脚本
 * 为开发环境创建测试数据
 */

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'realsourcing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log('🌱 开始种子数据插入...\n');

    // 1. 创建测试用户
    console.log('📝 创建测试用户...');
    const testUsers = [
      {
        id: 'test-factory-001',
        email: 'factory1@example.com',
        name: 'Factory One',
        role: 'factory',
      },
      {
        id: 'test-factory-002',
        email: 'factory2@example.com',
        name: 'Factory Two',
        role: 'factory',
      },
      {
        id: 'test-buyer-001',
        email: 'buyer1@example.com',
        name: 'Buyer One',
        role: 'buyer',
      },
    ];

    for (const user of testUsers) {
      await connection.execute(
        `INSERT IGNORE INTO users (id, email, name, role, createdAt) 
         VALUES (?, ?, ?, ?, NOW())`,
        [user.id, user.email, user.name, user.role]
      );
    }
    console.log(`✅ 创建了 ${testUsers.length} 个测试用户\n`);

    // 2. 创建工厂信息
    console.log('🏭 创建工厂信息...');
    const factories = [
      {
        userId: 'test-factory-001',
        name: 'Advanced Electronics Manufacturing',
        legalName: 'Advanced Electronics Co., Ltd.',
        category: 'Electronics',
        subCategories: JSON.stringify(['PCB', 'Assembly', 'Testing']),
        description: '专业的电子产品制造商，拥有20年的行业经验',
        logo: 'https://via.placeholder.com/200?text=Factory1',
        coverImage: 'https://via.placeholder.com/1200?text=Factory1+Cover',
        website: 'https://factory1.example.com',
        phone: '+86-10-1234-5678',
        email: 'contact@factory1.com',
        country: 'China',
        province: 'Guangdong',
        city: 'Shenzhen',
        address: '123 Industrial Park, Shenzhen',
        employees: 500,
        foundedYear: 2003,
        certifications: JSON.stringify(['ISO9001', 'ISO14001', 'IATF16949']),
        specialties: JSON.stringify(['High precision', 'Fast delivery', 'Cost effective']),
        backgroundScore: 85,
      },
      {
        userId: 'test-factory-002',
        name: 'Precision Metal Works',
        legalName: 'Precision Metal Works Co., Ltd.',
        category: 'Machinery',
        subCategories: JSON.stringify(['Metal Stamping', 'CNC Machining', 'Welding']),
        description: '精密金属加工企业，提供高质量的机械零部件',
        logo: 'https://via.placeholder.com/200?text=Factory2',
        coverImage: 'https://via.placeholder.com/1200?text=Factory2+Cover',
        website: 'https://factory2.example.com',
        phone: '+86-10-8765-4321',
        email: 'contact@factory2.com',
        country: 'China',
        province: 'Jiangsu',
        city: 'Suzhou',
        address: '456 Tech Zone, Suzhou',
        employees: 300,
        foundedYear: 2008,
        certifications: JSON.stringify(['ISO9001', 'ISO45001']),
        specialties: JSON.stringify(['Precision', 'Quality', 'Innovation']),
        backgroundScore: 78,
      },
    ];

    for (const factory of factories) {
      await connection.execute(
        `INSERT IGNORE INTO factories (userId, name, legalName, category, subCategories, description, 
         logo, coverImage, website, phone, email, country, province, city, address, employees, 
         foundedYear, certifications, specialties, backgroundScore, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          factory.userId,
          factory.name,
          factory.legalName,
          factory.category,
          factory.subCategories,
          factory.description,
          factory.logo,
          factory.coverImage,
          factory.website,
          factory.phone,
          factory.email,
          factory.country,
          factory.province,
          factory.city,
          factory.address,
          factory.employees,
          factory.foundedYear,
          factory.certifications,
          factory.specialties,
          factory.backgroundScore,
        ]
      );
    }
    console.log(`✅ 创建了 ${factories.length} 个工厂信息\n`);

    // 3. 创建 Webinar
    console.log('📹 创建 Webinar 活动...');
    const now = new Date();
    const webinars = [
      {
        factoryId: 1,
        title: 'New PCB Assembly Solutions 2026',
        description: '展示我们最新的 PCB 组装技术和解决方案',
        scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7天后
        durationMinutes: 60,
        status: 'scheduled',
        language: 'English',
        enableRecording: true,
        requireApproval: false,
        maxParticipants: 500,
        tags: JSON.stringify(['PCB', 'Assembly', 'Technology']),
      },
      {
        factoryId: 2,
        title: 'Precision Metal Machining Capabilities',
        description: '介绍我们的精密加工能力和最新设备',
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3天后
        durationMinutes: 45,
        status: 'scheduled',
        language: 'English',
        enableRecording: true,
        requireApproval: true,
        maxParticipants: 300,
        tags: JSON.stringify(['Machining', 'Precision', 'Metal']),
      },
      {
        factoryId: 1,
        title: 'Advanced Electronics - Product Showcase',
        description: '产品展示和技术交流',
        scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2天前
        durationMinutes: 60,
        status: 'completed',
        language: 'English',
        enableRecording: true,
        requireApproval: false,
        maxParticipants: 500,
        tags: JSON.stringify(['Electronics', 'Showcase']),
      },
    ];

    for (const webinar of webinars) {
      await connection.execute(
        `INSERT INTO webinars (factoryId, title, description, scheduledAt, durationMinutes, status, 
         language, enableRecording, requireApproval, maxParticipants, tags, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          webinar.factoryId,
          webinar.title,
          webinar.description,
          webinar.scheduledAt,
          webinar.durationMinutes,
          webinar.status,
          webinar.language,
          webinar.enableRecording ? 1 : 0,
          webinar.requireApproval ? 1 : 0,
          webinar.maxParticipants,
          webinar.tags,
        ]
      );
    }
    console.log(`✅ 创建了 ${webinars.length} 个 Webinar 活动\n`);

    // 4. 创建参会者
    console.log('👥 创建参会者记录...');
    const participants = [
      { webinarId: 1, userId: 'test-buyer-001', role: 'attendee', status: 'registered' },
      { webinarId: 2, userId: 'test-buyer-001', role: 'attendee', status: 'registered' },
      { webinarId: 3, userId: 'test-buyer-001', role: 'attendee', status: 'attended' },
    ];

    for (const participant of participants) {
      await connection.execute(
        `INSERT INTO webinarParticipants (webinarId, userId, role, status, joinedAt, createdAt) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          participant.webinarId,
          participant.userId,
          participant.role,
          participant.status,
          participant.status === 'attended' ? new Date() : null,
        ]
      );
    }
    console.log(`✅ 创建了 ${participants.length} 个参会者记录\n`);

    // 5. 创建聊天记录
    console.log('💬 创建聊天记录...');
    const messages = [
      {
        webinarId: 3,
        senderId: 'test-buyer-001',
        receiverId: 'test-factory-001',
        content: '您好，我对您的 PCB 组装服务很感兴趣',
        type: 'text',
      },
      {
        webinarId: 3,
        senderId: 'test-factory-001',
        receiverId: 'test-buyer-001',
        content: '感谢您的关注！我们可以为您提供高质量的组装服务',
        type: 'text',
      },
    ];

    for (const message of messages) {
      await connection.execute(
        `INSERT INTO messages (webinarId, senderId, receiverId, content, type, createdAt) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          message.webinarId,
          message.senderId,
          message.receiverId,
          message.content,
          message.type,
        ]
      );
    }
    console.log(`✅ 创建了 ${messages.length} 条聊天记录\n`);

    console.log('✨ 种子数据插入完成！\n');
    console.log('📊 数据统计：');
    console.log(`  - 用户: ${testUsers.length}`);
    console.log(`  - 工厂: ${factories.length}`);
    console.log(`  - Webinar: ${webinars.length}`);
    console.log(`  - 参会者: ${participants.length}`);
    console.log(`  - 消息: ${messages.length}`);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedDatabase();
