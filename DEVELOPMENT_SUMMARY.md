# RealSourcing 接力开发总结

**开发时间**: 2026-02-19  
**开发者**: Manus AI Agent  
**任务**: 接力开发 - Webinar 产品关联功能

---

## 📋 开发概览

本次开发完成了 **Webinar 产品关联功能**，允许用户在创建 Webinar 时选择要展示的产品，并在 Webinar 展示页面自动加载这些产品。

---

## ✅ 已完成的工作

### 1. 数据库层 (Database Layer)

#### 创建 `webinar_products` 关联表

**文件**: `migrations/fix_webinar_products.sql`

```sql
CREATE TABLE `webinar_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL,
  `productId` INT NOT NULL,
  `displayOrder` INT DEFAULT 0,
  `featured` TINYINT DEFAULT 0,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_productId` (`productId`),
  UNIQUE KEY `unique_webinar_product` (`webinarId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明**:
- `webinarId`: Webinar ID（外键）
- `productId`: 产品 ID（外键）
- `displayOrder`: 显示顺序（用于排序）
- `featured`: 是否精选（1=精选，0=普通）
- `notes`: 备注信息
- 唯一约束：同一个产品不能重复添加到同一个 Webinar

#### 更新 Drizzle Schema

**文件**: `drizzle/schema.ts`

添加了 `webinarProducts` 表定义和类型导出：

```typescript
export const webinarProducts = mysqlTable("webinar_products", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  productId: int("productId").notNull(),
  displayOrder: int("displayOrder").default(0),
  featured: tinyint("featured").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  productIdIdx: index("idx_productId").on(table.productId),
  webinarProductUnique: unique("unique_webinar_product").on(table.webinarId, table.productId),
}));

export type WebinarProduct = InferSelectModel<typeof webinarProducts>;
export type InsertWebinarProduct = InferInsertModel<typeof webinarProducts>;
```

---

### 2. 后端 API 层 (Backend API Layer)

#### 创建 `webinarProductRouter`

**文件**: `server/routers/webinar-product.router.ts`

实现了以下 tRPC 路由：

| 路由名称 | 类型 | 权限 | 功能描述 |
| :--- | :--- | :--- | :--- |
| `listByWebinar` | Query | Public | 获取 Webinar 的产品列表（支持包含产品详情） |
| `addProduct` | Mutation | Protected | 添加单个产品到 Webinar |
| `addProducts` | Mutation | Protected | 批量添加产品到 Webinar |
| `removeProduct` | Mutation | Protected | 从 Webinar 移除产品 |
| `updateDisplayOrder` | Mutation | Protected | 更新产品显示顺序 |
| `toggleFeatured` | Mutation | Protected | 设置/取消产品精选状态 |

**权限控制**:
- 只有 Webinar 创建者或管理员可以修改产品关联
- 游客可以查看 Webinar 的产品列表

**示例代码**:

```typescript
// 查询 Webinar 的产品列表
const products = await trpc.webinarProduct.listByWebinar.useQuery({
  webinarId: 1,
  includeDetails: true,
});

// 批量添加产品
await trpc.webinarProduct.addProducts.mutate({
  webinarId: 1,
  productIds: [55, 56, 57],
});
```

#### 注册到主路由

**文件**: `server/routers/index.ts`

```typescript
import { webinarProductRouter } from "./webinar-product.router.js";

export const appRouter = router({
  // ... 其他路由
  webinarProduct: webinarProductRouter,
});
```

---

### 3. 前端组件层 (Frontend Components)

#### 创建 `ProductSelectorNew` 组件

**文件**: `client/src/components/ProductSelectorNew.tsx`

**功能**:
- 搜索产品（按名称或分类）
- 多选产品（支持复选框）
- 显示产品信息（图片、名称、价格、分类）
- 显示 AI 爆款评分（Viral Score）
- 已选产品管理（可快速移除）

**使用示例**:

```tsx
<ProductSelectorNew
  selectedProductIds={selectedProductIds}
  onProductsChange={setSelectedProductIds}
  factoryId={123} // 可选：按工厂筛选
/>
```

#### 更新 `CreateWebinar` 页面

**文件**: `client/src/pages/CreateWebinar.tsx`

