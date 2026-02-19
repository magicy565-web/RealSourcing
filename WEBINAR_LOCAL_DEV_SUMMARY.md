# Webinar 本地开发环境配置与修复总结

**日期**: 2026-02-19  
**作者**: Manus AI  
**项目**: RealSourcing - B2B 跨境采购平台

---

## 📋 任务概述

在本地开发环境中完成 Webinar 页面的开发和实现，包括前后端集成、数据库连接、API 修复和页面测试。

---

## ✅ 已完成的工作

### 1. 数据库连接配置（通过 SSH 隧道）

**问题**：沙盒环境的 IP 地址（212.79.106.84）无法直接连接到阿里云 RDS 数据库。

**解决方案**：通过 ECS 服务器建立 SSH 隧道。

```bash
# 建立 SSH 隧道（将 RDS 3306 端口映射到本地 3307）
sshpass -p 'YOUR_PASSWORD' ssh -f -N \
  -L 3307:rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306 \
  -o StrictHostKeyChecking=no \
  -o ServerAliveInterval=60 \
  root@47.99.205.136

# 验证隧道是否运行
ps aux | grep "ssh.*3307" | grep -v grep
```

**配置更新**（`.env` 文件）：

```bash
# Database Configuration (via SSH tunnel)
DATABASE_URL=mysql://magicyang:YOUR_PASSWORD@localhost:3307/realsourcing
```

**测试结果**：
- ✅ 数据库连接成功
- ✅ 查询到 35 个 Webinar 记录
- ✅ 数据完整性验证通过

---

### 2. 前端 API 调用修复

**问题**：`WebinarDetailEnhanced.tsx` 使用了需要认证的 `webinar.getById` API，导致未登录用户无法查看详情页。

**错误信息**：
```json
{
  "error": {
    "message": "Please login (10001)",
    "code": "UNAUTHORIZED"
  }
}
```

**解决方案**：将 API 调用改为公开接口 `webinarEnhanced.getById`。

**修改文件**：`client/src/pages/WebinarDetailEnhanced.tsx`

```typescript
// 修改前
const { data: webinar, isLoading } = trpc.webinar.getById.useQuery(
  { id: webinarId },
  { enabled: !!webinarId }
);

// 修改后
const { data: webinar, isLoading } = trpc.webinarEnhanced.getById.useQuery(
  { id: webinarId },
  { enabled: !!webinarId }
);
```

**测试结果**：
- ✅ Webinar 详情页成功加载
- ✅ 所有数据正确显示
- ✅ 无需登录即可查看

---

### 3. 开发服务器配置

**启动命令**：

```bash
# 启动开发服务器（集成前后端）
cd /home/ubuntu/RealSourcing
pnpm dev
```

**服务器信息**：
- **后端 API**: http://localhost:3001/api/trpc
- **前端页面**: http://localhost:3001/
- **开发模式**: Vite 作为中间件集成在 Express 中

**公网访问**（通过 Manus 端口映射）：
```
https://3001-i1fpl7zs9e2h6utu4xbsk-d649666e.sg1.manus.computer
```

---

### 4. 环境变量配置

**完整的 `.env` 配置**：

```bash
# Database Configuration (via SSH tunnel)
DATABASE_URL=mysql://magicyang:YOUR_PASSWORD@localhost:3307/realsourcing

# JWT Secret
JWT_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3
COOKIE_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3

# AI Provider Configuration
AI_PROVIDER=auto
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_BASE_URL=https://once.novai.su/v1
OPENAI_MODEL=gpt-4.1-mini

# Agora Configuration
AGORA_APP_ID=YOUR_AGORA_APP_ID
AGORA_APP_CERTIFICATE=YOUR_AGORA_APP_CERTIFICATE

# Frontend API URL (for local development)
VITE_API_URL=http://localhost:3001/api/trpc
VITE_AGORA_APP_ID=YOUR_AGORA_APP_ID

# Google OAuth (for local testing)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Aliyun OSS Configuration
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=YOUR_ALIYUN_ACCESS_KEY_ID
OSS_ACCESS_KEY_SECRET=YOUR_ALIYUN_ACCESS_KEY_SECRET
OSS_BUCKET=demand-os-discord

# Environment
NODE_ENV=development
PORT=3001
```

---

## 🎯 功能验证

### Webinar 列表页 (`/webinars`)

**测试结果**：
- ✅ 成功显示 34 个 Webinar
- ✅ 统计卡片正确：29 已安排，3 直播中，2 已完成
- ✅ 搜索和筛选功能 UI 正常
- ✅ Webinar 卡片显示完整信息：标题、描述、时间、参与人数、状态

### Webinar 详情页 (`/webinars/:id`)

**测试 URL**: `/webinars/1` (TikTok Hot Products Sourcing Session)

**测试结果**：
- ✅ 页面标题和描述正确显示
- ✅ 状态标签："E-commerce" 和 "SCHEDULED"
- ✅ 时间信息："Feb 16, 2026, 10:00 AM" 和 "120 minutes"
- ✅ 注册信息："0 registered"，容量："0 / 100"
- ✅ 选项卡：Exhibiting Factories, Agenda, Speaker
- ✅ 互动按钮：Join Live Webinar, Share, Save
- ✅ 参与度统计：Shares, Questions, Inquiries

---

## 🔧 开发工具和脚本

### 数据库连接测试脚本

