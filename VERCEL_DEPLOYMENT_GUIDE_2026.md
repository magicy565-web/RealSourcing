# RealSourcing Vercel 部署指南 (2026-02-17)

本指南将帮助你将 RealSourcing 前端项目部署到 Vercel,并确保能够完美展示后端真实数据。

---

## 📋 部署前准备

### 1. 确认项目状态

✅ **代码已推送到 GitHub**: `magicy565-web/RealSourcing`  
✅ **前端构建成功**: 已通过 `pnpm run vercel-build` 测试  
✅ **后端服务运行**: 阿里云 ECS (47.99.205.136) 上的 API 服务  
✅ **数据库连接**: 阿里云 RDS MySQL 数据库  

### 2. 准备环境变量

你需要在 Vercel 项目设置中配置以下环境变量。**请从你提供的原始配置文件中获取实际的值。**

---

## 🚀 Vercel 部署步骤

### 步骤 1: 导入 GitHub 项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 选择 **"Import Git Repository"**
4. 选择 `magicy565-web/RealSourcing` 仓库
5. 点击 **"Import"**

### 步骤 2: 配置项目设置

#### 2.1 Framework Preset
- **Framework**: Vite
- **Root Directory**: `.` (保持默认)

#### 2.2 Build & Output Settings
```bash
Build Command: pnpm run vercel-build
Output Directory: dist/public
Install Command: pnpm install
```

#### 2.3 Node.js Version
- **Node.js Version**: 22.x (推荐)

### 步骤 3: 配置环境变量

在 **"Environment Variables"** 部分添加以下变量:

#### 🔐 数据库配置
```
DATABASE_URL = mysql://magicyang:Wysk1214@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/magicyang
```

#### 🎥 Agora 声网配置
```
VITE_AGORA_APP_ID = 0deed6e0ce284935b09babccaa5eb882
AGORA_APP_ID = 0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE = c9b17e2664044dfe8160140d7e581d89
AGORA_CUSTOMER_ID = f48e44adf06a425a869ebebd62e90ad2
AGORA_CUSTOMER_SECRET = fea9118eeff340b8b9f00a53f215883b
```

#### 🖼️ 阿里云 OSS 配置
```
VITE_OSS_BASE_URL = https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com
VITE_OSS_BUCKET = demand-os-discord
VITE_OSS_REGION = oss-cn-hangzhou
OSS_BUCKET = demand-os-discord
OSS_REGION = oss-cn-hangzhou
OSS_ENDPOINT = oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID = <Your-OSS-Access-Key-ID>
OSS_ACCESS_KEY_SECRET = <Your-OSS-Access-Key-Secret>
```

#### 📝 Netless 白板配置
```
VITE_NETLESS_APP_ID = An5FAAdKEfGBPUteaMCQZA/HawDYn5_ZHWEOg
VITE_NETLESS_SDK_TOKEN = NETLESSSDK_YWs9U1VSeGU2MFphNE5hX0xiUiZub25jZT03YmM0YjBhMC0wYTA4LTExZjEtYjhhMi04OTRhOGM2Zjc2MWMmcm9sZT0wJnNpZz0wNzZkMmFmMzE0YmNmMzdmMGU0ODA4YTM2OWIzNjk4NjlmNTc5ZjAxNzg5YmY1YmI2ZmY1OTMzYTA3YzI5M2Qw
NETLESS_APP_ID = An5FAAdKEfGBPUteaMCQZA/HawDYn5_ZHWEOg
NETLESS_AK = SURxe60Za4Na_LbR
NETLESS_SK = iSb7lL_rxn3rjIZJSVPdOiSm8Kzh1SmN
NETLESS_SDK_TOKEN = NETLESSSDK_YWs9U1VSeGU2MFphNE5hX0xiUiZub25jZT03YmM0YjBhMC0wYTA4LTExZjEtYjhhMi04OTRhOGM2Zjc2MWMmcm9sZT0wJnNpZz0wNzZkMmFmMzE0YmNmMzdmMGU0ODA4YTM2OWIzNjk4NjlmNTc5ZjAxNzg5YmY1YmI2ZmY1OTMzYTA3YzI5M2Qw
```

#### 🤖 AI 配置
```
OPENAI_API_KEY = sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM
OPENAI_BASE_URL = https://once.novai.su/v1
OPENAI_MODEL = [逆次]o4-mini
```

#### 🔧 应用配置
```
NODE_ENV = production
VITE_APP_ID = realsourcing-app
VITE_APP_NAME = RealSourcing
VITE_APP_ENV = production
```

**重要提示**: 
- 所有以 `VITE_` 开头的变量会被打包到前端代码中
- 不要在 `VITE_` 变量中放置敏感信息(如 AccessKey Secret)
- 确保所有变量的 **Environment** 设置为 **Production, Preview, Development**

### 步骤 4: 部署

