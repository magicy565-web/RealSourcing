-- ============================================================================
-- RealSourcing 数据库增强迁移脚本 - 第2部分
-- 版本: 002
-- 日期: 2026-02-17
-- 描述: 创建缺失的表 (external_events, ai_analysis_results, user_behavior_events)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. External Events 表 (外部活动表)
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
  `scheduledAt` TIMESTAMP NULL DEFAULT NULL COMMENT '计划时间',
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
  `collectedAt` TIMESTAMP NULL DEFAULT NULL COMMENT '收集时间',
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
-- 2. AI Analysis Results 表 (AI分析结果表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `ai_analysis_results` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `analysisType` VARCHAR(100) NOT NULL COMMENT '分析类型',
  `entityType` VARCHAR(50) NOT NULL COMMENT '实体类型',
  `entityId` INT NOT NULL COMMENT '实体ID',
  
  -- 分析结果
  `summary` TEXT DEFAULT NULL COMMENT '摘要',
  `insights` JSON DEFAULT NULL COMMENT '洞察',
  `recommendations` JSON DEFAULT NULL COMMENT '推荐',
  `score` DECIMAL(5,2) DEFAULT NULL COMMENT '评分',
  `confidence` DECIMAL(5,2) DEFAULT NULL COMMENT '置信度',
  
  -- 元数据
  `modelVersion` VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
  `processingTime` INT DEFAULT NULL COMMENT '处理时间(ms)',
  `dataPoints` INT DEFAULT NULL COMMENT '数据点数量',
  
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_entityType_entityId` (`entityType`, `entityId`),
  INDEX `idx_analysisType` (`analysisType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI分析结果表';

-- ============================================================================
-- 3. User Behavior Events 表 (用户行为事件表)
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
  
  -- 地理位置
  `country` VARCHAR(100) DEFAULT NULL COMMENT '国家',
  `region` VARCHAR(100) DEFAULT NULL COMMENT '地区',
  `city` VARCHAR(100) DEFAULT NULL COMMENT '城市',
  `ipAddress` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  
  -- 时间戳
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '事件时间',
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_sessionId` (`sessionId`),
  INDEX `idx_eventType` (`eventType`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_entityType_entityId` (`entityType`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户行为事件表';

SET FOREIGN_KEY_CHECKS = 1;
