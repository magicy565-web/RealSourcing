# RealSourcing Directus 后端开发指引

## 📋 目录

1. [项目概述](#项目概述)
2. [数据库结构](#数据库结构)
3. [Collections 详解](#collections-详解)
4. [权限配置](#权限配置)
5. [API 使用指南](#api-使用指南)
6. [前后端集成](#前后端集成)
7. [数据导入](#数据导入)
8. [常见问题](#常见问题)

---

## 项目概述

RealSourcing 使用 **Directus** 作为 Headless CMS 和后端 API 服务。Directus 提供了强大的数据管理界面、RESTful API 和 GraphQL API，以及细粒度的权限控制系统。

### Directus 实例信息

- **管理后台**: https://admin.cnsubscribe.xyz
- **API 端点**: https://admin.cnsubscribe.xyz/items/
- **认证方式**: OAuth 2.0 / JWT Token
- **版本**: Directus 11.1.1

### 技术栈

**后端**：Directus (Node.js + PostgreSQL/MySQL)  
**API**: RESTful API + GraphQL  
**认证**: JWT Token + OAuth  
**权限**: Role-Based Access Control (RBAC)

---

## 数据库结构

### 核心 Collections

RealSourcing 的数据库包含以下核心 Collections：

| Collection | 描述 | 主要字段 | 关系 |
|-----------|------|---------|------|
| **factories** | 工厂信息 | id, name, location, score, logo, verification_status | → webinar_participants, quotes |
| **webinars** | Webinar 信息 | id, title, description, scheduled_at, status, cover_image | → messages, reports, webinar_participants |
| **webinar_participants** | Webinar 参与者 | id, webinar_id, user_id, status | ← webinars, ← directus_users |
| **messages** | 聊天消息 | id, webinar_id, sender_id, content, created_at | ← webinars, ← directus_users |
| **reports** | AI 报告 | id, webinar_id, title, report_type, content | ← webinars, ← directus_users |
| **rfqs** | 询价单 | id, buyer_id, title, description, status | ← directus_users, → rfqs_factories |
| **quotes** | 报价 | id, rfq_id, factory_id, price, status | ← rfqs, ← factories |
| **orders** | 订单 | id, rfq_id, factory_id, status, amount | ← rfqs, ← factories |

### 系统 Collections

- **directus_users**: 用户账户（买家、工厂、管理员）
- **directus_roles**: 用户角色（Factory, Buyer, Admin）
- **directus_policies**: 访问策略
- **directus_permissions**: 权限规则

---

## Collections 详解

### 1. factories（工厂）

工厂是 RealSourcing 平台的供应商，提供产品和服务。

#### 字段定义

```typescript
interface Factory {
  id: number;                      // 主键
  name: string;                    // 工厂名称
  location: string;                // 地址
  contact_person: string;          // 联系人
  contact_email: string;           // 联系邮箱
  contact_phone: string;           // 联系电话
  description: string;             // 描述
  score: number;                   // 评分 (0-100)
  logo: string;                    // Logo URL
  year_established: number;        // 成立年份
  employee_count: number;          // 员工数量
  annual_revenue: string;          // 年营业额
  website: string;                 // 网站
  verification_status: string;     // 验证状态 (verified/pending/unverified)
  webinars_attended: number;       // 参与的 Webinar 数量
  orders_completed: number;        // 完成的订单数量
  created_at: Date;                // 创建时间
  updated_at: Date;                // 更新时间
}
```

#### API 示例

```javascript
// 获取所有工厂
GET https://admin.cnsubscribe.xyz/items/factories

// 获取单个工厂
GET https://admin.cnsubscribe.xyz/items/factories/1

// 筛选已验证的工厂
GET https://admin.cnsubscribe.xyz/items/factories?filter[verification_status][_eq]=verified

// 按评分排序
GET https://admin.cnsubscribe.xyz/items/factories?sort=-score
```

---

### 2. webinars（Webinar）

Webinar 是平台的核心功能，连接买家和工厂进行实时视频会议。

#### 字段定义

```typescript
interface Webinar {
  id: number;                      // 主键
  title: string;                   // 标题
  description: string;             // 描述（Markdown）
  type: string;                    // 类型
  status: string;                  // 状态 (scheduled/live/completed/cancelled)
  scheduled_at: Date;              // 计划时间
  ended_at: Date;                  // 结束时间
  duration: number;                // 时长（分钟）
  max_participants: number;        // 最大参与人数
  participant_count: number;       // 当前参与人数
  category: string;                // 类别
  cover_image: string;             // 封面图 URL
  tags: string[];                  // 标签
  language: string;                // 语言 (en/zh/ja)
  recording_url: string;           // 录制视频 URL
  agora_channel_name: string;      // Agora 频道名
  agora_token: string;             // Agora Token
  creator_id: string;              // 创建者 ID (FK → directus_users)
  created_at: Date;                // 创建时间
  updated_at: Date;                // 更新时间
}
```

#### API 示例

```javascript
// 获取所有 Webinar
GET https://admin.cnsubscribe.xyz/items/webinars

// 获取 Live 状态的 Webinar
GET https://admin.cnsubscribe.xyz/items/webinars?filter[status][_eq]=live

// 获取即将开始的 Webinar（未来 24 小时）
GET https://admin.cnsubscribe.xyz/items/webinars?filter[scheduled_at][_between]=now,+24hours&filter[status][_eq]=scheduled

// 创建 Webinar
POST https://admin.cnsubscribe.xyz/items/webinars
{
  "title": "Smart Home Products Showcase",
  "description": "Explore the latest smart home innovations",
  "scheduled_at": "2026-02-15T10:00:00Z",
  "duration": 60,
  "max_participants": 100,
  "category": "Electronics",
  "language": "en",
  "status": "scheduled"
}
```

---

### 3. webinar_participants（参与者）

记录用户参与 Webinar 的注册和出席情况。

#### 字段定义

```typescript
interface WebinarParticipant {
  id: number;                      // 主键
  webinar_id: number;              // Webinar ID (FK → webinars)
  user_id: string;                 // 用户 ID (FK → directus_users)
  user_name: string;               // 用户姓名
  user_role: string;               // 用户角色 (factory/buyer/admin)
  company: string;                 // 公司名称
  status: string;                  // 状态 (registered/attended/no_show)
  registered_at: Date;             // 注册时间
}
```

#### API 示例

```javascript
// 获取某个 Webinar 的所有参与者
GET https://admin.cnsubscribe.xyz/items/webinar_participants?filter[webinar_id][_eq]=1

// 注册参与 Webinar
POST https://admin.cnsubscribe.xyz/items/webinar_participants
{
  "webinar_id": 1,
  "user_id": "current-user-id",
  "user_name": "John Smith",
  "user_role": "buyer",
  "company": "TechCorp Inc.",
  "status": "registered"
}
```

---

### 4. messages（消息）

Webinar 中的实时聊天消息。

#### 字段定义

```typescript
interface Message {
  id: number;                      // 主键
  webinar_id: number;              // Webinar ID (FK → webinars)
  sender_id: string;               // 发送者 ID (FK → directus_users)
  sender_name: string;             // 发送者姓名
  content: string;                 // 消息内容
  message_type: string;            // 消息类型 (text/system/file)
  created_at: Date;                // 创建时间
}
```

#### API 示例

```javascript
// 获取某个 Webinar 的所有消息
GET https://admin.cnsubscribe.xyz/items/messages?filter[webinar_id][_eq]=1&sort=created_at

// 发送消息
POST https://admin.cnsubscribe.xyz/items/messages
{
  "webinar_id": 1,
  "sender_id": "current-user-id",
  "sender_name": "John Smith",
  "content": "Hello everyone!",
  "message_type": "text"
}
```

---

### 5. reports（报告）

AI 生成的供应商匹配、对比报告和谈判总结。

#### 字段定义

```typescript
interface Report {
  id: number;                      // 主键
  webinar_id: number;              // Webinar ID (FK → webinars)
  title: string;                   // 报告标题
  report_type: string;             // 报告类型 (supplier_matching/comparison/negotiation_summary)
  content: object;                 // 报告内容（JSON）
  generated_by: string;            // 生成者 ID (FK → directus_users)
  created_at: Date;                // 创建时间
}
```

#### API 示例

```javascript
// 获取某个 Webinar 的所有报告
GET https://admin.cnsubscribe.xyz/items/reports?filter[webinar_id][_eq]=1

// 创建报告
POST https://admin.cnsubscribe.xyz/items/reports
{
  "webinar_id": 1,
  "title": "Supplier Matching Report",
  "report_type": "supplier_matching",
  "content": {
    "matches": [
      {"factory_id": 1, "score": 95, "reason": "High quality and competitive pricing"},
      {"factory_id": 2, "score": 88, "reason": "Fast delivery and good communication"}
    ]
  },
  "generated_by": "current-user-id"
}
```

---

### 6. rfqs（询价单）

买家发布的询价需求。

#### 字段定义

```typescript
interface RFQ {
  id: number;                      // 主键
  buyer_id: string;                // 买家 ID (FK → directus_users)
  title: string;                   // 标题
  description: string;             // 描述
  category: string;                // 类别
  quantity: number;                // 数量
  target_price: number;            // 目标价格
  deadline: Date;                  // 截止日期
  status: string;                  // 状态 (open/closed/awarded)
  created_at: Date;                // 创建时间
  updated_at: Date;                // 更新时间
}
```

---

### 7. quotes（报价）

工厂对 RFQ 的报价。

#### 字段定义

```typescript
interface Quote {
  id: number;                      // 主键
  rfq_id: number;                  // RFQ ID (FK → rfqs)
  factory_id: number;              // 工厂 ID (FK → factories)
  price: number;                   // 报价
  lead_time: number;               // 交货时间（天）
  notes: string;                   // 备注
  status: string;                  // 状态 (pending/accepted/rejected)
  created_at: Date;                // 创建时间
  updated_at: Date;                // 更新时间
}
```

---

## 权限配置

### 角色定义

RealSourcing 定义了以下用户角色：

| 角色 | 描述 | 权限级别 |
|-----|------|---------|
| **Admin** | 平台管理员 | 完全访问所有数据和功能 |
| **Buyer** | 买家用户 | 创建 Webinar、RFQ、查看工厂信息 |
| **Factory** | 工厂用户 | 参与 Webinar、提交报价、更新自己的信息 |
| **Public** | 未认证用户 | 只读访问公开数据（Webinar 列表、工厂列表） |

### 权限矩阵

#### Buyer（买家）权限

| Collection | Create | Read | Update | Delete | 条件 |
|-----------|--------|------|--------|--------|------|
| factories | ❌ | ✅ | ❌ | ❌ | 所有数据 |
| webinars | ✅ | ✅ | ✅ | ❌ | 只能更新自己创建的 |
| webinar_participants | ❌ | ✅ | ❌ | ❌ | 所有数据 |
| messages | ✅ | ✅ | ❌ | ❌ | 所有数据 |
| reports | ✅ | ✅ | ❌ | ❌ | 所有数据 |
| rfqs | ✅ | ✅ | ✅ | ❌ | 只能更新自己的 |
| quotes | ❌ | ✅ | ❌ | ❌ | 所有数据 |

#### Factory（工厂）权限

| Collection | Create | Read | Update | Delete | 条件 |
|-----------|--------|------|--------|--------|------|
| factories | ❌ | ✅ | ✅ | ❌ | 只能更新自己的信息 |
| webinars | ❌ | ✅ | ❌ | ❌ | 所有数据 |
| webinar_participants | ✅ | ✅ | ❌ | ❌ | 所有数据 |
| messages | ✅ | ✅ | ❌ | ❌ | 所有数据 |
| reports | ❌ | ✅ | ❌ | ❌ | 所有数据 |
| rfqs | ❌ | ✅ | ❌ | ❌ | 所有数据 |
| quotes | ✅ | ✅ | ✅ | ❌ | 只能更新自己的报价 |

#### Public（公开）权限

| Collection | Create | Read | Update | Delete |
|-----------|--------|------|--------|--------|
| factories | ❌ | ✅ | ❌ | ❌ |
| webinars | ❌ | ✅ | ❌ | ❌ |
| webinar_participants | ❌ | ✅ | ❌ | ❌ |

### 配置权限的步骤

由于 API 创建 Access Policy 需要特殊权限，建议通过 Directus 管理界面手动配置：

**步骤 1**：进入 **Settings → Access Policies**

**步骤 2**：点击 **Create New Policy** 创建 Factory Policy

**步骤 3**：设置 Policy 信息：
- Name: Factory Policy
- Icon: factory
- Description: Permissions for factory users
- Roles: 选择 Factory Role

**步骤 4**：点击 **Permissions** 标签，为每个 Collection 添加权限规则：

例如，为 factories Collection 添加权限：
- Action: Read
- Permissions: `{}` (无限制)
- Fields: `*` (所有字段)

然后添加 Update 权限：
- Action: Update
- Permissions: `{"id": {"_eq": "$CURRENT_USER.factory_id"}}`
- Fields: `*`

**步骤 5**：重复步骤 2-4 创建 Buyer Policy

**步骤 6**：配置 Public Policy，为 factories、webinars、webinar_participants 添加 Read 权限

---

## API 使用指南

### 认证

RealSourcing 使用 JWT Token 进行 API 认证。

#### 登录获取 Token

```javascript
POST https://admin.cnsubscribe.xyz/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

// 响应
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "...",
    "expires": 900000
  }
}
```

#### 使用 Token 访问 API

```javascript
GET https://admin.cnsubscribe.xyz/items/webinars
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 常用 API 操作

#### 1. 获取数据（Read）

```javascript
// 获取所有项目
GET /items/webinars

// 获取单个项目
GET /items/webinars/1

// 筛选
GET /items/webinars?filter[status][_eq]=live

// 排序
GET /items/webinars?sort=-created_at

// 分页
GET /items/webinars?limit=10&offset=0

// 选择字段
GET /items/webinars?fields=id,title,status

// 关联查询
GET /items/webinars?fields=*,creator_id.first_name,creator_id.last_name
```

#### 2. 创建数据（Create）

```javascript
POST /items/webinars
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Webinar",
  "description": "Description here",
  "scheduled_at": "2026-02-15T10:00:00Z",
  "status": "scheduled"
}
```

#### 3. 更新数据（Update）

```javascript
PATCH /items/webinars/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "live",
  "participant_count": 25
}
```

#### 4. 删除数据（Delete）

```javascript
DELETE /items/webinars/1
Authorization: Bearer <token>
```

### 高级查询

#### 复杂筛选

```javascript
// AND 条件
GET /items/webinars?filter[status][_eq]=live&filter[category][_eq]=Electronics

// OR 条件
GET /items/webinars?filter[_or][0][status][_eq]=live&filter[_or][1][status][_eq]=scheduled

// IN 条件
GET /items/webinars?filter[id][_in]=1,2,3

// 日期范围
GET /items/webinars?filter[scheduled_at][_between]=2026-02-01,2026-02-28

// 模糊搜索
GET /items/webinars?filter[title][_contains]=Smart
```

#### 聚合查询

```javascript
// 计数
GET /items/webinars?aggregate[count]=*

// 平均值
GET /items/factories?aggregate[avg]=score

// 分组
GET /items/webinars?groupBy[]=status&aggregate[count]=*
```

---

## 前后端集成

### React + tRPC 集成

RealSourcing 前端使用 tRPC 与后端通信，但底层仍然调用 Directus API。

#### 创建 Directus Client

```typescript
// client/src/lib/directus.ts
import { createDirectus, rest, authentication } from '@directus/sdk';

const directus = createDirectus('https://admin.cnsubscribe.xyz')
  .with(rest())
  .with(authentication());

export default directus;
```

#### 在 tRPC Router 中使用

```typescript
// server/routers/webinars.ts
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import directus from '../lib/directus';

export const webinarsRouter = router({
  list: publicProcedure
    .input(z.object({
      status: z.enum(['all', 'live', 'scheduled', 'completed']).optional(),
    }))
    .query(async ({ input }) => {
      const filter = input.status && input.status !== 'all' 
        ? { status: { _eq: input.status } }
        : {};
      
      const response = await directus.request(
        readItems('webinars', {
          filter,
          sort: ['-scheduled_at'],
          limit: 50,
        })
      );
      
      return response;
    }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const response = await directus.request(
        readItem('webinars', input.id, {
          fields: ['*', 'creator_id.first_name', 'creator_id.last_name'],
        })
      );
      
      return response;
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      scheduled_at: z.string(),
      duration: z.number(),
      category: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const response = await directus.request(
        createItem('webinars', {
          ...input,
          creator_id: ctx.user.id,
          status: 'scheduled',
        })
      );
      
      return response;
    }),
});
```

#### 在 React 组件中使用

```typescript
// client/src/pages/Webinars.tsx
import { trpc } from '../lib/trpc';

function Webinars() {
  const { data: webinars, isLoading } = trpc.webinars.list.useQuery({
    status: 'live',
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {webinars?.map(webinar => (
        <div key={webinar.id}>
          <h3>{webinar.title}</h3>
          <p>{webinar.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 实时更新（WebSocket）

Directus 支持 WebSocket 订阅实时数据变化。

```typescript
// 订阅 messages Collection 的变化
import { createDirectus, realtime } from '@directus/sdk';

const directus = createDirectus('https://admin.cnsubscribe.xyz')
  .with(realtime());

// 连接 WebSocket
await directus.connect();

// 订阅消息
const { subscription } = await directus.subscribe('messages', {
  query: {
    filter: { webinar_id: { _eq: 1 } },
  },
});

// 监听新消息
for await (const message of subscription) {
  console.log('New message:', message);
  // 更新 UI
}
```

---

## 数据导入

### 从 Mock 数据导入

RealSourcing 的 Mock 数据位于 `client/src/lib/mock-data.ts`。可以通过以下脚本导入到 Directus：

```python
# import_mock_data.py
import requests
import json

DIRECTUS_URL = "https://admin.cnsubscribe.xyz"
TOKEN = "your-admin-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 导入工厂数据
factories = [
    {
        "name": "Shenzhen Electronics Co., Ltd.",
        "location": "Shenzhen, Guangdong, China",
        "score": 92,
        "logo": "/shenzhen-electronics.png",
        "verification_status": "verified",
        # ... 其他字段
    },
    # ... 更多工厂
]

for factory in factories:
    response = requests.post(
        f"{DIRECTUS_URL}/items/factories",
        headers=headers,
        json=factory
    )
    print(f"Imported factory: {factory['name']}")

# 导入 Webinar 数据
webinars = [
    {
        "title": "Consumer Electronics Q1 Sourcing Fair",
        "description": "Connect with top electronics manufacturers",
        "scheduled_at": "2026-02-15T10:00:00Z",
        "status": "scheduled",
        # ... 其他字段
    },
    # ... 更多 Webinar
]

for webinar in webinars:
    response = requests.post(
        f"{DIRECTUS_URL}/items/webinars",
        headers=headers,
        json=webinar
    )
    print(f"Imported webinar: {webinar['title']}")
```

### 批量导入（CSV/JSON）

Directus 支持通过管理界面导入 CSV 或 JSON 文件：

**步骤 1**：准备 CSV 文件，确保列名与字段名匹配

**步骤 2**：进入 **Content → [Collection Name]**

**步骤 3**：点击右上角的 **Import** 按钮

**步骤 4**：选择 CSV 文件并映射字段

**步骤 5**：点击 **Import** 完成导入

---

## 常见问题

### Q1: 如何处理图片上传？

**A**: Directus 提供了文件上传 API：

```javascript
// 上传文件
const formData = new FormData();
formData.append('file', fileBlob);

const response = await fetch('https://admin.cnsubscribe.xyz/files', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const file = await response.json();
const fileId = file.data.id;

// 在 Collection 中引用文件
await directus.request(
  updateItem('factories', factoryId, {
    logo: fileId,
  })
);
```

### Q2: 如何实现实时聊天？

**A**: 使用 Directus WebSocket 订阅 + tRPC Subscription：

```typescript
// server/routers/messages.ts
export const messagesRouter = router({
  subscribe: protectedProcedure
    .input(z.object({ webinarId: z.number() }))
    .subscription(async function* ({ input }) {
      const subscription = await directus.subscribe('messages', {
        query: {
          filter: { webinar_id: { _eq: input.webinarId } },
        },
      });
      
      for await (const message of subscription) {
        yield message;
      }
    }),
});
```

### Q3: 如何优化 API 性能？

**A**: 使用以下策略：

1. **字段选择**：只请求需要的字段 `?fields=id,title,status`
2. **分页**：使用 `limit` 和 `offset` 参数
3. **缓存**：在前端使用 React Query 的缓存功能
4. **索引**：在 Directus 中为常用查询字段添加数据库索引
5. **关联查询**：使用 `fields=*,creator_id.*` 一次性获取关联数据

### Q4: 如何处理权限错误？

**A**: 检查以下几点：

1. Token 是否有效（未过期）
2. 用户角色是否正确
3. Access Policy 是否正确配置
4. Permissions 规则是否符合预期

可以在 Directus 管理界面的 **System Logs** 中查看详细的权限错误日志。

### Q5: 如何备份数据？

**A**: Directus 提供了数据导出功能：

```bash
# 导出所有数据为 JSON
curl -X GET "https://admin.cnsubscribe.xyz/items/factories?export=json" \
  -H "Authorization: Bearer <token>" \
  > factories_backup.json

# 或使用 Directus CLI
npx directus schema snapshot ./snapshot.yaml
```

---

## 下一步

1. **完成权限配置**：通过 Directus 管理界面手动创建 Factory Policy 和 Buyer Policy
2. **导入 Mock 数据**：运行 `import_mock_data.py` 脚本导入初始数据
3. **测试 API**：使用 Postman 或 curl 测试各个 API 端点
4. **集成前端**：在 tRPC Router 中调用 Directus API
5. **实现实时功能**：使用 WebSocket 订阅实现聊天和通知

---

## 参考资源

- [Directus 官方文档](https://docs.directus.io/)
- [Directus API 参考](https://docs.directus.io/reference/introduction.html)
- [Directus SDK (TypeScript)](https://docs.directus.io/guides/sdk/getting-started.html)
- [tRPC 官方文档](https://trpc.io/)
- [Agora SDK 文档](https://docs.agora.io/)

---

**文档版本**: 1.0  
**最后更新**: 2026-02-13  
**维护者**: RealSourcing Team
