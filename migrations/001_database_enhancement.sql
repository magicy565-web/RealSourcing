-- ============================================================================
-- RealSourcing 数据库增强迁移脚本
-- 版本: 001
-- 日期: 2026-02-17
-- 描述: 将 RealSourcing 打造成真实可用的 B2B SaaS 平台
-- ============================================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 第 1 部分: Webinars 表增强 (添加 40+ 新字段)
-- ============================================================================

ALTER TABLE `webinars`
-- 讲师/主讲人信息
ADD COLUMN `speaker` VARCHAR(255) DEFAULT NULL COMMENT '讲师姓名' AFTER `coverImage`,
ADD COLUMN `speakerTitle` VARCHAR(255) DEFAULT NULL COMMENT '讲师职位' AFTER `speaker`,
ADD COLUMN `speakerCompany` VARCHAR(255) DEFAULT NULL COMMENT '讲师公司' AFTER `speakerTitle`,
ADD COLUMN `speakerBio` TEXT DEFAULT NULL COMMENT '讲师简介' AFTER `speakerCompany`,
ADD COLUMN `speakerAvatar` VARCHAR(500) DEFAULT NULL COMMENT '讲师头像' AFTER `speakerBio`,
ADD COLUMN `speakerLinkedin` VARCHAR(500) DEFAULT NULL COMMENT '讲师LinkedIn' AFTER `speakerAvatar`,
ADD COLUMN `speakerEmail` VARCHAR(320) DEFAULT NULL COMMENT '讲师邮箱' AFTER `speakerLinkedin`,

-- 活动组织信息
ADD COLUMN `organizer` VARCHAR(255) DEFAULT NULL COMMENT '主办方名称' AFTER `speakerEmail`,
ADD COLUMN `organizerLogo` VARCHAR(500) DEFAULT NULL COMMENT '主办方Logo' AFTER `organizer`,
ADD COLUMN `coOrganizers` JSON DEFAULT NULL COMMENT '联合主办方' AFTER `organizerLogo`,
ADD COLUMN `registrationUrl` VARCHAR(500) DEFAULT NULL COMMENT '外部注册链接' AFTER `coOrganizers`,
ADD COLUMN `externalEventId` VARCHAR(255) DEFAULT NULL COMMENT '外部活动ID' AFTER `registrationUrl`,
ADD COLUMN `eventSource` VARCHAR(100) DEFAULT 'internal' COMMENT '活动来源' AFTER `externalEventId`,

-- 内容分类与标签
ADD COLUMN `industry` VARCHAR(100) DEFAULT NULL COMMENT '行业标签' AFTER `eventSource`,
ADD COLUMN `topics` JSON DEFAULT NULL COMMENT '主题标签' AFTER `industry`,
ADD COLUMN `targetAudience` TEXT DEFAULT NULL COMMENT '目标受众' AFTER `topics`,
ADD COLUMN `level` ENUM('beginner', 'intermediate', 'advanced') DEFAULT NULL COMMENT '难度级别' AFTER `targetAudience`,

-- 营销与展示
ADD COLUMN `subtitle` VARCHAR(500) DEFAULT NULL COMMENT '副标题' AFTER `level`,
ADD COLUMN `highlights` JSON DEFAULT NULL COMMENT '核心亮点' AFTER `subtitle`,
ADD COLUMN `agenda` JSON DEFAULT NULL COMMENT '议程' AFTER `highlights`,
ADD COLUMN `learningOutcomes` JSON DEFAULT NULL COMMENT '学习成果' AFTER `agenda`,
ADD COLUMN `promoVideoUrl` VARCHAR(500) DEFAULT NULL COMMENT '预告视频URL' AFTER `learningOutcomes`,
ADD COLUMN `thumbnailUrl` VARCHAR(500) DEFAULT NULL COMMENT '缩略图URL' AFTER `promoVideoUrl`,
ADD COLUMN `bannerImage` VARCHAR(500) DEFAULT NULL COMMENT '横幅图' AFTER `thumbnailUrl`,

