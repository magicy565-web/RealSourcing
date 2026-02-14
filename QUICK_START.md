# RealSourcing Vercel 部署快速开始

## 🚀 三步完成部署

### 步骤 1: 在 Vercel Dashboard 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"New Project"**
3. 选择 **"Import Git Repository"**
4. 选择 `magicy565-web/RealSourcing` 仓库
5. 点击 **"Import"**

### 步骤 2: 配置项目设置

在项目导入页面配置以下内容：

**Framework Preset**: `Other`

**Build & Development Settings**:
- **Build Command**: `pnpm install && pnpm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install --frozen-lockfile`

### 步骤 3: 配置环境变量

点击 **"Environment Variables"**，添加以下必需变量：

#### 最小配置（核心功能）

```bash
# 数据库
DATABASE_URL=mysql://user:pass@your-mysql-host:3306/realsourcing

# 应用
NODE_ENV=production
APP_URL=https://your-project.vercel.app
JWT_SECRET=your_secret_key_min_32_chars

# OAuth
VITE_OAUTH_PORTAL_URL=https://oauth.manus.computer
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=your_owner_open_id

# 声网
AGORA_APP_ID=your_agora_app_id
AGORA_CERTIFICATE=your_agora_certificate
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret

# 阿里云 OSS
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_REGION=oss-cn-shenzhen
OSS_ENDPOINT=https://oss-cn-shenzhen.aliyuncs.com
```

**重要提示**：
- `APP_URL` 需要在部署后更新为实际的 Vercel 域名
- 可以先使用临时值，部署后再更新

### 步骤 4: 部署

点击 **"Deploy"** 按钮开始部署。

---

## ✅ 部署后验证

部署完成后，访问 Vercel 提供的域名（如 `https://your-project.vercel.app`），验证：

1. ✅ 前端页面正常加载
2. ✅ 登录功能正常（OAuth）
3. ✅ API 请求正常响应

---

## 🔧 常见问题

### Q1: 部署失败，提示 "Build failed"

**解决方案**：
- 检查 Build Command 是否正确：`pnpm install && pnpm run build`
- 查看构建日志，定位具体错误

### Q2: 页面加载正常，但 API 请求失败

**解决方案**：
- 检查环境变量是否配置完整
- 验证 `DATABASE_URL` 是否正确
- 查看 Vercel Functions 日志

### Q3: 数据库连接失败

**解决方案**：
- 确认阿里云 MySQL 白名单包含 `0.0.0.0/0`
- 验证数据库用户名、密码、主机地址

---

## 📚 详细文档

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 部署配置总结
- [.env.vercel.example](./.env.vercel.example) - 完整环境变量列表

---

## 🆘 需要帮助？

如遇到问题，请：
1. 查看 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) 的故障排查章节
2. 查看 Vercel 部署日志
3. 提交 GitHub Issue
