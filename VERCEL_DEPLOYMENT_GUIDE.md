# Vercel 前端部署指南

## 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

### 当前配置（HTTP - 临时）

```
VITE_API_URL=http://47.99.205.136/api/trpc
```

### SSL 生效后的配置（HTTPS - 最终）

```
VITE_API_URL=https://api.cnsubscribe.xyz/api/trpc
```

## 配置步骤

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com
   - 选择 RealSourcing 项目

2. **添加环境变量**
   - 进入 Settings → Environment Variables
   - 添加新变量：
     - Name: `VITE_API_URL`
     - Value: `http://47.99.205.136/api/trpc`
     - Environment: Production, Preview, Development（全选）
   - 点击 Save

3. **重新部署**
   - 进入 Deployments 页面
   - 点击最新部署右侧的 "..." 菜单
   - 选择 "Redeploy"
   - 或者推送新的 commit 触发自动部署

## 代码更改说明

已更新以下文件：

### `/client/src/main.tsx`
```typescript
// 新增：从环境变量读取 API URL
const apiUrl = import.meta.env.VITE_API_URL || "/api/trpc";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,  // 使用环境变量
      // ...
    }),
  ],
});
```

### `/.env.production`
```
VITE_API_URL=http://47.99.205.136/api/trpc
```

这个文件会在 Vercel 构建时被读取（如果没有在 Vercel 设置环境变量）。

## 验证部署

部署完成后，访问前端网站并检查：

1. **打开浏览器开发者工具**
   - 按 F12 打开控制台
   - 切换到 Network 标签

2. **访问需要 API 的页面**
   - 例如：Webinars 列表页面
   - 查看 Network 请求

3. **检查 API 请求地址**
   - 应该看到请求发送到：`http://47.99.205.136/api/trpc/...`
   - 而不是相对路径 `/api/trpc/...`

4. **检查响应**
   - 如果返回认证错误（401）：正常，说明 API 连接成功
   - 如果返回数据：完美，说明一切正常
   - 如果返回 CORS 错误：需要在后端添加 CORS 配置

## CORS 配置（如果需要）

如果出现 CORS 错误，需要在 ECS 服务器上配置：

### 方法 1：在 Nginx 添加 CORS 头

编辑 `/etc/nginx/sites-available/api.cnsubscribe.xyz`：

```nginx
location / {
    # 添加 CORS 头
    add_header Access-Control-Allow-Origin "https://your-vercel-domain.vercel.app" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # 处理 OPTIONS 预检请求
    if ($request_method = OPTIONS) {
        return 204;
    }
    
    proxy_pass http://localhost:3001;
    # ... 其他配置
}
```

### 方法 2：在 Node.js 后端添加 CORS

编辑 `/var/www/realsourcing/server/_core/index.ts`：

```typescript
import cors from 'cors';

const app = express();

// 添加 CORS 中间件
app.use(cors({
  origin: [
    'https://your-vercel-domain.vercel.app',
    'http://localhost:5173',  // 本地开发
  ],
  credentials: true,
}));
```

## SSL 证书生效后的更新

一旦 SSL 证书申请成功（检查 `/var/log/ssl-apply.log`），执行以下步骤：

1. **更新 Vercel 环境变量**
   ```
   VITE_API_URL=https://api.cnsubscribe.xyz/api/trpc
   ```

2. **重新部署**
   - 推送新 commit 或手动触发重新部署

3. **验证 HTTPS 连接**
   - 检查浏览器地址栏是否显示安全锁
   - 确认 API 请求使用 HTTPS

## 故障排除

### 问题 1：API 请求失败
- **症状**：Network 错误，无法连接
- **解决**：
  1. 检查 ECS 服务器状态：`pm2 status`
  2. 检查 Nginx 状态：`systemctl status nginx`
  3. 测试 API：`curl http://47.99.205.136/api/trpc/auth.me`

### 问题 2：CORS 错误
- **症状**：浏览器控制台显示 CORS policy 错误
- **解决**：参考上面的 CORS 配置章节

### 问题 3：认证失败
- **症状**：所有请求返回 401 Unauthorized
- **解决**：
  1. 检查 cookie 设置（credentials: "include"）
  2. 确认后端 session 配置正确
  3. 检查域名和 cookie domain 设置

### 问题 4：环境变量未生效
- **症状**：仍然请求相对路径 `/api/trpc`
- **解决**：
  1. 确认 Vercel 环境变量已保存
  2. 重新部署（不是重新运行，而是重新构建）
  3. 检查构建日志中的环境变量

## 本地测试

在推送到 Vercel 之前，可以本地测试：

```bash
# 1. 设置环境变量
export VITE_API_URL=http://47.99.205.136/api/trpc

# 2. 构建生产版本
pnpm build

# 3. 预览构建结果
pnpm preview

# 4. 访问 http://localhost:4173 测试
```

## 监控和日志

### Vercel 部署日志
- Vercel Dashboard → Deployments → 选择部署 → View Function Logs

### ECS 后端日志
```bash
# PM2 日志
pm2 logs realsourcing-api

# Nginx 访问日志
tail -f /var/log/nginx/api.access.log

# Nginx 错误日志
tail -f /var/log/nginx/api.error.log
```

## 下一步

1. ✅ 更新代码（已完成）
2. ⏳ 配置 Vercel 环境变量
3. ⏳ 重新部署前端
4. ⏳ 测试前后端连接
5. ⏳ 等待 SSL 证书生效
6. ⏳ 更新为 HTTPS URL
7. ⏳ 最终测试和验证
