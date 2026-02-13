-- ============================================================================
-- RealSourcing SaaS 完整数据库架构迁移脚本
-- 版本: v1.0
-- 日期: 2026-02-13
-- 描述: 创建所有业务表、索引和初始化数据
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. 用户与身份域 (Identity & Access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE,
  `email` VARCHAR(320) UNIQUE,
  `phone` VARCHAR(20),
  `passwordHash` VARCHAR(255),
  `name` VARCHAR(100),
  `avatar` VARCHAR(500),
  `role` ENUM('user', 'buyer', 'factory', 'admin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
  `emailVerified` TINYINT(1) DEFAULT 0,
  `phoneVerified` TINYINT(1) DEFAULT 0,
  `language` VARCHAR(10) DEFAULT 'en',
  `timezone` VARCHAR(50),
  `loginMethod` VARCHAR(64),
  `lastLoginAt` TIMESTAMP NULL,
  `lastLoginIp` VARCHAR(45),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL UNIQUE,
  `company` VARCHAR(255),
  `position` VARCHAR(100),
  `country` VARCHAR(100),
  `city` VARCHAR(100),
  `address` TEXT,
  `website` VARCHAR(500),
  `linkedin` VARCHAR(500),
  `bio` TEXT,
  `interests` JSON,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. 工厂域 (Factory)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `factories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `legalName` VARCHAR(255),
  `slug` VARCHAR(255) UNIQUE,
  `logo` VARCHAR(500),
  `coverImage` VARCHAR(500),
  `category` VARCHAR(100),
  `subCategories` JSON,
  `country` VARCHAR(100) DEFAULT 'China',
  `province` VARCHAR(100),
  `city` VARCHAR(100),
  `address` TEXT,
  `postalCode` VARCHAR(20),
  `phone` VARCHAR(20),
  `email` VARCHAR(320),
  `website` VARCHAR(500),
  `established` INT,
  `employees` VARCHAR(50),
  `annualRevenue` VARCHAR(100),
  `exportRatio` INT,
  `mainMarkets` JSON,
  `description` TEXT,
  `aiSummary` TEXT,
  `status` ENUM('pending', 'verified', 'suspended') NOT NULL DEFAULT 'pending',
  `verifiedAt` TIMESTAMP NULL,
  `verifiedBy` INT,
  `overallScore` DECIMAL(3,2) DEFAULT 0.00,
  `qualityScore` DECIMAL(3,2) DEFAULT 0.00,
  `deliveryScore` DECIMAL(3,2) DEFAULT 0.00,
  `communicationScore` DECIMAL(3,2) DEFAULT 0.00,
  `pricingScore` DECIMAL(3,2) DEFAULT 0.00,
  `complianceScore` DECIMAL(3,2) DEFAULT 0.00,
  `reviewCount` INT DEFAULT 0,
  `viewCount` INT DEFAULT 0,
  `inquiryCount` INT DEFAULT 0,
  `orderCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_overallScore` (`overallScore` DESC),
  INDEX `idx_city` (`city`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `factory_certifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `factoryId` INT NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `issuedBy` VARCHAR(255),
  `certificateNumber` VARCHAR(100),
  `issuedAt` DATE,
  `expiresAt` DATE,
  `fileUrl` VARCHAR(500),
  `status` ENUM('pending', 'verified', 'expired') NOT NULL DEFAULT 'pending',
  `verifiedAt` TIMESTAMP NULL,
  `verifiedBy` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `factory_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `factoryId` INT NOT NULL,
  `sku` VARCHAR(100),
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255),
  `category` VARCHAR(100),
  `description` TEXT,
  `specifications` JSON,
  `features` JSON,
  `images` JSON,
  `videos` JSON,
  `minOrderQuantity` INT,
  `priceRange` VARCHAR(100),
  `leadTime` VARCHAR(100),
  `customizable` TINYINT(1) DEFAULT 0,
  `certifications` JSON,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `viewCount` INT DEFAULT 0,
  `inquiryCount` INT DEFAULT 0,
  `displayOrder` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_sku` (`sku`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_displayOrder` (`displayOrder`),
  FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. 采购会议域 (Webinar)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `webinars` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `createdById` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `type` ENUM('one_to_one', 'group', 'webinar') NOT NULL DEFAULT 'one_to_one',
  `status` ENUM('draft', 'scheduled', 'live', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  `language` VARCHAR(10) DEFAULT 'en',
  `scheduledAt` TIMESTAMP NULL,
  `startedAt` TIMESTAMP NULL,
  `endedAt` TIMESTAMP NULL,
  `duration` INT DEFAULT 60,
  `actualDuration` INT,
  `maxParticipants` INT DEFAULT 10,
  `currentParticipants` INT DEFAULT 0,
  `agoraChannelName` VARCHAR(255),
  `agoraToken` VARCHAR(500),
  `recordingEnabled` TINYINT(1) DEFAULT 1,
  `recordingStatus` ENUM('none', 'recording', 'completed', 'failed'),
  `recordingUrl` VARCHAR(500),
  `coverImage` VARCHAR(500),
  `tags` JSON,
  `workSpec` TEXT,
  `aiSummary` TEXT,
  `viewCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  INDEX `idx_createdById` (`createdById`),
  INDEX `idx_status` (`status`),
  INDEX `idx_scheduledAt` (`scheduledAt`),
  INDEX `idx_category` (`category`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `webinar_participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL,
  `userId` INT NOT NULL,
  `factoryId` INT,
  `role` ENUM('host', 'presenter', 'participant', 'observer') NOT NULL DEFAULT 'participant',
  `status` ENUM('invited', 'accepted', 'declined', 'joined', 'left') NOT NULL DEFAULT 'invited',
  `invitedAt` TIMESTAMP NULL,
  `joinedAt` TIMESTAMP NULL,
  `leftAt` TIMESTAMP NULL,
  `duration` INT,
  `agoraUid` VARCHAR(100),
  `hasVideo` TINYINT(1) DEFAULT 0,
  `hasAudio` TINYINT(1) DEFAULT 0,
  `screenSharing` TINYINT(1) DEFAULT 0,
  `metadata` JSON,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_status` (`status`),
  UNIQUE KEY `unique_webinar_user` (`webinarId`, `userId`),
  FOREIGN KEY (`webinarId`) REFERENCES `webinars`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. 询价报价域 (RFQ & Quotation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `rfqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rfqNumber` VARCHAR(50) NOT NULL UNIQUE,
  `buyerId` INT NOT NULL,
  `webinarId` INT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `description` TEXT,
  `specifications` JSON,
  `targetPrice` DECIMAL(12,2),
  `currency` VARCHAR(10) DEFAULT 'USD',
  `quantity` INT,
  `unit` VARCHAR(50),
  `targetDeliveryDate` DATE,
  `deliveryTerms` VARCHAR(50),
  `paymentTerms` VARCHAR(100),
  `attachments` JSON,
  `status` ENUM('draft', 'published', 'closed', 'cancelled') NOT NULL DEFAULT 'draft',
  `expiresAt` TIMESTAMP NULL,
  `quotationCount` INT DEFAULT 0,
  `viewCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_buyerId` (`buyerId`),
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`webinarId`) REFERENCES `webinars`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quotations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quotationNumber` VARCHAR(50) NOT NULL UNIQUE,
  `rfqId` INT NOT NULL,
  `factoryId` INT NOT NULL,
  `userId` INT NOT NULL,
  `unitPrice` DECIMAL(12,2) NOT NULL,
  `totalPrice` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `quantity` INT NOT NULL,
  `unit` VARCHAR(50),
  `leadTime` VARCHAR(100),
  `deliveryTerms` VARCHAR(50),
  `paymentTerms` VARCHAR(100),
  `validUntil` DATE,
  `notes` TEXT,
  `attachments` JSON,
  `status` ENUM('draft', 'submitted', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'draft',
  `submittedAt` TIMESTAMP NULL,
  `acceptedAt` TIMESTAMP NULL,
  `rejectedAt` TIMESTAMP NULL,
  `rejectionReason` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rfqId` (`rfqId`),
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_submittedAt` (`submittedAt`),
  FOREIGN KEY (`rfqId`) REFERENCES `rfqs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. 订单域 (Order)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderNumber` VARCHAR(50) NOT NULL UNIQUE,
  `buyerId` INT NOT NULL,
  `factoryId` INT NOT NULL,
  `webinarId` INT,
  `rfqId` INT,
  `quotationId` INT,
  `type` ENUM('intent', 'formal') NOT NULL DEFAULT 'intent',
  `status` ENUM('draft', 'pending', 'confirmed', 'production', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'draft',
  `totalAmount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `paymentTerms` VARCHAR(100),
  `deliveryTerms` VARCHAR(50),
  `deliveryAddress` TEXT,
  `targetDeliveryDate` DATE,
  `actualDeliveryDate` DATE,
  `notes` TEXT,
  `contractUrl` VARCHAR(500),
  `confirmedAt` TIMESTAMP NULL,
  `shippedAt` TIMESTAMP NULL,
  `deliveredAt` TIMESTAMP NULL,
  `cancelledAt` TIMESTAMP NULL,
  `cancellationReason` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_buyerId` (`buyerId`),
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`webinarId`) REFERENCES `webinars`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`rfqId`) REFERENCES `rfqs`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `productId` INT,
  `productName` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100),
  `specifications` JSON,
  `quantity` INT NOT NULL,
  `unit` VARCHAR(50),
  `unitPrice` DECIMAL(12,2) NOT NULL,
  `totalPrice` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `notes` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orderId` (`orderId`),
  INDEX `idx_productId` (`productId`),
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `factory_products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. 消息通信域 (Messaging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `rtm_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `senderId` INT NOT NULL,
  `receiverId` INT,
  `channelName` VARCHAR(255),
  `messageType` ENUM('private', 'channel') NOT NULL DEFAULT 'private',
  `contentType` ENUM('text', 'image', 'file') NOT NULL DEFAULT 'text',
  `content` TEXT NOT NULL,
  `metadata` JSON,
  `isRead` TINYINT(1) DEFAULT 0,
  `readAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_senderId` (`senderId`),
  INDEX `idx_receiverId` (`receiverId`),
  INDEX `idx_channelName` (`channelName`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rtm_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `targetUserId` INT,
  `channelName` VARCHAR(255),
  `conversationType` ENUM('private', 'channel') NOT NULL DEFAULT 'private',
  `lastMessageId` INT,
  `lastMessageContent` TEXT,
  `lastMessageAt` TIMESTAMP NULL,
  `unreadCount` INT DEFAULT 0,
  `isPinned` TINYINT(1) DEFAULT 0,
  `isMuted` TINYINT(1) DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_targetUserId` (`targetUserId`),
  INDEX `idx_channelName` (`channelName`),
  INDEX `idx_updatedAt` (`updatedAt`),
  UNIQUE KEY `unique_conversation` (`userId`, `targetUserId`, `channelName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `data` JSON,
  `isRead` TINYINT(1) DEFAULT 0,
  `readAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_isRead` (`isRead`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. SaaS 商业化域 (Subscription & Billing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `nameEn` VARCHAR(100),
  `description` TEXT,
  `priceMonthly` DECIMAL(10,2) NOT NULL,
  `priceYearly` DECIMAL(10,2) NOT NULL,
  `priceMonthlyUSD` DECIMAL(10,2),
  `priceYearlyUSD` DECIMAL(10,2),
  `currency` VARCHAR(10) DEFAULT 'CNY',
  `trialDays` INT DEFAULT 0,
  `features` JSON NOT NULL,
  `limits` JSON NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `isPopular` TINYINT(1) DEFAULT 0,
  `displayOrder` INT DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_isActive` (`isActive`),
  INDEX `idx_displayOrder` (`displayOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `planId` VARCHAR(50) NOT NULL,
  `status` ENUM('trial', 'active', 'expired', 'cancelled', 'suspended') NOT NULL DEFAULT 'trial',
  `billingCycle` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'CNY',
  `currentPeriodStart` TIMESTAMP NOT NULL,
  `currentPeriodEnd` TIMESTAMP NOT NULL,
  `trialStart` TIMESTAMP NULL,
  `trialEnd` TIMESTAMP NULL,
  `autoRenew` TINYINT(1) DEFAULT 1,
  `renewalDate` TIMESTAMP NULL,
  `cancelledAt` TIMESTAMP NULL,
  `cancellationReason` TEXT,
  `metadata` JSON,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_planId` (`planId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_currentPeriodEnd` (`currentPeriodEnd`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderNo` VARCHAR(64) NOT NULL UNIQUE,
  `userId` INT NOT NULL,
  `subscriptionId` INT,
  `planId` VARCHAR(50) NOT NULL,
  `type` ENUM('subscription', 'recharge', 'upgrade') NOT NULL DEFAULT 'subscription',
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'CNY',
  `billingCycle` ENUM('monthly', 'yearly'),
  `paymentMethod` VARCHAR(50),
  `paymentId` VARCHAR(255),
  `status` ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending',
  `paidAt` TIMESTAMP NULL,
  `refundedAt` TIMESTAMP NULL,
  `refundAmount` DECIMAL(10,2),
  `refundReason` TEXT,
  `metadata` JSON,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_subscriptionId` (`subscriptionId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_paidAt` (`paidAt`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoiceNumber` VARCHAR(50) NOT NULL UNIQUE,
  `userId` INT NOT NULL,
  `paymentOrderId` INT NOT NULL,
  `type` ENUM('vat', 'receipt') NOT NULL DEFAULT 'receipt',
  `status` ENUM('pending', 'issued', 'sent', 'cancelled') NOT NULL DEFAULT 'pending',
  `amount` DECIMAL(10,2) NOT NULL,
  `taxAmount` DECIMAL(10,2) DEFAULT 0.00,
  `totalAmount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'CNY',
  `companyName` VARCHAR(255),
  `taxNumber` VARCHAR(100),
  `address` TEXT,
  `phone` VARCHAR(20),
  `bankName` VARCHAR(255),
  `bankAccount` VARCHAR(100),
  `fileUrl` VARCHAR(500),
  `issuedAt` TIMESTAMP NULL,
  `sentAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_paymentOrderId` (`paymentOrderId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_issuedAt` (`issuedAt`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`paymentOrderId`) REFERENCES `payment_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usage_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `resourceType` VARCHAR(50) NOT NULL,
  `count` INT DEFAULT 1,
  `periodStart` TIMESTAMP NOT NULL,
  `periodEnd` TIMESTAMP NOT NULL,
  `metadata` JSON,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_resourceType` (`resourceType`),
  INDEX `idx_periodStart` (`periodStart`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. 评价评分域 (Rating & Review)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `factory_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `factoryId` INT NOT NULL,
  `buyerId` INT NOT NULL,
  `orderId` INT,
  `webinarId` INT,
  `overallScore` DECIMAL(3,2) NOT NULL,
  `qualityScore` DECIMAL(3,2),
  `deliveryScore` DECIMAL(3,2),
  `communicationScore` DECIMAL(3,2),
  `pricingScore` DECIMAL(3,2),
  `complianceScore` DECIMAL(3,2),
  `title` VARCHAR(255),
  `content` TEXT,
  `pros` TEXT,
  `cons` TEXT,
  `images` JSON,
  `isVerified` TINYINT(1) DEFAULT 0,
  `isAnonymous` TINYINT(1) DEFAULT 0,
  `status` ENUM('pending', 'published', 'hidden') NOT NULL DEFAULT 'pending',
  `helpfulCount` INT DEFAULT 0,
  `replyContent` TEXT,
  `repliedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_buyerId` (`buyerId`),
  INDEX `idx_orderId` (`orderId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`factoryId`) REFERENCES `factories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`webinarId`) REFERENCES `webinars`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. 系统管理域 (System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `action` VARCHAR(100) NOT NULL,
  `entityType` VARCHAR(100),
  `entityId` INT,
  `changes` JSON,
  `ipAddress` VARCHAR(45),
  `userAgent` VARCHAR(500),
  `metadata` JSON,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_action` (`action`),
  INDEX `idx_entityType` (`entityType`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(100) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT,
  `type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` TEXT,
  `isPublic` TINYINT(1) DEFAULT 0,
  `updatedBy` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  UNIQUE KEY `unique_category_key` (`category`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. 报告域 (Reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('supplier_evaluation', 'profit_analysis', 'negotiation_summary') NOT NULL DEFAULT 'supplier_evaluation',
  `webinarId` INT,
  `content` TEXT,
  `aiAnalysis` TEXT,
  `status` ENUM('generating', 'completed', 'failed') NOT NULL DEFAULT 'generating',
  `factoriesAnalyzed` INT DEFAULT 0,
  `createdById` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_createdById` (`createdById`),
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`webinarId`) REFERENCES `webinars`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `negotiation_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `metadata` JSON,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` INT,
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_timestamp` (`timestamp`),
  FOREIGN KEY (`webinarId`) REFERENCES `webinars`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 完成
-- ============================================================================
