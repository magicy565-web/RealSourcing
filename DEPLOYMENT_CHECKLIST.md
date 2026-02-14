# Vercel 部署检查清单

使用此清单确保部署过程顺利完成。

---

## 📋 部署前准备

### 数据库准备
- [ ] 阿里云 MySQL RDS 实例已创建
- [ ] 数据库名称已创建（如 `realsourcing`）
- [ ] 数据库用户已创建，权限已配置
- [ ] 白名单已配置（添加 `0.0.0.0/0` 允许 Vercel 访问）
- [ ] 数据库连接测试通过
  ```bash
  mysql -h your-host -u username -p database_name
  ```

### 数据库迁移
- [ ] 本地环境已配置 `DATABASE_URL`
- [ ] 数据库迁移已执行
  ```bash
  export DATABASE_URL="mysql://user:pass@host:3306/db"
  pnpm db:push
  ```
- [ ] 数据库表创建成功
  ```bash
  pnpm tsx scripts/db-verify.ts
  ```

### 第三方服务配置

#### 声网 Agora
- [ ] 声网账号已创建
- [ ] 项目已创建，获取以下信息：
  - [ ] `AGORA_APP_ID`
  - [ ] `AGORA_CERTIFICATE`
  - [ ] `AGORA_CUSTOMER_ID`
  - [ ] `AGORA_CUSTOMER_SECRET`

#### 阿里云 OSS
- [ ] OSS Bucket 已创建
- [ ] 访问密钥已创建：
  - [ ] `OSS_ACCESS_KEY_ID`
  - [ ] `OSS_ACCESS_KEY_SECRET`
- [ ] Bucket 信息已记录：
  - [ ] `OSS_BUCKET` (Bucket 名称)
  - [ ] `OSS_REGION` (如 `oss-cn-shenzhen`)
  - [ ] `OSS_ENDPOINT` (如 `https://oss-cn-shenzhen.aliyuncs.com`)

#### Manus OAuth
- [ ] Manus 应用已注册
- [ ] 获取以下信息：
  - [ ] `VITE_APP_ID`
  - [ ] `VITE_OAUTH_PORTAL_URL` (通常为 `https://oauth.manus.computer`)
  - [ ] `OWNER_OPEN_ID`

#### 支付服务（可选）
- [ ] 支付宝配置（如需要）：
  - [ ] `ALIPAY_APP_ID`
  - [ ] `ALIPAY_PRIVATE_KEY`
  - [ ] `ALIPAY_PUBLIC_KEY`
- [ ] 微信支付配置（如需要）：
  - [ ] `WECHAT_MERCHANT_ID`
  - [ ] `WECHAT_API_KEY`
  - [ ] `WECHAT_APP_ID`
  - [ ] `WECHAT_APP_SECRET`

### 代码准备
- [ ] 代码已推送到 GitHub 主分支
- [ ] 本地构建测试通过
  ```bash
  pnpm install
  pnpm build
  ```
- [ ] 本地运行测试通过
  ```bash
  pnpm dev
  # 访问 http://localhost:5173
  ```

---

## 🚀 Vercel 部署

### 项目导入
- [ ] 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] 点击 "New Project"
- [ ] 导入 `magicy565-web/RealSourcing` 仓库
- [ ] 项目名称已设置

### 构建配置
- [ ] Framework Preset: `Other`
- [ ] Build Command: `pnpm install && pnpm run build`
- [ ] Output Directory: `dist/public`
- [ ] Install Command: `pnpm install --frozen-lockfile`
- [ ] Node.js Version: `20.x`

### 环境变量配置

#### 核心配置
- [ ] `DATABASE_URL` (MySQL 连接字符串)
- [ ] `NODE_ENV` = `production`
- [ ] `APP_URL` (先用临时值，部署后更新)
- [ ] `JWT_SECRET` (至少 32 位随机字符串)

#### OAuth 配置
- [ ] `VITE_OAUTH_PORTAL_URL`
- [ ] `VITE_APP_ID`
- [ ] `OAUTH_SERVER_URL`
- [ ] `OWNER_OPEN_ID`

#### 声网配置
- [ ] `AGORA_APP_ID`
- [ ] `AGORA_CERTIFICATE`
- [ ] `AGORA_CUSTOMER_ID`
- [ ] `AGORA_CUSTOMER_SECRET`

