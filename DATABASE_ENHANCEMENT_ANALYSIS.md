# RealSourcing 数据库增强分析报告

**日期**: 2026-02-17  
**目标**: 将 RealSourcing 打造成真实可用的 B2B SaaS 平台

---

## 📊 现状分析

### 当前数据库结构概览

经过深入分析,现有数据库包含以下 10 个核心域:

1. **用户与身份域** (Identity & Access)
   - `users` - 用户基础信息
   - `user_profiles` - 用户详细资料

2. **工厂域** (Factory)
   - `factories` - 工厂基础信息
   - `factory_certifications` - 工厂认证
   - `factory_products` - 工厂产品
   - `factory_images` - 工厂图片

3. **采购会议域** (Webinar)
   - `webinars` - 会议基础信息
   - `webinar_participants` - 参会者
   - `webinar_products` - 会议产品
   - `webinar_messages` - 会议消息
   - `webinar_recordings` - 会议录制

4. **产品互动域** (Product Interaction)
   - `product_favorites` - 产品收藏
   - `product_inquiries` - 产品询价

5. **订单域** (Order)
   - `orders` - 订单信息
   - `order_items` - 订单明细

6. **通知域** (Notification)
   - `notifications` - 通知消息

7. **订阅支付域** (Subscription & Payment)
   - `subscriptions` - 订阅信息
   - `payment_orders` - 支付订单
   - `invoices` - 发票
   - `usage_records` - 使用记录

8. **评价评分域** (Rating & Review)
   - `factory_reviews` - 工厂评价

9. **系统管理域** (System)
   - `audit_logs` - 审计日志
   - `system_settings` - 系统设置

10. **报告域** (Reports)
    - `reports` - 报告
    - `negotiation_events` - 谈判事件

---

## 🚨 核心问题识别

### 问题 1: Webinar 表字段严重不足

根据你提供的文档分析,**TikTok 选品会议**是 RealSourcing 的核心场景,但现有 `webinars` 表缺失大量关键字段:

#### 缺失的核心字段

**讲师/主讲人信息** (Speaker Info)
- ❌ `speaker` - 讲师姓名
- ❌ `speakerTitle` - 讲师职位
- ❌ `speakerCompany` - 讲师公司
- ❌ `speakerBio` - 讲师简介
- ❌ `speakerAvatar` - 讲师头像
- ❌ `speakerLinkedin` - 讲师 LinkedIn

**活动组织信息** (Event Organization)
- ❌ `organizer` - 主办方名称
- ❌ `organizerLogo` - 主办方 Logo
- ❌ `coOrganizers` - 联合主办方 (JSON)
- ❌ `registrationUrl` - 外部注册链接 (对接真实 B2B Webinar)
- ❌ `externalEventId` - 外部活动 ID

**内容分类与标签** (Content Classification)
- ❌ `industry` - 行业标签 (Apparel, Energy, Agriculture, etc.)
- ❌ `topics` - 主题标签 (JSON 数组)
- ❌ `targetAudience` - 目标受众
- ❌ `level` - 难度级别 (Beginner, Intermediate, Advanced)

**营销与展示** (Marketing & Display)
- ❌ `subtitle` - 副标题
- ❌ `highlights` - 核心亮点 (JSON 数组)
- ❌ `agenda` - 议程 (JSON 数组)
- ❌ `learningOutcomes` - 学习成果 (JSON 数组)
- ❌ `promoVideoUrl` - 预告视频 URL
- ❌ `thumbnailUrl` - 缩略图 URL

**统计与分析** (Analytics)
- ❌ `registrationCount` - 注册人数
- ❌ `attendanceCount` - 实际出席人数
- ❌ `completionRate` - 完成率
- ❌ `averageRating` - 平均评分
- ❌ `ratingCount` - 评分人数
- ❌ `viewCount` - 浏览量
- ❌ `shareCount` - 分享次数

**互动数据** (Engagement)
- ❌ `questionCount` - 提问数量
- ❌ `pollCount` - 投票数量
- ❌ `chatMessageCount` - 聊天消息数
- ❌ `productFavoriteCount` - 产品收藏总数
- ❌ `inquiryCount` - 询价总数

**时区与国际化** (Timezone & i18n)
- ❌ `timezone` - 时区
- ❌ `translations` - 多语言翻译 (JSON)

