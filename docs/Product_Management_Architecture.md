# TikTok 选品会议 - 产品管理架构设计

## 🎯 核心理解

### 业务逻辑
1. **产品由管理员管理**，不是在会议中临时上传
2. **产品归属于工厂**，每个产品都有 factory_id
3. **工厂创建会议时**，从自己的产品库中选择要展示的产品
4. **会议中只展示**已选择的产品，不能临时添加

---

## 👥 角色和权限体系

### 1. 管理员（Admin）

**权限**：
- ✅ 管理所有工厂
- ✅ 管理所有产品（跨工厂）
- ✅ 创建/编辑/删除产品
- ✅ 创建大型 Webinar（无限制）
- ✅ 查看所有数据和报告

**可访问页面**：
- `/admin` - 管理员面板首页
- `/admin/factories` - 工厂管理
- `/admin/factories/:id` - 工厂详情
- `/admin/products` - 产品库（所有产品）
- `/admin/products/new` - 添加产品
- `/admin/products/:id/edit` - 编辑产品
- `/admin/webinars` - 所有会议管理
- `/admin/reports` - 数据报告

### 2. 工厂（Factory）

**权限**：
- ✅ 查看自己的产品库（只读，不能添加/编辑）
- ✅ 创建小型 Webinar（有限制，如最多 20 人）
- ✅ 从自己的产品库中选择产品
- ✅ 查看自己的会议数据
- ❌ 不能管理产品（需要联系管理员）
- ❌ 不能查看其他工厂的产品

**可访问页面**：
- `/factories/:id/dashboard` - 工厂仪表盘
- `/factories/:id/products` - 我的产品库（只读）
- `/webinars/create` - 创建会议（选择产品）
- `/webinars/:id` - 我的会议详情
- `/webinars/:id/showcase` - 会议室

### 3. 采购商/卖家（Buyer）

**权限**：
- ✅ 参加 Webinar
- ✅ 浏览产品
- ✅ 收藏产品
- ✅ 提交询价
- ✅ 查看我的收藏
- ❌ 不能看到产品管理功能
- ❌ 不能创建会议

**可访问页面**：
- `/webinars` - 会议列表
- `/webinars/:id` - 会议详情
- `/webinars/:id/showcase` - 会议室（参会）
- `/webinars/:id/favorites` - 我的收藏
- `/profile` - 个人资料

---

## 📊 数据模型设计

### 1. User（用户）

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'factory' | 'buyer';  // 角色
  factory_id?: number;                   // 如果是工厂角色，关联工厂 ID
  avatar?: string;
  created_at: string;
}
```

### 2. Factory（工厂）

```typescript
interface Factory {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  product_count: number;                 // 产品数量
  webinar_count: number;                 // 会议数量
  created_at: string;
  updated_at?: string;
}
```

### 3. Product（产品）

```typescript
interface Product {
  id: number;
  factory_id: number;                    // 归属工厂 ID ⭐
  name: string;
  price: number;
  currency: string;
  moq: number;
  lead_time: string;
  images: string[];
  description?: string;
  specs?: any;
  category?: string;
  stock?: number;
  
  // 统计数据
  favorite_count: number;
  inquiry_count: number;
  view_count: number;
  
  // 状态
  status: 'active' | 'inactive';         // 是否启用
  
  created_at: string;
  updated_at?: string;
  created_by?: string;                   // 创建者（管理员 ID）
}
```

### 4. Webinar（会议）

```typescript
interface Webinar {
  id: number;
  title: string;
  description?: string;
  factory_id: number;                    // 主办工厂 ID ⭐
  
  // 会议类型和规模
  meeting_type: 'standard' | 'sourcing'; // 会议类型
  size: 'small' | 'large';               // 小型/大型
  max_participants?: number;             // 最大参会人数
  
  // 产品关联
  product_ids: number[];                 // 选择的产品 ID 列表 ⭐
  product_count: number;                 // 产品数量
  
  // 其他字段...
  status: 'scheduled' | 'live' | 'completed';
  start_time: string;
  end_time?: string;
  created_at: string;
}
```

### 5. WebinarProduct（会议产品关联表）

```typescript
interface WebinarProduct {
  id: number;
  webinar_id: number;
  product_id: number;
  display_order: number;                 // 展示顺序
  created_at: string;
}
```

### 6. ProductInteraction（产品互动）

```typescript
interface ProductInteraction {
  id: number;
  webinar_id: number;
  product_id: number;
  user_id: string;
  user_name?: string;
  type: 'view' | 'favorite' | 'inquiry';
  metadata?: any;
  created_at: string;
}
```

---

## 🔄 业务流程

### 流程 1：管理员添加产品

```
1. 管理员登录 → 进入管理员面板 `/admin`
2. 点击 "产品管理" → 进入 `/admin/products`
3. 点击 "添加产品" → 进入 `/admin/products/new`
4. 填写产品信息：
   - 选择归属工厂（下拉选择）⭐
   - 产品名称
   - 价格、MOQ、交期
   - 上传图片（多张）
   - 产品描述和规格
