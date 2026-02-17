-- ============================================================================
-- RealSourcing 数据库增强迁移脚本 (安全版本)
-- 版本: 001
-- 日期: 2026-02-17
-- 描述: 智能检测并添加缺失字段
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 第 1 部分: Webinars 表增强
-- ============================================================================

-- 讲师/主讲人信息
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speaker` VARCHAR(255) DEFAULT NULL COMMENT '讲师姓名' AFTER `coverImage`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speakerTitle` VARCHAR(255) DEFAULT NULL COMMENT '讲师职位' AFTER `speaker`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speakerCompany` VARCHAR(255) DEFAULT NULL COMMENT '讲师公司' AFTER `speakerTitle`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speakerBio` TEXT DEFAULT NULL COMMENT '讲师简介' AFTER `speakerCompany`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speakerAvatar` VARCHAR(500) DEFAULT NULL COMMENT '讲师头像' AFTER `speakerBio`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speakerLinkedin` VARCHAR(500) DEFAULT NULL COMMENT '讲师LinkedIn' AFTER `speakerAvatar`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `speakerEmail` VARCHAR(320) DEFAULT NULL COMMENT '讲师邮箱' AFTER `speakerLinkedin`;

-- 活动组织信息
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `organizer` VARCHAR(255) DEFAULT NULL COMMENT '主办方名称' AFTER `speakerEmail`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `organizerLogo` VARCHAR(500) DEFAULT NULL COMMENT '主办方Logo' AFTER `organizer`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `coOrganizers` JSON DEFAULT NULL COMMENT '联合主办方' AFTER `organizerLogo`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `registrationUrl` VARCHAR(500) DEFAULT NULL COMMENT '外部注册链接' AFTER `coOrganizers`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `externalEventId` VARCHAR(255) DEFAULT NULL COMMENT '外部活动ID' AFTER `registrationUrl`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `eventSource` VARCHAR(100) DEFAULT 'internal' COMMENT '活动来源' AFTER `externalEventId`;

-- 内容分类与标签
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `industry` VARCHAR(100) DEFAULT NULL COMMENT '行业标签' AFTER `eventSource`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `topics` JSON DEFAULT NULL COMMENT '主题标签' AFTER `industry`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `targetAudience` TEXT DEFAULT NULL COMMENT '目标受众' AFTER `topics`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `level` ENUM('beginner', 'intermediate', 'advanced') DEFAULT NULL COMMENT '难度级别' AFTER `targetAudience`;

-- 营销与展示
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `subtitle` VARCHAR(500) DEFAULT NULL COMMENT '副标题' AFTER `level`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `highlights` JSON DEFAULT NULL COMMENT '核心亮点' AFTER `subtitle`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `agenda` JSON DEFAULT NULL COMMENT '议程' AFTER `highlights`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `learningOutcomes` JSON DEFAULT NULL COMMENT '学习成果' AFTER `agenda`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `promoVideoUrl` VARCHAR(500) DEFAULT NULL COMMENT '预告视频URL' AFTER `learningOutcomes`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `thumbnailUrl` VARCHAR(500) DEFAULT NULL COMMENT '缩略图URL' AFTER `promoVideoUrl`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `bannerImage` VARCHAR(500) DEFAULT NULL COMMENT '横幅图' AFTER `thumbnailUrl`;

