# 增强版数据库表结构设计

## 核心表结构

### 1. products (产品表) - 扩展字段

```sql
-- 基础信息 (已有)
id, name, description, price, currency, moq, lead_time, images

-- 新增：TikTok 指标字段
tiktok_views BIGINT DEFAULT 0                -- TikTok 浏览量
tiktok_likes BIGINT DEFAULT 0                -- TikTok 点赞数
tiktok_shares INT DEFAULT 0                  -- TikTok 分享数
tiktok_comments INT DEFAULT 0                -- TikTok 评论数
tiktok_sales_volume BIGINT DEFAULT 0         -- TikTok 销量
conversion_rate DECIMAL(5,2) DEFAULT 0       -- 转化率 (%)
trending_score INT DEFAULT 0                 -- 趋势评分 (0-100)

-- 新增：销售数据字段
daily_sales INT DEFAULT 0                    -- 日销量
total_sales BIGINT DEFAULT 0                 -- 总销量
daily_gmv DECIMAL(12,2) DEFAULT 0            -- 日GMV
total_gmv DECIMAL(15,2) DEFAULT 0            -- 总GMV
growth_rate DECIMAL(6,2) DEFAULT 0           -- 增长率 (%)

-- 新增：商业信息字段
original_price DECIMAL(10,2)                 -- 原价
commission_rate DECIMAL(5,2) DEFAULT 0       -- 佣金率 (%)
category VARCHAR(100)                        -- 产品品类
tags JSON                                    -- 标签数组 ["Viral", "BeautyTok"]
launch_date DATE                             -- 上架日期

-- 新增：供应商关联
supplier_id INT                              -- 供应商ID (外键)
```

### 2. suppliers (供应商表) - 新建

```sql
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,              -- 供应商名称
  logo_url VARCHAR(500),                   -- Logo URL
  country VARCHAR(100),                    -- 国家/地区
  country_flag VARCHAR(10),                -- 国旗 emoji
  rating DECIMAL(2,1) DEFAULT 0,           -- 评分 (0-5.0)
  total_products INT DEFAULT 0,            -- 产品总数
  total_sales BIGINT DEFAULT 0,            -- 总销量
  contact_email VARCHAR(200),              -- 联系邮箱
  contact_phone VARCHAR(50),               -- 联系电话
  description TEXT,                        -- 供应商简介
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. webinars (会议表) - 扩展字段

```sql
-- 基础信息 (已有)
id, title, description, start_time, end_time, status

-- 新增：会议详情
subtitle VARCHAR(500)                        -- 副标题
host_name VARCHAR(200)                       -- 主持人名称
host_avatar VARCHAR(500)                     -- 主持人头像
max_participants INT DEFAULT 20              -- 最大参会人数
current_participants INT DEFAULT 0           -- 当前参会人数
video_url VARCHAR(500)                       -- 视频流地址
meeting_type VARCHAR(50)                     -- 会议类型 (sourcing, showcase, etc)
tags JSON                                    -- 会议标签
```

### 4. webinar_products (会议产品关联表) - 扩展

```sql
-- 已有字段
id, webinar_id, product_id