5. 点击 "保存" → 产品添加到工厂的产品库
```

### 流程 2：工厂创建选品会议

```
1. 工厂用户登录 → 进入工厂仪表盘
2. 点击 "创建会议" → 进入 `/webinars/create`
3. 填写会议信息：
   - 会议标题
   - 会议描述
   - 开始时间
   - 会议类型：选择 "选品会议（Sourcing）"
4. 选择要展示的产品：⭐
   - 从自己工厂的产品库中选择
   - 支持多选（checkbox）
   - 可以调整展示顺序
5. 点击 "创建会议" → 会议创建成功
```

### 流程 3：会议中展示产品

```
1. 工厂用户开始会议 → 进入 `/webinars/:id/showcase`
2. 系统读取：
   - 当前会议的 webinar_id
   - 关联的 product_ids
   - 根据 product_ids 查询产品详情
3. 展示产品网格（只展示已选择的产品）⭐
4. 采购商可以浏览、收藏、询价
```

### 流程 4：采购商收藏和询价

```
1. 采购商进入会议室 → `/webinars/:id/showcase`
2. 浏览产品，点击收藏按钮
3. 系统记录：
   - webinar_id
   - product_id
   - user_id
   - type: 'favorite'
4. 点击询价按钮 → 填写询价表单
5. 系统记录：
   - webinar_id
   - product_id
   - user_id
   - type: 'inquiry'
   - metadata: { quantity, target_price, message }
```

---

## 🔐 权限控制实现

### 1. 路由守卫（Route Guard）

```typescript
// 管理员路由守卫
const AdminRoute = ({ component: Component, ...rest }) => {
  const user = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
};