**新增功能**:
1. 在创建 Webinar 表单中添加产品选择器
2. 提交时自动关联选中的产品

**实现逻辑**:

```typescript
// 创建 Webinar
const result = await trpc.webinar.create.mutate({ /* ... */ });

// 如果选择了产品，批量添加
if (selectedProductIds.length > 0) {
  await trpc.webinarProduct.addProducts.mutate({
    webinarId: result.id,
    productIds: selectedProductIds,
  });
}
```

#### 更新 `ProductShowcase` 页面

**文件**: `client/src/pages/ProductShowcase.tsx`

**新增功能**:
- 从 API 加载 Webinar 关联的产品
- 如果没有关联产品，回退到 mock 数据

**实现逻辑**:

```typescript
const { data: webinarProducts } = trpc.webinarProduct.listByWebinar.useQuery({
  webinarId: parseInt(id),
  includeDetails: true,
});

useEffect(() => {
  if (webinarProducts && webinarProducts.length > 0) {
    const converted = webinarProducts
      .filter((wp) => wp.product)
      .map((wp) => ({
        ...wp.product,
        viralScore: wp.product.viralScore || { overall: 0 },
      }));
    setEnhancedProducts(converted);
  } else {
    setEnhancedProducts(mockProducts);
  }
}, [webinarProducts]);
```

---

### 4. 测试验证 (Testing & Validation)

#### 创建测试脚本

**文件**: `test-webinar-product-api.ts`

**测试内容**:
1. ✅ 检查 `webinar_products` 表是否存在
2. ✅ 查询 Webinar 和产品数据
3. ✅ 测试添加产品到 Webinar
4. ✅ 查询 Webinar 的产品列表

**测试结果**:

```
🧪 开始测试 Webinar Product API...
✅ webinar_products 表存在
✅ 找到 Webinar: ID=1, 标题="TikTok Hot Products Sourcing Session"
✅ 找到 3 个产品
✅ 成功添加产品 55 到 Webinar 1
✅ Webinar 1 关联了 1 个产品
✅ 所有测试完成！
```

---

## 🚀 部署指南

### 前置条件

1. **环境变量配置**

确保 `.env` 文件包含以下配置：

```env
DATABASE_URL=mysql://magicyang:Wysk1214@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/realsourcing
JWT_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3
VITE_API_URL=http://47.99.205.136:3001/api/trpc
```

2. **数据库迁移**

```bash
# 执行数据库迁移
mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com \
  -u magicyang -pWysk1214 realsourcing \
  < migrations/fix_webinar_products.sql
```

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 在浏览器访问
open http://localhost:3001
```

### 生产部署

#### 后端部署（阿里云 ECS）

```bash
# 1. SSH 登录服务器
ssh root@47.99.205.136

# 2. 进入项目目录
cd /path/to/realsourcing

# 3. 拉取最新代码
git pull origin main

# 4. 安装依赖
pnpm install

# 5. 构建项目
pnpm build

# 6. 重启服务
pm2 restart realsourcing-api
pm2 logs realsourcing-api
```

#### 前端部署（Vercel）

```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "feat: add webinar product association"
git push origin main

# 2. Vercel 会自动部署
# 访问 https://vercel.com/dashboard 查看部署状态
```

**Vercel 环境变量**:

在 Vercel 项目设置中添加：

```
VITE_API_URL=http://47.99.205.136:3001/api/trpc
```

---

## 📊 功能使用流程

### 1. 创建带产品的 Webinar

1. 访问 `/webinars/create`
2. 填写 Webinar 基本信息（标题、时间、分类等）
3. 在"选择展示产品"区域搜索并选择产品
4. 点击"创建"按钮
5. 系统自动创建 Webinar 并关联产品

### 2. 查看 Webinar 产品展示

1. 访问 `/webinars/:id/showcase`
2. 系统自动加载该 Webinar 关联的产品
3. 用户可以查看产品详情、AI 评分、收藏、询价

### 3. 管理 Webinar 产品

```typescript
// 添加产品
await trpc.webinarProduct.addProduct.mutate({
  webinarId: 1,
  productId: 55,
  displayOrder: 0,
  featured: true,
});

// 移除产品
await trpc.webinarProduct.removeProduct.mutate({
  webinarId: 1,
  productId: 55,
});

