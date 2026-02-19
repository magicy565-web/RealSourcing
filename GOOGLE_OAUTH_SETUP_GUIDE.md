# Google OAuth 登录配置指南

## 📋 概述

本指南将帮助您为 RealSourcing 项目配置稳定的 Google OAuth 2.0 登录功能。

## 🎯 解决的问题

- ✅ **稳定性**：替换不稳定的自定义登录系统
- ✅ **安全性**：使用 Google 官方 OAuth 2.0 协议
- ✅ **用户体验**：一键登录，无需记住密码
- ✅ **可维护性**：标准化的认证流程

## 🚀 快速开始

### 第一步：在 Google Cloud Console 创建 OAuth 凭据

1. **访问 Google Cloud Console**
   - 打开 [Google Cloud Console](https://console.cloud.google.com/)
   - 使用您的 Google 账号登录

2. **创建或选择项目**
   - 点击顶部导航栏的项目选择器
   - 点击"新建项目"
   - 项目名称：`RealSourcing`
   - 点击"创建"

3. **启用 Google+ API**
   - 在左侧菜单选择"API 和服务" → "库"
   - 搜索"Google+ API"
   - 点击"启用"

4. **配置 OAuth 同意屏幕**
   - 在左侧菜单选择"API 和服务" → "OAuth 同意屏幕"
   - 用户类型选择"外部"（如果您的 Google Workspace 账号可以选择"内部"）
   - 点击"创建"
   - 填写应用信息：
     - **应用名称**：`RealSourcing`
     - **用户支持电子邮件**：您的邮箱
     - **应用徽标**：（可选）上传您的 Logo
     - **应用首页**：`https://real-sourcing.vercel.app`
     - **应用隐私政策链接**：`https://real-sourcing.vercel.app/privacy`
     - **应用服务条款链接**：`https://real-sourcing.vercel.app/terms`
     - **授权网域**：
       - `vercel.app`
       - `manus.computer`（如果需要在 Manus 环境测试）
       - 您的自定义域名（如果有）
     - **开发者联系信息**：您的邮箱
   - 点击"保存并继续"

5. **添加作用域（Scopes）**
   - 点击"添加或移除作用域"
   - 选择以下作用域：
     - `openid`
     - `email`
     - `profile`
   - 点击"更新" → "保存并继续"

6. **添加测试用户（开发阶段）**
   - 在"测试用户"页面，点击"添加用户"
   - 输入您的测试邮箱地址
   - 点击"保存并继续"

7. **创建 OAuth 2.0 客户端 ID**
   - 在左侧菜单选择"API 和服务" → "凭据"
   - 点击"创建凭据" → "OAuth 客户端 ID"
   - 应用类型：选择"Web 应用"
   - 名称：`RealSourcing Web Client`
   - **已获授权的 JavaScript 来源**：
     ```
     http://localhost:3000
     http://localhost:5173
     https://real-sourcing.vercel.app
     https://47.99.205.136:3000
     ```
   - **已获授权的重定向 URI**：
     ```
     http://localhost:3000/api/auth/google/callback
     http://localhost:5173/api/auth/google/callback
     https://real-sourcing.vercel.app/api/auth/google/callback
     http://47.99.205.136:3000/api/auth/google/callback
     ```
   - 点击"创建"

8. **保存凭据**
   - 创建成功后，会弹出对话框显示：
     - **客户端 ID**：`xxxxx.apps.googleusercontent.com`
     - **客户端密钥**：`GOCSPX-xxxxx`
   - **重要**：立即复制并保存这两个值！

---

### 第二步：配置环境变量

#### 本地开发环境

编辑 `.env` 文件，添加以下配置：

```bash
# Google OAuth 配置
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-你的客户端密钥
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# 前端 API 地址（确保正确）
VITE_API_URL=http://localhost:3000/api/trpc
```

#### 生产环境（ECS 服务器）

SSH 登录到您的 ECS 服务器：

```bash
ssh root@47.99.205.136
```

编辑 `.env` 文件：

```bash
cd /path/to/RealSourcing
nano .env
```

添加以下配置：

```bash
# Google OAuth 配置
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-你的客户端密钥
GOOGLE_REDIRECT_URI=http://47.99.205.136:3000/api/auth/google/callback

# 或者使用域名（如果已配置）
# GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
```

#### Vercel 部署环境

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的 `RealSourcing` 项目
3. 进入"Settings" → "Environment Variables"
4. 添加以下变量：

| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_CLIENT_ID` | `你的客户端ID.apps.googleusercontent.com` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-你的客户端密钥` | Production, Preview, Development |
| `GOOGLE_REDIRECT_URI` | `https://real-sourcing.vercel.app/api/auth/google/callback` | Production |

5. 点击"Save"
6. 重新部署项目

---

### 第三步：更新前端登录页面

编辑 `client/src/pages/Login.tsx`（或您的登录页面组件）：

```tsx
import { GoogleLoginButton, GoogleLoginCard } from '../components/GoogleLoginButton';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <GoogleLoginCard
        showTraditionalLogin={true}
        traditionalLoginForm={
          <form onSubmit={handleTraditionalLogin}>
            {/* 您现有的邮箱+密码登录表单 */}
          </form>
        }
      />
    </div>
  );
}
```

或者只使用 Google 登录按钮：

```tsx
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">登录到 RealSourcing</h1>
        <GoogleLoginButton fullWidth />
      </div>
    </div>
  );
}
```

---

### 第四步：部署并测试

#### 本地测试

1. **启动后端服务器**：
   ```bash
   cd /path/to/RealSourcing
   pnpm install
   pnpm run dev
   ```

2. **启动前端开发服务器**（如果是分离的）：
   ```bash
   cd client
   pnpm run dev
   ```

3. **访问登录页面**：
   ```
   http://localhost:5173/login
   ```

4. **点击"使用 Google 登录"按钮**

5. **预期流程**：
   - 跳转到 Google 登录页面
   - 选择或登录 Google 账号
   - 授权 RealSourcing 访问您的基本信息
   - 自动跳转回您的应用
   - 登录成功，Cookie 已设置

#### 生产环境测试

1. **部署到 ECS**：
   ```bash
   ssh root@47.99.205.136
   cd /path/to/RealSourcing
   git pull origin main
   pnpm install
   pm2 restart realsourcing
   ```

2. **访问**：
   ```
   http://47.99.205.136:3000/login
   ```

3. **测试 Google 登录流程**

---

## 🔧 故障排查

### 问题 1：重定向 URI 不匹配

**错误信息**：
```
Error 400: redirect_uri_mismatch
```

**解决方案**：
1. 检查 Google Cloud Console 中配置的重定向 URI 是否与代码中的完全一致
2. 确保没有多余的斜杠 `/`
3. 协议（http/https）必须匹配

### 问题 2：客户端 ID 未配置

**错误信息**：
```
[Google OAuth] Missing configuration
```

**解决方案**：
1. 检查 `.env` 文件是否正确配置
2. 重启服务器以加载新的环境变量
3. 使用 `console.log(process.env.GOOGLE_CLIENT_ID)` 验证

### 问题 3：Cookie 未设置

**症状**：登录后仍然显示未登录状态

**解决方案**：
1. 检查浏览器控制台的 Network 标签
2. 确认 `/api/auth/google/callback` 响应中包含 `Set-Cookie` 头
3. 检查 Cookie 的 `SameSite` 和 `Secure` 属性设置
4. 如果是跨域，确保 CORS 配置正确

### 问题 4：CORS 错误

**错误信息**：
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

**解决方案**：
编辑 `server/_core/index.ts`，确保 CORS 配置正确：

```typescript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://real-sourcing.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // ... 其他配置
});
```

---

## 📊 登录流程图

```
用户点击"Google登录"按钮
         ↓
前端跳转到 /api/auth/google
         ↓
后端生成授权URL并重定向到Google
         ↓
用户在Google页面登录并授权
         ↓
Google重定向到 /api/auth/google/callback?code=xxx
         ↓
后端使用code交换access_token
         ↓
后端使用access_token获取用户信息
         ↓
后端在数据库中创建/更新用户
         ↓
后端生成JWT并设置Cookie
         ↓
重定向到前端首页（已登录状态）
```

---

## 🔐 安全最佳实践

1. **永远不要在前端暴露 `GOOGLE_CLIENT_SECRET`**
   - 只在后端使用
   - 添加到 `.gitignore`

2. **使用 HTTPS**
   - 生产环境必须使用 HTTPS
   - Cookie 的 `Secure` 属性在 HTTPS 下自动启用

3. **验证 State 参数**
   - 防止 CSRF 攻击
   - 代码中已实现

4. **定期轮换密钥**
   - 每 6 个月更换一次 `GOOGLE_CLIENT_SECRET`

5. **限制作用域**
   - 只请求必要的权限（openid, email, profile）

---

## 📚 相关文档

- [Google OAuth 2.0 官方文档](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

## ✅ 完成检查清单

- [ ] 在 Google Cloud Console 创建 OAuth 凭据
- [ ] 配置 OAuth 同意屏幕
- [ ] 添加授权的重定向 URI
- [ ] 复制并保存 Client ID 和 Client Secret
- [ ] 在 `.env` 文件中配置环境变量
- [ ] 更新前端登录页面
- [ ] 本地测试 Google 登录流程
- [ ] 部署到生产环境
- [ ] 生产环境测试
- [ ] 发布 OAuth 应用（从"测试"状态改为"已发布"）

---

## 🆘 需要帮助？

如果遇到问题，请检查：
1. 浏览器控制台的错误信息
2. 服务器日志（`pm2 logs` 或 `pnpm run dev` 的输出）
3. Google Cloud Console 的 OAuth 配置

---

**祝您配置顺利！🎉**
