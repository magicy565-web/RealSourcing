# Directus 数据表创建指南

## 概述

为了支持 TikTok 选品会议功能，需要在 Directus 中创建和修改以下数据表：

1. **factories** - 工厂信息表（可能已存在，需要扩展）
2. **products** - 产品信息表（新建）
3. **webinar_products** - 会议产品关联表（新建）
4. **product_interactions** - 产品互动记录表（新建）
5. **webinars** - 会议表（已存在，需要扩展字段）

---

## 1. factories 表（工厂信息）

### 检查现有字段

如果 `factories` 表已存在，请确保包含以下字段：

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | UUID/Integer | 主键 | ✓ |
| name | String | 工厂名称 | ✓ |
| description | Text | 工厂描述 | |
| logo | Image | 工厂 Logo | |
| contact_email | String | 联系邮箱 | ✓ |
| contact_phone | String | 联系电话 | |
| address | String | 地址 | |
| product_count | Integer | 产品数量 | |
| webinar_count | Integer | 会议数量 | |
| created_at | DateTime | 创建时间 | ✓ |
| updated_at | DateTime | 更新时间 | |

### 创建步骤

1. 登录 Directus 管理面板
2. 进入 Settings → Data Model
3. 如果 `factories` 表不存在，点击 "Create Collection"
4. 设置 Collection Name: `factories`
5. 添加上述字段

---

## 2. products 表（产品信息）

### 字段定义

| 字段名 | 类型 | 说明 | 必填 | 默认值 |
|--------|------|------|------|--------|
| id | Integer | 主键（自增） | ✓ | |
| factory_id | Many-to-One | 归属工厂 ID（关联 factories.id） | ✓ | |
| name | String | 产品名称 | ✓ | |
| price | Decimal | 价格 | ✓ | |
| currency | String | 货币单位 | ✓ | USD |
| moq | Integer | 最小起订量 | ✓ | |
| lead_time | String | 交期（如 "7-10 days"） | ✓ | |
| images | JSON | 产品图片 URL 数组 | | [] |
| description | Text | 产品描述 | | |
| specs | JSON | 产品规格（JSON 对象） | | {} |
| category | String | 产品分类 | | |
| stock | Integer | 库存数量 | | 0 |
| favorite_count | Integer | 收藏数 | | 0 |
| inquiry_count | Integer | 询价数 | | 0 |
| view_count | Integer | 浏览数 | | 0 |
| status | String | 状态（active/inactive） | ✓ | active |
| created_at | DateTime | 创建时间 | ✓ | |
| updated_at | DateTime | 更新时间 | | |
| created_by | String | 创建者（管理员 ID） | | |

### 创建步骤

1. Settings → Data Model → Create Collection
2. Collection Name: `products`
3. 添加字段：
   - **id**: Integer, Primary Key, Auto Increment
   - **factory_id**: Many-to-One Relationship
     - Related Collection: `factories`
     - Display Template: `{{name}}`
   - **name**: String, Interface: Input, Required
   - **price**: Decimal, Interface: Input, Required
   - **currency**: String, Interface: Dropdown, Default: "USD"
   - **moq**: Integer, Interface: Input, Required
   - **lead_time**: String, Interface: Input, Required
   - **images**: JSON, Interface: JSON Editor
   - **description**: Text, Interface: Textarea
   - **specs**: JSON, Interface: JSON Editor
   - **category**: String, Interface: Input
   - **stock**: Integer, Interface: Input, Default: 0
   - **favorite_count**: Integer, Interface: Input, Default: 0
   - **inquiry_count**: Integer, Interface: Input, Default: 0
   - **view_count**: Integer, Interface: Input, Default: 0
   - **status**: String, Interface: Dropdown
     - Choices: `active`, `inactive`
     - Default: `active`
   - **created_at**: DateTime, Interface: DateTime, Required
   - **updated_at**: DateTime, Interface: DateTime
   - **created_by**: String, Interface: Input

