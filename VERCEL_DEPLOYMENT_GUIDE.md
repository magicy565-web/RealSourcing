# RealSourcing Vercel 部署指南

> **版本**: v1.0  
> **更新日期**: 2026年2月14日  
> **部署架构**: 前后端分离（Vercel + 阿里云 MySQL）

---

## 📋 目录

1. [架构概述](#架构概述)
2. [部署前准备](#部署前准备)
3. [Vercel 部署步骤](#vercel-部署步骤)
4. [环境变量配置](#环境变量配置)
5. [数据库配置](#数据库配置)
6. [域名配置](#域名配置)
7. [故障排查](#故障排查)
8. [性能优化建议](#性能优化建议)

---

## 架构概述

### 部署架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel CDN + 边缘网络                      │
│  ┌──────────────────────┐    ┌──────────────────────────┐   │
│  │   静态前端资源        │    │  Serverless Functions    │   │
│  │  (React + Vite)      │    │  (Express + tRPC)        │   │
│  │  - HTML/CSS/JS       │    │  - /api/trpc/*           │   │
│  │  - 图片/字体          │    │  - /api/oauth/*          │   │
│  │  - 静态资源           │    │  - /api/webhooks/*       │   │
│  └──────────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │                      │
                     │                      ▼
                     │         ┌──────────────────────────┐
                     │         │   阿里云 MySQL 数据库     │
                     │         │  - 用户数据               │
                     │         │  - 会议数据               │
                     │         │  - 订阅数据               │
                     │         │  - 消息数据               │
                     │         └──────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────────┐
        │        第三方服务集成                 │
        │  - 声网 Agora (音视频)                │
        │  - 阿里云 OSS (文件存储)              │
        │  - 支付宝/微信支付                    │
        │  - Nova AI                           │
        └──────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 部署位置 |
|------|------|----------|
| 前端 | React 19 + Vite + TypeScript | Vercel CDN |
| 后端 API | Express + tRPC | Vercel Serverless Functions |
| 数据库 | MySQL 8.0 + Drizzle ORM | 阿里云 RDS MySQL |
| 文件存储 | 阿里云 OSS | 阿里云对象存储 |
| 实时通信 | Agora RTM/RTC SDK | 声网云服务 |

---

## 部署前准备

### 1. 环境要求

- **Node.js**: 18.x 或 20.x
- **pnpm**: 8.x 或更高版本
- **Git**: 用于版本控制
- **Vercel 账号**: 免费或付费账号
- **阿里云账号**: 用于 MySQL 和 OSS

### 2. 数据库准备

#### 2.1 阿里云 ECS MySQL 配置

由于你使用的是阿里云 ECS 云服务器自建 MySQL，请确保：

1. **MySQL 监听配置**：
   - 编辑 `/etc/mysql/mysql.conf.d/mysqld.cnf` (或类似路径)
   - 将 `bind-address` 设置为 `0.0.0.0` 以允许远程连接。
   - 重启 MySQL 服务：`sudo systemctl restart mysql`

2. **用户权限**：
   - 确保你的 MySQL 用户允许从远程 IP 登录：
     ```sql
     CREATE USER 'your_user'@'%' IDENTIFIED BY 'your_password';
     GRANT ALL PRIVILEGES ON realsourcing.* TO 'your_user'@'%';
     FLUSH PRIVILEGES;
     ```

#### 2.2 ECS 安全组配置

在阿里云 ECS 控制台中，你需要配置安全组规则：

1. **入方向规则**：
   - **协议类型**：TCP
   - **端口范围**：3306
   - **授权对象**：`0.0.0.0/0` (或者 Vercel 的 IP 段)**注意**：为了安全，建议使用 Vercel 的固定 IP 范围或配置 VPN。如果你的 ECS 有公网 IP，请确保 `DATABASE_URL` 使用该公网 IP。
#### 2.3 执行数据库迁移

在本地环境执行数据库初始化：

```bash
# 1. 配置数据库连接
export DATABASE_URL="mysql://username:password@host:3306/database"

# 2. 执行迁移
pnpm db:push

# 或手动执行 SQL
pnpm tsx scripts/db-init.ts
```

### 3. 第三方服务配置

确保已经获取以下服务的 API 密钥：

- **声网 Agora**: App ID、Certificate、Customer ID、Customer Secret
- **阿里云 OSS**: Access Key ID、Access Key Secret、Bucket、Region
- **支付宝**: App ID、私钥、公钥
- **微信支付**: Merchant ID、API Key、App ID、App Secret
- **Nova AI**: API Key
- **Manus OAuth**: App ID、OAuth Server URL

---

## Vercel 部署步骤

### 方式 1: 通过 Vercel CLI 部署（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
# 在项目根目录执行
cd /path/to/RealSourcing

# 首次部署（会引导配置）
vercel

# 生产环境部署
vercel --prod
```

### 方式 2: 通过 Vercel Dashboard 部署

#### 1. 导入 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"New Project"**
3. 选择 **"Import Git Repository"**
4. 授权并选择 `magicy565-web/RealSourcing` 仓库

#### 2. 配置项目设置

- **Framework Preset**: 选择 `Other`
- **Root Directory**: `.` (项目根目录)
- **Build Command**: `pnpm install && pnpm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install --frozen-lockfile`

#### 3. 配置环境变量

点击 **"Environment Variables"**，添加所有必需的环境变量（见下一节）。

#### 4. 部署

点击 **"Deploy"** 开始部署。

---

## 环境变量配置

### 在 Vercel Dashboard 中配置

进入项目设置 → **Environment Variables**，添加以下变量：

#### 前端环境变量（以 `VITE_` 开头）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_OAUTH_PORTAL_URL` | OAuth 认证服务器地址 | `https://oauth.manus.computer` |
| `VITE_APP_ID` | Manus 应用 ID | `your_app_id` |

#### 后端环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DATABASE_URL` | MySQL 数据库连接字符串 | ✅ |
| `NODE_ENV` | 运行环境 | ✅ |
| `APP_URL` | 应用访问地址 | ✅ |
| `JWT_SECRET` | JWT 加密密钥 | ✅ |
| `OAUTH_SERVER_URL` | OAuth 服务器地址 | ✅ |
| `OWNER_OPEN_ID` | 管理员 Open ID | ✅ |
| `AGORA_APP_ID` | 声网应用 ID | ✅ |
| `AGORA_CERTIFICATE` | 声网证书 | ✅ |
| `AGORA_CUSTOMER_ID` | 声网客户 ID | ✅ |
| `AGORA_CUSTOMER_SECRET` | 声网客户密钥 | ✅ |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS Access Key | ✅ |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS Secret Key | ✅ |
| `OSS_BUCKET` | OSS Bucket 名称 | ✅ |
| `OSS_REGION` | OSS 区域 | ✅ |
| `OSS_ENDPOINT` | OSS 访问端点 | ✅ |
| `ALIPAY_APP_ID` | 支付宝应用 ID | ⚠️ |
| `ALIPAY_PRIVATE_KEY` | 支付宝私钥 | ⚠️ |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥 | ⚠️ |
| `WECHAT_MERCHANT_ID` | 微信商户号 | ⚠️ |
| `WECHAT_API_KEY` | 微信 API 密钥 | ⚠️ |
| `NOVA_API_KEY` | Nova AI API 密钥 | ⚠️ |

**图标说明**：
- ✅ 必填项
- ⚠️ 可选项（根据功能需求）

### 环境变量配置示例

```bash
# 数据库
DATABASE_URL=mysql://user:pass@rm-xxxxx.mysql.rds.aliyuncs.com:3306/realsourcing

# 应用
NODE_ENV=production
APP_URL=https://your-domain.vercel.app
CORS_ORIGIN=https://your-domain.vercel.app
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# OAuth
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=your_owner_open_id

# 声网
AGORA_APP_ID=your_agora_app_id
AGORA_CERTIFICATE=your_agora_certificate
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret

# 阿里云 OSS
OSS_ACCESS_KEY_ID=LTAI5xxxxxxxxxxxxx
OSS_ACCESS_KEY_SECRET=your_secret_key
OSS_BUCKET=realsourcing-prod
OSS_REGION=oss-cn-shenzhen
OSS_ENDPOINT=https://oss-cn-shenzhen.aliyuncs.com
```

---

## 数据库配置

### 连接池优化

Vercel Serverless Functions 是无状态的，每次请求可能创建新的数据库连接。为避免连接数过多，建议：

#### 1. 使用连接池

在 `server/db.ts` 中已经实现了单例模式的数据库连接：

```typescript
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}
```

#### 2. 配置 MySQL 最大连接数

在阿里云 RDS 控制台中，调整 `max_connections` 参数：

```sql
-- 查看当前最大连接数
SHOW VARIABLES LIKE 'max_connections';

-- 建议设置为 500-1000（根据实例规格）
```

#### 3. 使用数据库代理（可选）

对于高并发场景，推荐使用 [PlanetScale](https://planetscale.com/) 或 [Neon](https://neon.tech/) 等支持 Serverless 的数据库服务。

---

## 域名配置

### 1. 添加自定义域名

在 Vercel Dashboard 中：

1. 进入项目设置 → **Domains**
2. 点击 **"Add"**
3. 输入域名（如 `www.realsourcing.com`）
4. 按照提示配置 DNS 记录

### 2. DNS 配置示例

在域名服务商（如阿里云、腾讯云）添加以下记录：

```
类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

### 3. 更新环境变量

域名配置完成后，更新以下环境变量：

```bash
APP_URL=https://www.realsourcing.com
CORS_ORIGIN=https://www.realsourcing.com
```

### 4. 配置 OAuth 回调地址

在 Manus OAuth 管理后台更新回调地址：

```
https://www.realsourcing.com/api/oauth/callback
```

---

## 故障排查

### 问题 1: 数据库连接失败

**错误信息**：
```
Error: connect ETIMEDOUT
```

**解决方案**：
1. 检查阿里云 RDS 白名单是否包含 `0.0.0.0/0`
2. 验证 `DATABASE_URL` 格式是否正确
3. 测试数据库连接：

```bash
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -u username -p
```

### 问题 2: API 请求 CORS 错误

**错误信息**：
```
Access to fetch at 'https://xxx/api/trpc' has been blocked by CORS policy
```

**解决方案**：
1. 确认 `CORS_ORIGIN` 环境变量设置正确
2. 检查 `vercel.json` 中的 headers 配置
3. 清除浏览器缓存并重新部署

### 问题 3: Serverless Function 超时

**错误信息**：
```
Function execution timed out after 10s
```

**解决方案**：
1. 在 `vercel.json` 中增加 `maxDuration`：

```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

2. 优化数据库查询性能
3. 考虑升级 Vercel 付费计划（免费版限制 10s）

### 问题 4: 环境变量未生效

**解决方案**：
1. 确认环境变量已在 Vercel Dashboard 中正确配置
2. 重新部署项目（环境变量更新需要重新部署）
3. 检查变量名是否正确（区分大小写）

### 问题 5: OAuth 登录失败

**解决方案**：
1. 检查 `VITE_OAUTH_PORTAL_URL` 和 `VITE_APP_ID` 是否正确
2. 确认回调地址 `https://your-domain.vercel.app/api/oauth/callback` 已在 Manus OAuth 后台配置
3. 检查 `JWT_SECRET` 是否配置

---

## 性能优化建议

### 1. 启用 Vercel Edge Network

Vercel 自动使用全球 CDN，无需额外配置。

### 2. 优化静态资源

```bash
# 在 vite.config.ts 中启用压缩
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
```

### 3. 数据库查询优化

- 使用索引加速查询
- 避免 N+1 查询问题
- 实现分页加载

### 4. 缓存策略

在 `vercel.json` 中配置缓存：

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

### 5. 监控和日志

- 使用 Vercel Analytics 监控性能
- 集成 Sentry 进行错误追踪
- 配置日志收集服务

---

## 后续维护

### 持续部署

每次推送到 GitHub 主分支，Vercel 会自动触发部署：

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

### 回滚部署

在 Vercel Dashboard 中：

1. 进入 **Deployments**
2. 选择之前的稳定版本
3. 点击 **"Promote to Production"**

### 数据库备份

定期备份数据库：

```bash
# 本地执行备份
export DATABASE_URL="mysql://..."
pnpm tsx scripts/db-backup.ts
```

---

## 总结

通过本指南，你应该能够成功将 RealSourcing 项目部署到 Vercel，实现前后端分离架构。关键要点：

✅ **前端**：静态资源托管在 Vercel CDN  
✅ **后端**：API 运行在 Vercel Serverless Functions  
✅ **数据库**：阿里云 MySQL RDS  
✅ **文件存储**：阿里云 OSS  
✅ **实时通信**：声网 Agora

如有问题，请参考 [Vercel 官方文档](https://vercel.com/docs) 或提交 GitHub Issue。

---

**文档版本**: v1.0  
**最后更新**: 2026-02-14  
**维护者**: RealSourcing Team
