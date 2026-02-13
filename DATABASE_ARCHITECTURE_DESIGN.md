# RealSourcing SaaS 数据库架构设计

**文档版本**: v1.0  
**设计日期**: 2026-02-13  
**架构师**: Manus AI  
**数据库**: MySQL 8.0+

---

## 📋 目录

1. [业务需求分析](#业务需求分析)
2. [核心领域模型](#核心领域模型)
3. [数据库架构设计](#数据库架构设计)
4. [完整表结构设计](#完整表结构设计)
5. [索引优化策略](#索引优化策略)
6. [数据安全与隐私](#数据安全与隐私)
7. [性能优化方案](#性能优化方案)
8. [扩展性设计](#扩展性设计)

---

## 业务需求分析

### 核心业务场景

RealSourcing 是一个连接**中国工厂**和**海外采购商**的实时视频采购 SaaS 平台。

#### 主要业务流程

1. **用户管理**
   - 工厂注册、认证、订阅管理
   - 采购商注册（免费）
   - 用户权限和角色管理

2. **工厂管理**
   - 工厂资料管理（公司信息、认证、评分）
   - 产品目录管理
   - 工厂主页展示

3. **采购会议（Webinar）**
   - 会议创建、调度、管理
   - 实时音视频通信（Agora）
   - 会议录制和回放
   - 参与者管理

4. **询价与报价**
   - 采购商发起询价（RFQ）
   - 工厂提交报价
   - 报价对比和谈判

5. **订单管理**
   - 意向订单生成
   - 订单状态追踪
   - 合同管理

6. **消息通信**
   - 实时消息（RTM）
   - 私聊和群聊
   - 消息历史

7. **SaaS 商业化**
   - 订阅计划管理
   - 支付处理（支付宝/微信）
   - 配额和使用量追踪
   - 发票管理

8. **评价与评分**
   - 工厂评分系统
   - 采购商评价
   - 信用体系

9. **数据分析**
   - 工厂数据看板
   - 采购商行为分析
   - 平台运营数据

---

## 核心领域模型

### 领域划分

```
┌─────────────────────────────────────────────────────────────┐
│                    RealSourcing 领域模型                      │
└─────────────────────────────────────────────────────────────┘

1. 用户与身份域 (Identity & Access)
   ├─ Users (用户)
   ├─ UserProfiles (用户资料)
   ├─ UserRoles (用户角色)
   └─ UserSessions (会话)

2. 工厂域 (Factory)
   ├─ Factories (工厂)
   ├─ FactoryProfiles (工厂资料)
   ├─ FactoryCertifications (认证)
   ├─ FactoryProducts (产品)
   ├─ FactoryImages (图片)
   └─ FactoryRatings (评分)

3. 采购会议域 (Webinar)
   ├─ Webinars (会议)
   ├─ WebinarParticipants (参与者)
   ├─ WebinarRecordings (录制)
   ├─ WebinarResources (资源)
   └─ WebinarEvents (事件时间线)

4. 询价报价域 (RFQ & Quotation)
   ├─ RFQs (询价单)
   ├─ RFQItems (询价项)
   ├─ Quotations (报价)
   ├─ QuotationItems (报价项)
   └─ QuotationComparisons (报价对比)

5. 订单域 (Order)
   ├─ Orders (订单)
   ├─ OrderItems (订单项)
   ├─ OrderTimeline (订单时间线)
   └─ Contracts (合同)

6. 消息通信域 (Messaging)
   ├─ RTMMessages (消息)
   ├─ RTMConversations (会话)
   └─ Notifications (通知)

7. SaaS 商业化域 (Subscription & Billing)
   ├─ SubscriptionPlans (订阅计划)
   ├─ Subscriptions (订阅)
   ├─ PaymentOrders (支付订单)
   ├─ Invoices (发票)
   ├─ UsageRecords (使用量记录)
   └─ Quotas (配额)

8. 评价评分域 (Rating & Review)
   ├─ FactoryReviews (工厂评价)
   ├─ BuyerReviews (采购商评价)
   └─ TrustScores (信用分)

9. 系统管理域 (System)
   ├─ SystemSettings (系统设置)
   ├─ AuditLogs (审计日志)
   └─ Analytics (分析数据)
```

---

## 数据库架构设计

### 架构原则

1. **业务驱动**: 以业务领域为边界划分表结构
2. **规范化**: 遵循第三范式（3NF），减少数据冗余
3. **性能优先**: 适度反规范化，提升查询性能
4. **可扩展**: 预留扩展字段，支持业务演进
5. **安全合规**: 敏感数据加密，符合 GDPR/CCPA
6. **审计追踪**: 关键表记录创建/更新时间和操作人

### ER 关系图

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Users     │───────│ Subscriptions│───────│Subscription │
│             │ 1   n │              │ n   1 │   Plans     │
└─────────────┘       └──────────────┘       └─────────────┘
       │ 1                    │ 1
       │                      │
       │ n                    │ n
┌─────────────┐       ┌──────────────┐
│  Factories  │       │ PaymentOrders│
│             │       │              │
└─────────────┘       └──────────────┘
       │ 1                    
       │                      
       │ n                    
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  Products   │       │   Webinars   │───────│  Webinar    │
│             │       │              │ 1   n │Participants │
└─────────────┘       └──────────────┘       └─────────────┘
                             │ 1
                             │
                             │ n
                      ┌──────────────┐
                      │     RFQs     │
                      │              │
                      └──────────────┘
                             │ 1
                             │
                             │ n
                      ┌──────────────┐       ┌─────────────┐
                      │  Quotations  │───────│ Quotation   │
                      │              │ 1   n │   Items     │
                      └──────────────┘       └─────────────┘
                             │ 1
                             │
                             │ n
                      ┌──────────────┐
                      │    Orders    │
                      │              │
                      └──────────────┘
```

### 表命名规范

- **表名**: 使用复数形式，小写+下划线（snake_case）
  - ✅ `users`, `factories`, `subscription_plans`
  - ❌ `User`, `Factory`, `SubscriptionPlan`

- **字段名**: 使用驼峰命名（camelCase）
  - ✅ `userId`, `createdAt`, `isActive`
  - ❌ `user_id`, `created_at`, `is_active`

- **主键**: 统一使用 `id`
- **外键**: 使用 `{表名单数}Id`，如 `userId`, `factoryId`
- **时间戳**: 
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间
  - `deletedAt`: 软删除时间（可选）

### 字段类型规范

| 数据类型 | MySQL 类型 | 说明 |
|---------|-----------|------|
| 主键 | INT AUTO_INCREMENT | 自增整数 |
| 外键 | INT | 关联表的主键 |
| 短文本 | VARCHAR(n) | n ≤ 255 |
| 长文本 | TEXT | 大段文字 |
| 枚举 | ENUM | 固定选项 |
| 布尔 | TINYINT(1) | 0/1 |
| 整数 | INT | 数量、分数 |
| 小数 | DECIMAL(p,s) | 金额、价格 |
| 日期时间 | TIMESTAMP | 时间戳 |
| JSON | JSON | 结构化数据 |

---

## 完整表结构设计

### 1. 用户与身份域

#### 1.1 users (用户表)

**用途**: 存储所有用户的基本信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 用户ID |
| openId | VARCHAR(64) | UNIQUE, NOT NULL | OAuth OpenID |
| email | VARCHAR(320) | UNIQUE | 邮箱 |
| phone | VARCHAR(20) | | 手机号 |
| passwordHash | VARCHAR(255) | | 密码哈希（可选） |
| name | VARCHAR(100) | | 姓名 |
| avatar | VARCHAR(500) | | 头像URL |
| role | ENUM | NOT NULL | user/buyer/factory/admin |
| status | ENUM | NOT NULL | active/suspended/deleted |
| emailVerified | TINYINT(1) | DEFAULT 0 | 邮箱是否验证 |
| phoneVerified | TINYINT(1) | DEFAULT 0 | 手机是否验证 |
| language | VARCHAR(10) | DEFAULT 'en' | 语言偏好 |
| timezone | VARCHAR(50) | | 时区 |
| loginMethod | VARCHAR(64) | | 登录方式 |
| lastLoginAt | TIMESTAMP | | 最后登录时间 |
| lastLoginIp | VARCHAR(45) | | 最后登录IP |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |
| deletedAt | TIMESTAMP | | 软删除时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_openId (openId)
UNIQUE KEY idx_email (email)
INDEX idx_role (role)
INDEX idx_status (status)
INDEX idx_createdAt (createdAt)
```

#### 1.2 user_profiles (用户资料表)

**用途**: 存储用户的详细资料

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 资料ID |
| userId | INT | UNIQUE, NOT NULL | 用户ID |
| company | VARCHAR(255) | | 公司名称 |
| position | VARCHAR(100) | | 职位 |
| country | VARCHAR(100) | | 国家 |
| city | VARCHAR(100) | | 城市 |
| address | TEXT | | 详细地址 |
| website | VARCHAR(500) | | 网站 |
| linkedin | VARCHAR(500) | | LinkedIn |
| bio | TEXT | | 个人简介 |
| interests | JSON | | 兴趣领域 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_userId (userId)
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
```

---

### 2. 工厂域

#### 2.1 factories (工厂表)

**用途**: 存储工厂的基本信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 工厂ID |
| userId | INT | NOT NULL | 关联用户ID |
| name | VARCHAR(255) | NOT NULL | 工厂名称 |
| legalName | VARCHAR(255) | | 法定名称 |
| slug | VARCHAR(255) | UNIQUE | URL友好标识 |
| logo | VARCHAR(500) | | Logo URL |
| coverImage | VARCHAR(500) | | 封面图 |
| category | VARCHAR(100) | | 主营类目 |
| subCategories | JSON | | 子类目 |
| country | VARCHAR(100) | DEFAULT 'China' | 国家 |
| province | VARCHAR(100) | | 省份 |
| city | VARCHAR(100) | | 城市 |
| address | TEXT | | 详细地址 |
| postalCode | VARCHAR(20) | | 邮编 |
| phone | VARCHAR(20) | | 电话 |
| email | VARCHAR(320) | | 邮箱 |
| website | VARCHAR(500) | | 网站 |
| established | INT | | 成立年份 |
| employees | VARCHAR(50) | | 员工数量范围 |
| annualRevenue | VARCHAR(100) | | 年营收范围 |
| exportRatio | INT | | 出口比例(%) |
| mainMarkets | JSON | | 主要市场 |
| description | TEXT | | 公司简介 |
| aiSummary | TEXT | | AI生成摘要 |
| status | ENUM | NOT NULL | pending/verified/suspended |
| verifiedAt | TIMESTAMP | | 认证时间 |
| verifiedBy | INT | | 认证人ID |
| overallScore | DECIMAL(3,2) | DEFAULT 0 | 综合评分(0-5) |
| qualityScore | DECIMAL(3,2) | DEFAULT 0 | 质量评分 |
| deliveryScore | DECIMAL(3,2) | DEFAULT 0 | 交付评分 |
| communicationScore | DECIMAL(3,2) | DEFAULT 0 | 沟通评分 |
| pricingScore | DECIMAL(3,2) | DEFAULT 0 | 价格评分 |
| complianceScore | DECIMAL(3,2) | DEFAULT 0 | 合规评分 |
| reviewCount | INT | DEFAULT 0 | 评价数量 |
| viewCount | INT | DEFAULT 0 | 浏览次数 |
| inquiryCount | INT | DEFAULT 0 | 询价次数 |
| orderCount | INT | DEFAULT 0 | 订单数量 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |
| deletedAt | TIMESTAMP | | 软删除时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_slug (slug)
INDEX idx_userId (userId)
INDEX idx_category (category)
INDEX idx_status (status)
INDEX idx_overallScore (overallScore DESC)
INDEX idx_city (city)
INDEX idx_createdAt (createdAt)
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
```

#### 2.2 factory_certifications (工厂认证表)

**用途**: 存储工厂的各类认证证书

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 认证ID |
| factoryId | INT | NOT NULL | 工厂ID |
| type | VARCHAR(100) | NOT NULL | 认证类型 |
| name | VARCHAR(255) | NOT NULL | 认证名称 |
| issuedBy | VARCHAR(255) | | 颁发机构 |
| certificateNumber | VARCHAR(100) | | 证书编号 |
| issuedAt | DATE | | 颁发日期 |
| expiresAt | DATE | | 过期日期 |
| fileUrl | VARCHAR(500) | | 证书文件URL |
| status | ENUM | NOT NULL | pending/verified/expired |
| verifiedAt | TIMESTAMP | | 验证时间 |
| verifiedBy | INT | | 验证人ID |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_factoryId (factoryId)
INDEX idx_type (type)
INDEX idx_status (status)
FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
```

#### 2.3 factory_products (工厂产品表)

**用途**: 存储工厂的产品目录

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 产品ID |
| factoryId | INT | NOT NULL | 工厂ID |
| sku | VARCHAR(100) | | 产品SKU |
| name | VARCHAR(255) | NOT NULL | 产品名称 |
| slug | VARCHAR(255) | | URL友好标识 |
| category | VARCHAR(100) | | 产品类目 |
| description | TEXT | | 产品描述 |
| specifications | JSON | | 规格参数 |
| features | JSON | | 产品特性 |
| images | JSON | | 产品图片数组 |
| videos | JSON | | 产品视频数组 |
| minOrderQuantity | INT | | 最小起订量 |
| priceRange | VARCHAR(100) | | 价格区间 |
| leadTime | VARCHAR(100) | | 交货周期 |
| customizable | TINYINT(1) | DEFAULT 0 | 是否可定制 |
| certifications | JSON | | 产品认证 |
| status | ENUM | NOT NULL | draft/published/archived |
| viewCount | INT | DEFAULT 0 | 浏览次数 |
| inquiryCount | INT | DEFAULT 0 | 询价次数 |
| displayOrder | INT | DEFAULT 0 | 显示顺序 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |
| deletedAt | TIMESTAMP | | 软删除时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_factoryId (factoryId)
INDEX idx_sku (sku)
INDEX idx_category (category)
INDEX idx_status (status)
INDEX idx_displayOrder (displayOrder)
FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
```

---

### 3. 采购会议域

#### 3.1 webinars (会议表)

**用途**: 存储采购会议的基本信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 会议ID |
| createdById | INT | NOT NULL | 创建者ID |
| title | VARCHAR(255) | NOT NULL | 会议标题 |
| description | TEXT | | 会议描述 |
| category | VARCHAR(100) | | 会议类目 |
| type | ENUM | NOT NULL | one_to_one/group/webinar |
| status | ENUM | NOT NULL | draft/scheduled/live/completed/cancelled |
| language | VARCHAR(10) | DEFAULT 'en' | 会议语言 |
| scheduledAt | TIMESTAMP | | 预定时间 |
| startedAt | TIMESTAMP | | 实际开始时间 |
| endedAt | TIMESTAMP | | 实际结束时间 |
| duration | INT | DEFAULT 60 | 预计时长(分钟) |
| actualDuration | INT | | 实际时长(分钟) |
| maxParticipants | INT | DEFAULT 10 | 最大参与人数 |
| currentParticipants | INT | DEFAULT 0 | 当前参与人数 |
| agoraChannelName | VARCHAR(255) | | Agora频道名 |
| agoraToken | VARCHAR(500) | | Agora Token |
| recordingEnabled | TINYINT(1) | DEFAULT 1 | 是否录制 |
| recordingStatus | ENUM | | none/recording/completed/failed |
| recordingUrl | VARCHAR(500) | | 录制文件URL |
| coverImage | VARCHAR(500) | | 封面图 |
| tags | JSON | | 标签 |
| workSpec | TEXT | | 工作规格 |
| aiSummary | TEXT | | AI会议总结 |
| viewCount | INT | DEFAULT 0 | 浏览次数 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |
| deletedAt | TIMESTAMP | | 软删除时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_createdById (createdById)
INDEX idx_status (status)
INDEX idx_scheduledAt (scheduledAt)
INDEX idx_category (category)
INDEX idx_createdAt (createdAt DESC)
FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
```

#### 3.2 webinar_participants (会议参与者表)

**用途**: 存储会议参与者信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 参与者ID |
| webinarId | INT | NOT NULL | 会议ID |
| userId | INT | NOT NULL | 用户ID |
| factoryId | INT | | 工厂ID（如果是工厂代表） |
| role | ENUM | NOT NULL | host/presenter/participant/observer |
| status | ENUM | NOT NULL | invited/accepted/declined/joined/left |
| invitedAt | TIMESTAMP | | 邀请时间 |
| joinedAt | TIMESTAMP | | 加入时间 |
| leftAt | TIMESTAMP | | 离开时间 |
| duration | INT | | 参与时长(秒) |
| agoraUid | VARCHAR(100) | | Agora UID |
| hasVideo | TINYINT(1) | DEFAULT 0 | 是否开启视频 |
| hasAudio | TINYINT(1) | DEFAULT 0 | 是否开启音频 |
| screenSharing | TINYINT(1) | DEFAULT 0 | 是否共享屏幕 |
| metadata | JSON | | 其他元数据 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_webinarId (webinarId)
INDEX idx_userId (userId)
INDEX idx_factoryId (factoryId)
INDEX idx_status (status)
UNIQUE KEY idx_webinar_user (webinarId, userId)
FOREIGN KEY (webinarId) REFERENCES webinars(id) ON DELETE CASCADE
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE SET NULL
```

---

### 4. 询价报价域

#### 4.1 rfqs (询价单表)

**用途**: 存储采购商的询价请求

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 询价ID |
| rfqNumber | VARCHAR(50) | UNIQUE, NOT NULL | 询价单号 |
| buyerId | INT | NOT NULL | 采购商ID |
| webinarId | INT | | 关联会议ID |
| title | VARCHAR(255) | NOT NULL | 询价标题 |
| category | VARCHAR(100) | | 产品类目 |
| description | TEXT | | 详细描述 |
| specifications | JSON | | 规格要求 |
| targetPrice | DECIMAL(12,2) | | 目标价格 |
| currency | VARCHAR(10) | DEFAULT 'USD' | 货币 |
| quantity | INT | | 采购数量 |
| unit | VARCHAR(50) | | 单位 |
| targetDeliveryDate | DATE | | 期望交货日期 |
| deliveryTerms | VARCHAR(50) | | 交货条款(FOB/CIF等) |
| paymentTerms | VARCHAR(100) | | 付款条款 |
| attachments | JSON | | 附件 |
| status | ENUM | NOT NULL | draft/published/closed/cancelled |
| expiresAt | TIMESTAMP | | 截止时间 |
| quotationCount | INT | DEFAULT 0 | 报价数量 |
| viewCount | INT | DEFAULT 0 | 浏览次数 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_rfqNumber (rfqNumber)
INDEX idx_buyerId (buyerId)
INDEX idx_webinarId (webinarId)
INDEX idx_status (status)
INDEX idx_category (category)
INDEX idx_createdAt (createdAt DESC)
FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (webinarId) REFERENCES webinars(id) ON DELETE SET NULL
```

#### 4.2 quotations (报价表)

**用途**: 存储工厂的报价信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 报价ID |
| quotationNumber | VARCHAR(50) | UNIQUE, NOT NULL | 报价单号 |
| rfqId | INT | NOT NULL | 询价ID |
| factoryId | INT | NOT NULL | 工厂ID |
| userId | INT | NOT NULL | 提交人ID |
| unitPrice | DECIMAL(12,2) | NOT NULL | 单价 |
| totalPrice | DECIMAL(12,2) | NOT NULL | 总价 |
| currency | VARCHAR(10) | DEFAULT 'USD' | 货币 |
| quantity | INT | NOT NULL | 数量 |
| unit | VARCHAR(50) | | 单位 |
| leadTime | VARCHAR(100) | | 交货周期 |
| deliveryTerms | VARCHAR(50) | | 交货条款 |
| paymentTerms | VARCHAR(100) | | 付款条款 |
| validUntil | DATE | | 报价有效期 |
| notes | TEXT | | 备注说明 |
| attachments | JSON | | 附件 |
| status | ENUM | NOT NULL | draft/submitted/accepted/rejected/expired |
| submittedAt | TIMESTAMP | | 提交时间 |
| acceptedAt | TIMESTAMP | | 接受时间 |
| rejectedAt | TIMESTAMP | | 拒绝时间 |
| rejectionReason | TEXT | | 拒绝原因 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_quotationNumber (quotationNumber)
INDEX idx_rfqId (rfqId)
INDEX idx_factoryId (factoryId)
INDEX idx_userId (userId)
INDEX idx_status (status)
INDEX idx_submittedAt (submittedAt DESC)
FOREIGN KEY (rfqId) REFERENCES rfqs(id) ON DELETE CASCADE
FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
```

---

### 5. 订单域

#### 5.1 orders (订单表)

**用途**: 存储意向订单和正式订单

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 订单ID |
| orderNumber | VARCHAR(50) | UNIQUE, NOT NULL | 订单号 |
| buyerId | INT | NOT NULL | 采购商ID |
| factoryId | INT | NOT NULL | 工厂ID |
| webinarId | INT | | 关联会议ID |
| rfqId | INT | | 关联询价ID |
| quotationId | INT | | 关联报价ID |
| type | ENUM | NOT NULL | intent/formal |
| status | ENUM | NOT NULL | draft/pending/confirmed/production/shipped/delivered/cancelled |
| totalAmount | DECIMAL(12,2) | NOT NULL | 订单总额 |
| currency | VARCHAR(10) | DEFAULT 'USD' | 货币 |
| paymentTerms | VARCHAR(100) | | 付款条款 |
| deliveryTerms | VARCHAR(50) | | 交货条款 |
| deliveryAddress | TEXT | | 交货地址 |
| targetDeliveryDate | DATE | | 期望交货日期 |
| actualDeliveryDate | DATE | | 实际交货日期 |
| notes | TEXT | | 订单备注 |
| contractUrl | VARCHAR(500) | | 合同文件URL |
| confirmedAt | TIMESTAMP | | 确认时间 |
| shippedAt | TIMESTAMP | | 发货时间 |
| deliveredAt | TIMESTAMP | | 交付时间 |
| cancelledAt | TIMESTAMP | | 取消时间 |
| cancellationReason | TEXT | | 取消原因 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_orderNumber (orderNumber)
INDEX idx_buyerId (buyerId)
INDEX idx_factoryId (factoryId)
INDEX idx_status (status)
INDEX idx_createdAt (createdAt DESC)
FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
FOREIGN KEY (webinarId) REFERENCES webinars(id) ON DELETE SET NULL
FOREIGN KEY (rfqId) REFERENCES rfqs(id) ON DELETE SET NULL
FOREIGN KEY (quotationId) REFERENCES quotations(id) ON DELETE SET NULL
```

#### 5.2 order_items (订单项表)

**用途**: 存储订单的具体商品项

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 订单项ID |
| orderId | INT | NOT NULL | 订单ID |
| productId | INT | | 产品ID |
| productName | VARCHAR(255) | NOT NULL | 产品名称 |
| sku | VARCHAR(100) | | 产品SKU |
| specifications | JSON | | 规格参数 |
| quantity | INT | NOT NULL | 数量 |
| unit | VARCHAR(50) | | 单位 |
| unitPrice | DECIMAL(12,2) | NOT NULL | 单价 |
| totalPrice | DECIMAL(12,2) | NOT NULL | 小计 |
| currency | VARCHAR(10) | DEFAULT 'USD' | 货币 |
| notes | TEXT | | 备注 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_orderId (orderId)
INDEX idx_productId (productId)
FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
FOREIGN KEY (productId) REFERENCES factory_products(id) ON DELETE SET NULL
```

---

### 6. SaaS 商业化域

#### 6.1 subscription_plans (订阅计划表)

**用途**: 存储订阅套餐配置

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PK | 计划ID (free_trial/basic/pro/enterprise) |
| name | VARCHAR(100) | NOT NULL | 计划名称 |
| nameEn | VARCHAR(100) | | 英文名称 |
| description | TEXT | | 计划描述 |
| priceMonthly | DECIMAL(10,2) | NOT NULL | 月付价格(CNY) |
| priceYearly | DECIMAL(10,2) | NOT NULL | 年付价格(CNY) |
| priceMonthlyUSD | DECIMAL(10,2) | | 月付价格(USD) |
| priceYearlyUSD | DECIMAL(10,2) | | 年付价格(USD) |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 默认货币 |
| trialDays | INT | DEFAULT 0 | 试用天数 |
| features | JSON | NOT NULL | 功能列表 |
| limits | JSON | NOT NULL | 配额限制 |
| isActive | TINYINT(1) | DEFAULT 1 | 是否启用 |
| isPopular | TINYINT(1) | DEFAULT 0 | 是否推荐 |
| displayOrder | INT | DEFAULT 0 | 显示顺序 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**limits JSON 结构示例**:
```json
{
  "webinarCreatedMonthly": 10,
  "productsMax": 30,
  "inquiriesMonthly": 50,
  "storageGB": 5,
  "videoRecordingHours": 10
}
```

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_isActive (isActive)
INDEX idx_displayOrder (displayOrder)
```

#### 6.2 subscriptions (订阅表)

**用途**: 存储用户的订阅记录

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 订阅ID |
| userId | INT | NOT NULL | 用户ID |
| planId | VARCHAR(50) | NOT NULL | 计划ID |
| status | ENUM | NOT NULL | trial/active/expired/cancelled/suspended |
| billingCycle | ENUM | NOT NULL | monthly/yearly |
| amount | DECIMAL(10,2) | NOT NULL | 订阅金额 |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 货币 |
| currentPeriodStart | TIMESTAMP | NOT NULL | 当前周期开始 |
| currentPeriodEnd | TIMESTAMP | NOT NULL | 当前周期结束 |
| trialStart | TIMESTAMP | | 试用开始 |
| trialEnd | TIMESTAMP | | 试用结束 |
| autoRenew | TINYINT(1) | DEFAULT 1 | 自动续费 |
| renewalDate | TIMESTAMP | | 下次续费日期 |
| cancelledAt | TIMESTAMP | | 取消时间 |
| cancellationReason | TEXT | | 取消原因 |
| metadata | JSON | | 其他元数据 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_userId (userId)
INDEX idx_planId (planId)
INDEX idx_status (status)
INDEX idx_currentPeriodEnd (currentPeriodEnd)
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (planId) REFERENCES subscription_plans(id)
```

#### 6.3 payment_orders (支付订单表)

**用途**: 存储支付订单记录

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 支付订单ID |
| orderNo | VARCHAR(64) | UNIQUE, NOT NULL | 订单号 |
| userId | INT | NOT NULL | 用户ID |
| subscriptionId | INT | | 订阅ID |
| planId | VARCHAR(50) | NOT NULL | 计划ID |
| type | ENUM | NOT NULL | subscription/recharge/upgrade |
| amount | DECIMAL(10,2) | NOT NULL | 金额 |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 货币 |
| billingCycle | ENUM | | monthly/yearly |
| paymentMethod | VARCHAR(50) | | alipay/wechat/stripe |
| paymentId | VARCHAR(255) | | 第三方支付ID |
| status | ENUM | NOT NULL | pending/paid/failed/refunded/cancelled |
| paidAt | TIMESTAMP | | 支付时间 |
| refundedAt | TIMESTAMP | | 退款时间 |
| refundAmount | DECIMAL(10,2) | | 退款金额 |
| refundReason | TEXT | | 退款原因 |
| metadata | JSON | | 其他元数据 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_orderNo (orderNo)
INDEX idx_userId (userId)
INDEX idx_subscriptionId (subscriptionId)
INDEX idx_status (status)
INDEX idx_paidAt (paidAt)
INDEX idx_createdAt (createdAt DESC)
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id) ON DELETE SET NULL
FOREIGN KEY (planId) REFERENCES subscription_plans(id)
```

#### 6.4 invoices (发票表)

**用途**: 存储发票记录

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 发票ID |
| invoiceNumber | VARCHAR(50) | UNIQUE, NOT NULL | 发票号 |
| userId | INT | NOT NULL | 用户ID |
| paymentOrderId | INT | NOT NULL | 支付订单ID |
| type | ENUM | NOT NULL | vat/receipt |
| status | ENUM | NOT NULL | pending/issued/sent/cancelled |
| amount | DECIMAL(10,2) | NOT NULL | 金额 |
| taxAmount | DECIMAL(10,2) | DEFAULT 0 | 税额 |
| totalAmount | DECIMAL(10,2) | NOT NULL | 总额 |
| currency | VARCHAR(10) | DEFAULT 'CNY' | 货币 |
| companyName | VARCHAR(255) | | 公司名称 |
| taxNumber | VARCHAR(100) | | 税号 |
| address | TEXT | | 地址 |
| phone | VARCHAR(20) | | 电话 |
| bankName | VARCHAR(255) | | 开户行 |
| bankAccount | VARCHAR(100) | | 银行账号 |
| fileUrl | VARCHAR(500) | | 发票文件URL |
| issuedAt | TIMESTAMP | | 开具时间 |
| sentAt | TIMESTAMP | | 发送时间 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_invoiceNumber (invoiceNumber)
INDEX idx_userId (userId)
INDEX idx_paymentOrderId (paymentOrderId)
INDEX idx_status (status)
INDEX idx_issuedAt (issuedAt)
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (paymentOrderId) REFERENCES payment_orders(id) ON DELETE CASCADE
```

#### 6.5 usage_records (使用量记录表)

**用途**: 记录用户的资源使用情况

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 记录ID |
| userId | INT | NOT NULL | 用户ID |
| resourceType | VARCHAR(50) | NOT NULL | 资源类型 |
| count | INT | DEFAULT 1 | 使用数量 |
| periodStart | TIMESTAMP | NOT NULL | 周期开始 |
| periodEnd | TIMESTAMP | NOT NULL | 周期结束 |
| metadata | JSON | | 其他元数据 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |

**resourceType 枚举**:
- `webinar_created`: 创建会议
- `product_uploaded`: 上传产品
- `inquiry_received`: 接收询价
- `storage_used`: 存储使用
- `video_recording`: 视频录制

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_userId (userId)
INDEX idx_resourceType (resourceType)
INDEX idx_periodStart (periodStart)
INDEX idx_createdAt (createdAt)
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
```

---

### 7. 评价评分域

#### 7.1 factory_reviews (工厂评价表)

**用途**: 存储采购商对工厂的评价

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 评价ID |
| factoryId | INT | NOT NULL | 工厂ID |
| buyerId | INT | NOT NULL | 采购商ID |
| orderId | INT | | 关联订单ID |
| webinarId | INT | | 关联会议ID |
| overallScore | DECIMAL(3,2) | NOT NULL | 综合评分(1-5) |
| qualityScore | DECIMAL(3,2) | | 质量评分 |
| deliveryScore | DECIMAL(3,2) | | 交付评分 |
| communicationScore | DECIMAL(3,2) | | 沟通评分 |
| pricingScore | DECIMAL(3,2) | | 价格评分 |
| complianceScore | DECIMAL(3,2) | | 合规评分 |
| title | VARCHAR(255) | | 评价标题 |
| content | TEXT | | 评价内容 |
| pros | TEXT | | 优点 |
| cons | TEXT | | 缺点 |
| images | JSON | | 评价图片 |
| isVerified | TINYINT(1) | DEFAULT 0 | 是否认证评价 |
| isAnonymous | TINYINT(1) | DEFAULT 0 | 是否匿名 |
| status | ENUM | NOT NULL | pending/published/hidden |
| helpfulCount | INT | DEFAULT 0 | 有用数 |
| replyContent | TEXT | | 工厂回复 |
| repliedAt | TIMESTAMP | | 回复时间 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_factoryId (factoryId)
INDEX idx_buyerId (buyerId)
INDEX idx_orderId (orderId)
INDEX idx_status (status)
INDEX idx_createdAt (createdAt DESC)
FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL
FOREIGN KEY (webinarId) REFERENCES webinars(id) ON DELETE SET NULL
```

---

### 8. 系统管理域

#### 8.1 audit_logs (审计日志表)

**用途**: 记录系统关键操作日志

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 日志ID |
| userId | INT | | 操作用户ID |
| action | VARCHAR(100) | NOT NULL | 操作类型 |
| entityType | VARCHAR(100) | | 实体类型 |
| entityId | INT | | 实体ID |
| changes | JSON | | 变更内容 |
| ipAddress | VARCHAR(45) | | IP地址 |
| userAgent | VARCHAR(500) | | User Agent |
| metadata | JSON | | 其他元数据 |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |

**索引**:
```sql
PRIMARY KEY (id)
INDEX idx_userId (userId)
INDEX idx_action (action)
INDEX idx_entityType (entityType)
INDEX idx_createdAt (createdAt DESC)
```

#### 8.2 system_settings (系统设置表)

**用途**: 存储系统配置参数

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 设置ID |
| category | VARCHAR(100) | NOT NULL | 分类 |
| key | VARCHAR(100) | NOT NULL | 键名 |
| value | TEXT | | 值 |
| type | ENUM | NOT NULL | string/number/boolean/json |
| description | TEXT | | 描述 |
| isPublic | TINYINT(1) | DEFAULT 0 | 是否公开 |
| updatedBy | INT | | 更新人ID |
| createdAt | TIMESTAMP | NOT NULL | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
```sql
PRIMARY KEY (id)
UNIQUE KEY idx_category_key (category, key)
INDEX idx_category (category)
```

---

## 索引优化策略

### 索引设计原则

1. **主键索引**: 所有表使用自增 INT 作为主键
2. **唯一索引**: 业务唯一字段（email, orderNo 等）
3. **外键索引**: 所有外键字段创建索引
4. **查询索引**: 高频查询字段创建索引
5. **复合索引**: 多字段联合查询创建复合索引
6. **覆盖索引**: 查询字段全部在索引中

### 复合索引示例

```sql
-- 工厂表：按城市和评分查询
CREATE INDEX idx_city_score ON factories(city, overallScore DESC);

-- 会议表：按状态和时间查询
CREATE INDEX idx_status_scheduled ON webinars(status, scheduledAt);

-- 订单表：按买家和状态查询
CREATE INDEX idx_buyer_status ON orders(buyerId, status, createdAt DESC);

-- 支付订单：按用户和支付时间查询
CREATE INDEX idx_user_paid ON payment_orders(userId, paidAt DESC);
```

### 索引监控

定期检查索引使用情况：

```sql
-- 查看未使用的索引
SELECT * FROM sys.schema_unused_indexes;

-- 查看索引大小
SELECT 
  table_name,
  index_name,
  ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM mysql.innodb_index_stats
WHERE database_name = 'realsourcing'
ORDER BY size_mb DESC;
```

---

## 数据安全与隐私

### 敏感数据加密

需要加密的字段：
- `users.passwordHash`: bcrypt 加密
- `users.phone`: AES-256 加密
- `payment_orders.paymentId`: 部分脱敏
- `invoices.taxNumber`: 部分脱敏

### GDPR 合规

1. **数据最小化**: 只收集必要数据
2. **用户同意**: 记录用户同意记录
3. **数据导出**: 提供用户数据导出功能
4. **数据删除**: 实现软删除和硬删除
5. **数据保留**: 设置数据保留期限

### 访问控制

```sql
-- 创建只读用户
CREATE USER 'realsourcing_readonly'@'%' IDENTIFIED BY 'password';
GRANT SELECT ON realsourcing.* TO 'realsourcing_readonly'@'%';

-- 创建应用用户
CREATE USER 'realsourcing_app'@'%' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE ON realsourcing.* TO 'realsourcing_app'@'%';

-- 创建管理员用户
CREATE USER 'realsourcing_admin'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON realsourcing.* TO 'realsourcing_admin'@'%';
```

---

## 性能优化方案

### 1. 分区表

对大表进行分区：

```sql
-- 按月分区审计日志表
ALTER TABLE audit_logs PARTITION BY RANGE (YEAR(createdAt) * 100 + MONTH(createdAt)) (
  PARTITION p202601 VALUES LESS THAN (202602),
  PARTITION p202602 VALUES LESS THAN (202603),
  PARTITION p202603 VALUES LESS THAN (202604),
  -- ...
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

### 2. 读写分离

- **主库**: 处理写操作
- **从库**: 处理读操作
- **中间件**: ProxySQL 或 MaxScale

### 3. 缓存策略

使用 Redis 缓存热点数据：

```
- 工厂详情: factory:{id}
- 产品列表: factory:{id}:products
- 订阅计划: subscription_plans
- 用户会话: session:{userId}
```

### 4. 慢查询优化

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 分析慢查询
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;
```

---

## 扩展性设计

### 1. 水平扩展

- **分库分表**: 按用户 ID 哈希分片
- **数据库中间件**: ShardingSphere
- **分布式 ID**: Snowflake 算法

### 2. 垂直扩展

- **读写分离**: 主从复制
- **服务器升级**: 增加 CPU/内存/磁盘

### 3. 云原生部署

- **容器化**: Docker + Kubernetes
- **云数据库**: AWS RDS / Alibaba Cloud RDS
- **自动扩缩容**: HPA (Horizontal Pod Autoscaler)

---

## 总结

本数据库架构设计遵循以下原则：

✅ **业务驱动**: 完整覆盖 RealSourcing SaaS 所有业务场景  
✅ **规范化设计**: 符合数据库设计范式，减少冗余  
✅ **性能优化**: 合理索引、分区表、缓存策略  
✅ **安全合规**: 数据加密、访问控制、GDPR 合规  
✅ **可扩展性**: 支持水平和垂直扩展  
✅ **可维护性**: 清晰的命名规范和文档

**下一步**: 实现 Drizzle ORM Schema 和数据库迁移脚本。