**SEO 与发现** (SEO & Discovery)
- ❌ `slug` - URL 友好标识
- ❌ `metaTitle` - SEO 标题
- ❌ `metaDescription` - SEO 描述
- ❌ `tags` - 搜索标签 (JSON)

**会议设置** (Meeting Settings)
- ❌ `requiresApproval` - 是否需要审核
- ❌ `isPublic` - 是否公开
- ❌ `allowRecording` - 是否允许录制
- ❌ `allowChat` - 是否允许聊天
- ❌ `allowQA` - 是否允许问答
- ❌ `reminderSent` - 提醒是否已发送
- ❌ `followUpSent` - 跟进邮件是否已发送

---

### 问题 2: 缺失 TikTok 选品会议的核心表

根据文档中的业务需求,需要新增以下表:

#### 2.1 产品展示表 (Webinar Products - 增强版)

现有的 `webinar_products` 表过于简单,需要大幅增强:

**缺失字段**:
- ❌ `displayOrder` - 展示顺序
- ❌ `highlightText` - 高亮文本 (如 "爆款推荐")
- ❌ `specifications` - 产品规格 (JSON)
- ❌ `images` - 产品图片 (JSON 数组)
- ❌ `videos` - 产品视频 (JSON 数组)
- ❌ `moq` - 最小起订量
- ❌ `leadTime` - 交期
- ❌ `stockStatus` - 库存状态
- ❌ `customizable` - 是否可定制
- ❌ `favoriteCount` - 收藏次数
- ❌ `inquiryCount` - 询价次数
- ❌ `viewCount` - 查看次数
- ❌ `clickCount` - 点击次数
- ❌ `conversionRate` - 转化率

#### 2.2 产品收藏表 (Product Favorites - 增强版)

现有的 `product_favorites` 表缺少关键字段:

**缺失字段**:
- ❌ `webinarId` - 会议 ID (关联到具体会议)
- ❌ `notes` - 买家备注
- ❌ `targetPrice` - 目标价格
- ❌ `targetQuantity` - 目标数量
- ❌ `priority` - 优先级 (High, Medium, Low)
- ❌ `status` - 状态 (Interested, Contacted, Negotiating, Ordered)
- ❌ `followUpDate` - 跟进日期

#### 2.3 询价表 (Product Inquiries - 增强版)

现有的 `product_inquiries` 表缺少关键字段:

**缺失字段**:
- ❌ `webinarId` - 会议 ID
- ❌ `quantity` - 询价数量
- ❌ `targetPrice` - 目标价格
- ❌ `urgency` - 紧急程度 (Urgent, Normal, Low)
- ❌ `requirements` - 特殊要求 (JSON)
- ❌ `responseTime` - 响应时间
- ❌ `responseContent` - 回复内容
- ❌ `respondedBy` - 回复人 ID
- ❌ `respondedAt` - 回复时间
- ❌ `followUpCount` - 跟进次数
- ❌ `conversionStatus` - 转化状态 (Pending, Quoted, Negotiating, Ordered, Lost)

#### 2.4 实时互动表 (Live Interactions)

**完全缺失**,需要新建:

```sql
CREATE TABLE live_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  webinar_id INT NOT NULL,
  user_id INT NOT NULL,
  interaction_type ENUM('join', 'leave', 'product_view', 'product_favorite', 'inquiry', 'chat', 'question', 'poll_vote') NOT NULL,
  product_id INT,
  metadata JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webinar_id (webinar_id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp)
);
```

#### 2.5 会议报告表 (Webinar Reports)

**完全缺失**,需要新建:

```sql
CREATE TABLE webinar_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  webinar_id INT NOT NULL UNIQUE,
  total_participants INT DEFAULT 0,
  total_products INT DEFAULT 0,
  total_favorites INT DEFAULT 0,
  total_inquiries INT DEFAULT 0,
  total_chat_messages INT DEFAULT 0,
  hot_products JSON,  -- TOP 产品列表
  high_intent_buyers JSON,  -- 高意向买家列表
  ai_insights TEXT,  -- AI 分析洞察
  ai_recommendations TEXT,  -- AI 跟进建议
  generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_webinar_id (webinar_id)
);
```

