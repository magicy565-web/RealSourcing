# RealSourcing 权限修改总结

**修改时间**: 2026-02-19  
**任务**: P1 - 前端权限调试

---

## 📊 修改概览

本次修改将以下 API 从 `protectedProcedure`（需要登录）改为 `publicProcedure`（游客可访问），以支持游客浏览工厂和产品信息。

---

## ✅ 已修改的 API

### Factory Router (`server/routers/factory.router.ts`)

| API 名称 | 修改前 | 修改后 | 说明 |
| :--- | :--- | :--- | :--- |
| `factory.getImages` | 🔒 Protected | 🌍 Public | 游客可以查看工厂图片 |
| `factory.getCertifications` | 🔒 Protected | 🌍 Public | 游客可以查看工厂认证 |
| `factory.getProducts` | 🔒 Protected | 🌍 Public | 游客可以查看工厂产品列表 |
| `factory.getProductById` | 🔒 Protected | 🌍 Public | 游客可以查看产品详情 |
| `factory.getReviews` | 🔒 Protected | 🌍 Public | 游客可以查看工厂评价 |

**修改数量**: 5 个 API

---

## ✅ 已验证为公开的 API

以下 API 已经是 `publicProcedure`，无需修改：

### Factory Router
- ✅ `factory.list` - 获取工厂列表
- ✅ `factory.getById` - 获取工厂详情

### Product Router
- ✅ `product.list` - 获取产品列表
- ✅ `product.listByFactory` - 获取工厂产品
- ✅ `product.getById` - 获取产品详情
- ✅ `product.getViralScore` - 获取产品爆款评分

### Webinar Router
- ✅ `webinar.listAll` - 获取所有 Webinar 列表
- ✅ `webinar.getById` - 获取 Webinar 详情

### Webinar Product Router
- ✅ `webinarProduct.listByWebinar` - 获取 Webinar 产品列表

---

## 🔒 保持受保护的 API

以下 API 仍然需要登录才能访问：

### Factory Router
- 🔒 `factory.create` - 创建工厂
- 🔒 `factory.update` - 更新工厂
- 🔒 `factory.delete` - 删除工厂
- 🔒 `factory.addImage` - 添加工厂图片
- 🔒 `factory.deleteImage` - 删除工厂图片
- 🔒 `factory.addCertification` - 添加认证
- 🔒 `factory.updateCertification` - 更新认证
- 🔒 `factory.deleteCertification` - 删除认证
- 🔒 `factory.createReview` - 创建评价
- 🔒 `factory.replyReview` - 回复评价

### Webinar Router
- 🔒 `webinar.create` - 创建 Webinar
- 🔒 `webinar.update` - 更新 Webinar
- 🔒 `webinar.delete` - 删除 Webinar
- 🔒 `webinar.list` - 获取用户自己的 Webinar 列表
- 🔒 `webinar.join` - 加入 Webinar
- 🔒 `webinar.leave` - 离开 Webinar

### Webinar Product Router
- 🔒 `webinarProduct.addProduct` - 添加产品
- 🔒 `webinarProduct.addProducts` - 批量添加产品
- 🔒 `webinarProduct.removeProduct` - 移除产品
- 🔒 `webinarProduct.updateDisplayOrder` - 更新排序
- 🔒 `webinarProduct.toggleFeatured` - 设置精选

---

## 🎯 权限设计原则

### 公开访问（Public）
适用于以下场景：
- ✅ 浏览和查看信息（工厂、产品、Webinar）
- ✅ 搜索和筛选
- ✅ 查看公开数据（评价、认证、图片）
- ✅ 营销和展示页面

### 需要认证（Protected）
适用于以下场景：
- 🔒 创建、修改、删除操作
- 🔒 个人数据访问（收藏、消息、订阅）
- 🔒 交互操作（加入 Webinar、发起询价）
- 🔒 支付和订阅管理

---

## 🧪 测试场景

### 游客（未登录）应该能够：

#### ✅ 工厂相关
- [ ] 访问 `/factories` 查看工厂列表
- [ ] 访问 `/factories/:id` 查看工厂详情
- [ ] 查看工厂图片、认证、评价
- [ ] 查看工厂的产品列表

#### ✅ 产品相关
- [ ] 浏览产品列表
- [ ] 查看产品详情
- [ ] 查看产品的 AI 爆款评分

#### ✅ Webinar 相关
- [ ] 访问 `/webinars` 查看 Webinar 列表
- [ ] 访问 `/webinars/:id` 查看 Webinar 详情
- [ ] 访问 `/webinars/:id/showcase` 查看产品展示
- [ ] 查看 Webinar 关联的产品

### 游客（未登录）不应该能够：

#### ❌ 操作限制
- [ ] 创建 Webinar
- [ ] 加入 Webinar 直播间
- [ ] 收藏产品
- [ ] 发起询价
- [ ] 创建工厂
- [ ] 添加产品

### 买家（已登录）应该能够：

#### ✅ 额外权限
- [ ] 执行游客的所有操作
- [ ] 创建 Webinar
- [ ] 加入 Webinar 直播间
- [ ] 收藏产品
- [ ] 发起询价
- [ ] 查看自己的收藏和消息
- [ ] 管理订阅和配额

### 工厂（已登录）应该能够：

#### ✅ 额外权限
- [ ] 执行游客的所有操作
- [ ] 创建和管理自己的工厂
- [ ] 添加和管理产品
- [ ] 创建 Webinar 展示产品
- [ ] 回复买家询价
- [ ] 回复工厂评价

---

## 📝 代码变更

### 修改文件
- `server/routers/factory.router.ts` - 5 处修改

### Git 提交
```bash
git add server/routers/factory.router.ts
git commit -m "fix: update factory router permissions for guest access

- Change factory.getImages to publicProcedure
- Change factory.getCertifications to publicProcedure
- Change factory.getProducts to publicProcedure
- Change factory.getProductById to publicProcedure
- Change factory.getReviews to publicProcedure

This allows guests to browse factory information, products, and reviews
without requiring authentication."
```

---

## 🚀 部署说明

### 本地测试
```bash
# 1. 启动开发服务器
pnpm dev

# 2. 在浏览器隐私模式访问（模拟游客）
open http://localhost:3001/factories
open http://localhost:3001/webinars
```

### 生产部署
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建
pnpm build

# 3. 重启服务
pm2 restart realsourcing-api
```

---

## ⚠️ 注意事项

### 安全考虑
1. ✅ 敏感操作（创建、修改、删除）仍然需要认证
2. ✅ 用户个人数据（收藏、消息）仍然受保护
3. ✅ 支付和订阅操作仍然需要认证
4. ⚠️ 公开 API 需要考虑速率限制，防止爬虫滥用

### 性能考虑
1. 公开 API 可能会有更高的访问量
2. 建议添加缓存机制（Redis）
3. 建议添加 CDN 加速静态资源

### 数据隐私
1. ✅ 草稿状态的产品不会在公开 API 中显示
2. ✅ 用户个人信息不会在公开 API 中泄露
3. ✅ 隐藏状态的评价不会在公开 API 中显示

---

## 📚 相关文档

- `permission_analysis.md` - 完整的权限需求分析
- `DEVELOPMENT_SUMMARY.md` - 开发总结文档
- `server/routers/factory.router.ts` - Factory Router 源代码
- `server/routers/product.router.ts` - Product Router 源代码
- `server/routers/webinar.router.ts` - Webinar Router 源代码

---

**文档版本**: v1.0  
**最后更新**: 2026-02-19