-- 统计与分析
ADD COLUMN `registrationCount` INT DEFAULT 0 COMMENT '注册人数' AFTER `bannerImage`,
ADD COLUMN `attendanceCount` INT DEFAULT 0 COMMENT '实际出席人数' AFTER `registrationCount`,
ADD COLUMN `completionRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '完成率' AFTER `attendanceCount`,
ADD COLUMN `averageRating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '平均评分' AFTER `completionRate`,
ADD COLUMN `ratingCount` INT DEFAULT 0 COMMENT '评分人数' AFTER `averageRating`,
ADD COLUMN `viewCount` INT DEFAULT 0 COMMENT '浏览量' AFTER `ratingCount`,
ADD COLUMN `shareCount` INT DEFAULT 0 COMMENT '分享次数' AFTER `viewCount`,
ADD COLUMN `clickCount` INT DEFAULT 0 COMMENT '点击次数' AFTER `shareCount`,

-- 互动数据
ADD COLUMN `questionCount` INT DEFAULT 0 COMMENT '提问数量' AFTER `clickCount`,
ADD COLUMN `pollCount` INT DEFAULT 0 COMMENT '投票数量' AFTER `questionCount`,
ADD COLUMN `chatMessageCount` INT DEFAULT 0 COMMENT '聊天消息数' AFTER `pollCount`,
ADD COLUMN `productFavoriteCount` INT DEFAULT 0 COMMENT '产品收藏总数' AFTER `chatMessageCount`,
ADD COLUMN `inquiryCount` INT DEFAULT 0 COMMENT '询价总数' AFTER `productFavoriteCount`,

-- 时区与国际化
ADD COLUMN `timezone` VARCHAR(50) DEFAULT 'UTC' COMMENT '时区' AFTER `inquiryCount`,
ADD COLUMN `translations` JSON DEFAULT NULL COMMENT '多语言翻译' AFTER `timezone`,

-- SEO 与发现
ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL COMMENT 'URL友好标识' AFTER `translations`,
ADD COLUMN `metaTitle` VARCHAR(255) DEFAULT NULL COMMENT 'SEO标题' AFTER `slug`,
ADD COLUMN `metaDescription` TEXT DEFAULT NULL COMMENT 'SEO描述' AFTER `metaTitle`,
ADD COLUMN `tags` JSON DEFAULT NULL COMMENT '搜索标签' AFTER `metaDescription`,

-- 会议设置
ADD COLUMN `requiresApproval` TINYINT DEFAULT 0 COMMENT '是否需要审核' AFTER `tags`,
ADD COLUMN `isPublic` TINYINT DEFAULT 1 COMMENT '是否公开' AFTER `requiresApproval`,
ADD COLUMN `allowRecording` TINYINT DEFAULT 1 COMMENT '是否允许录制' AFTER `isPublic`,
ADD COLUMN `allowChat` TINYINT DEFAULT 1 COMMENT '是否允许聊天' AFTER `allowRecording`,
ADD COLUMN `allowQA` TINYINT DEFAULT 1 COMMENT '是否允许问答' AFTER `allowChat`,
ADD COLUMN `allowProductDisplay` TINYINT DEFAULT 1 COMMENT '是否允许产品展示' AFTER `allowQA`,
ADD COLUMN `reminderSent` TINYINT DEFAULT 0 COMMENT '提醒是否已发送' AFTER `allowProductDisplay`,
ADD COLUMN `followUpSent` TINYINT DEFAULT 0 COMMENT '跟进邮件是否已发送' AFTER `reminderSent`,

-- 商业数据
ADD COLUMN `estimatedRevenue` DECIMAL(10,2) DEFAULT NULL COMMENT '预估收入' AFTER `followUpSent`,
ADD COLUMN `actualRevenue` DECIMAL(10,2) DEFAULT NULL COMMENT '实际收入' AFTER `estimatedRevenue`,
ADD COLUMN `conversionRate` DECIMAL(5,2) DEFAULT NULL COMMENT '转化率' AFTER `actualRevenue`,
ADD COLUMN `roi` DECIMAL(5,2) DEFAULT NULL COMMENT '投资回报率' AFTER `conversionRate`,

