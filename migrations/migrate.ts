import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST || 'rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
  user: process.env.DATABASE_USER || 'magicyang',
  password: process.env.DATABASE_PASSWORD || 'Wysk1214',
  database: process.env.DATABASE_NAME || 'realsourcing',
});

async function columnExists(table: string, column: string): Promise<boolean> {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DATABASE_NAME || 'realsourcing', table, column]
  );
  return (rows as any[]).length > 0;
}

async function addColumnIfNotExists(table: string, column: string, definition: string) {
  const exists = await columnExists(table, column);
  if (!exists) {
    console.log(`Adding column ${table}.${column}...`);
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`✓ Added ${table}.${column}`);
  } else {
    console.log(`✓ Column ${table}.${column} already exists`);
  }
}

async function main() {
  console.log('Starting database migration...\n');

  // Webinars表增强
  console.log('=== Enhancing webinars table ===');
  await addColumnIfNotExists('webinars', 'speaker', "VARCHAR(255) DEFAULT NULL COMMENT '讲师姓名'");
  await addColumnIfNotExists('webinars', 'speakerTitle', "VARCHAR(255) DEFAULT NULL COMMENT '讲师职位'");
  await addColumnIfNotExists('webinars', 'speakerCompany', "VARCHAR(255) DEFAULT NULL COMMENT '讲师公司'");
  await addColumnIfNotExists('webinars', 'speakerBio', "TEXT DEFAULT NULL COMMENT '讲师简介'");
  await addColumnIfNotExists('webinars', 'speakerAvatar', "VARCHAR(500) DEFAULT NULL COMMENT '讲师头像'");
  await addColumnIfNotExists('webinars', 'speakerLinkedin', "VARCHAR(500) DEFAULT NULL COMMENT '讲师LinkedIn'");
  await addColumnIfNotExists('webinars', 'organizer', "VARCHAR(255) DEFAULT NULL COMMENT '主办方名称'");
  await addColumnIfNotExists('webinars', 'organizerLogo', "VARCHAR(500) DEFAULT NULL COMMENT '主办方Logo'");
  await addColumnIfNotExists('webinars', 'coOrganizers', "JSON DEFAULT NULL COMMENT '联合主办方'");
  await addColumnIfNotExists('webinars', 'registrationUrl', "VARCHAR(500) DEFAULT NULL COMMENT '外部注册链接'");
  await addColumnIfNotExists('webinars', 'externalEventId', "VARCHAR(255) DEFAULT NULL COMMENT '外部活动ID'");
  await addColumnIfNotExists('webinars', 'eventSource', "VARCHAR(100) DEFAULT 'internal' COMMENT '活动来源'");
  await addColumnIfNotExists('webinars', 'industry', "VARCHAR(100) DEFAULT NULL COMMENT '行业标签'");
  await addColumnIfNotExists('webinars', 'topics', "JSON DEFAULT NULL COMMENT '主题标签'");
  await addColumnIfNotExists('webinars', 'targetAudience', "TEXT DEFAULT NULL COMMENT '目标受众'");
  await addColumnIfNotExists('webinars', 'level', "ENUM('beginner', 'intermediate', 'advanced') DEFAULT NULL COMMENT '难度级别'");
  await addColumnIfNotExists('webinars', 'subtitle', "VARCHAR(500) DEFAULT NULL COMMENT '副标题'");
  await addColumnIfNotExists('webinars', 'highlights', "JSON DEFAULT NULL COMMENT '核心亮点'");
  await addColumnIfNotExists('webinars', 'agenda', "JSON DEFAULT NULL COMMENT '议程'");
  await addColumnIfNotExists('webinars', 'learningOutcomes', "JSON DEFAULT NULL COMMENT '学习成果'");
  await addColumnIfNotExists('webinars', 'promoVideoUrl', "VARCHAR(500) DEFAULT NULL COMMENT '预告视频URL'");
  await addColumnIfNotExists('webinars', 'thumbnailUrl', "VARCHAR(500) DEFAULT NULL COMMENT '缩略图URL'");
  await addColumnIfNotExists('webinars', 'bannerImage', "VARCHAR(500) DEFAULT NULL COMMENT '横幅图'");
  await addColumnIfNotExists('webinars', 'registrationCount', "INT DEFAULT 0 COMMENT '注册人数'");
  await addColumnIfNotExists('webinars', 'attendanceCount', "INT DEFAULT 0 COMMENT '实际出席人数'");
  await addColumnIfNotExists('webinars', 'completionRate', "DECIMAL(5,2) DEFAULT 0.00 COMMENT '完成率'");
  await addColumnIfNotExists('webinars', 'averageRating', "DECIMAL(3,2) DEFAULT 0.00 COMMENT '平均评分'");
  await addColumnIfNotExists('webinars', 'ratingCount', "INT DEFAULT 0 COMMENT '评分人数'");
  await addColumnIfNotExists('webinars', 'shareCount', "INT DEFAULT 0 COMMENT '分享次数'");
  await addColumnIfNotExists('webinars', 'clickCount', "INT DEFAULT 0 COMMENT '点击次数'");
  await addColumnIfNotExists('webinars', 'questionCount', "INT DEFAULT 0 COMMENT '提问数量'");
  await addColumnIfNotExists('webinars', 'pollCount', "INT DEFAULT 0 COMMENT '投票数量'");
  await addColumnIfNotExists('webinars', 'chatMessageCount', "INT DEFAULT 0 COMMENT '聊天消息数'");
  await addColumnIfNotExists('webinars', 'productFavoriteCount', "INT DEFAULT 0 COMMENT '产品收藏总数'");
  await addColumnIfNotExists('webinars', 'inquiryCount', "INT DEFAULT 0 COMMENT '询价总数'");
  await addColumnIfNotExists('webinars', 'timezone', "VARCHAR(50) DEFAULT 'UTC' COMMENT '时区'");
  await addColumnIfNotExists('webinars', 'translations', "JSON DEFAULT NULL COMMENT '多语言翻译'");
  await addColumnIfNotExists('webinars', 'slug', "VARCHAR(255) DEFAULT NULL COMMENT 'URL友好标识'");
  await addColumnIfNotExists('webinars', 'metaTitle', "VARCHAR(255) DEFAULT NULL COMMENT 'SEO标题'");
  await addColumnIfNotExists('webinars', 'metaDescription', "TEXT DEFAULT NULL COMMENT 'SEO描述'");
  await addColumnIfNotExists('webinars', 'requiresApproval', "TINYINT DEFAULT 0 COMMENT '是否需要审核'");
  await addColumnIfNotExists('webinars', 'isPublic', "TINYINT DEFAULT 1 COMMENT '是否公开'");
  await addColumnIfNotExists('webinars', 'allowRecording', "TINYINT DEFAULT 1 COMMENT '是否允许录制'");
  await addColumnIfNotExists('webinars', 'allowChat', "TINYINT DEFAULT 1 COMMENT '是否允许聊天'");
  await addColumnIfNotExists('webinars', 'allowQA', "TINYINT DEFAULT 1 COMMENT '是否允许问答'");
  await addColumnIfNotExists('webinars', 'allowProductDisplay', "TINYINT DEFAULT 1 COMMENT '是否允许产品展示'");
  await addColumnIfNotExists('webinars', 'reminderSent', "TINYINT DEFAULT 0 COMMENT '提醒是否已发送'");
  await addColumnIfNotExists('webinars', 'followUpSent', "TINYINT DEFAULT 0 COMMENT '跟进邮件是否已发送'");
  await addColumnIfNotExists('webinars', 'estimatedRevenue', "DECIMAL(10,2) DEFAULT NULL COMMENT '预估收入'");
  await addColumnIfNotExists('webinars', 'actualRevenue', "DECIMAL(10,2) DEFAULT NULL COMMENT '实际收入'");
  await addColumnIfNotExists('webinars', 'conversionRate', "DECIMAL(5,2) DEFAULT NULL COMMENT '转化率'");
  await addColumnIfNotExists('webinars', 'roi', "DECIMAL(5,2) DEFAULT NULL COMMENT '投资回报率'");

  console.log('\n=== Creating new tables ===');
  
  // 创建buyer_profiles表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS buyer_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      shopType VARCHAR(100) DEFAULT NULL,
      shopName VARCHAR(255) DEFAULT NULL,
      mainCategories JSON DEFAULT NULL,
      priceRangeMin DECIMAL(10,2) DEFAULT NULL,
      priceRangeMax DECIMAL(10,2) DEFAULT NULL,
      preferredMoqMin INT DEFAULT NULL,
      preferredMoqMax INT DEFAULT NULL,
      totalOrders INT DEFAULT 0,
      totalSpent DECIMAL(10,2) DEFAULT 0.00,
      webinarsAttended INT DEFAULT 0,
      productsViewed INT DEFAULT 0,
      productsFavorited INT DEFAULT 0,
      inquiriesSent INT DEFAULT 0,
      creditScore INT DEFAULT 50,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_userId (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✓ Created buyer_profiles table');

  // 创建live_interactions表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS live_interactions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      webinarId INT NOT NULL,
      userId INT NOT NULL,
      interactionType ENUM('join', 'leave', 'product_view', 'product_favorite', 'inquiry', 'chat', 'question', 'poll_vote') NOT NULL,
      productId INT DEFAULT NULL,
      metadata JSON DEFAULT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_webinarId (webinarId),
      INDEX idx_userId (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✓ Created live_interactions table');

  // 创建webinar_reports表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS webinar_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      webinarId INT NOT NULL UNIQUE,
      totalParticipants INT DEFAULT 0,
      totalProducts INT DEFAULT 0,
      totalFavorites INT DEFAULT 0,
      totalInquiries INT DEFAULT 0,
      hotProducts JSON DEFAULT NULL,
      highIntentBuyers JSON DEFAULT NULL,
      aiInsights TEXT DEFAULT NULL,
      aiRecommendations TEXT DEFAULT NULL,
      generatedAt TIMESTAMP NULL DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_webinarId (webinarId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✓ Created webinar_reports table');

  // 创建ai_recommendations表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ai_recommendations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      webinarId INT NOT NULL,
      productId INT NOT NULL,
      recommendationType ENUM('high_match', 'medium_match', 'similar', 'trending') NOT NULL,
      matchScore DECIMAL(3,2) DEFAULT NULL,
      matchReasons JSON DEFAULT NULL,
      isShown TINYINT DEFAULT 0,
      isClicked TINYINT DEFAULT 0,
      isConverted TINYINT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_userId (userId),
      INDEX idx_webinarId (webinarId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('✓ Created ai_recommendations table');

  console.log('\n✅ Database migration completed successfully!');
  await connection.end();
}

main().catch(console.error);
