# RealSourcing SaaS 数据库集成开发指南

> **开发日期**: 2026年2月13日  
> **版本**: v2.0  
> **状态**: ✅ 已完成

---

## 📋 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [数据库层](#数据库层)
4. [业务逻辑层](#业务逻辑层)
5. [API 层](#api-层)
6. [前端集成](#前端集成)
7. [使用示例](#使用示例)
8. [测试指南](#测试指南)
9. [部署说明](#部署说明)

---

## 概述

本次开发实现了 RealSourcing SaaS 产品的完整数据库集成，包括：

- ✅ **数据库操作层** - 24张表的完整 CRUD 操作
- ✅ **SaaS 核心逻辑** - 订阅管理、配额检查、使用量追踪
- ✅ **tRPC API 路由** - 工厂、订单、评价、订阅管理
- ✅ **前端集成** - 订阅管理页面、配额仪表板
- ✅ **配额中间件** - 自动配额检查和使用量记录

### 核心功能

| 功能模块 | 说明 | 文件 |
|---------|------|------|
| **数据库操作** | 所有表的 CRUD 函数 | `server/db_extended.ts` |
| **SaaS 核心** | 订阅和配额管理 | `server/saas-core.ts` |
| **工厂管理** | 工厂、产品、认证、评价 | `server/routers/factory.router.ts` |
| **订单管理** | RFQ、报价、订单 | `server/routers/order.router.ts` |
| **订阅管理** | 订阅、配额、仪表板 | `server/routers/subscription_enhanced.router.ts` |
| **订阅页面** | 前端订阅管理 | `client/src/pages/Subscription.tsx` |
| **配额仪表板** | 前端配额展示 | `client/src/pages/QuotaDashboard.tsx` |

---

## 架构设计

### 三层架构

```
┌─────────────────────────────────────────────┐
│           前端层 (React + tRPC)              │
│  - Subscription.tsx (订阅管理)               │
│  - QuotaDashboard.tsx (配额仪表板)           │
└─────────────────────────────────────────────┘
                    ↓ tRPC
┌─────────────────────────────────────────────┐
│           API 层 (tRPC Routers)              │
│  - factory.router.ts (工厂管理)              │
│  - order.router.ts (订单管理)                │
│  - subscription_enhanced.router.ts (订阅)    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         业务逻辑层 (SaaS Core)               │
│  - saas-core.ts (订阅、配额、使用量)          │
│  - checkQuota() (配额检查)                   │
│  - trackUsage() (使用量追踪)                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         数据库层 (Drizzle ORM)               │
│  - db.ts (基础操作)                          │
│  - db_extended.ts (扩展操作)                 │
│  - schema.ts (表定义)                        │
└─────────────────────────────────────────────┘
```

---

## 数据库层

### 文件结构

```
server/
├── db.ts                    # 基础数据库操作
├── db_extended.ts           # 扩展数据库操作（新增）
└── saas-core.ts             # SaaS 核心逻辑（新增）

drizzle/
├── schema.ts                # 数据库表定义（已更新）
└── migrations/
    ├── 001_complete_database_schema.sql  # 完整建表脚本
    └── 002_seed_subscription_plans.sql   # 订阅计划初始化
```

### 核心表

#### 1. 用户资料表 (user_profiles)

```typescript
export async function getUserProfile(userId: number);
export async function upsertUserProfile(data: InsertUserProfile);
```

#### 2. 工厂相关表

```typescript
// 工厂认证
export async function getFactoryCertifications(factoryId: number);
export async function createFactoryCertification(data: InsertFactoryCertification);

// 工厂产品
export async function getFactoryProducts(factoryId: number, status?: string);
export async function createFactoryProduct(data: InsertFactoryProduct);
export async function incrementProductView(id: number);
```

#### 3. 订单相关表

```typescript
// 询价单 (RFQ)
export async function getRFQs(buyerId?: number, status?: string);
export async function createRFQ(data: InsertRFQ);

// 报价单 (Quotation)
export async function getQuotations(rfqId?: number, factoryId?: number);
export async function createQuotation(data: InsertQuotation);
export async function acceptQuotation(id: number);
export async function rejectQuotation(id: number, reason: string);

// 订单 (Order)
export async function getOrders(buyerId?: number, factoryId?: number, status?: string);
export async function createOrder(data: InsertOrder);
export async function updateOrderStatus(id: number, status: string);
```

#### 4. 评价表 (factory_reviews)

```typescript
export async function getFactoryReviews(factoryId: number, status?: string);
export async function createFactoryReview(data: InsertFactoryReview);
export async function replyToReview(id: number, replyContent: string);
```

---

## 业务逻辑层

### SaaS 核心功能 (saas-core.ts)

#### 1. 订阅管理

```typescript
// 初始化用户订阅（免费试用）
export async function initializeUserSubscription(userId: number);

// 升级订阅
export async function upgradeSubscription(
  userId: number,
  newPlanId: string,
  billingCycle: "monthly" | "yearly"
);

// 降级订阅
export async function downgradeSubscription(userId: number, newPlanId: string);

// 取消订阅
export async function cancelUserSubscription(userId: number, reason?: string);

// 检查过期订阅
export async function checkExpiredSubscriptions();
```

#### 2. 配额管理

```typescript
// 获取用户配额限制
export async function getUserQuotaLimits(userId: number): Promise<QuotaLimits>;

// 获取用户配额使用情况
export async function getUserQuotaUsage(userId: number): Promise<QuotaUsage>;

// 检查配额是否允许
export async function checkQuota(
  userId: number,
  resourceType: "webinar" | "product" | "inquiry" | "storage" | "video" | "ai_report"
): Promise<QuotaCheckResult>;

// 记录资源使用
export async function trackUsage(
  userId: number,
  resourceType: string,
  count: number,
  metadata?: Record<string, unknown>
);

// 检查并追踪使用量（一步到位）
export async function checkAndTrackUsage(
  userId: number,
  resourceType: "webinar" | "product" | "inquiry" | "storage" | "video" | "ai_report",
  count: number,
  metadata?: Record<string, unknown>
);
```

#### 3. 配额限制类型

```typescript
interface QuotaLimits {
  webinarCreatedMonthly: number;    // 每月创建会议数
  productsMax: number;               // 最大产品数
  inquiriesMonthly: number;          // 每月询价数
  storageGB: number;                 // 存储空间(GB)
  videoRecordingHours: number;       // 录制时长(小时/月)
  aiReportsMonthly: number;          // AI报告数/月
  webinarDurationMinutes?: number;   // 会议时长(分钟)
  priorityListing?: boolean;         // 优先展示
  verifiedBadge?: boolean;           // 认证徽章
  multiFactoryManagement?: boolean;  // 多工厂管理
  apiAccess?: boolean;               // API访问
  dedicatedSupport?: boolean;        // 专属支持
}
```

---

## API 层

### 1. 工厂管理路由 (factory.router.ts)

```typescript
// 工厂基础信息
factoryEnhanced.list({ search?: string })
factoryEnhanced.getById({ id: number })
factoryEnhanced.create({ name, category, ... })
factoryEnhanced.update({ id, ... })

// 工厂认证
factoryEnhanced.getCertifications({ factoryId })
factoryEnhanced.addCertification({ factoryId, type, name, ... })
factoryEnhanced.updateCertification({ id, status, ... })
factoryEnhanced.deleteCertification({ id })

// 工厂产品
factoryEnhanced.getProducts({ factoryId, status? })
factoryEnhanced.getProductById({ id })
factoryEnhanced.createProduct({ factoryId, name, ... })  // 自动检查配额
factoryEnhanced.updateProduct({ id, ... })
factoryEnhanced.deleteProduct({ id })

// 工厂评价
factoryEnhanced.getReviews({ factoryId, status? })
factoryEnhanced.createReview({ factoryId, overallScore, ... })
factoryEnhanced.replyReview({ id, replyContent })
```

### 2. 订单管理路由 (order.router.ts)

```typescript
// 询价单 (RFQ)
order.listRFQs({ buyerId?, status? })
order.getRFQById({ id })
order.createRFQ({ title, description, ... })  // 自动检查配额
order.updateRFQ({ id, ... })

// 报价单 (Quotation)
order.listQuotations({ rfqId?, factoryId? })
order.getQuotationById({ id })
order.createQuotation({ rfqId, factoryId, unitPrice, ... })
order.acceptQuotation({ id })
order.rejectQuotation({ id, reason })

// 订单 (Order)
order.listOrders({ buyerId?, factoryId?, status? })
order.getOrderById({ id })
order.createOrder({ factoryId, totalAmount, ... })
order.updateOrder({ id, ... })
order.updateOrderStatus({ id, status })

// 订单项 (Order Item)
order.getOrderItems({ orderId })
order.addOrderItem({ orderId, productName, quantity, ... })
order.updateOrderItem({ id, ... })
order.deleteOrderItem({ id })
```

### 3. 订阅管理路由 (subscription_enhanced.router.ts)

```typescript
// 订阅计划
subscriptionEnhanced.getPlans()
subscriptionEnhanced.getPlanById({ id })

// 用户订阅
subscriptionEnhanced.getCurrent()
subscriptionEnhanced.getDetails()  // 包含配额和使用量
subscriptionEnhanced.upgrade({ planId, billingCycle })
subscriptionEnhanced.downgrade({ planId })
subscriptionEnhanced.cancel({ reason? })

// 配额管理
subscriptionEnhanced.getQuotaLimits()
subscriptionEnhanced.getQuotaUsage()
subscriptionEnhanced.checkQuota({ resourceType })
subscriptionEnhanced.getDashboard()  // 完整的配额仪表板数据
```

---

## 前端集成

### 1. 订阅管理页面 (Subscription.tsx)

**路由**: `/subscription-plans`

**功能**:
- 展示所有订阅计划
- 当前订阅状态
- 计费周期切换（月付/年付）
- 一键升级订阅
- 推荐标签和当前套餐标识

**使用示例**:

```typescript
import { Subscription } from "./pages/Subscription";

// 在路由中使用
<Route path="/subscription-plans" component={Subscription} />
```

### 2. 配额仪表板页面 (QuotaDashboard.tsx)

**路由**: `/quota`

**功能**:
- 当前订阅信息展示
- 6种资源配额使用情况
- 进度条可视化
- 配额预警（80%、100%）
- 升级提示
- 使用建议

**配额类型**:
1. 会议创建 (场/月)
2. 产品数量 (个)
3. 询价数量 (次/月)
4. 存储空间 (GB)
5. 视频录制 (小时/月)
6. AI 报告 (份/月)

---

## 使用示例

### 示例 1: 创建产品时自动检查配额

```typescript
// 前端调用
const createProductMutation = trpc.factoryEnhanced.createProduct.useMutation({
  onSuccess: () => {
    alert("产品创建成功！");
  },
  onError: (error) => {
    // 如果配额不足，会抛出错误
    alert(`创建失败：${error.message}`);
  },
});

createProductMutation.mutate({
  factoryId: 1,
  name: "新产品",
  category: "Electronics",
  description: "产品描述",
});
```

**后端自动处理**:

```typescript
// server/routers/factory.router.ts
createProduct: protectedProcedure
  .input(...)
  .mutation(async ({ ctx, input }) => {
    // 自动检查配额并记录使用量
    await checkAndTrackUsage(ctx.user.id, "product", 1, {
      factoryId: input.factoryId,
      productName: input.name,
    });
    
    const productId = await createFactoryProduct(input);
    return { id: productId };
  }),
```

### 示例 2: 升级订阅

```typescript
// 前端调用
const upgradeMutation = trpc.subscriptionEnhanced.upgrade.useMutation({
  onSuccess: () => {
    refetchSubscription();
    alert("订阅升级成功！");
  },
});

upgradeMutation.mutate({
  planId: "pro",
  billingCycle: "yearly",
});
```

### 示例 3: 查看配额使用情况

```typescript
// 前端调用
const { data: dashboard } = trpc.subscriptionEnhanced.getDashboard.useQuery();

// 返回数据结构
{
  subscription: { ... },
  plan: { ... },
  quotas: [
    {
      name: "会议创建",
      key: "webinar",
      current: 5,
      limit: 10,
      percentage: 50,
      unit: "场/月",
      unlimited: false,
    },
    // ...
  ]
}
```

---

## 测试指南

### 1. 数据库迁移测试

```bash
# 执行迁移
cd /home/ubuntu/realsourcing
mysql -u root -p realsourcing < drizzle/migrations/001_complete_database_schema.sql
mysql -u root -p realsourcing < drizzle/migrations/002_seed_subscription_plans.sql

# 验证表创建
mysql -u root -p realsourcing -e "SHOW TABLES;"

# 验证订阅计划
mysql -u root -p realsourcing -e "SELECT * FROM subscription_plans;"
```

### 2. API 测试

使用 tRPC 客户端测试：

```typescript
// 测试订阅计划查询
const plans = await trpc.subscriptionEnhanced.getPlans.query();
console.log("订阅计划:", plans);

// 测试配额检查
const quotaCheck = await trpc.subscriptionEnhanced.checkQuota.query({
  resourceType: "product",
});
console.log("配额检查:", quotaCheck);

// 测试工厂列表
const factories = await trpc.factoryEnhanced.list.query({ search: "电子" });
console.log("工厂列表:", factories);
```

### 3. 配额测试流程

1. **初始化用户订阅**
   ```typescript
   const subscription = await initializeUserSubscription(userId);
   // 应该创建免费试用订阅
   ```

2. **检查配额限制**
   ```typescript
   const limits = await getUserQuotaLimits(userId);
   // 免费试用: webinarCreatedMonthly = 0, productsMax = 5
   ```

3. **创建产品（测试配额）**
   ```typescript
   // 创建第1-5个产品应该成功
   for (let i = 1; i <= 5; i++) {
     await createFactoryProduct({ ... });
   }
   
   // 创建第6个产品应该失败
   try {
     await createFactoryProduct({ ... });
   } catch (error) {
     console.log("配额已满:", error.message);
   }
   ```

4. **升级订阅**
   ```typescript
   await upgradeSubscription(userId, "basic", "monthly");
   const newLimits = await getUserQuotaLimits(userId);
   // Basic: webinarCreatedMonthly = 3, productsMax = 20
   ```

---

## 部署说明

### 1. 环境准备

确保以下环境变量已配置：

```bash
# .env
DATABASE_URL=mysql://user:password@localhost:3306/realsourcing
```

### 2. 数据库初始化

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS realsourcing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 执行迁移
mysql -u root -p realsourcing < drizzle/migrations/001_complete_database_schema.sql
mysql -u root -p realsourcing < drizzle/migrations/002_seed_subscription_plans.sql

# 3. 验证
mysql -u root -p realsourcing -e "SELECT COUNT(*) FROM subscription_plans;"
```

### 3. 应用部署

```bash
# 1. 安装依赖
pnpm install

# 2. 构建前端
pnpm build

# 3. 启动服务
pnpm start
```

### 4. 定时任务（可选）

设置定时任务检查过期订阅：

```bash
# crontab -e
0 0 * * * cd /path/to/realsourcing && node -e "require('./server/saas-core').checkExpiredSubscriptions()"
```

---

## 常见问题

### Q1: 如何修改订阅计划的配额？

修改 `drizzle/migrations/002_seed_subscription_plans.sql` 中的 `limits` 字段，然后重新执行迁移。

### Q2: 如何添加新的资源类型配额？

1. 在 `saas-core.ts` 的 `QuotaLimits` 接口中添加新字段
2. 更新 `checkQuota()` 函数添加新的检查逻辑
3. 更新订阅计划的 `limits` 字段
4. 在前端仪表板中添加显示

### Q3: 配额何时重置？

配额在每月1号自动重置（存储空间除外）。重置逻辑在 `getMonthlyUsage()` 函数中实现。

---

## 总结

本次开发完成了 RealSourcing SaaS 产品的完整数据库集成，实现了：

✅ **24张表** 的完整 CRUD 操作  
✅ **订阅管理** 系统（试用、升级、降级、取消）  
✅ **配额管理** 系统（6种资源类型）  
✅ **自动配额检查** 和使用量追踪  
✅ **前端页面** 集成（订阅管理、配额仪表板）  
✅ **完整文档** 和测试指南  

现在 RealSourcing 已经具备了完整的 SaaS 商业化能力！🎉