-- 添加索引
ADD INDEX `idx_industry` (`industry`),
ADD INDEX `idx_slug` (`slug`),
ADD INDEX `idx_eventSource` (`eventSource`),
ADD UNIQUE INDEX `unique_slug` (`slug`);

-- ============================================================================
-- 第 2 部分: Webinar Products 表增强 (添加 20+ 新字段)
-- ============================================================================

ALTER TABLE `webinar_products`
-- 展示与排序
ADD COLUMN `displayOrder` INT DEFAULT 0 COMMENT '展示顺序' AFTER `currency`,
ADD COLUMN `highlightText` VARCHAR(255) DEFAULT NULL COMMENT '高亮文本' AFTER `displayOrder`,
ADD COLUMN `isHighlighted` TINYINT DEFAULT 0 COMMENT '是否高亮显示' AFTER `highlightText`,
ADD COLUMN `isPinned` TINYINT DEFAULT 0 COMMENT '是否置顶' AFTER `isHighlighted`,

-- 产品详情
ADD COLUMN `sku` VARCHAR(100) DEFAULT NULL COMMENT 'SKU' AFTER `isPinned`,
ADD COLUMN `specifications` JSON DEFAULT NULL COMMENT '产品规格' AFTER `sku`,
ADD COLUMN `features` JSON DEFAULT NULL COMMENT '产品特性' AFTER `specifications`,
ADD COLUMN `images` JSON DEFAULT NULL COMMENT '产品图片' AFTER `features`,
ADD COLUMN `videos` JSON DEFAULT NULL COMMENT '产品视频' AFTER `images`,
ADD COLUMN `thumbnailUrl` VARCHAR(500) DEFAULT NULL COMMENT '缩略图' AFTER `videos`,

-- 采购信息
ADD COLUMN `moq` INT DEFAULT NULL COMMENT '最小起订量' AFTER `thumbnailUrl`,
ADD COLUMN `priceRange` VARCHAR(100) DEFAULT NULL COMMENT '价格区间' AFTER `moq`,
ADD COLUMN `leadTime` VARCHAR(100) DEFAULT NULL COMMENT '交期' AFTER `priceRange`,
ADD COLUMN `stockStatus` ENUM('in_stock', 'low_stock', 'out_of_stock', 'pre_order') DEFAULT 'in_stock' COMMENT '库存状态' AFTER `leadTime`,
ADD COLUMN `stockQuantity` INT DEFAULT NULL COMMENT '库存数量' AFTER `stockStatus`,
ADD COLUMN `customizable` TINYINT DEFAULT 0 COMMENT '是否可定制' AFTER `stockQuantity`,
ADD COLUMN `customizationOptions` JSON DEFAULT NULL COMMENT '定制选项' AFTER `customizable`,