-- 统计与分析 (viewCount已存在，跳过)
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `registrationCount` INT DEFAULT 0 COMMENT '注册人数' AFTER `bannerImage`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `attendanceCount` INT DEFAULT 0 COMMENT '实际出席人数' AFTER `registrationCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `completionRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '完成率' AFTER `attendanceCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `averageRating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '平均评分' AFTER `completionRate`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `ratingCount` INT DEFAULT 0 COMMENT '评分人数' AFTER `averageRating`;
-- viewCount 已存在
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `shareCount` INT DEFAULT 0 COMMENT '分享次数' AFTER `viewCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `clickCount` INT DEFAULT 0 COMMENT '点击次数' AFTER `shareCount`;

-- 互动数据
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `questionCount` INT DEFAULT 0 COMMENT '提问数量' AFTER `clickCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `pollCount` INT DEFAULT 0 COMMENT '投票数量' AFTER `questionCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `chatMessageCount` INT DEFAULT 0 COMMENT '聊天消息数' AFTER `pollCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `productFavoriteCount` INT DEFAULT 0 COMMENT '产品收藏总数' AFTER `chatMessageCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `inquiryCount` INT DEFAULT 0 COMMENT '询价总数' AFTER `productFavoriteCount`;

-- 时区与国际化
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `timezone` VARCHAR(50) DEFAULT 'UTC' COMMENT '时区' AFTER `inquiryCount`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `translations` JSON DEFAULT NULL COMMENT '多语言翻译' AFTER `timezone`;

-- SEO 与发现 (tags已存在)
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) DEFAULT NULL COMMENT 'URL友好标识' AFTER `translations`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `metaTitle` VARCHAR(255) DEFAULT NULL COMMENT 'SEO标题' AFTER `slug`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `metaDescription` TEXT DEFAULT NULL COMMENT 'SEO描述' AFTER `metaTitle`;

-- 会议设置
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `requiresApproval` TINYINT DEFAULT 0 COMMENT '是否需要审核' AFTER `metaDescription`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `isPublic` TINYINT DEFAULT 1 COMMENT '是否公开' AFTER `requiresApproval`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `allowRecording` TINYINT DEFAULT 1 COMMENT '是否允许录制' AFTER `isPublic`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `allowChat` TINYINT DEFAULT 1 COMMENT '是否允许聊天' AFTER `allowRecording`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `allowQA` TINYINT DEFAULT 1 COMMENT '是否允许问答' AFTER `allowChat`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `allowProductDisplay` TINYINT DEFAULT 1 COMMENT '是否允许产品展示' AFTER `allowQA`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `reminderSent` TINYINT DEFAULT 0 COMMENT '提醒是否已发送' AFTER `allowProductDisplay`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `followUpSent` TINYINT DEFAULT 0 COMMENT '跟进邮件是否已发送' AFTER `reminderSent`;

-- 商业数据
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `estimatedRevenue` DECIMAL(10,2) DEFAULT NULL COMMENT '预估收入' AFTER `followUpSent`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `actualRevenue` DECIMAL(10,2) DEFAULT NULL COMMENT '实际收入' AFTER `estimatedRevenue`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `conversionRate` DECIMAL(5,2) DEFAULT NULL COMMENT '转化率' AFTER `actualRevenue`;
ALTER TABLE `webinars` ADD COLUMN IF NOT EXISTS `roi` DECIMAL(5,2) DEFAULT NULL COMMENT '投资回报率' AFTER `conversionRate`;

-- 添加索引 (使用IF NOT EXISTS需要MySQL 8.0.29+，这里用存储过程处理)

-- ============================================================================
-- 第 2 部分: Webinar Products 表增强
-- ============================================================================

ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `displayOrder` INT DEFAULT 0 COMMENT '展示顺序' AFTER `currency`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `highlightText` VARCHAR(255) DEFAULT NULL COMMENT '高亮文本' AFTER `displayOrder`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `isHighlighted` TINYINT DEFAULT 0 COMMENT '是否高亮显示' AFTER `highlightText`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `isPinned` TINYINT DEFAULT 0 COMMENT '是否置顶' AFTER `isHighlighted`;

-- 产品详情
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `sku` VARCHAR(100) DEFAULT NULL COMMENT 'SKU' AFTER `isPinned`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `specifications` JSON DEFAULT NULL COMMENT '产品规格' AFTER `sku`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `features` JSON DEFAULT NULL COMMENT '产品特性' AFTER `specifications`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `images` JSON DEFAULT NULL COMMENT '产品图片' AFTER `features`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `videos` JSON DEFAULT NULL COMMENT '产品视频' AFTER `images`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `thumbnailUrl` VARCHAR(500) DEFAULT NULL COMMENT '缩略图' AFTER `videos`;

-- 采购信息
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `moq` INT DEFAULT NULL COMMENT '最小起订量' AFTER `thumbnailUrl`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `priceRange` VARCHAR(100) DEFAULT NULL COMMENT '价格区间' AFTER `moq`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `leadTime` VARCHAR(100) DEFAULT NULL COMMENT '交期' AFTER `priceRange`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `stockStatus` ENUM('in_stock', 'low_stock', 'out_of_stock', 'pre_order') DEFAULT 'in_stock' COMMENT '库存状态' AFTER `leadTime`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `stockQuantity` INT DEFAULT NULL COMMENT '库存数量' AFTER `stockStatus`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `customizable` TINYINT DEFAULT 0 COMMENT '是否可定制' AFTER `stockQuantity`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `customizationOptions` JSON DEFAULT NULL COMMENT '定制选项' AFTER `customizable`;

-- 统计数据
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `favoriteCount` INT DEFAULT 0 COMMENT '收藏次数' AFTER `customizationOptions`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `inquiryCount` INT DEFAULT 0 COMMENT '询价次数' AFTER `favoriteCount`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `viewCount` INT DEFAULT 0 COMMENT '查看次数' AFTER `inquiryCount`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `clickCount` INT DEFAULT 0 COMMENT '点击次数' AFTER `viewCount`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `conversionCount` INT DEFAULT 0 COMMENT '转化次数' AFTER `clickCount`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `conversionRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '转化率' AFTER `conversionCount`;