// 工厂路由守卫
const FactoryRoute = ({ component: Component, ...rest }) => {
  const user = useAuth();
  
  if (!user || user.role !== 'factory') {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
};

// 使用示例
<Route path="/admin/products">
  <AdminRoute component={AdminProducts} />
</Route>

<Route path="/factories/:id/dashboard">
  <FactoryRoute component={FactoryDashboard} />
</Route>
```

### 2. API 权限控制

```typescript
// 后端 API 权限检查
app.get('/api/products', async (req, res) => {
  const user = req.user;
  
  if (user.role === 'admin') {
    // 管理员可以看到所有产品
    const products = await db.products.findAll();
    return res.json(products);
  }
  
  if (user.role === 'factory') {
    // 工厂只能看到自己的产品
    const products = await db.products.findAll({
      where: { factory_id: user.factory_id }
    });
    return res.json(products);
  }
  
  // 采购商不能访问产品库
  return res.status(403).json({ error: 'Forbidden' });
});
```

### 3. UI 权限控制

```typescript
// 根据角色显示不同的导航菜单
const Navigation = () => {
  const user = useAuth();
  
  return (
    <nav>
      {user.role === 'admin' && (
        <>
          <Link to="/admin">管理员面板</Link>
          <Link to="/admin/products">产品管理</Link>
          <Link to="/admin/factories">工厂管理</Link>
        </>
      )}
      
      {user.role === 'factory' && (
        <>
          <Link to="/factories/:id/dashboard">我的仪表盘</Link>
          <Link to="/factories/:id/products">我的产品库</Link>
          <Link to="/webinars/create">创建会议</Link>
        </>
      )}
      
      {user.role === 'buyer' && (
        <>
          <Link to="/webinars">会议列表</Link>
          <Link to="/profile">个人资料</Link>
        </>
      )}
    </nav>
  );
};
```

---

## 🎨 UI 设计要点

### 管理员面板（Admin Panel）

**风格**：
- 深色主题（与现有设计一致）
- 侧边栏导航
- 数据表格 + 操作按钮

**主要页面**：

#### 1. 产品管理页面（`/admin/products`）

```
┌─────────────────────────────────────────────────┐
│ 产品管理                    [+ 添加产品]        │
├─────────────────────────────────────────────────┤
│ 搜索: [___________]  工厂: [全部▼]  状态: [全部▼] │
├─────────────────────────────────────────────────┤
│ 图片  │ 产品名称        │ 工厂    │ 价格  │ 操作 │
├─────────────────────────────────────────────────┤
│ [img] │ LED Desk Lamp   │ 工厂A  │ $2.50 │ 编辑 │
│ [img] │ Smart RGB Bulb  │ 工厂B  │ $3.80 │ 编辑 │
│ [img] │ Wireless Earbuds│ 工厂A  │ $8.90 │ 编辑 │
└─────────────────────────────────────────────────┘
```

#### 2. 添加产品页面（`/admin/products/new`）

```
┌─────────────────────────────────────────────────┐
│ 添加产品                              [保存]    │
├─────────────────────────────────────────────────┤
│ 归属工厂 *                                      │
│ [选择工厂 ▼]                                    │
│                                                 │
│ 产品名称 *                                      │
│ [_____________________]                         │
│                                                 │
│ 产品图片 *                                      │
│ [上传图片] [上传图片] [上传图片]                │
│                                                 │
│ 价格 *          MOQ *         交期 *            │
│ [$____]         [____] units  [____] days       │
│                                                 │
│ 产品描述                                        │
│ [_____________________________________]         │
│ [_____________________________________]         │
│                                                 │
│ 产品规格（JSON）                                │
│ [_____________________________________]         │
│                                                 │
│              [取消]  [保存产品]                 │
└─────────────────────────────────────────────────┘
```

### 工厂创建会议（Factory Create Webinar）

**修改 `/webinars/create` 页面**：

```
┌─────────────────────────────────────────────────┐
│ 创建选品会议                                    │
├─────────────────────────────────────────────────┤
│ 会议标题 *                                      │
│ [_____________________]                         │
│                                                 │
│ 会议描述                                        │
│ [_____________________________________]         │
│                                                 │
│ 开始时间 *                                      │
│ [2024-01-15 14:00]                              │
│                                                 │
│ 选择要展示的产品 *                              │
│ ┌───────────────────────────────────────────┐   │
│ │ ☑ LED Desk Lamp - $2.50                   │   │
│ │ ☑ Smart RGB Bulb - $3.80                  │   │
│ │ ☐ Portable Power Bank - $4.20             │   │
│ │ ☑ Wireless Earbuds - $8.90                │   │
│ │ ☐ Mini USB Desk Fan - $1.90               │   │
│ └───────────────────────────────────────────┘   │
│ 已选择 3 个产品                                 │
│                                                 │
│              [取消]  [创建会议]                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 开发任务清单

### Phase 1: 数据模型和权限设计 ✅
- [x] 设计角色权限体系
- [x] 设计数据模型（Factory, Product, WebinarProduct）
- [x] 设计业务流程
- [x] 编写架构文档

### Phase 2: 管理员面板
- [ ] 创建管理员面板布局（侧边栏导航）
- [ ] 开发产品管理列表页（`/admin/products`）
- [ ] 开发添加产品页面（`/admin/products/new`）
- [ ] 开发编辑产品页面（`/admin/products/:id/edit`）
- [ ] 开发工厂管理页面（`/admin/factories`）

### Phase 3: 工厂产品选择
- [ ] 修改 Webinar 创建页面（`/webinars/create`）
- [ ] 添加产品选择组件（多选 checkbox）
- [ ] 实现产品展示顺序调整
- [ ] 保存 webinar_products 关联

### Phase 4: 权限控制
- [ ] 创建 AuthContext 和 useAuth hook
- [ ] 实现路由守卫（AdminRoute, FactoryRoute）
- [ ] 实现 API 权限中间件
- [ ] 根据角色显示不同的导航菜单

### Phase 5: Directus 集成
- [ ] 创建 factories 表
- [ ] 修改 products 表（添加 factory_id）
- [ ] 创建 webinar_products 表
- [ ] 修改 webinars 表（添加 size, max_participants）
- [ ] 创建 API 接口

### Phase 6: 测试和交付
- [ ] 测试管理员添加产品流程
- [ ] 测试工厂创建会议流程
- [ ] 测试权限控制
- [ ] 测试会议中产品展示
- [ ] 编写使用文档

---

## 🚀 下一步行动

1. **等待您提供 .env 文件**（Directus 配置）
2. **开发管理员面板**（2-3 小时）
3. **修改 Webinar 创建流程**（1-2 小时）
4. **实现权限控制**（1-2 小时）
5. **Directus 集成和测试**（2-3 小时）

**预计总时间**：6-10 小时

---

## ❓ 待确认问题

1. **工厂用户是否可以查看自己的产品库？**
   - 我的理解：可以查看（只读），但不能添加/编辑

2. **小型 Webinar 的限制是什么？**
   - 最大参会人数？（如 20 人）
   - 最大产品数量？（如 10 个产品）

3. **管理员是否可以代替工厂创建会议？**
   - 我的理解：可以，管理员权限最高

4. **产品是否有审核流程？**
   - 管理员添加后直接生效？
   - 还是需要审核后才能在会议中展示？

请确认以上理解是否正确，我将立即开始开发！