#### 阿里云 OSS 配置
- [ ] `OSS_ACCESS_KEY_ID`
- [ ] `OSS_ACCESS_KEY_SECRET`
- [ ] `OSS_BUCKET`
- [ ] `OSS_REGION`
- [ ] `OSS_ENDPOINT`

#### 可选配置
- [ ] `CORS_ORIGIN` (与 `APP_URL` 相同)
- [ ] `ALIPAY_APP_ID` (如需支付功能)
- [ ] `WECHAT_MERCHANT_ID` (如需支付功能)
- [ ] `NOVA_API_KEY` (如需 AI 功能)

### 开始部署
- [ ] 点击 "Deploy" 按钮
- [ ] 等待构建完成（约 2-5 分钟）
- [ ] 部署成功，获取部署 URL

---

## ✅ 部署后验证

### 基础功能测试
- [ ] 访问部署 URL，前端页面正常加载
- [ ] 控制台无错误信息
- [ ] 静态资源（CSS、JS、图片）正常加载

### API 功能测试
- [ ] 访问 `https://your-domain.vercel.app/api/health`
- [ ] 返回 `{"status":"ok",...}`
- [ ] 登录功能测试（OAuth）
- [ ] 登录后能正常访问用户信息

### 核心功能测试
- [ ] 创建会议功能正常
- [ ] 音视频通话功能正常（Agora）
- [ ] 文件上传功能正常（OSS）
- [ ] 消息发送功能正常（RTM）
- [ ] 数据库读写正常

### 性能测试
- [ ] 首页加载时间 < 3 秒
- [ ] API 响应时间 < 1 秒
- [ ] 无明显性能问题

---

## 🔧 部署后配置

### 更新环境变量
- [ ] 更新 `APP_URL` 为实际部署域名
- [ ] 更新 `CORS_ORIGIN` 为实际部署域名
- [ ] 重新部署以应用更新

### 更新 OAuth 回调地址
- [ ] 在 Manus OAuth 后台更新回调地址
  ```
  https://your-actual-domain.vercel.app/api/oauth/callback
  ```

### 配置自定义域名（可选）
- [ ] 在 Vercel Dashboard 添加自定义域名
- [ ] 在域名服务商配置 DNS 记录
- [ ] 等待 DNS 生效（通常 5-30 分钟）
- [ ] 验证自定义域名可访问
- [ ] 更新环境变量中的 `APP_URL` 和 `CORS_ORIGIN`

---

## 📊 监控和维护

### 启用监控
- [ ] 启用 Vercel Analytics
- [ ] 配置 Sentry 错误追踪（可选）
- [ ] 设置告警规则

### 数据库维护
- [ ] 配置数据库自动备份
- [ ] 测试数据库恢复流程
- [ ] 监控数据库连接数

### 日志管理
- [ ] 查看 Vercel Functions 日志
- [ ] 配置日志保留策略
- [ ] 设置错误告警

---

## 🎯 优化建议

### 性能优化
- [ ] 启用 Vercel Edge Functions（部分 API）
- [ ] 配置静态资源缓存
- [ ] 优化图片加载（使用 Vercel Image Optimization）
- [ ] 实现 API 响应缓存

### 安全加固
- [ ] 配置 CSP (Content Security Policy)
- [ ] 启用 HTTPS 强制跳转
- [ ] 实现 API 限流
- [ ] 定期更新依赖包

### 用户体验
- [ ] 配置 PWA 支持
- [ ] 优化移动端体验
- [ ] 添加离线功能
- [ ] 实现骨架屏加载

---

## 📝 文档更新

- [ ] 更新项目 README.md，添加部署说明
- [ ] 记录实际使用的环境变量值（敏感信息除外）
- [ ] 更新团队文档，记录部署流程
- [ ] 创建运维手册

---

## ✨ 完成标志

当以上所有核心检查项（标记为 ✅ 的必填项）都完成后，部署即告成功！

**部署完成日期**: _______________  
**部署人员**: _______________  
**部署环境**: _______________  
**部署 URL**: _______________

---

## 🆘 遇到问题？

参考以下文档：
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 部署配置总结

或提交 GitHub Issue 寻求帮助。
