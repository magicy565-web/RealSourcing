# Vercel 环境变量配置指南

## 🔧 必需的环境变量

请在 Vercel 控制台（Settings -> Environment Variables）添加以下环境变量：

### 1. API 配置
```
VITE_API_URL=http://47.99.205.136:3001/api/trpc
```

### 2. 数据库配置（如果 Vercel 需要后端）
```
DATABASE_URL=mysql://<username>:<password>@<host>:3306/realsourcing
```

### 3. JWT 密钥
```
JWT_SECRET=<your_jwt_secret>
```

### 4. 声网配置
```
AGORA_APP_ID=<your_agora_app_id>
AGORA_APP_CERTIFICATE=<your_agora_certificate>
VITE_AGORA_APP_ID=<your_agora_app_id>
AGORA_CUSTOMER_ID=<your_agora_customer_id>
AGORA_CUSTOMER_SECRET=<your_agora_customer_secret>
```

### 5. AI 配置
```
OPENAI_API_KEY=<your_openai_api_key>
OPENAI_BASE_URL=https://once.novai.su/v1
OPENAI_MODEL=[逆次]o4-mini
```

### 6. 阿里云 OSS 配置
```
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=<your_oss_access_key_id>
OSS_ACCESS_KEY_SECRET=<your_oss_access_key_secret>
OSS_BUCKET=demand-os-discord
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

---

## 📝 配置步骤

### 方法 1: 通过 Vercel 控制台（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `RealSourcing` 项目
3. 进入 `Settings` -> `Environment Variables`
4. 逐个添加上述环境变量
5. 选择适用环境：`Production`, `Preview`, `Development`（建议全选）
6. 点击 `Save`
7. 重新部署项目（Deployments -> 最新部署 -> Redeploy）

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果尚未安装）
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd /path/to/RealSourcing

# 添加环境变量
vercel env add VITE_API_URL production
# 输入值: http://47.99.205.136:3001/api/trpc

# 重复以上步骤添加所有环境变量

# 重新部署
vercel --prod
```

---

## ⚠️ 重要提示

### 1. HTTPS 混合内容问题
由于 Vercel 部署是 HTTPS（`https://real-sourcing.vercel.app`），而后端 API 是 HTTP（`http://47.99.205.136:3001`），浏览器会阻止请求。

**解决方案**：
- **临时方案**: 在浏览器中允许不安全内容（不推荐生产环境）
- **永久方案**: 为阿里云服务器配置 HTTPS（推荐）

#### 为阿里云服务器配置 HTTPS（推荐）

1. **购买域名**（如果还没有）
2. **申请 SSL 证书**（可使用免费的 Let's Encrypt）
3. **配置 Nginx 反向代理**：
   ```nginx
   server {
       listen 443 ssl;
       server_name api.yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
4. **更新 Vercel 环境变量**：
   ```
   VITE_API_URL=https://api.yourdomain.com/api/trpc
   ```

### 2. CORS 配置
确保后端 API 允许来自 Vercel 域名的跨域请求。

在 `server/_core/index.ts` 中添加：
```typescript
app.use(cors({
  origin: ['https://real-sourcing.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### 3. Directus 已移除
Vercel 部署不再依赖 Directus CMS，所有数据通过 tRPC API 获取。

---

## ✅ 验证配置

部署后，访问 `https://real-sourcing.vercel.app` 并打开浏览器控制台：

1. **检查 API URL**：
   ```
   📡 API URL: http://47.99.205.136:3001/api/trpc
   ```

2. **检查网络请求**：
   - 应该向 `http://47.99.205.136:3001/api/trpc/...` 发送请求
   - 不应该再有 `api.cnsubscribe.xyz` 或 `admin.cnsubscribe.xyz` 的请求

3. **测试功能**：
   - 访问 `/webinars` 页面，应该能看到 Webinar 列表
   - 访问 `/factories` 页面，应该能看到工厂列表
   - 登录功能应该正常工作

---

## 🐛 故障排查

### 问题 1: 仍然向旧域名发送请求
**原因**: 环境变量未生效或缓存未清除  
**解决**: 
1. 确认环境变量已保存
2. 强制重新部署（Redeploy）
3. 清除浏览器缓存

### 问题 2: CORS 错误
**原因**: 后端未允许 Vercel 域名的跨域请求  
**解决**: 在后端添加 CORS 配置（见上文）

### 问题 3: 混合内容错误（HTTPS -> HTTP）
**原因**: 浏览器阻止 HTTPS 页面向 HTTP API 发送请求  
**解决**: 为后端配置 HTTPS（见上文）

---

## 📚 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Let's Encrypt 免费 SSL 证书](https://letsencrypt.org/)