-- 统计数据
ADD COLUMN `favoriteCount` INT DEFAULT 0 COMMENT '收藏次数' AFTER `customizationOptions`,
ADD COLUMN `inquiryCount` INT DEFAULT 0 COMMENT '询价次数' AFTER `favoriteCount`,
ADD COLUMN `viewCount` INT DEFAULT 0 COMMENT '查看次数' AFTER `inquiryCount`,
ADD COLUMN `clickCount` INT DEFAULT 0 COMMENT '点击次数' AFTER `viewCount`,
ADD COLUMN `conversionCount` INT DEFAULT 0 COMMENT '转化次数' AFTER `clickCount`,
ADD COLUMN `conversionRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '转化率' AFTER `conversionCount`,

-- 营销信息
ADD COLUMN `originalPrice` DECIMAL(10,2) DEFAULT NULL COMMENT '原价' AFTER `conversionRate`,
ADD COLUMN `discountPercent` INT DEFAULT NULL COMMENT '折扣百分比' AFTER `originalPrice`,
ADD COLUMN `promotionText` VARCHAR(255) DEFAULT NULL COMMENT '促销文本' AFTER `discountPercent`,
ADD COLUMN `badges` JSON DEFAULT NULL COMMENT '徽章标签' AFTER `promotionText`,

-- 添加索引
ADD INDEX `idx_displayOrder` (`displayOrder`),
ADD INDEX `idx_isHighlighted` (`isHighlighted`),
ADD INDEX `idx_stockStatus` (`stockStatus`);

-- ============================================================================
-- 第 3 部分: Product Favorites 表增强 (添加 7+ 新字段)
-- ============================================================================

ALTER TABLE `product_favorites`
ADD COLUMN `webinarId` INT DEFAULT NULL COMMENT '从哪个会议收藏的' AFTER `productId`,
ADD COLUMN `notes` TEXT DEFAULT NULL COMMENT '买家备注' AFTER `webinarId`,
ADD COLUMN `targetPrice` DECIMAL(10,2) DEFAULT NULL COMMENT '目标价格' AFTER `notes`,
ADD COLUMN `targetQuantity` INT DEFAULT NULL COMMENT '目标数量' AFTER `targetPrice`,
ADD COLUMN `priority` ENUM('high', 'medium', 'low') DEFAULT 'medium' COMMENT '优先级' AFTER `targetQuantity`,
ADD COLUMN `status` ENUM('interested', 'contacted', 'negotiating', 'ordered', 'abandoned') DEFAULT 'interested' COMMENT '状态' AFTER `priority`,
ADD COLUMN `followUpDate` DATE DEFAULT NULL COMMENT '跟进日期' AFTER `status`,
ADD COLUMN `lastViewedAt` TIMESTAMP DEFAULT NULL COMMENT '最后查看时间' AFTER `followUpDate`,
ADD COLUMN `viewCount` INT DEFAULT 1 COMMENT '查看次数' AFTER `lastViewedAt`,
ADD COLUMN `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `viewCount`,

-- 添加索引
ADD INDEX `idx_webinarId` (`webinarId`),
ADD INDEX `idx_status` (`status`),
ADD INDEX `idx_priority` (`priority`);

-- ============================================================================
-- 第 4 部分: Product Inquiries 表增强 (添加 10+ 新字段)
-- ============================================================================

ALTER TABLE `product_inquiries`
ADD COLUMN `webinarId` INT DEFAULT NULL COMMENT '从哪个会议询价的' AFTER `productId`,
ADD COLUMN `quantity` INT DEFAULT NULL COMMENT '询价数量' AFTER `webinarId`,
ADD COLUMN `targetPrice` DECIMAL(10,2) DEFAULT NULL COMMENT '目标价格' AFTER `quantity`,
ADD COLUMN `urgency` ENUM('urgent', 'normal', 'low') DEFAULT 'normal' COMMENT '紧急程度' AFTER `targetPrice`,
ADD COLUMN `requirements` JSON DEFAULT NULL COMMENT '特殊要求' AFTER `urgency`,

-- 响应信息
ADD COLUMN `responseTime` INT DEFAULT NULL COMMENT '响应时间(分钟)' AFTER `requirements`,
ADD COLUMN `responseContent` TEXT DEFAULT NULL COMMENT '回复内容' AFTER `responseTime`,
ADD COLUMN `quotedPrice` DECIMAL(10,2) DEFAULT NULL COMMENT '报价' AFTER `responseContent`,
ADD COLUMN `quotedMoq` INT DEFAULT NULL COMMENT '报价MOQ' AFTER `quotedPrice`,
ADD COLUMN `quotedLeadTime` VARCHAR(100) DEFAULT NULL COMMENT '报价交期' AFTER `quotedMoq`,
ADD COLUMN `respondedBy` INT DEFAULT NULL COMMENT '回复人ID' AFTER `quotedLeadTime`,
ADD COLUMN `respondedAt` TIMESTAMP DEFAULT NULL COMMENT '回复时间' AFTER `respondedBy`,