-- 新增：展示顺序和状态
display_order INT DEFAULT 0                  -- 展示顺序
is_featured BOOLEAN DEFAULT FALSE            -- 是否精选
added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 添加时间
```

### 5. product_inquiries (询价记录表) - 新建

```sql
CREATE TABLE product_inquiries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,                 -- 产品ID
  webinar_id INT,                          -- 会议ID (可选)
  user_name VARCHAR(200),                  -- 询价人姓名
  user_email VARCHAR(200),                 -- 询价人邮箱
  user_company VARCHAR(200),               -- 公司名称
  quantity INT,                            -- 询价数量
  message TEXT,                            -- 询价留言
  status VARCHAR(50) DEFAULT 'pending',    -- 状态 (pending, replied, closed)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (webinar_id) REFERENCES webinars(id)
);
```

### 6. product_favorites (收藏记录表) - 新建

```sql
CREATE TABLE product_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,                 -- 产品ID
  user_id INT,                             -- 用户ID (如果有用户系统)
  session_id VARCHAR(200),                 -- 会话ID (匿名用户)
  webinar_id INT,                          -- 会议ID (可选)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (webinar_id) REFERENCES webinars(id)
);
```

### 7. chat_messages (聊天消息表) - 新建

```sql
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  webinar_id INT NOT NULL,                 -- 会议ID
  user_name VARCHAR(200),                  -- 用户名
  user_avatar VARCHAR(500),                -- 用户头像
  message TEXT NOT NULL,                   -- 消息内容
  is_ai BOOLEAN DEFAULT FALSE,             -- 是否AI消息
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webinar_id) REFERENCES webinars(id)
);
```

### 8. webinar_stats (会议统计表) - 新建

```sql
CREATE TABLE webinar_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  webinar_id INT NOT NULL UNIQUE,          -- 会议ID
  total_views INT DEFAULT 0,               -- 总浏览量
  total_inquiries INT DEFAULT 0,           -- 总询价数
  total_favorites INT DEFAULT 0,           -- 总收藏数
  total_messages INT DEFAULT 0,            -- 总消息数
  peak_participants INT DEFAULT 0,         -- 峰值参会人数
  avg_duration_minutes INT DEFAULT 0,      -- 平均观看时长
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (webinar_id) REFERENCES webinars(id)
);
```

## Directus 配置步骤

### 第一步：扩展现有表

1. **products 表**
   - 进入 Directus Admin: http://47.99.205.136:8055
   - Settings → Data Model → products
   - 添加以下字段组：

   **TikTok Metrics Group**
   - tiktok_views (Integer, Default: 0)
   - tiktok_likes (Integer, Default: 0)
   - tiktok_shares (Integer, Default: 0)
   - tiktok_comments (Integer, Default: 0)
   - tiktok_sales_volume (Integer, Default: 0)
   - conversion_rate (Decimal, Default: 0)
   - trending_score (Integer, Default: 0)

   **Sales Data Group**
   - daily_sales (Integer, Default: 0)
   - total_sales (Integer, Default: 0)
   - daily_gmv (Decimal, Default: 0)
   - total_gmv (Decimal, Default: 0)
   - growth_rate (Decimal, Default: 0)

   **Business Info Group**
   - original_price (Decimal)
   - commission_rate (Decimal, Default: 0)
   - category (String)
   - tags (JSON)
   - launch_date (Date)
   - supplier_id (Many-to-One → suppliers)

2. **webinars 表**
   - subtitle (String)
   - host_name (String)
   - host_avatar (String)
   - max_participants (Integer, Default: 20)
   - current_participants (Integer, Default: 0)
   - video_url (String)
   - meeting_type (String)
   - tags (JSON)

### 第二步：创建新表

1. **suppliers**
2. **product_inquiries**
3. **product_favorites**
4. **chat_messages**
5. **webinar_stats**

### 第三步：设置关系

- products.supplier_id → suppliers.id (Many-to-One)
- product_inquiries.product_id → products.id (Many-to-One)
- product_inquiries.webinar_id → webinars.id (Many-to-One)
- product_favorites.product_id → products.id (Many-to-One)
- chat_messages.webinar_id → webinars.id (Many-to-One)
- webinar_stats.webinar_id → webinars.id (One-to-One)

## API 端点示例

### 获取会议详情（含产品和TikTok指标）
```
GET /items/webinars/20?fields=*,webinar_products.product_id.*,webinar_products.product_id.supplier_id.*
```

### 获取产品列表（含供应商信息）
```
GET /items/products?fields=*,supplier_id.*&filter[category][_eq]=Beauty
```

### 创建询价记录
```
POST /items/product_inquiries
{
  "product_id": 1,
  "webinar_id": 20,
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "quantity": 500,
  "message": "Interested in bulk order"
}
```

### 添加收藏
```
POST /items/product_favorites
{
  "product_id": 1,
  "webinar_id": 20,
  "session_id": "abc123"
}
```

### 发送聊天消息
```
POST /items/chat_messages
{
  "webinar_id": 20,
  "user_name": "Alice",
  "message": "Great products!",
  "is_ai": false
}
```

## 数据导入模板

### 供应商数据示例
```json
{
  "name": "DR DENT Official",
  "logo_url": "https://ui-avatars.com/api/?name=DR+DENT&background=8B5CF6&color=fff",
  "country": "United States",
  "country_flag": "🇺🇸",
  "rating": 4.8,
  "contact_email": "contact@drdent.com"
}
```

### 产品数据示例
```json
{
  "name": "DRDENT Purple Teeth Whitening Strips",
  "description": "Safe for Enamel - Non Sensitive",
  "price": 15.99,
  "original_price": 29.99,
  "category": "Beauty & Personal Care",
  "moq": 100,
  "commission_rate": 15,
  "tiktok_views": 15200000,
  "tiktok_likes": 1850000,
  "tiktok_comments": 48500,
  "conversion_rate": 12.5,
  "trending_score": 95,
  "daily_sales": 7700,
  "total_sales": 330500,
  "daily_gmv": 124600,
  "total_gmv": 6000000,
  "growth_rate": -19.22,
  "tags": ["Viral", "BeautyTok", "TeethWhitening"],
  "supplier_id": 1
}
```

## 下一步行动

1. ✅ 在 Directus 中扩展表结构
2. ✅ 创建供应商数据
3. ✅ 导入产品数据（含TikTok指标）
4. ✅ 开发后台管理界面
5. ✅ 更新前端API调用
