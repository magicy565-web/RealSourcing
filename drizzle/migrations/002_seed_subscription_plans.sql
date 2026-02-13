-- ============================================================================
-- 订阅计划初始化数据
-- 版本: v1.0
-- 日期: 2026-02-13
-- 描述: 插入 RealSourcing SaaS 订阅计划初始数据
-- ============================================================================

SET NAMES utf8mb4;

-- 清空现有数据（如果存在）
TRUNCATE TABLE `subscription_plans`;

-- ============================================================================
-- 1. 免费试用套餐 (Free Trial)
-- ============================================================================

INSERT INTO `subscription_plans` (
  `id`,
  `name`,
  `nameEn`,
  `description`,
  `priceMonthly`,
  `priceYearly`,
  `priceMonthlyUSD`,
  `priceYearlyUSD`,
  `currency`,
  `trialDays`,
  `features`,
  `limits`,
  `isActive`,
  `isPopular`,
  `displayOrder`
) VALUES (
  'free_trial',
  '免费试用',
  'Free Trial',
  '14天免费试用，体验平台核心功能',
  0.00,
  0.00,
  0.00,
  0.00,
  'CNY',
  14,
  JSON_ARRAY(
    '创建工厂主页',
    '上传产品（最多5个）',
    '接收买家询价（最多3个）',
    '参与买家发起的Webinar（被动参与）',
    '基础数据统计'
  ),
  JSON_OBJECT(
    'webinarCreatedMonthly', 0,
    'productsMax', 5,
    'inquiriesMonthly', 3,
    'storageGB', 1,
    'videoRecordingHours', 0,
    'aiReportsMonthly', 0
  ),
  1,
  0,
  1
);

-- ============================================================================
-- 2. 基础套餐 (Basic Plan)
-- ============================================================================

INSERT INTO `subscription_plans` (
  `id`,
  `name`,
  `nameEn`,
  `description`,
  `priceMonthly`,
  `priceYearly`,
  `priceMonthlyUSD`,
  `priceYearlyUSD`,
  `currency`,
  `trialDays`,
  `features`,
  `limits`,
  `isActive`,
  `isPopular`,
  `displayOrder`
) VALUES (
  'basic',
  '基础套餐',
  'Basic Plan',
  '适合年营收¥5M-¥20M的外贸型中小工厂',
  299.00,
  2990.00,
  42.00,
  420.00,
  'CNY',
  14,
  JSON_ARRAY(
    '创建工厂主页（完整信息展示）',
    '上传产品（最多30个）',
    '主动创建Webinar（每月10场）',
    '接收买家询价（不限）',
    '实时视频会议（每场最长1小时）',
    '会议录制（每月10小时）',
    '基础数据分析',
    'AI询价匹配',
    '邮件通知',
    '5GB存储空间'
  ),
  JSON_OBJECT(
    'webinarCreatedMonthly', 10,
    'productsMax', 30,
    'inquiriesMonthly', -1,
    'storageGB', 5,
    'videoRecordingHours', 10,
    'aiReportsMonthly', 3,
    'webinarDurationMinutes', 60
  ),
  1,
  0,
  2
);

-- ============================================================================
-- 3. 专业套餐 (Pro Plan)
-- ============================================================================

INSERT INTO `subscription_plans` (
  `id`,
  `name`,
  `nameEn`,
  `description`,
  `priceMonthly`,
  `priceYearly`,
  `priceMonthlyUSD`,
  `priceYearlyUSD`,
  `currency`,
  `trialDays`,
  `features`,
  `limits`,
  `isActive`,
  `isPopular`,
  `displayOrder`
) VALUES (
  'pro',
  '专业套餐',
  'Pro Plan',
  '适合年营收¥20M-¥100M的成长型工厂',
  999.00,
  9990.00,
  140.00,
  1400.00,
  'CNY',
  14,
  JSON_ARRAY(
    '基础套餐所有功能',
    '上传产品（最多100个）',
    '主动创建Webinar（每月30场）',
    '实时视频会议（每场最长2小时）',
    '会议录制（每月30小时）',
    '高级数据分析',
    'AI智能推荐（优先级提升）',
    'AI谈判总结',
    'AI意向合同生成',
    '优先展示位（类目前3页）',
    '认证徽章',
    '20GB存储空间',
    '优先客服支持'
  ),
  JSON_OBJECT(
    'webinarCreatedMonthly', 30,
    'productsMax', 100,
    'inquiriesMonthly', -1,
    'storageGB', 20,
    'videoRecordingHours', 30,
    'aiReportsMonthly', 10,
    'webinarDurationMinutes', 120,
    'priorityListing', true,
    'verifiedBadge', true
  ),
  1,
  1,
  3
);

-- ============================================================================
-- 4. 企业套餐 (Enterprise Plan)
-- ============================================================================

INSERT INTO `subscription_plans` (
  `id`,
  `name`,
  `nameEn`,
  `description`,
  `priceMonthly`,
  `priceYearly`,
  `priceYearlyUSD`,
  `currency`,
  `trialDays`,
  `features`,
  `limits`,
  `isActive`,
  `isPopular`,
  `displayOrder`
) VALUES (
  'enterprise',
  '企业套餐',
  'Enterprise Plan',
  '适合年营收¥100M+的大型工厂和供应链公司',
  2999.00,
  29990.00,
  420.00,
  4200.00,
  'CNY',
  14,
  JSON_ARRAY(
    '专业套餐所有功能',
    '上传产品（不限）',
    '主动创建Webinar（不限）',
    '实时视频会议（不限时长）',
    '会议录制（不限）',
    '多工厂管理',
    'API集成',
    '定制化数据报表',
    '专属客户经理',
    '首页推荐位',
    '金牌认证徽章',
    '100GB存储空间',
    '7x24小时客服支持',
    '定制化服务'
  ),
  JSON_OBJECT(
    'webinarCreatedMonthly', -1,
    'productsMax', -1,
    'inquiriesMonthly', -1,
    'storageGB', 100,
    'videoRecordingHours', -1,
    'aiReportsMonthly', -1,
    'webinarDurationMinutes', -1,
    'priorityListing', true,
    'verifiedBadge', true,
    'multiFactoryManagement', true,
    'apiAccess', true,
    'dedicatedSupport', true
  ),
  1,
  0,
  4
);

-- ============================================================================
-- 完成
-- ============================================================================

SELECT '订阅计划初始化完成！' AS message;
SELECT * FROM `subscription_plans` ORDER BY `displayOrder`;