**文件**: `test-db-tunnel.js`

```bash
# 测试数据库连接
node test-db-tunnel.js
```

**输出示例**：
```
✅ Connection successful!
Webinars count: [ { count: 35 } ]
Sample webinars: [
  { id: 1, title: 'TikTok Hot Products Sourcing Session', ... },
  { id: 2, title: 'LED Lighting Solutions 2026', ... },
  { id: 3, title: 'Influencer Product Selection', ... }
]
```

### API 测试命令

```bash
# 测试 Webinar 列表 API
curl -s "http://localhost:3001/api/trpc/webinarEnhanced.listAll?input=%7B%22json%22%3A%7B%22limit%22%3A5%7D%7D" | python3 -m json.tool

# 测试 Webinar 详情 API
curl -s "http://localhost:3001/api/trpc/webinarEnhanced.getById?input=%7B%22json%22%3A%7B%22id%22%3A1%7D%7D" | python3 -m json.tool
```

---

## 📝 关键技术点

### 1. SSH 隧道持久化

**问题**：SSH 隧道可能会断开，导致数据库连接失败。

**解决方案**：
- 使用 `ServerAliveInterval=60` 保持连接活跃
- 在开发脚本中添加隧道检查和自动重连逻辑

**自动重连脚本**：

```bash
#!/bin/bash
# check-tunnel.sh

if ! ps aux | grep "ssh.*3307" | grep -v grep > /dev/null; then
  echo "SSH tunnel is down, re-establishing..."
  sshpass -p 'YOUR_PASSWORD' ssh -f -N \
    -L 3307:rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306 \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=60 \
    root@47.99.205.136
  echo "SSH tunnel re-established"
else
  echo "SSH tunnel is running"
fi
```

### 2. tRPC API 路由结构

**后端路由注册**（`server/routers.ts`）：

```typescript
export const appRouter = router({
  // 新版 Webinar API（推荐使用）
  webinarEnhanced: webinarRouter,  // 包含 listAll, getById 等公开接口
  
  // 旧版 Webinar API（需要认证）
  webinar: router({
    list: protectedProcedure...,
    getById: protectedProcedure...,
    // ...
  }),
});
```

**前端调用示例**：

```typescript
// 公开接口（无需登录）
const { data } = trpc.webinarEnhanced.listAll.useQuery({ limit: 100 });
const { data } = trpc.webinarEnhanced.getById.useQuery({ id: 1 });

// 受保护接口（需要登录）
const { data } = trpc.webinar.create.useMutation();
const { data } = trpc.webinar.update.useMutation();
```

### 3. Vite 开发服务器集成

**架构**：
- Express 服务器监听 3001 端口
- Vite 作为中间件集成在 Express 中
- 所有 `/api/*` 请求路由到 tRPC
- 其他请求由 Vite 处理（前端页面）

**优势**：
- 单一端口，无需 CORS 配置
- 前后端代码修改实时热更新
- 统一的开发体验

---

## 🚀 下一步计划

### 1. Webinar 直播间功能开发

**目标**：实现完整的 Webinar 直播间，包括：
- ✅ Agora 视频通话集成
- ✅ Netless 互动白板集成
- ✅ 实时聊天室
- ✅ 屏幕共享
- ✅ 参与者管理

**关键文件**：
- `client/src/pages/WebinarLiveRoom.tsx` - 直播间主组件
- `client/src/lib/agora.ts` - Agora 服务封装
- `server/routers/agora.router.ts` - Agora Token 生成

### 2. AI 功能前端集成

**目标**：将后端 AI 功能展示在前端 UI：
- 爆款评分仪表盘
- 智能推荐列表
- 谈判助手聊天界面
- 决策矩阵可视化

### 3. Google OAuth 登录测试

**配置**：
- 在 Google Cloud Console 添加 `http://localhost:3001/api/auth/google/callback`
- 测试本地登录流程
- 验证用户信息存储

---

## 📚 参考文档

1. **本地开发指南**: `LOCAL_DEVELOPMENT_GUIDE.md`
2. **数据库维护指南**: `RealSourcing-数据库维护与开发指南.md`
3. **前端 UI 集成文档**: `RealSourcing-前端UI集成开发文档.md`
4. **Agora SDK 文档**: https://docs.agora.io/en/
5. **Netless 白板文档**: https://docs.netless.link/

---

## ⚠️ 注意事项

1. **SSH 隧道管理**：
   - 每次重启开发环境需要重新建立 SSH 隧道
   - 建议创建自动化脚本检查和重连

2. **数据库连接**：
   - 使用 `localhost:3307` 而非直接连接 RDS
   - 确保 ECS 服务器（47.99.205.136）可访问

3. **环境变量**：
   - `.env` 文件不应提交到 Git
   - 生产环境使用不同的配置（Vercel 环境变量）

4. **API 版本**：
   - 优先使用 `webinarEnhanced` 路由（公开接口）
   - `webinar` 路由需要用户认证

---

## 🎉 总结

通过本次开发，我们成功：
1. ✅ 解决了数据库连接问题（SSH 隧道）
2. ✅ 修复了前端 API 调用（使用公开接口）
3. ✅ 验证了 Webinar 列表和详情页功能
4. ✅ 建立了完整的本地开发环境
5. ✅ 创建了测试脚本和开发文档

现在可以高效地进行本地开发和测试，完成后再部署到生产环境！