---

## 3. webinar_products 表（会议产品关联）

### 字段定义

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | Integer | 主键（自增） | ✓ |
| webinar_id | Many-to-One | 会议 ID（关联 webinars.id） | ✓ |
| product_id | Many-to-One | 产品 ID（关联 products.id） | ✓ |
| display_order | Integer | 展示顺序 | ✓ |
| created_at | DateTime | 创建时间 | ✓ |

### 创建步骤

1. Settings → Data Model → Create Collection
2. Collection Name: `webinar_products`
3. 添加字段：
   - **id**: Integer, Primary Key, Auto Increment
   - **webinar_id**: Many-to-One Relationship
     - Related Collection: `webinars`
     - Display Template: `{{title}}`
   - **product_id**: Many-to-One Relationship
     - Related Collection: `products`
     - Display Template: `{{name}}`
   - **display_order**: Integer, Interface: Input, Required
   - **created_at**: DateTime, Interface: DateTime, Required

---

## 4. product_interactions 表（产品互动记录）

### 字段定义

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | Integer | 主键（自增） | ✓ |
| webinar_id | Many-to-One | 会议 ID（关联 webinars.id） | ✓ |
| product_id | Many-to-One | 产品 ID（关联 products.id） | ✓ |
| user_id | String | 用户 ID（卖家） | ✓ |
| user_name | String | 用户名称 | |
| type | String | 互动类型（view/favorite/inquiry） | ✓ |
| metadata | JSON | 额外信息（如询价数量、目标价格等） | |
| created_at | DateTime | 创建时间 | ✓ |

### 创建步骤

1. Settings → Data Model → Create Collection
2. Collection Name: `product_interactions`
3. 添加字段：
   - **id**: Integer, Primary Key, Auto Increment
   - **webinar_id**: Many-to-One Relationship
     - Related Collection: `webinars`
   - **product_id**: Many-to-One Relationship
     - Related Collection: `products`
   - **user_id**: String, Interface: Input, Required
   - **user_name**: String, Interface: Input
   - **type**: String, Interface: Dropdown, Required
     - Choices: `view`, `favorite`, `inquiry`
   - **metadata**: JSON, Interface: JSON Editor
   - **created_at**: DateTime, Interface: DateTime, Required

---

## 5. webinars 表（扩展字段）

### 需要添加的新字段

| 字段名 | 类型 | 说明 | 必填 | 默认值 |
|--------|------|------|------|--------|
| meeting_type | String | 会议类型（standard/sourcing） | | standard |
| size | String | 会议规模（small/large） | | small |
| factory_id | Many-to-One | 主办工厂 ID（关联 factories.id） | | |
| product_ids | JSON | 选择的产品 ID 列表 | | [] |
| product_count | Integer | 产品数量 | | 0 |

### 添加步骤

1. Settings → Data Model → 选择 `webinars` 表
2. 点击 "Create Field" 添加以下字段：
   - **meeting_type**: String, Interface: Dropdown
     - Choices: `standard`, `sourcing`
     - Default: `standard`
   - **size**: String, Interface: Dropdown
     - Choices: `small`, `large`
     - Default: `small`
   - **factory_id**: Many-to-One Relationship
     - Related Collection: `factories`
     - Display Template: `{{name}}`
   - **product_ids**: JSON, Interface: JSON Editor
   - **product_count**: Integer, Interface: Input, Default: 0

---

## 6. 关系配置

### factories → products (One-to-Many)

1. 在 `factories` 表中添加关系字段：
   - Field Name: `products`
   - Interface: One-to-Many
   - Related Collection: `products`
   - Foreign Key: `factory_id`

### webinars → webinar_products (One-to-Many)

1. 在 `webinars` 表中添加关系字段：
   - Field Name: `webinar_products`
   - Interface: One-to-Many
   - Related Collection: `webinar_products`
   - Foreign Key: `webinar_id`

