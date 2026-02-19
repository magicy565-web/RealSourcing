

# RealSourcing 本地开发环境完整指南

**作者**: Manus AI
**版本**: 1.0
**日期**: 2026-02-19

---

## 1. 概述

本文档旨在提供一个完整的本地开发环境搭建指南，帮助您在本地高效地进行功能开发、测试和调试，并在测试通过后一键部署到 Vercel 生产环境。

**遵循本指南，您将能够**：
- 在本地运行完整的前后端项目
- 连接到真实的 RDS 数据库
- 在本地测试 Google OAuth 登录
- 开发和调试 Webinar 等复杂功能
- 掌握从本地到生产的安全部署流程

---

## 2. 本地开发环境搭建

### 2.1 必备工具

在开始之前，请确保您的本地开发机器已安装以下工具：

| 工具 | 用途 | 安装说明 |
|---|---|---|
| **Git** | 版本控制 | [https://git-scm.com/downloads](https://git-scm.com/downloads) |
| **Node.js** | JavaScript 运行环境 | **v18.x** 或更高版本，推荐使用 `nvm` 管理 [1] |
| **pnpm** | 高性能包管理器 | `npm install -g pnpm` [2] |
| **VS Code** | 代码编辑器 | [https://code.visualstudio.com/](https://code.visualstudio.com/) |

### 2.2 克隆项目到本地

打开终端（Terminal），执行以下命令：

```bash
# 1. 克隆项目
git clone https://github.com/magicy565-web/RealSourcing.git

# 2. 进入项目目录
cd RealSourcing
```

### 2.3 安装项目依赖

```bash
# 使用 pnpm 安装所有依赖
pnpm install
```

### 2.4 配置环境变量 (`.env`)

这是最关键的一步。在项目根目录创建一个名为 `.env` 的文件，并填入以下内容：

```bash
# 1. 数据库配置 (使用您的 RDS 外网地址)
DATABASE_URL="mysql://magicyang:Wysk1214@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/realsourcing"

# 2. JWT 密钥 (必须与生产环境一致)
JWT_SECRET="pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3"

# 3. 后端 API 地址 (本地开发时指向本地)
VITE_API_URL="http://localhost:3001/api/trpc"

# 4. Google OAuth (稍后在第 3 节配置)
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# 5. 其他配置 (从您的 vercel-vars.txt 中复制)
AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE=c9b17e2664044dfe8160140d7e581d89
VITE_AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
# ... 其他声网、阿里云、AI 配置
```

**重要**：
- `DATABASE_URL` 必须使用您的 RDS **外网地址**。
- `JWT_SECRET` 必须与 Vercel 和 ECS 上的配置完全一致。
- 将您之前提供的所有环境变量（如声网、阿里云、AI 等）全部复制到这个 `.env` 文件中。

### 2.5 启动本地开发服务器

项目配置为同时启动前端（Vite）和后端（Node.js）开发服务器。

打开终端，运行：

```bash
pnpm dev
```

**预期输出**：

```
> realsourcing@0.0.0 dev /path/to/RealSourcing
> concurrently "pnpm dev:client" "pnpm dev:server"

[dev:client] Vite dev server running at: http://localhost:3000
[dev:server] Server running on http://localhost:3001
```

现在，您可以：
- **访问前端页面**：`http://localhost:3000`
- **访问后端 API**：`http://localhost:3001`

---


## 3. Google OAuth 本地测试配置

为了在本地 (`localhost`) 测试 Google 登录，您需要在 Google Cloud Console 中添加一个额外的重定向 URI。

### 3.1 在 Google Cloud Console 添加本地重定向 URI

1. 访问 [Google Cloud Console - 凭据](https://console.cloud.google.com/apis/credentials)
2. 点击您的 OAuth 客户端：`RealSourcing Web Client`
3. 在 **"已获授权的重定向 URI"** 部分，点击 **"添加 URI"**
4. 添加以下 URI：
   ```
   http://localhost:3001/api/auth/google/callback
   ```
5. 点击 **"保存"**

### 3.2 在本地 `.env` 文件中配置 Google OAuth

打开您本地的 `.env` 文件，取消注释并填入 Google OAuth 凭据：

```bash
# Google OAuth (本地测试配置)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

### 3.3 测试本地 Google 登录

1. 确保您的本地开发服务器正在运行 (`pnpm dev`)
2. 打开浏览器，访问 `http://localhost:3000`
3. 找到并点击"使用 Google 登录"按钮
4. 完成授权后，应该能成功登录并跳转回 `http://localhost:3000`

---


## 4. Webinar 功能开发指南

根据您提供的报错信息和项目代码，Webinar 功能无法读取或测试，主要是因为**前端组件与后端 API 的数据流尚未完全打通**。

### 4.1 技术架构

Webinar 功能主要依赖以下技术：
- **Agora (声网)**: 提供实时音视频通话能力。
- **Netless (声网互动白板)**: 提供实时协作白板。
- **tRPC**: 用于前后端 API 通信。

### 4.2 开发步骤

#### 步骤 1：确认声网配置

确保您的 `.env` 文件中包含了正确的声网配置：

```bash
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
VITE_AGORA_APP_ID=...
# ... 其他声网配置
```

#### 步骤 2：检查前端 Webinar 页面

打开 `client/src/pages/Webinars.tsx`（或类似文件），检查：
- **tRPC 调用**：是否正确调用了后端的 `webinar.getById` 或 `webinar.list` 等 tRPC 查询？
- **状态管理**：是否正确处理了加载（loading）、错误（error）和成功（data）状态？
- **Agora SDK 初始化**：是否在获取到 webinar 信息（如频道名、token）后才初始化 Agora 客户端？

**示例代码片段 (Webinars.tsx)**：

```tsx
import { trpc } from "../utils/trpc";

function WebinarPage({ webinarId }) {
  const { data: webinar, isLoading, error } = trpc.webinar.getById.useQuery({ id: webinarId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!webinar) return <div>Webinar not found</div>;

  // 在这里初始化 Agora 和 Netless
  // const client = AgoraRTC.createClient(...);
  // ...

  return (
    <div>
      <h1>{webinar.title}</h1>
      {/* 视频和白板组件 */}
    </div>
  );
}
```

#### 步骤 3：检查后端 Webinar 路由

打开 `server/routers/webinar.router.ts`，检查：
- **数据库查询**：`getById` 和 `list` 等路由是否能正确从数据库查询数据？
- **Token 生成**：创建或加入 webinar 时，是否正确调用了声网的 API 来生成 RTC 和 RTM token？

### 4.3 调试技巧

- **浏览器开发者工具**：打开浏览器的"网络"（Network）选项卡，筛选 `trpc` 请求，查看请求是否成功，返回的数据是否正确。
- **后端日志**：在 `pnpm dev` 的终端输出中，查看是否有与 webinar 相关的数据库查询错误或声网 API 调用错误。

---



---


## 5. 生产部署流程

当您在本地完成开发和测试后，可以按照以下流程将代码安全地部署到 Vercel 生产环境。

### 5.1 推送代码到 GitHub

这是触发自动部署的唯一操作。

```bash
# 1. 检查代码状态
git status

# 2. 添加所有修改过的文件
git add .

# 3. 提交代码并撰写清晰的提交信息
git commit -m "feat: 完成了 Webinar 功能的开发"

# 4. 推送到 GitHub 主分支
git push origin main
```

### 5.2 Vercel 自动部署

- **自动触发**：当您推送到 `main` 分支后，Vercel 会自动拉取最新代码并开始构建和部署。
- **查看进度**：您可以在 Vercel 控制台的 **Deployments** 页面查看实时部署进度。
- **部署完成**：部署成功后，Vercel 会为本次部署生成一个唯一的 URL，并将生产域名（`real-sourcing.vercel.app`）指向最新的部署。

### 5.3 验证生产环境

1. **访问生产域名**：`https://real-sourcing.vercel.app`
2. **测试核心功能**：
   - Google 登录是否正常？
   - 新开发的 Webinar 功能是否按预期工作？
   - 关键页面是否能正常加载？
3. **检查 Vercel 日志**：如果在生产环境遇到问题，可以访问 Vercel 控制台的 **Logs** 页面，查看实时日志以定位问题。

---

## 6. 参考文献

[1] NVM (Node Version Manager). [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
[2] pnpm. [https://pnpm.io/](https://pnpm.io/)