1. 点击 **"Deploy"** 按钮
2. 等待构建完成 (大约 2-3 分钟)
3. 构建成功后,Vercel 会自动分配一个域名

---

## ✅ 部署后验证

### 1. 检查前端访问

访问 Vercel 分配的域名 (例如: `https://real-sourcing.vercel.app`)

**预期结果**:
- ✅ 页面正常加载
- ✅ 样式正确显示
- ✅ 导航栏功能正常

### 2. 检查 Webinar 列表

访问 `/webinars` 页面

**预期结果**:
- ✅ 显示来自数据库的真实 Webinar 数据
- ✅ 封面图片正确加载 (OSS 图片)
- ✅ 统计卡片显示正确的数量
- ✅ 搜索和筛选功能正常

### 3. 检查 Webinar 详情

点击任意 Webinar 卡片

**预期结果**:
- ✅ 详情页正确加载
- ✅ 封面图片显示
- ✅ 所有元数据正确显示
- ✅ 状态徽章正确

### 4. 检查 API 连接

打开浏览器开发者工具 (F12) → Network 标签

**预期结果**:
- ✅ `/api/trpc/webinar.listAll` 请求成功 (200 状态码)
- ✅ 返回的数据包含真实的 Webinar 信息
- ✅ 图片请求指向 OSS (demand-os-discord.oss-cn-hangzhou.aliyuncs.com)

---

## 🔍 常见问题排查

### 问题 1: 页面显示 "No webinars yet"

**可能原因**:
- API 请求失败
- 数据库连接问题
- 后端服务未运行

**排查步骤**:
1. 检查浏览器控制台是否有错误
2. 检查 Network 标签中的 API 请求状态
3. 确认后端服务 (47.99.205.136) 正在运行
4. 检查 `vercel.json` 中的 API 代理配置

### 问题 2: 图片不显示

**可能原因**:
- OSS 配置错误
- 图片路径不正确
- OSS Bucket 权限问题

**排查步骤**:
1. 检查 `VITE_OSS_BASE_URL` 环境变量是否正确
2. 确认 OSS Bucket 设置为 **"公共读"**
3. 在浏览器中直接访问图片 URL 测试
4. 检查 EnhancedImage 组件的路径处理逻辑

### 问题 3: API 请求返回 CORS 错误

**可能原因**:
- 后端 CORS 配置问题
- Vercel 代理配置错误

**解决方案**:
1. 检查 `vercel.json` 中的 rewrites 配置
2. 确认后端服务器允许来自 Vercel 域名的请求
3. 检查后端的 CORS 中间件配置

### 问题 4: 构建失败

**可能原因**:
- 依赖安装失败
- TypeScript 类型错误
- 环境变量缺失

**排查步骤**:
1. 查看 Vercel 构建日志
2. 确认所有必需的环境变量已配置
3. 本地运行 `pnpm run vercel-build` 测试

---

## 📊 性能优化建议

### 1. 启用 Vercel Analytics

在 Vercel 项目设置中启用 Analytics,监控:
- 页面加载时间
- Core Web Vitals
- 用户访问统计

### 2. 配置 CDN 缓存

在 `vercel.json` 中添加缓存配置:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. 启用图片优化

考虑使用 Vercel Image Optimization:
```typescript
import Image from 'next/image'; // 如果迁移到 Next.js
```

---

## 🔄 持续部署

### 自动部署

Vercel 已自动配置 GitHub 集成:

- ✅ **Push to main** → 自动部署到生产环境
- ✅ **Pull Request** → 自动创建预览部署
- ✅ **Commit** → 触发构建

### 手动部署

如需手动触发部署:

1. 访问 Vercel Dashboard
2. 选择 RealSourcing 项目
3. 点击 **"Deployments"** 标签
4. 点击 **"Redeploy"** 按钮

---

## 📝 部署检查清单

在宣布部署成功之前,请确认:

- [ ] ✅ 前端页面正常访问
- [ ] ✅ Webinar 列表显示真实数据
- [ ] ✅ 图片正确加载 (OSS)
- [ ] ✅ API 请求成功 (tRPC)
- [ ] ✅ 搜索和筛选功能正常
- [ ] ✅ Webinar 详情页正常
- [ ] ✅ 移动端响应式布局正常
- [ ] ✅ 无控制台错误
- [ ] ✅ 性能指标良好 (Lighthouse > 80)

---

## 🎉 部署成功!

恭喜!RealSourcing 前端已成功部署到 Vercel。

**下一步**:
1. 分享部署链接给团队
2. 开始添加真实的 Webinar 数据
3. 监控用户反馈和性能指标
4. 根据需要进行迭代优化

**支持资源**:
- [Vercel 文档](https://vercel.com/docs)
- [Vite 文档](https://vitejs.dev/)
- [tRPC 文档](https://trpc.io/)

---

**部署日期**: 2026-02-17  
**部署版本**: v1.0.0  
**前端优化**: 完成  
**状态**: ✅ 就绪
