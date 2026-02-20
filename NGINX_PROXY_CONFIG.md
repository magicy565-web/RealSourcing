# 阿里云 ECS Nginx 反向代理配置方案

**目标域名**: `api.cnsubscribe.xyz`  
**后端服务**: `http://127.0.0.1:3001`  
**解决问题**: CORS 跨域、HTTPS 安全、带凭据请求

---

## 1️⃣ Nginx 站点配置

请在服务器上创建并编辑文件 `/etc/nginx/sites-available/api.cnsubscribe.xyz`：

```nginx
server {
    listen 80;
    server_name api.cnsubscribe.xyz;

    location / {
        # 允许跨域（配合后端 CORS 共同生效）
        add_header 'Access-Control-Allow-Origin' 'https://real-sourcing.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://real-sourcing.vercel.app' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # 反向代理到后端 3001 端口
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 启用配置
```bash
ln -s /etc/nginx/sites-available/api.cnsubscribe.xyz /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 2️⃣ 申请 SSL 证书 (HTTPS)

使用 Certbot 自动为域名申请证书并更新 Nginx 配置：

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.cnsubscribe.xyz
```

---

## 3️⃣ 阿里云安全组配置

确保在阿里云控制台开放以下端口：
- **80 (HTTP)**: 0.0.0.0/0
- **443 (HTTPS)**: 0.0.0.0/0
- **3001 (Node.js)**: 127.0.0.1 (本地访问即可，无需对外开放)

---

## 4️⃣ 后端 CORS 代码修复

在 `server/index.ts` 中，必须将 CORS 设置为允许特定源，而不是 `*`：

```typescript
// 修复后的后端代码
app.use(cors({
  origin: ['https://real-sourcing.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 5️⃣ 验证方法

配置完成后，使用以下命令验证：

```bash
curl -I https://api.cnsubscribe.xyz/health
```

如果看到 `HTTP/2 200` 且包含 `Access-Control-Allow-Origin` 头，说明配置成功。
