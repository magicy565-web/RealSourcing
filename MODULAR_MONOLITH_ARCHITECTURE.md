# RealSourcing Modular Monolith 架构设计方案

**方案版本**: v1.0  
**设计时间**: 2026年2月20日  
**预计完成**: 3-4 天  
**月度成本**: ¥650

---

## 1. 架构概览

### 1.1 核心理念

**Modular Monolith** = 单体应用的部署简单性 + 微服务的模块化设计

```
┌─────────────────────────────────────────────────────────────┐
│                    RealSourcing Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Web UI  │  │ Mobile   │  │  Admin   │  │   API    │    │
│  │ (Vercel) │  │   App    │  │Dashboard │  │  Docs    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │             │           │
│       └─────────────┴──────────────┴─────────────┘           │
│                         │                                     │
│                    tRPC Link                                  │
│                         │                                     │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │           Modular Monolith Backend                   │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │         tRPC Router (API Gateway)            │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │ Webinar  │  │ Factory  │  │ Product  │          │    │
│  │  │  Module  │  │  Module  │  │  Module  │  ...     │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │    │
│  │       │             │              │                 │    │
│  │  ┌────┴─────────────┴──────────────┴─────┐          │    │
│  │  │        Shared Infrastructure           │          │    │
│  │  │  • Prisma ORM  • Auth  • Cache        │          │    │
│  │  │  • Queue       • Logger • Validation  │          │    │
│  │  └────────────────────────────────────────┘          │    │
│  └───────────────────────────────────────────────────────┘    │
│                         │                                     │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │              Data Layer (Prisma)                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │    │
│  │  │  MySQL  │  │  Redis  │  │   OSS   │             │    │
│  │  │   RDS   │  │  Cache  │  │ Storage │             │    │
│  │  └─────────┘  └─────────┘  └─────────┘             │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择

| 层级 | 技术 | 理由 |
|------|------|------|
| **前端** | React + Vite + TypeScript | 保持现有技术栈 |
| **API 通信** | tRPC v11 + tRPC Link | 端到端类型安全 + 灵活部署 |
| **ORM** | Prisma (替换 Drizzle) | 更好的类型推断、迁移管理、生态系统 |
| **数据库** | MySQL (阿里云 RDS) | 保持现有基础设施 |
| **缓存** | Redis (阿里云) | 性能优化 |
| **存储** | 阿里云 OSS | 媒体文件存储 |
| **部署** | 单体应用 (ECS/Railway) | 简化运维 |

---

## 2. 为什么选择 Modular Monolith？

### 2.1 对比分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **纯 tRPC (当前)** | 开发快速 | 高度耦合、难以扩展 | ❌ 不适合 SaaS |
| **RESTful API** | 解耦、标准化 | 失去类型安全、开发慢 | ⚠️ 可用但不理想 |
| **微服务** | 高度解耦 | 复杂度高、成本高 | ❌ 过度设计 |
| **Modular Monolith** | 模块化 + 类型安全 + 简单部署 | ✅ **最佳选择** |

### 2.2 核心优势

1. **保留 tRPC 优势**
   - ✅ 端到端类型安全
   - ✅ 自动生成 API 文档
   - ✅ 优秀的开发体验

2. **解决耦合问题**
   - ✅ 模块边界清晰
   - ✅ 可独立测试
   - ✅ 易于重构

3. **支持多端**
   - ✅ Web (React)
   - ✅ Mobile (React Native)
   - ✅ Admin Dashboard
   - ✅ 第三方 API 集成

4. **部署简单**
   - ✅ 单一进程
   - ✅ 易于调试
   - ✅ 成本低（¥650/月）

5. **未来可扩展**
   - ✅ 模块可轻松拆分为微服务
   - ✅ 支持水平扩展

---

## 3. 模块设计

### 3.1 模块划分原则

- **高内聚**：每个模块负责一个业务领域
- **低耦合**：模块间通过定义良好的接口通信
- **独立性**：每个模块可独立开发、测试、部署

### 3.2 核心模块

```
server/
├── modules/
│   ├── auth/                    # 认证授权模块
│   │   ├── auth.router.ts       # tRPC 路由
│   │   ├── auth.service.ts      # 业务逻辑
│   │   ├── auth.schema.ts       # Zod 验证
│   │   └── auth.test.ts         # 单元测试
│   │
│   ├── webinar/                 # Webinar 核心模块
│   │   ├── webinar.router.ts
│   │   ├── webinar.service.ts
│   │   ├── webinar.schema.ts
│   │   ├── webinar-participant.service.ts
│   │   ├── webinar-product.service.ts
│   │   └── webinar.test.ts
│   │
│   ├── factory/                 # 工厂模块
│   │   ├── factory.router.ts
│   │   ├── factory.service.ts
│   │   ├── factory.schema.ts
│   │   ├── factory-verification.service.ts
│   │   └── factory.test.ts
│   │
│   ├── product/                 # 产品模块
│   │   ├── product.router.ts
│   │   ├── product.service.ts
│   │   ├── product.schema.ts
│   │   └── product.test.ts
│   │
│   ├── user/                    # 用户模块
│   │   ├── user.router.ts
│   │   ├── user.service.ts
│   │   ├── user.schema.ts
│   │   └── user.test.ts
│   │
│   ├── subscription/            # 订阅计费模块
│   │   ├── subscription.router.ts
│   │   ├── subscription.service.ts
│   │   ├── subscription.schema.ts
│   │   ├── quota.service.ts
│   │   └── subscription.test.ts
│   │
│   ├── agora/                   # 声网集成模块
│   │   ├── agora.router.ts
│   │   ├── agora.service.ts
│   │   ├── rtc.service.ts
│   │   ├── rtm.service.ts
│   │   ├── whiteboard.service.ts
│   │   └── agora.test.ts
│   │
│   ├── message/                 # 消息模块
│   │   ├── message.router.ts
│   │   ├── message.service.ts
│   │   ├── conversation.service.ts
│   │   └── message.test.ts
│   │
│   ├── analytics/               # 分析统计模块
│   │   ├── analytics.router.ts
│   │   ├── analytics.service.ts
│   │   └── analytics.test.ts
│   │
│   └── admin/                   # 管理后台模块
│       ├── admin.router.ts
│       ├── admin.service.ts
│       └── admin.test.ts
│
├── shared/                      # 共享基础设施
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma schema
│   │   ├── client.ts            # Prisma 客户端
│   │   └── migrations/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # 认证中间件
│   │   ├── rate-limit.middleware.ts
│   │   ├── logger.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── logger.ts            # 日志工具
│   │   ├── cache.ts             # Redis 缓存
│   │   ├── queue.ts             # 任务队列
│   │   ├── email.ts             # 邮件服务
│   │   ├── sms.ts               # 短信服务
│   │   └── oss.ts               # OSS 存储
│   │
│   ├── types/
│   │   ├── common.ts            # 通用类型
│   │   └── errors.ts            # 错误类型
│   │
│   └── config/
│       ├── env.ts               # 环境变量
│       └── constants.ts         # 常量定义
│
├── trpc/
│   ├── context.ts               # tRPC Context
│   ├── router.ts                # 根路由
│   └── link.ts                  # tRPC Link 配置
│
├── index.ts                     # 应用入口
└── server.ts                    # HTTP 服务器
```

### 3.3 模块通信规则

1. **禁止直接依赖**
   ```typescript
   // ❌ 错误：直接导入其他模块的 service
   import { FactoryService } from '../factory/factory.service';
   
   // ✅ 正确：通过 tRPC 调用
   const factory = await ctx.caller.factory.getById({ id });
   ```

2. **使用事件解耦**
   ```typescript
   // Webinar 模块发出事件
   eventBus.emit('webinar.created', { webinarId, factoryIds });
   
   // Factory 模块监听事件
   eventBus.on('webinar.created', async (data) => {
     await notifyFactories(data.factoryIds);
   });
   ```

3. **共享数据通过 Prisma**
   ```typescript
   // 所有模块使用同一个 Prisma 客户端
   import { prisma } from '@/shared/prisma/client';
   ```

---

## 4. Prisma 迁移方案

### 4.1 为什么从 Drizzle 迁移到 Prisma？

| 特性 | Drizzle | Prisma | 选择 |
|------|---------|--------|------|
| 类型安全 | ✅ | ✅ | 平手 |
| 迁移管理 | ⚠️ 手动 | ✅ 自动 | **Prisma** |
| 查询构建器 | ✅ SQL-like | ✅ 声明式 | **Prisma** |
| 关系处理 | ⚠️ 手动 join | ✅ 自动 include | **Prisma** |
| 生态系统 | ⚠️ 较新 | ✅ 成熟 | **Prisma** |
| 性能 | ✅ 更快 | ✅ 足够快 | 平手 |
| 学习曲线 | ⚠️ 陡峭 | ✅ 平缓 | **Prisma** |

**结论**：Prisma 更适合 Modular Monolith 架构，特别是在团队协作和长期维护方面。

### 4.2 迁移步骤

1. **安装 Prisma**
   ```bash
   pnpm add prisma @prisma/client
   pnpm add -D prisma
   ```

2. **初始化 Prisma**
   ```bash
   npx prisma init
   ```

3. **从现有数据库生成 Schema**
   ```bash
   npx prisma db pull
   ```

4. **调整 Schema**（添加关系、索引等）

5. **生成 Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **迁移数据**（如果需要）

7. **替换 Drizzle 调用**

### 4.3 Prisma Schema 示例

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int       @id @default(autoincrement())
  openId        String    @unique @db.VarChar(64)
  email         String?   @unique @db.VarChar(320)
  passwordHash  String?   @db.VarChar(255)
  name          String?   @db.VarChar(100)
  avatar        String?   @db.VarChar(500)
  role          Role      @default(user)
  status        Status    @default(active)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  profile       UserProfile?
  factories     Factory[]
  webinars      Webinar[]
  subscriptions Subscription[]
  
  @@index([role])
  @@index([status])
  @@map("users")
}

model Webinar {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(255)
  description String?  @db.Text
  status      WebinarStatus @default(draft)
  scheduledAt DateTime?
  duration    Int      @default(60) // minutes
  hostId      Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  host        User     @relation(fields: [hostId], references: [id])
  participants WebinarParticipant[]
  products    WebinarProduct[]
  
  @@index([status])
  @@index([scheduledAt])
  @@map("webinars")
}

enum Role {
  user
  buyer
  factory
  admin
}

enum Status {
  active
  suspended
  deleted
}

enum WebinarStatus {
  draft
  scheduled
  live
  completed
  cancelled
}
```

