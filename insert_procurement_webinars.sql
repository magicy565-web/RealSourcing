-- 注塑机采购 Webinar 数据插入脚本
-- 生成时间: 2026-02-16 11:22:01
-- 数据库: realsourcing
-- 表: webinars

USE realsourcing;

-- 删除旧的注塑机相关 Webinar（如果存在）
DELETE FROM webinars WHERE category = 'Injection Molding' AND title LIKE '%采购%';

INSERT INTO webinars (
    createdById, title, description, category, type, language,
    scheduledAt, duration, maxParticipants, coverImage, tags,
    recordingEnabled, agoraChannelName, status, createdAt, updatedAt
) VALUES (
    1,
    'CHINAPLAS 2026 国际橡塑展 - 注塑机采购专区',
    'CHINAPLAS 2026 国际橡塑展是亚洲最大的塑料橡胶工业展览会，汇聚全球4600+参展商。本次展会特设注塑机采购专区，展示海天、震雄、伊之密等国内外知名品牌的最新注塑设备。展会将举办供需对接会，为采购商提供一站式采购解决方案。

**展会亮点**：
- 390,000+ 平方米展览面积
- 4,600+ 国际参展商
- 320,000 预计观众
- 专业采购对接服务

**适合人群**：注塑机采购商、工厂采购经理、设备投资决策者',
    'Injection Molding',
    'webinar',
    'zh',
    '2026-04-21 09:00:00',
    240,
    5000,
    'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/chinaplas_2026_exhibition.jpg',
    '["注塑机", "采购对接", "CHINAPLAS", "橡塑展", "设备展会", "供应商"]',
    1,
    'procurement_1771258921.126283',
    'scheduled',
    NOW(),
    NOW()
);
INSERT INTO webinars (
    createdById, title, description, category, type, language,
    scheduledAt, duration, maxParticipants, coverImage, tags,
    recordingEnabled, agoraChannelName, status, createdAt, updatedAt
) VALUES (
    1,
    '2026 华东地区注塑机供需对接会',
    'RealSourcing 平台联合长三角注塑机制造商协会，举办华东地区注塑机供需线上对接会。本次活动邀请20+优质注塑机供应商在线展示产品，提供实时报价和技术咨询服务。

**活动内容**：
- 供应商产品在线展示
- 一对一采购洽谈
- 实时报价与技术支持
- 采购合同在线签署

**参展品牌**：包括精密注塑机、大型注塑机、全电动注塑机等多种类型设备供应商。

**适合人群**：华东地区制造企业、注塑加工厂、设备采购负责人',
    'Injection Molding',
    'webinar',
    'zh',
    '2026-03-15 14:00:00',
    180,
    500,
    'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/injection_molding_plant.jpg',
    '["注塑机", "供需对接", "华东地区", "在线采购", "供应商展示"]',
    1,
    'procurement_1771258921.126327',
    'scheduled',
    NOW(),
    NOW()
);
INSERT INTO webinars (
    createdById, title, description, category, type, language,
    scheduledAt, duration, maxParticipants, coverImage, tags,
    recordingEnabled, agoraChannelName, status, createdAt, updatedAt
) VALUES (
    1,
    '智能注塑设备采购指南线上研讨会',
    '本次研讨会由 RealSourcing 平台主办，邀请行业专家分享智能注塑设备选型指南，帮助采购商了解如何选择适合自己工厂的注塑机设备。

**研讨内容**：
- 注塑机选型关键参数解析
- 全电动 vs 液压注塑机对比
- 智能化功能与投资回报分析
- 供应商评估标准与采购流程
- 设备维护与售后服务要点

**特邀嘉宾**：资深注塑行业顾问、设备工程师、采购专家

**活动形式**：专家分享 + 互动问答 + 供应商推荐

**适合人群**：注塑设备采购新手、工厂技术负责人、投资决策者',
    'Injection Molding',
    'webinar',
    'zh',
    '2026-03-25 15:00:00',
    120,
    300,
    'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/injection_molding_plant.jpg',
    '["注塑机", "采购指南", "设备选型", "智能制造", "在线研讨会"]',
    1,
    'procurement_1771258921.126341',
    'scheduled',
    NOW(),
    NOW()
);