#### 2.6 AI 推荐表 (AI Recommendations)

**完全缺失**,需要新建:

```sql
CREATE TABLE ai_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  webinar_id INT NOT NULL,
  product_id INT NOT NULL,
  recommendation_type ENUM('high_match', 'medium_match', 'similar', 'trending') NOT NULL,
  match_score DECIMAL(3,2),  -- 匹配度 0.00-1.00
  match_reasons JSON,  -- 推荐原因
  is_shown TINYINT DEFAULT 0,
  is_clicked TINYINT DEFAULT 0,
  is_converted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_webinar_id (webinar_id),
  INDEX idx_product_id (product_id)
);
```

#### 2.7 买家画像表 (Buyer Profiles)

**完全缺失**,需要新建:

```sql
CREATE TABLE buyer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  shop_type VARCHAR(100),  -- TikTok Shop, Shopify, etc.
  main_categories JSON,  -- 主营类目
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  monthly_sales_volume INT,
  preferred_moq_min INT,
  preferred_moq_max INT,
  preferred_lead_time VARCHAR(50),
  target_markets JSON,  -- 目标市场
  purchase_frequency VARCHAR(50),
  average_order_value DECIMAL(10,2),
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  favorite_suppliers JSON,
  product_preferences JSON,  -- 产品偏好特征
  last_purchase_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

#### 2.8 工厂画像表 (Factory Profiles - 增强)

现有 `factories` 表需要增加:

**缺失字段**:
- ❌ `specialties` - 专长领域 (JSON)
- ❌ `productionCapacity` - 生产能力
- ❌ `averageMOQ` - 平均 MOQ
- ❌ `averageLeadTime` - 平均交期
- ❌ `customizationLevel` - 定制能力级别
- ❌ `qualityControlProcess` - 质量控制流程
- ❌ `successfulWebinars` - 成功会议数
- ❌ `totalInquiries` - 总询价数
- ❌ `inquiryResponseRate` - 询价响应率
- ❌ `inquiryResponseTime` - 平均响应时间
- ❌ `conversionRate` - 转化率

---

### 问题 3: 缺失真实 B2B Webinar 集成表

根据你提供的《RealSourcing即将举办的真实B2BWebinar收集指南》,需要新增:

#### 3.1 外部活动表 (External Events)

**完全缺失**,需要新建:

```sql
CREATE TABLE external_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(100) NOT NULL,  -- 'Innovation Forum', 'Eventbrite', 'LinkedIn', etc.
  external_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  speaker VARCHAR(255),
  speaker_title VARCHAR(255),
  speaker_company VARCHAR(255),
  speaker_bio TEXT,
  speaker_avatar VARCHAR(500),
  organizer VARCHAR(255),
  organizer_logo VARCHAR(500),
  registration_url VARCHAR(500),
  event_url VARCHAR(500),
  scheduled_at TIMESTAMP,
  duration INT,
  timezone VARCHAR(50),
  language VARCHAR(10),
  industry VARCHAR(100),
  topics JSON,
  target_audience TEXT,
  cover_image VARCHAR(500),
  promo_video_url VARCHAR(500),
  status ENUM('upcoming', 'live', 'completed', 'cancelled') DEFAULT 'upcoming',
  is_synced_to_webinars TINYINT DEFAULT 0,
  synced_webinar_id INT,
  collected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_source (source),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_status (status)
);
```

---

### 问题 4: 缺失 AI 功能支撑表

根据《TikTok选品会议-AI功能设计方案》,需要新增:

#### 4.1 AI 分析结果表 (AI Analysis Results)

```sql
CREATE TABLE ai_analysis_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('webinar', 'product', 'buyer', 'factory') NOT NULL,
  entity_id INT NOT NULL,
  analysis_type VARCHAR(100) NOT NULL,  -- 'product_recommendation', 'buyer_intent', 'decision_matrix', etc.
  result JSON NOT NULL,
  confidence_score DECIMAL(3,2),
  model_version VARCHAR(50),
  processing_time INT,  -- 毫秒
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_analysis_type (analysis_type)
);
```

#### 4.2 AI 训练数据表 (AI Training Data)

```sql
CREATE TABLE ai_training_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_type VARCHAR(100) NOT NULL,
  features JSON NOT NULL,
  label VARCHAR(255),
  source_entity_type VARCHAR(50),
  source_entity_id INT,
  is_validated TINYINT DEFAULT 0,
  validated_by INT,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_data_type (data_type),
  INDEX idx_is_validated (is_validated)
);
```

---

### 问题 5: 缺失用户行为追踪表

#### 5.1 用户行为事件表 (User Behavior Events)

```sql
CREATE TABLE user_behavior_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(100),
  event_action VARCHAR(100),
  event_label VARCHAR(255),
  page_url VARCHAR(500),
  referrer_url VARCHAR(500),
  entity_type VARCHAR(50),
  entity_id INT,
  metadata JSON,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_session_id (session_id)
);
```

---

## 📈 数据量级评估

### 现状问题

根据你的描述"现在的数据/信息量完全不够看",我完全同意。让我们对比一下:

#### 真实 SaaS 平台 vs 当前状态

| 维度 | 真实 SaaS 平台 | 当前 RealSourcing | 差距 |
|------|---------------|------------------|------|
| Webinar 字段数 | 40-50 个 | 20 个 | **缺失 20-30 个** |
| 核心业务表 | 25-30 张 | 18 张 | **缺失 7-12 张** |
| 产品详情字段 | 30-40 个 | 15 个 | **缺失 15-25 个** |
| 用户画像维度 | 20-30 个 | 5 个 | **缺失 15-25 个** |
| AI 功能表 | 5-8 张 | 0 张 | **完全缺失** |
| 行为追踪 | 完整 | 无 | **完全缺失** |

---

## 🎯 增强方案优先级

### P0 (必须立即完成)

1. **Webinar 表字段增强** - 添加 30+ 个缺失字段
2. **产品展示表增强** - 添加 15+ 个缺失字段
3. **买家画像表** - 新建完整表
4. **实时互动表** - 新建完整表
5. **会议报告表** - 新建完整表

### P1 (高优先级)

6. **AI 推荐表** - 新建完整表
7. **外部活动表** - 新建完整表
8. **AI 分析结果表** - 新建完整表
9. **用户行为事件表** - 新建完整表
10. **工厂画像增强** - 添加 10+ 个字段

### P2 (中优先级)

11. **AI 训练数据表** - 新建完整表
12. **产品收藏表增强** - 添加 7+ 个字段
13. **询价表增强** - 添加 10+ 个字段

---

## 📦 下一步行动

### 阶段 1: 数据库设计 (当前阶段)
- ✅ 完成现状分析
- ⏳ 设计完整的表结构
- ⏳ 生成 SQL 迁移脚本

### 阶段 2: 数据库迁移
- ⏳ 执行 ALTER TABLE 添加字段
- ⏳ 执行 CREATE TABLE 新建表
- ⏳ 创建索引和外键

### 阶段 3: 示例数据生成
- ⏳ 生成真实的 Webinar 数据
- ⏳ 生成买家画像数据
- ⏳ 生成产品展示数据

### 阶段 4: API 适配
- ⏳ 更新 tRPC Router
- ⏳ 更新前端 TypeScript 类型
- ⏳ 更新前端组件

### 阶段 5: 真实数据导入
- ⏳ 导入 8 个真实 B2B Webinar
- ⏳ 导入产品数据
- ⏳ 导入工厂数据

---

## 💡 关键洞察

### 1. 数据驱动的产品设计

你提供的文档非常清晰地展示了**数据驱动的产品设计思维**:

- **TikTok 选品会议场景**需要大量的实时互动数据
- **AI 功能**需要完整的用户画像和行为数据
- **真实 B2B Webinar 集成**需要外部数据同步

### 2. SaaS 产品的数据完整性

一个真实的 SaaS 产品需要:

- **完整的用户画像** - 了解用户是谁,需要什么
- **完整的行为追踪** - 知道用户做了什么,为什么
- **完整的业务数据** - 支撑核心业务流程
- **完整的分析数据** - 提供洞察和优化方向

### 3. 数据库设计的前瞻性

现有数据库设计过于简单,缺乏:

- **业务场景的深度理解**
- **用户行为的细粒度追踪**
- **AI 功能的数据支撑**
- **外部集成的灵活性**

---

**下一步**: 我将设计完整的数据库增强方案,包括所有缺失的表和字段的详细定义。