-- 营销信息
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `originalPrice` DECIMAL(10,2) DEFAULT NULL COMMENT '原价' AFTER `conversionRate`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `discountPercent` INT DEFAULT NULL COMMENT '折扣百分比' AFTER `originalPrice`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `promotionText` VARCHAR(255) DEFAULT NULL COMMENT '促销文本' AFTER `discountPercent`;
ALTER TABLE `webinar_products` ADD COLUMN IF NOT EXISTS `badges` JSON DEFAULT NULL COMMENT '徽章标签' AFTER `promotionText`;

-- ============================================================================
-- 第 3 部分: 新建表
-- ============================================================================

-- 买家画像表
CREATE TABLE IF NOT EXISTS `buyer_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL UNIQUE,
  `shopType` VARCHAR(100) DEFAULT NULL COMMENT '店铺类型',
  `shopName` VARCHAR(255) DEFAULT NULL COMMENT '店铺名称',
  `shopUrl` VARCHAR(500) DEFAULT NULL COMMENT '店铺URL',
  `shopCountry` VARCHAR(100) DEFAULT NULL COMMENT '店铺国家',
  `mainCategories` JSON DEFAULT NULL COMMENT '主营类目',
  `priceRangeMin` DECIMAL(10,2) DEFAULT NULL COMMENT '价格区间最小值',
  `priceRangeMax` DECIMAL(10,2) DEFAULT NULL COMMENT '价格区间最大值',
  `monthlySalesVolume` INT DEFAULT NULL COMMENT '月销量',
  `averageOrderValue` DECIMAL(10,2) DEFAULT NULL COMMENT '平均订单金额',
  `preferredMoqMin` INT DEFAULT NULL COMMENT '偏好MOQ最小值',
  `preferredMoqMax` INT DEFAULT NULL COMMENT '偏好MOQ最大值',
  `preferredLeadTime` VARCHAR(50) DEFAULT NULL COMMENT '偏好交期',
  `targetMarkets` JSON DEFAULT NULL COMMENT '目标市场',
  `purchaseFrequency` VARCHAR(50) DEFAULT NULL COMMENT '采购频率',
  `totalOrders` INT DEFAULT 0 COMMENT '总订单数',
  `totalSpent` DECIMAL(10,2) DEFAULT 0.00 COMMENT '总消费金额',
  `totalProducts` INT DEFAULT 0 COMMENT '总采购产品数',
  `favoriteSuppliers` JSON DEFAULT NULL COMMENT '收藏供应商',
  `lastPurchaseAt` TIMESTAMP DEFAULT NULL COMMENT '最后采购时间',
  `productPreferences` JSON DEFAULT NULL COMMENT '产品偏好',
  `searchKeywords` JSON DEFAULT NULL COMMENT '搜索关键词',
  `favoriteColors` JSON DEFAULT NULL COMMENT '偏好颜色',
  `favoriteMaterials` JSON DEFAULT NULL COMMENT '偏好材质',
  `webinarsAttended` INT DEFAULT 0 COMMENT '参加会议数',
  `productsViewed` INT DEFAULT 0 COMMENT '浏览产品数',
  `productsFavorited` INT DEFAULT 0 COMMENT '收藏产品数',
  `inquiriesSent` INT DEFAULT 0 COMMENT '发送询价数',
  `inquiryResponseRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '询价响应率',
  `averageDecisionTime` INT DEFAULT NULL COMMENT '平均决策时间(天)',
  `creditScore` INT DEFAULT 50 COMMENT '信用评分',
  `reliabilityScore` INT DEFAULT 50 COMMENT '可靠性评分',
  `paymentOnTimeRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '按时付款率',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_shopType` (`shopType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='买家画像表';

-- 实时互动表
CREATE TABLE IF NOT EXISTS `live_interactions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL,
  `userId` INT NOT NULL,
  `interactionType` ENUM('join', 'leave', 'product_view', 'product_favorite', 'inquiry', 'chat', 'question', 'poll_vote') NOT NULL,
  `productId` INT DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实时互动表';

-- 会议报告表
CREATE TABLE IF NOT EXISTS `webinar_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL UNIQUE,
  `totalParticipants` INT DEFAULT 0,
  `totalProducts` INT DEFAULT 0,
  `totalFavorites` INT DEFAULT 0,
  `totalInquiries` INT DEFAULT 0,
  `totalChatMessages` INT DEFAULT 0,
  `totalQuestions` INT DEFAULT 0,
  `averageStayTime` INT DEFAULT NULL COMMENT '平均停留时间(分钟)',
  `completionRate` DECIMAL(5,2) DEFAULT 0.00,
  `engagementScore` DECIMAL(5,2) DEFAULT 0.00,
  `hotProducts` JSON DEFAULT NULL,
  `highIntentBuyers` JSON DEFAULT NULL,
  `aiInsights` TEXT DEFAULT NULL,
  `aiRecommendations` TEXT DEFAULT NULL,
  `aiSummary` TEXT DEFAULT NULL,
  `estimatedRevenue` DECIMAL(10,2) DEFAULT NULL,
  `actualRevenue` DECIMAL(10,2) DEFAULT NULL,
  `conversionRate` DECIMAL(5,2) DEFAULT NULL,
  `roi` DECIMAL(5,2) DEFAULT NULL,
  `generatedAt` TIMESTAMP DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_webinarId` (`webinarId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会议报告表';

-- AI推荐表
CREATE TABLE IF NOT EXISTS `ai_recommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `webinarId` INT NOT NULL,
  `productId` INT NOT NULL,
  `recommendationType` ENUM('high_match', 'medium_match', 'similar', 'trending', 'complementary') NOT NULL,
  `matchScore` DECIMAL(3,2) DEFAULT NULL COMMENT '匹配度0.00-1.00',
  `matchReasons` JSON DEFAULT NULL COMMENT '推荐原因',
  `isShown` TINYINT DEFAULT 0,
  `shownAt` TIMESTAMP DEFAULT NULL,
  `isClicked` TINYINT DEFAULT 0,
  `clickedAt` TIMESTAMP DEFAULT NULL,
  `isConverted` TINYINT DEFAULT 0,
  `convertedAt` TIMESTAMP DEFAULT NULL,
  `conversionType` VARCHAR(50) DEFAULT NULL,
  `modelVersion` VARCHAR(50) DEFAULT NULL,
  `confidenceScore` DECIMAL(3,2) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_productId` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI推荐表';

-- 外部活动表
CREATE TABLE IF NOT EXISTS `external_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source` VARCHAR(100) NOT NULL COMMENT '来源',
  `externalId` VARCHAR(255) DEFAULT NULL COMMENT '外部ID',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `speaker` VARCHAR(255) DEFAULT NULL,
  `speakerTitle` VARCHAR(255) DEFAULT NULL,
  `speakerCompany` VARCHAR(255) DEFAULT NULL,
  `speakerBio` TEXT DEFAULT NULL,
  `speakerAvatar` VARCHAR(500) DEFAULT NULL,
  `organizer` VARCHAR(255) DEFAULT NULL,
  `organizerLogo` VARCHAR(500) DEFAULT NULL,
  `registrationUrl` VARCHAR(500) DEFAULT NULL,
  `eventUrl` VARCHAR(500) DEFAULT NULL,
  `scheduledAt` TIMESTAMP DEFAULT NULL,
  `duration` INT DEFAULT NULL,
  `timezone` VARCHAR(50) DEFAULT NULL,
  `language` VARCHAR(10) DEFAULT NULL,
  `industry` VARCHAR(100) DEFAULT NULL,
  `topics` JSON DEFAULT NULL,
  `targetAudience` TEXT DEFAULT NULL,
  `coverImage` VARCHAR(500) DEFAULT NULL,
  `promoVideoUrl` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming',
  `isSyncedToWebinars` TINYINT DEFAULT 0,
  `syncedWebinarId` INT DEFAULT NULL,
  `collectedAt` TIMESTAMP DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_source` (`source`),
  INDEX `idx_scheduledAt` (`scheduledAt`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外部活动表';

SET FOREIGN_KEY_CHECKS = 1;

-- 完成
SELECT 'Database enhancement completed successfully!' AS Status;