-- 跟进信息
ADD COLUMN `followUpCount` INT DEFAULT 0 COMMENT '跟进次数' AFTER `respondedAt`,
ADD COLUMN `lastFollowUpAt` TIMESTAMP DEFAULT NULL COMMENT '最后跟进时间' AFTER `followUpCount`,
ADD COLUMN `nextFollowUpAt` TIMESTAMP DEFAULT NULL COMMENT '下次跟进时间' AFTER `lastFollowUpAt`,

-- 转化信息
ADD COLUMN `conversionStatus` ENUM('pending', 'quoted', 'negotiating', 'ordered', 'lost') DEFAULT 'pending' COMMENT '转化状态' AFTER `nextFollowUpAt`,
ADD COLUMN `conversionReason` TEXT DEFAULT NULL COMMENT '转化/流失原因' AFTER `conversionStatus`,
ADD COLUMN `orderId` INT DEFAULT NULL COMMENT '关联订单ID' AFTER `conversionReason`,
ADD COLUMN `orderValue` DECIMAL(10,2) DEFAULT NULL COMMENT '订单金额' AFTER `orderId`,
ADD COLUMN `convertedAt` TIMESTAMP DEFAULT NULL COMMENT '转化时间' AFTER `orderValue`,

-- 添加索引
ADD INDEX `idx_webinarId` (`webinarId`),
ADD INDEX `idx_urgency` (`urgency`),
ADD INDEX `idx_conversionStatus` (`conversionStatus`);