---

## 5. tRPC Link 配置

### 5.1 什么是 tRPC Link？

tRPC Link 是一个中间件系统，允许你：
- 自定义请求/响应处理
- 添加日志、缓存、重试等功能
- 支持多种传输协议（HTTP、WebSocket、自定义）

### 5.2 前端配置

```typescript
// client/src/lib/trpc.ts

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '@server/trpc/router';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: '/api/trpc',
      // 自定义 headers
      headers() {
        return {
          authorization: localStorage.getItem('token') || '',
        };
      },
    }),
  ],
});
```

### 5.3 后端配置

```typescript
// server/trpc/router.ts

import { initTRPC } from '@trpc/server';
import { authRouter } from '@/modules/auth/auth.router';
import { webinarRouter } from '@/modules/webinar/webinar.router';
import { factoryRouter } from '@/modules/factory/factory.router';
// ... 其他模块

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  auth: authRouter,
  webinar: webinarRouter,
  factory: factoryRouter,
  product: productRouter,
  user: userRouter,
  subscription: subscriptionRouter,
  agora: agoraRouter,
  message: messageRouter,
  analytics: analyticsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

---

## 6. 实施计划

### Day 1: 基础设施搭建

**上午**（4h）
- [ ] 安装 Prisma 依赖
- [ ] 从现有数据库生成 Prisma Schema
- [ ] 调整 Schema（添加关系、优化索引）
- [ ] 生成 Prisma Client

**下午**（4h）
- [ ] 创建模块化目录结构
- [ ] 配置 tRPC Context 和 Router
- [ ] 实现共享基础设施（logger, cache, error handler）
- [ ] 配置环境变量和常量

### Day 2: 核心模块迁移

**上午**（4h）
- [ ] 迁移 Auth 模块
  - [ ] auth.service.ts (登录、注册、JWT)
  - [ ] auth.router.ts
  - [ ] auth.middleware.ts
  - [ ] 测试认证流程

**下午**（4h）
- [ ] 迁移 Webinar 模块
  - [ ] webinar.service.ts (CRUD)
  - [ ] webinar-participant.service.ts
  - [ ] webinar-product.service.ts
  - [ ] webinar.router.ts
  - [ ] 测试 Webinar API

### Day 3: 辅助模块迁移

**上午**（4h）
- [ ] 迁移 Factory 模块
- [ ] 迁移 Product 模块
- [ ] 迁移 User 模块

**下午**（4h）
- [ ] 迁移 Subscription 模块
- [ ] 迁移 Agora 模块
- [ ] 迁移 Message 模块

### Day 4: 前端适配 + 测试 + 部署

**上午**（4h）
- [ ] 更新前端 tRPC 客户端配置
- [ ] 替换关键页面的 API 调用
  - [ ] Dashboard
  - [ ] Webinar 列表/详情
  - [ ] Factory 列表/详情
- [ ] 测试前端数据展示

**下午**（4h）
- [ ] 完整功能测试
- [ ] 性能优化（添加缓存、索引）
- [ ] 部署到 ECS/Railway
- [ ] 编写文档和使用指南

---

## 7. 成本估算

### 7.1 基础设施成本（月度）

| 服务 | 配置 | 成本 |
|------|------|------|
| 阿里云 ECS | 2核4G | ¥200 |
| 阿里云 RDS MySQL | 1核2G | ¥300 |
| 阿里云 Redis | 256MB | ¥50 |
| 阿里云 OSS | 100GB | ¥50 |
| Vercel (前端) | Hobby | ¥0 |
| 域名 + SSL | - | ¥50 |
| **总计** | - | **¥650/月** |

### 7.2 可选优化（降低成本）

- 使用 Railway 替代阿里云 ECS（¥150/月）
- 使用 Upstash Redis 免费版（¥0）
- 使用 Cloudflare R2 替代 OSS（¥0-50）

**优化后成本**：¥400-500/月

---

## 8. 预期收益

### 8.1 技术收益

- ✅ **解决耦合问题**：模块化设计，易于维护
- ✅ **保留类型安全**：端到端类型推断
- ✅ **提升稳定性**：单体部署，减少故障点
- ✅ **支持多端**：Web + Mobile + Admin
- ✅ **易于扩展**：未来可拆分为微服务

### 8.2 业务收益

- ✅ **快速迭代**：3-4 天完成重构
- ✅ **降低成本**：¥650/月运行成本
- ✅ **提升体验**：前端数据展示稳定
- ✅ **符合 SaaS 标准**：可商业化

---

## 9. 风险与应对

### 9.1 技术风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| Prisma 迁移失败 | 低 | 高 | 先在测试环境验证，保留 Drizzle 备份 |
| 前端兼容性问题 | 中 | 中 | 分阶段迁移，保留旧 API 过渡期 |
| 性能下降 | 低 | 中 | 添加 Redis 缓存，优化 SQL 查询 |
| 部署失败 | 低 | 高 | 使用 Docker，确保环境一致性 |

### 9.2 业务风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 重构时间超期 | 中 | 中 | 严格按计划执行，优先核心功能 |
| 用户体验中断 | 低 | 高 | 灰度发布，保留回滚方案 |
| 数据丢失 | 极低 | 极高 | 每日备份数据库，测试恢复流程 |

---

## 10. 成功标准

### 10.1 技术指标

- [ ] 所有 71 处 tRPC 调用成功迁移
- [ ] 前端数据展示稳定，无 API 错误
- [ ] 响应时间 < 500ms (P95)
- [ ] 单元测试覆盖率 > 80%
- [ ] 零数据丢失

### 10.2 业务指标

- [ ] 3-4 天内完成重构
- [ ] 月度成本 ≤ ¥650
- [ ] 支持 Web + Mobile + Admin 三端
- [ ] 可快速添加新功能（< 1 天/模块）

---

## 11. 下一步行动

请您确认：

1. **是否同意此方案？**
2. **是否立即开始实施？**
3. **是否需要调整优先级？**（例如先迁移部分模块）
4. **是否需要保留 Drizzle？**（作为过渡期备份）

确认后，我将立即开始 Day 1 的工作！