// 设置精选
await trpc.webinarProduct.toggleFeatured.mutate({
  webinarId: 1,
  productId: 55,
  featured: true,
});
```

---

## 🔧 技术栈

| 层级 | 技术 | 说明 |
| :--- | :--- | :--- |
| **数据库** | MySQL 8.0 | 阿里云 RDS |
| **ORM** | Drizzle ORM | 类型安全的 SQL 查询构建器 |
| **后端框架** | tRPC | 端到端类型安全的 API |
| **前端框架** | React 19 + TypeScript | 现代化 UI 框架 |
| **UI 组件** | shadcn/ui | 基于 Radix UI 的组件库 |
| **状态管理** | TanStack Query | 服务端状态管理 |
| **路由** | Wouter | 轻量级路由库 |

---

## 🐛 已知问题

### 1. TypeScript 类型错误

**问题**: 前端 tRPC 客户端类型未同步

**原因**: 后端添加了新路由，但前端类型定义未更新

**解决方案**:

```bash
# 方案 1: 重启开发服务器（会自动生成类型）
pnpm dev

# 方案 2: 手动重新构建
pnpm build
```

### 2. 环境变量加载问题

**问题**: 测试脚本无法加载 `.env` 文件

**解决方案**: 使用 `dotenv` 或直接设置环境变量

```bash
# 使用 dotenv
node -r dotenv/config test-script.js

# 直接设置
DATABASE_URL="..." pnpm tsx test-script.ts
```

---

## 📝 后续优化建议

### 短期优化（1-2 周）

1. **产品排序功能**
   - 在 `ProductShowcase` 页面支持拖拽排序
   - 调用 `updateDisplayOrder` API 保存顺序

2. **产品筛选功能**
   - 按分类筛选
   - 按价格范围筛选
   - 按 AI 评分筛选

3. **批量操作**
   - 批量删除产品
   - 批量设置精选

### 中期优化（1-2 月）

1. **产品推荐**
   - 基于 Webinar 分类推荐相关产品
   - 基于历史数据推荐热门产品

2. **数据统计**
   - 统计每个产品在 Webinar 中的点击率
   - 统计产品询价转化率

3. **权限细化**
   - 支持多个主持人共同管理产品
   - 支持产品审核流程

### 长期优化（3-6 月）

1. **AI 自动选品**
   - 根据 Webinar 主题自动推荐产品
   - 根据买家画像个性化推荐

2. **实时同步**
   - 使用 WebSocket 实时同步产品变更
   - 多人协作编辑产品列表

3. **性能优化**
   - 产品列表分页加载
   - 图片懒加载和 CDN 加速

---

## 🔐 安全注意事项

### ⚠️ 高优先级安全问题

**当前存在的安全风险**（请尽快处理）：

1. **数据库安全**
   - ❌ 数据库向全网开放访问 (`0.0.0.0/0`)
   - ❌ 数据库密码已在文档中泄露
   - ✅ **建议**: 立即修改白名单，仅允许 ECS 服务器 IP 访问

2. **服务器安全**
   - ❌ 使用 root 账号和弱密码登录
   - ✅ **建议**: 禁用 root 登录，改用 SSH 密钥认证

3. **API 密钥安全**
   - ❌ 所有第三方服务密钥已泄露
   - ✅ **建议**: 轮换所有 API 密钥（声网、阿里云、Netless）

**详细安全加固指南**: 请参考 `Security_Hardening_Guide.md`

---

## 📚 相关文档

- `Security_Hardening_Guide.md` - 安全加固操作指南
- `RealSourcing_Final_Report.md` - 项目深度研究报告
- `tech_stack_evaluation.md` - 技术栈评估文档
- `migrations/fix_webinar_products.sql` - 数据库迁移脚本
- `test-webinar-product-api.ts` - API 测试脚本

---

## 🤝 贡献者

- **Manus AI Agent** - 接力开发、功能实现、文档编写

---

## 📞 支持

如有问题，请联系：
- GitHub Issues: https://github.com/magicy565-web/RealSourcing/issues
- 邮箱: support@realsourcing.com

---

**文档版本**: v1.0  
**最后更新**: 2026-02-19