-- ============================================================================
-- 第 5 部分: 新建 Buyer Profiles 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `buyer_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL UNIQUE COMMENT '用户ID',
  
  -- 店铺信息
  `shopType` VARCHAR(100) DEFAULT NULL COMMENT '店铺类型',
  `shopName` VARCHAR(255) DEFAULT NULL COMMENT '店铺名称',
  `shopUrl` VARCHAR(500) DEFAULT NULL COMMENT '店铺URL',
  `shopCountry` VARCHAR(100) DEFAULT NULL COMMENT '店铺所在国家',
  
  -- 经营特征
  `mainCategories` JSON DEFAULT NULL COMMENT '主营类目',
  `priceRangeMin` DECIMAL(10,2) DEFAULT NULL COMMENT '价格区间最小值',
  `priceRangeMax` DECIMAL(10,2) DEFAULT NULL COMMENT '价格区间最大值',
  `monthlySalesVolume` INT DEFAULT NULL COMMENT '月销量',
  `averageOrderValue` DECIMAL(10,2) DEFAULT NULL COMMENT '平均客单价',
  
  -- 采购偏好
  `preferredMoqMin` INT DEFAULT NULL COMMENT '偏好最小起订量',
  `preferredMoqMax` INT DEFAULT NULL COMMENT '偏好最大起订量',
  `preferredLeadTime` VARCHAR(50) DEFAULT NULL COMMENT '偏好交期',
  `targetMarkets` JSON DEFAULT NULL COMMENT '目标市场',
  `purchaseFrequency` VARCHAR(50) DEFAULT NULL COMMENT '采购频率',
  
  -- 采购历史
  `totalOrders` INT DEFAULT 0 COMMENT '总订单数',
  `totalSpent` DECIMAL(10,2) DEFAULT 0.00 COMMENT '总消费金额',
  `totalProducts` INT DEFAULT 0 COMMENT '采购产品种类数',
  `favoriteSuppliers` JSON DEFAULT NULL COMMENT '收藏的供应商',
  `lastPurchaseAt` TIMESTAMP DEFAULT NULL COMMENT '最后采购时间',
  
  -- 产品偏好
  `productPreferences` JSON DEFAULT NULL COMMENT '产品偏好',
  `searchKeywords` JSON DEFAULT NULL COMMENT '搜索关键词',
  `favoriteColors` JSON DEFAULT NULL COMMENT '偏好颜色',
  `favoriteMaterials` JSON DEFAULT NULL COMMENT '偏好材质',
  
  -- 行为特征
  `webinarsAttended` INT DEFAULT 0 COMMENT '参加会议数',
  `productsViewed` INT DEFAULT 0 COMMENT '浏览产品数',
  `productsFavorited` INT DEFAULT 0 COMMENT '收藏产品数',
  `inquiriesSent` INT DEFAULT 0 COMMENT '发送询价数',
  `inquiryResponseRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '询价响应率',
  `averageDecisionTime` INT DEFAULT NULL COMMENT '平均决策时间(天)',
  
  -- 信用与评级
  `creditScore` INT DEFAULT 0 COMMENT '信用分数',
  `reliabilityScore` DECIMAL(3,2) DEFAULT 0.00 COMMENT '可靠性评分',
  `paymentOnTimeRate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '按时付款率',
  
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_shopType` (`shopType`),
  INDEX `idx_totalOrders` (`totalOrders`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='买家画像表';

-- ============================================================================
-- 第 6 部分: 新建 Live Interactions 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `live_interactions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL COMMENT '会议ID',
  `userId` INT NOT NULL COMMENT '用户ID',
  `interactionType` ENUM('join', 'leave', 'product_view', 'product_favorite', 'inquiry', 'chat', 'question', 'poll_vote', 'share', 'download') NOT NULL COMMENT '互动类型',
  `productId` INT DEFAULT NULL COMMENT '产品ID',
  `metadata` JSON DEFAULT NULL COMMENT '元数据',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '时间戳',
  
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_interactionType` (`interactionType`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_productId` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实时互动表';

-- ============================================================================
-- 第 7 部分: 新建 Webinar Reports 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `webinar_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL UNIQUE COMMENT '会议ID',
  
  -- 基础统计
  `totalParticipants` INT DEFAULT 0 COMMENT '总参与人数',
  `totalProducts` INT DEFAULT 0 COMMENT '总产品数',
  `totalFavorites` INT DEFAULT 0 COMMENT '总收藏数',
  `totalInquiries` INT DEFAULT 0 COMMENT '总询价数',
  `totalChatMessages` INT DEFAULT 0 COMMENT '总聊天消息数',
  `totalQuestions` INT DEFAULT 0 COMMENT '总提问数',
  
  -- 参与度统计
  `averageStayTime` INT DEFAULT NULL COMMENT '平均停留时间(分钟)',
  `completionRate` DECIMAL(5,2) DEFAULT NULL COMMENT '完成率',
  `engagementScore` DECIMAL(5,2) DEFAULT NULL COMMENT '参与度评分',
  
  -- 热门产品
  `hotProducts` JSON DEFAULT NULL COMMENT '热门产品',
  
  -- 高意向买家
  `highIntentBuyers` JSON DEFAULT NULL COMMENT '高意向买家',
  
  -- AI 分析
  `aiInsights` TEXT DEFAULT NULL COMMENT 'AI洞察',
  `aiRecommendations` TEXT DEFAULT NULL COMMENT 'AI建议',
  `aiSummary` TEXT DEFAULT NULL COMMENT 'AI总结',
  
  -- 商业数据
  `estimatedRevenue` DECIMAL(10,2) DEFAULT NULL COMMENT '预估收入',
  `actualRevenue` DECIMAL(10,2) DEFAULT NULL COMMENT '实际收入',
  `conversionRate` DECIMAL(5,2) DEFAULT NULL COMMENT '转化率',
  `roi` DECIMAL(5,2) DEFAULT NULL COMMENT 'ROI',
  
  `generatedAt` TIMESTAMP DEFAULT NULL COMMENT '生成时间',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_webinarId` (`webinarId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议报告表';

-- ============================================================================
-- 第 8 部分: 新建 AI Recommendations 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `ai_recommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL COMMENT '用户ID',
  `webinarId` INT NOT NULL COMMENT '会议ID',
  `productId` INT NOT NULL COMMENT '产品ID',
  `recommendationType` ENUM('high_match', 'medium_match', 'similar', 'trending', 'complementary') NOT NULL COMMENT '推荐类型',
  `matchScore` DECIMAL(3,2) DEFAULT NULL COMMENT '匹配度',
  `matchReasons` JSON DEFAULT NULL COMMENT '匹配原因',
  
  -- 行为追踪
  `isShown` TINYINT DEFAULT 0 COMMENT '是否已展示',
  `shownAt` TIMESTAMP DEFAULT NULL COMMENT '展示时间',
  `isClicked` TINYINT DEFAULT 0 COMMENT '是否已点击',
  `clickedAt` TIMESTAMP DEFAULT NULL COMMENT '点击时间',
  `isConverted` TINYINT DEFAULT 0 COMMENT '是否已转化',
  `convertedAt` TIMESTAMP DEFAULT NULL COMMENT '转化时间',
  `conversionType` VARCHAR(50) DEFAULT NULL COMMENT '转化类型',
  
  -- 模型信息
  `modelVersion` VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
  `confidenceScore` DECIMAL(3,2) DEFAULT NULL COMMENT '置信度',
  
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_productId` (`productId`),
  INDEX `idx_recommendationType` (`recommendationType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI推荐表';

-- ============================================================================
-- 第 9 部分: 新建 External Events 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `external_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source` VARCHAR(100) NOT NULL COMMENT '来源',
  `externalId` VARCHAR(255) DEFAULT NULL COMMENT '外部ID',
  
  -- 基础信息
  `title` VARCHAR(255) NOT NULL COMMENT '标题',
  `description` TEXT DEFAULT NULL COMMENT '描述',
  `subtitle` VARCHAR(500) DEFAULT NULL COMMENT '副标题',
  
  -- 讲师信息
  `speaker` VARCHAR(255) DEFAULT NULL COMMENT '讲师',
  `speakerTitle` VARCHAR(255) DEFAULT NULL COMMENT '讲师职位',
  `speakerCompany` VARCHAR(255) DEFAULT NULL COMMENT '讲师公司',
  `speakerBio` TEXT DEFAULT NULL COMMENT '讲师简介',
  `speakerAvatar` VARCHAR(500) DEFAULT NULL COMMENT '讲师头像',
  `speakerLinkedin` VARCHAR(500) DEFAULT NULL COMMENT '讲师LinkedIn',
  
  -- 组织信息
  `organizer` VARCHAR(255) DEFAULT NULL COMMENT '主办方',
  `organizerLogo` VARCHAR(500) DEFAULT NULL COMMENT '主办方Logo',
  `coOrganizers` JSON DEFAULT NULL COMMENT '联合主办方',
  
  -- 活动信息
  `registrationUrl` VARCHAR(500) DEFAULT NULL COMMENT '注册链接',
  `eventUrl` VARCHAR(500) DEFAULT NULL COMMENT '活动链接',
  `scheduledAt` TIMESTAMP DEFAULT NULL COMMENT '计划时间',
  `duration` INT DEFAULT NULL COMMENT '时长(分钟)',
  `timezone` VARCHAR(50) DEFAULT NULL COMMENT '时区',
  `language` VARCHAR(10) DEFAULT NULL COMMENT '语言',
  
  -- 分类信息
  `industry` VARCHAR(100) DEFAULT NULL COMMENT '行业',
  `topics` JSON DEFAULT NULL COMMENT '主题',
  `targetAudience` TEXT DEFAULT NULL COMMENT '目标受众',
  `level` ENUM('beginner', 'intermediate', 'advanced') DEFAULT NULL COMMENT '级别',
  
  -- 媒体资源
  `coverImage` VARCHAR(500) DEFAULT NULL COMMENT '封面图',
  `promoVideoUrl` VARCHAR(500) DEFAULT NULL COMMENT '预告视频',
  `thumbnailUrl` VARCHAR(500) DEFAULT NULL COMMENT '缩略图',
  
  -- 状态
  `status` ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming' COMMENT '状态',
  `isSyncedToWebinars` TINYINT DEFAULT 0 COMMENT '是否已同步到webinars',
  `syncedWebinarId` INT DEFAULT NULL COMMENT '同步的webinar ID',
  
  -- 数据收集
  `collectedAt` TIMESTAMP DEFAULT NULL COMMENT '收集时间',
  `collectedBy` INT DEFAULT NULL COMMENT '收集人',
  `dataQuality` ENUM('high', 'medium', 'low') DEFAULT NULL COMMENT '数据质量',
  `notes` TEXT DEFAULT NULL COMMENT '备注',
  
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_source` (`source`),
  INDEX `idx_scheduledAt` (`scheduledAt`),
  INDEX `idx_status` (`status`),
  INDEX `idx_industry` (`industry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外部活动表';

-- ============================================================================
-- 第 10 部分: 新建 AI Analysis Results 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `ai_analysis_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entityType` ENUM('webinar', 'product', 'buyer', 'factory') NOT NULL COMMENT '实体类型',
  `entityId` INT NOT NULL COMMENT '实体ID',
  `analysisType` VARCHAR(100) NOT NULL COMMENT '分析类型',
  `result` JSON NOT NULL COMMENT '分析结果',
  `confidenceScore` DECIMAL(3,2) DEFAULT NULL COMMENT '置信度',
  `modelVersion` VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
  `processingTime` INT DEFAULT NULL COMMENT '处理时间(毫秒)',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_entity` (`entityType`, `entityId`),
  INDEX `idx_analysisType` (`analysisType`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI分析结果表';

-- ============================================================================
-- 第 11 部分: 新建 User Behavior Events 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS `user_behavior_events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL COMMENT '用户ID',
  `sessionId` VARCHAR(255) DEFAULT NULL COMMENT '会话ID',
  
  -- 事件信息
  `eventType` VARCHAR(100) NOT NULL COMMENT '事件类型',
  `eventCategory` VARCHAR(100) DEFAULT NULL COMMENT '事件分类',
  `eventAction` VARCHAR(100) DEFAULT NULL COMMENT '事件动作',
  `eventLabel` VARCHAR(255) DEFAULT NULL COMMENT '事件标签',
  
  -- 页面信息
  `pageUrl` VARCHAR(500) DEFAULT NULL COMMENT '页面URL',
  `referrerUrl` VARCHAR(500) DEFAULT NULL COMMENT '来源URL',
  
  -- 实体关联
  `entityType` VARCHAR(50) DEFAULT NULL COMMENT '实体类型',
  `entityId` INT DEFAULT NULL COMMENT '实体ID',
  
  -- 元数据
  `metadata` JSON DEFAULT NULL COMMENT '元数据',
  
  -- 设备信息
  `deviceType` VARCHAR(50) DEFAULT NULL COMMENT '设备类型',
  `browser` VARCHAR(100) DEFAULT NULL COMMENT '浏览器',
  `os` VARCHAR(100) DEFAULT NULL COMMENT '操作系统',
  `screenResolution` VARCHAR(50) DEFAULT NULL COMMENT '屏幕分辨率',
  
  -- 地理信息
  `ipAddress` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `country` VARCHAR(100) DEFAULT NULL COMMENT '国家',
  `city` VARCHAR(100) DEFAULT NULL COMMENT '城市',
  
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '时间戳',
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_eventType` (`eventType`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_sessionId` (`sessionId`),
  INDEX `idx_entity` (`entityType`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户行为事件表';

-- ============================================================================
-- 迁移完成
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- 输出迁移信息
SELECT '数据库增强迁移完成!' AS message;
SELECT 'Webinars 表新增 40+ 字段' AS enhancement_1;
SELECT 'Webinar Products 表新增 20+ 字段' AS enhancement_2;
SELECT 'Product Favorites 表新增 9 个字段' AS enhancement_3;
SELECT 'Product Inquiries 表新增 15 个字段' AS enhancement_4;
SELECT '新建 Buyer Profiles 表' AS new_table_1;
SELECT '新建 Live Interactions 表' AS new_table_2;
SELECT '新建 Webinar Reports 表' AS new_table_3;
SELECT '新建 AI Recommendations 表' AS new_table_4;
SELECT '新建 External Events 表' AS new_table_5;
SELECT '新建 AI Analysis Results 表' AS new_table_6;
SELECT '新建 User Behavior Events 表' AS new_table_7;