### products → product_interactions (One-to-Many)

1. 在 `products` 表中添加关系字段：
   - Field Name: `interactions`
   - Interface: One-to-Many
   - Related Collection: `product_interactions`
   - Foreign Key: `product_id`

---

## 7. 权限配置

### 管理员（Admin）

- **factories**: 完全访问（CRUD）
- **products**: 完全访问（CRUD）
- **webinar_products**: 完全访问（CRUD）
- **product_interactions**: 完全访问（CRUD）
- **webinars**: 完全访问（CRUD）

### 工厂（Factory）

- **factories**: 只读（自己的工厂）
- **products**: 只读（自己工厂的产品）
- **webinar_products**: 读写（自己创建的会议）
- **product_interactions**: 只读（自己会议的互动）
- **webinars**: 读写（自己创建的会议）

### 采购商（Buyer）

- **factories**: 只读（公开信息）
- **products**: 只读（会议中的产品）
- **webinar_products**: 只读
- **product_interactions**: 读写（自己的互动）
- **webinars**: 只读（参加的会议）

---

## 8. 测试数据

### 创建测试工厂

```json
{
  "name": "Shenzhen Electronics Co.",
  "description": "Leading electronics manufacturer in Shenzhen",
  "contact_email": "contact@shenzhen-electronics.com",
  "contact_phone": "+86 755 1234 5678",
  "address": "Shenzhen, Guangdong, China",
  "product_count": 0,
  "webinar_count": 0
}
```

### 创建测试产品

```json
{
  "factory_id": 1,
  "name": "LED Desk Lamp - Modern Design",
  "price": 2.50,
  "currency": "USD",
  "moq": 100,
  "lead_time": "7 days",
  "images": [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"
  ],
  "description": "Modern LED desk lamp with adjustable brightness",
  "specs": {
    "Material": "Aluminum",
    "Power": "12W",
    "Color": "White"
  },
  "category": "Lighting",
  "stock": 5000,
  "favorite_count": 0,
  "inquiry_count": 0,
  "view_count": 0,
  "status": "active"
}
```

---

## 9. API 端点

创建完成后，可以通过以下 API 端点访问数据：

- `GET /items/factories` - 获取所有工厂
- `GET /items/factories/:id` - 获取单个工厂
- `GET /items/products?filter[factory_id][_eq]=1` - 获取某工厂的产品
- `POST /items/products` - 创建产品
- `PATCH /items/products/:id` - 更新产品
- `DELETE /items/products/:id` - 删除产品
- `GET /items/webinar_products?filter[webinar_id][_eq]=1` - 获取会议的产品
- `POST /items/product_interactions` - 记录产品互动

---

## 10. 下一步

完成 Directus 配置后：

1. 更新前端代码，使用真实的 Directus API
2. 替换 Mock 数据为 API 调用
3. 测试完整的产品管理流程
4. 测试会议创建和产品选择流程
5. 测试权限控制

---

## 注意事项

1. **备份数据**：在修改现有表之前，请备份数据库
2. **环境变量**：确保 `.env` 文件中配置了正确的 Directus URL 和 Token
3. **CORS 设置**：确保 Directus 允许前端域名的跨域请求
4. **图片上传**：配置 Directus 的文件上传功能，用于产品图片
5. **索引优化**：为 `factory_id`、`webinar_id`、`product_id` 等外键字段添加索引

---

## 完成清单

- [ ] 创建/扩展 `factories` 表
- [ ] 创建 `products` 表
- [ ] 创建 `webinar_products` 表
- [ ] 创建 `product_interactions` 表
- [ ] 扩展 `webinars` 表
- [ ] 配置表关系
- [ ] 配置权限
- [ ] 创建测试数据
- [ ] 测试 API 端点
- [ ] 更新前端代码

---

**准备好 .env 文件后，我将帮您完成 API 集成和测试！**
