# RealSourcing Vercel 部署配置总结

> **配置日期**: 2026-02-14  
> **配置版本**: v1.0  
> **部署架构**: 前后端分离（Vercel Serverless）

---

## 📦 本次配置内容

### 1. 新增文件

| 文件路径 | 说明 |
|---------|------|
| `api/index.ts` | Vercel Serverless Function 入口文件 |
| `vercel.json` | Vercel 部署配置文件（已更新） |
| `.vercelignore` | Vercel 部署忽略文件 |
| `.env.vercel.example` | Vercel 环境变量配置示例 |
| `VERCEL_DEPLOYMENT_GUIDE.md` | 完整的 Vercel 部署指南 |
| `deploy-vercel.sh` | 快速部署脚本 |
| `DEPLOYMENT_SUMMARY.md` | 本文档 |

### 2. 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `vercel.json` | 从静态部署配置更新为支持 Serverless Functions |

---

## 🏗️ 架构设计

### 前后端分离架构

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel 平台                           │
│                                                          │
│  ┌────────────────────┐      ┌────────────────────────┐ │
│  │   前端静态资源      │      │  Serverless Functions  │ │
│  │                    │      │                        │ │
│  │  dist/public/      │      │  api/index.ts          │ │
│  │  - index.html      │      │  ├─ /api/trpc/*        │ │
│  │  - assets/*.js     │      │  ├─ /api/oauth/*       │ │
│  │  - assets/*.css    │      │  └─ /api/webhooks/*    │ │
│  └────────────────────┘      └────────────────────────┘ │
│           │                            │                 │
└───────────┼────────────────────────────┼─────────────────┘
            │                            │
            │                            ▼
            │                  ┌──────────────────────┐
            │                  │  阿里云 MySQL 数据库  │
            │                  └──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────────┐
  │        第三方服务                     │
  │  - 声网 Agora                         │
  │  - 阿里云 OSS                         │
  │  - 支付宝/微信支付                    │
  └──────────────────────────────────────┘
```

### 关键设计决策

#### 1. Serverless Functions 架构

**为什么选择 Serverless Functions？**

- ✅ **自动扩展**: 根据流量自动扩展，无需手动管理服务器
- ✅ **成本优化**: 按实际使用量付费，空闲时不产生费用
- ✅ **全球分布**: Vercel 边缘网络提供低延迟访问
- ✅ **简化运维**: 无需配置负载均衡、SSL 证书等

**实现方式**：

- 将 Express 应用封装为 Vercel Serverless Function
- 通过 `api/index.ts` 导出 Express app
- Vercel 自动处理请求路由和函数调用

#### 2. API 路由设计

所有后端 API 统一通过 `/api/*` 前缀访问：

```
/api/trpc/*          → tRPC API (主要业务逻辑)
/api/oauth/callback  → OAuth 登录回调
/api/webhooks/*      → 支付回调 Webhooks
/api/health          → 健康检查端点
```

#### 3. CORS 配置

在 `api/index.ts` 中实现动态 CORS 配置：

```typescript
const allowedOrigins = [
  process.env.APP_URL,
  process.env.CORS_ORIGIN,
  "http://localhost:5173",  // 开发环境
];
```

#### 4. 数据库连接优化

使用单例模式复用数据库连接，避免 Serverless 环境下连接数过多：

```typescript
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}
```

---

## 🚀 快速部署指南

### 方式 1: 使用部署脚本（推荐）

```bash
# 1. 确保已配置 .env 文件
cp .env.vercel.example .env
# 编辑 .env 文件，填入实际配置

# 2. 执行部署脚本
./deploy-vercel.sh

# 3. 选择部署环境
#    1) 预览环境 (Preview)
#    2) 生产环境 (Production)
```

### 方式 2: 手动部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 方式 3: GitHub 自动部署

1. 在 Vercel Dashboard 导入 GitHub 仓库
2. 配置环境变量
3. 推送代码到 GitHub，自动触发部署

```bash
git add .
git commit -m "feat: configure vercel deployment"
git push origin main
```

---

## ⚙️ 环境变量配置

### 必需的环境变量

在 Vercel Dashboard 的 **Settings → Environment Variables** 中配置：

#### 数据库配置

```bash
DATABASE_URL=mysql://user:pass@rm-xxxxx.mysql.rds.aliyuncs.com:3306/realsourcing
```

#### 应用配置

```bash
NODE_ENV=production
APP_URL=https://your-domain.vercel.app
CORS_ORIGIN=https://your-domain.vercel.app
JWT_SECRET=your_jwt_secret_min_32_characters
```

#### OAuth 配置

```bash
VITE_OAUTH_PORTAL_URL=https://oauth.manus.computer
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=your_owner_open_id
```

#### 声网配置

```bash
AGORA_APP_ID=your_agora_app_id
AGORA_CERTIFICATE=your_agora_certificate
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret
```

#### 阿里云 OSS 配置

```bash
OSS_ACCESS_KEY_ID=LTAI5xxxxxxxxxxxxx
OSS_ACCESS_KEY_SECRET=your_secret_key
OSS_BUCKET=realsourcing-prod
OSS_REGION=oss-cn-shenzhen
OSS_ENDPOINT=https://oss-cn-shenzhen.aliyuncs.com
```

### 可选的环境变量

```bash
# 支付配置
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_private_key
WECHAT_MERCHANT_ID=your_merchant_id

# AI 配置
NOVA_API_KEY=your_nova_api_key

# 监控配置
SENTRY_DSN=your_sentry_dsn
```

---

## 📋 部署前检查清单

### 数据库准备

- [ ] 阿里云 MySQL 实例已创建
- [ ] 数据库白名单已配置（允许 `0.0.0.0/0`）
- [ ] 数据库迁移已执行（`pnpm db:push`）
- [ ] 数据库连接测试通过

### 第三方服务

- [ ] 声网 Agora 账号已创建，API 密钥已获取
- [ ] 阿里云 OSS Bucket 已创建
- [ ] Manus OAuth 应用已注册
- [ ] 支付服务已配置（如需要）

### 代码准备

- [ ] 代码已推送到 GitHub
- [ ] 依赖项已更新（`pnpm install`）
- [ ] 本地构建测试通过（`pnpm build`）
- [ ] 本地运行测试通过（`pnpm dev`）

### Vercel 配置

- [ ] Vercel 账号已创建
- [ ] 项目已导入或通过 CLI 初始化
- [ ] 所有环境变量已配置
- [ ] 构建设置已正确配置

---

## 🔧 故障排查

### 常见问题

#### 1. 数据库连接失败

**症状**: 
```
Error: connect ETIMEDOUT
```

**解决方案**:
- 检查阿里云 RDS 白名单配置
- 验证 `DATABASE_URL` 格式
- 确认数据库实例状态正常

#### 2. API 请求 404

**症状**: 
```
GET /api/trpc/... 404 Not Found
```

**解决方案**:
- 检查 `vercel.json` 中的 `rewrites` 配置
- 确认 `api/index.ts` 文件存在
- 查看 Vercel 部署日志

#### 3. CORS 错误

**症状**: 
```
Access-Control-Allow-Origin header is missing
```

**解决方案**:
- 检查 `CORS_ORIGIN` 环境变量
- 验证 `api/index.ts` 中的 CORS 配置
- 清除浏览器缓存

#### 4. 环境变量未生效

**症状**: 
```
process.env.XXX is undefined
```

**解决方案**:
- 确认变量已在 Vercel Dashboard 配置
- 重新部署项目（环境变量更新需要重新部署）
- 检查变量名拼写（区分大小写）

---

## 📊 性能监控

### Vercel Analytics

在 Vercel Dashboard 启用 Analytics：

1. 进入项目设置 → **Analytics**
2. 点击 **Enable Analytics**
3. 查看实时性能指标

### 关键指标

- **TTFB** (Time to First Byte): < 200ms
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🔄 持续集成/部署 (CI/CD)

### GitHub Actions 集成

Vercel 自动集成 GitHub，每次推送代码会触发部署：

```bash
# 推送到主分支 → 生产环境部署
git push origin main

# 推送到其他分支 → 预览环境部署
git push origin feature/new-feature
```

### 部署流程

```
代码推送 → Vercel 检测 → 安装依赖 → 构建项目 → 部署 → 通知
```

### 回滚机制

在 Vercel Dashboard 中：

1. 进入 **Deployments**
2. 选择之前的稳定版本
3. 点击 **Promote to Production**

---

## 📚 相关文档

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DATABASE_DEPLOYMENT_COMPLETE_GUIDE.md](./DATABASE_DEPLOYMENT_COMPLETE_GUIDE.md) - 数据库部署指南
- [DEVELOPMENT_HANDOVER.md](./DEVELOPMENT_HANDOVER.md) - 开发交接文档
- [.env.vercel.example](./.env.vercel.example) - 环境变量配置示例

---

## ✅ 验收标准

部署成功后，验证以下功能：

- [ ] 前端页面正常访问
- [ ] 用户登录功能正常（OAuth）
- [ ] API 请求正常响应（tRPC）
- [ ] 数据库读写正常
- [ ] 文件上传功能正常（OSS）
- [ ] 音视频通话功能正常（Agora）
- [ ] 支付功能正常（如已配置）
- [ ] 响应时间在可接受范围内

---

## 🎯 后续优化建议

### 短期优化（1-2 周）

1. **监控和日志**
   - 集成 Sentry 错误追踪
   - 配置日志收集服务
   - 设置告警规则

2. **性能优化**
   - 启用 Vercel Edge Functions（部分 API）
   - 实现 Redis 缓存层
   - 优化数据库查询

3. **安全加固**
   - 配置 CSP (Content Security Policy)
   - 启用 HTTPS 强制跳转
   - 实现 API 限流

### 中期优化（1-3 个月）

1. **数据库优化**
   - 迁移到 PlanetScale 或 Neon（Serverless 数据库）
   - 实现读写分离
   - 配置数据库备份策略

2. **CDN 优化**
   - 配置自定义 CDN 域名
   - 优化静态资源缓存策略
   - 启用图片优化服务

3. **功能增强**
   - 实现 PWA 支持
   - 添加离线功能
   - 优化移动端体验

### 长期优化（3-6 个月）

1. **架构升级**
   - 考虑微服务架构
   - 实现服务网格
   - 引入消息队列

2. **国际化**
   - 多语言支持
   - 多地域部署
   - CDN 加速优化

3. **AI 增强**
   - 智能推荐系统
   - 自动化客服
   - 数据分析和预测

---

## 🤝 技术支持

如有问题或需要帮助，请：

1. 查阅 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
2. 查看 [Vercel 官方文档](https://vercel.com/docs)
3. 提交 GitHub Issue
4. 联系技术团队

---

**配置完成时间**: 2026-02-14  
**配置人员**: Manus AI  
**项目状态**: ✅ 配置完成，待部署测试
