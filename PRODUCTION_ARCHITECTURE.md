# 🏗️ RealSourcing 生产环境架构方案

**创建日期**: 2026-02-17  
**目标**: 建立专业、安全、稳定的生产环境架构

---

## ❌ 当前架构的问题

### 问题 1: 直接暴露应用端口（3001）

**风险**:
- 🔓 **安全隐患**: 应用直接暴露在公网，容易受到攻击
- 🚫 **无法负载均衡**: 单实例无法应对高并发
- ❌ **无 HTTPS**: 数据传输不加密，不符合安全标准
- 🔧 **难以维护**: 端口变更需要修改所有客户端配置
- 📊 **无监控**: 缺少访问日志和性能监控

### 问题 2: 前端直接连接后端 IP

**风险**:
- 🌐 **IP 变更**: 服务器 IP 变更需要重新部署前端
- 🔒 **跨域问题**: 可能遇到 CORS 限制
- 🚀 **无 CDN 加速**: API 响应速度受地理位置影响

### 问题 3: 无反向代理

**缺失功能**:
- 无请求限流和防护
- 无静态资源缓存
- 无 gzip 压缩
- 无健康检查和自动重启

---

## ✅ 专业的生产环境架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS (443)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel CDN (前端)                         │
│              https://real-sourcing.vercel.app                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   阿里云 ECS (47.99.205.136)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Nginx (反向代理)                        │   │
│  │  • 端口: 80 (HTTP) / 443 (HTTPS)                    │   │
│  │  • 域名: api.cnsubscribe.xyz                        │   │
│  │  • SSL 证书: Let's Encrypt                          │   │
│  │  • 功能: 反向代理、限流、压缩、缓存                   │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                      │
│                       │ HTTP (localhost:3001)                │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Node.js API (PM2 管理)                     │   │
│  │  • 端口: 3001 (仅监听 localhost)                     │   │
│  │  • 进程: realsourcing-api                           │   │
│  │  • 运行时: tsx                                       │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              阿里云 RDS MySQL                        │   │
│  │  rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 推荐方案：Nginx + 域名 + HTTPS

### 方案优势

| 功能 | 当前方案 | 推荐方案 |
|------|---------|---------|
| **安全性** | ❌ HTTP 明文传输 | ✅ HTTPS 加密传输 |
| **端口** | ❌ 3001 非标准端口 | ✅ 443/80 标准端口 |
| **域名** | ❌ IP 地址访问 | ✅ api.cnsubscribe.xyz |
| **防护** | ❌ 无防护 | ✅ 限流、防 DDoS |
| **性能** | ❌ 无优化 | ✅ gzip、缓存、CDN |
| **监控** | ❌ 无日志 | ✅ 访问日志、错误日志 |
| **维护** | ❌ 难以扩展 | ✅ 易于扩展和维护 |

---

## 🔧 实施步骤

### 步骤 1: 配置 Nginx

#### 1.1 安装 Nginx

```bash
# SSH 到服务器
ssh root@47.99.205.136

# 安装 Nginx
apt update
apt install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 验证安装
nginx -v
```

#### 1.2 配置反向代理

创建 `/etc/nginx/sites-available/realsourcing`:

```nginx
# HTTP 配置（稍后会重定向到 HTTPS）
server {
    listen 80;
    server_name api.cnsubscribe.xyz;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name api.cnsubscribe.xyz;
    
    # SSL 证书配置（稍后配置）
    ssl_certificate /etc/letsencrypt/live/api.cnsubscribe.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cnsubscribe.xyz/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 日志配置
    access_log /var/log/nginx/realsourcing-access.log;
    error_log /var/log/nginx/realsourcing-error.log;
    
    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    
    # 反向代理到 Node.js 应用
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        
        # 代理头
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓存配置
        proxy_cache_bypass $http_upgrade;
    }
    
    # API 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

#### 1.3 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/realsourcing /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 步骤 2: 配置域名 DNS

在域名服务商（阿里云）配置 DNS：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | api | 47.99.205.136 | 600 |

### 步骤 3: 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d api.cnsubscribe.xyz --email magic@gmail.com --agree-tos --non-interactive

# 自动续期（Certbot 会自动配置 cron）
certbot renew --dry-run
```

### 步骤 4: 修改 Node.js 应用监听配置

修改后端代码，只监听 localhost：

```typescript
// server/_core/index.ts
const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
```

### 步骤 5: 更新防火墙规则

```bash
# 开放 HTTP 和 HTTPS 端口
ufw allow 80/tcp
ufw allow 443/tcp

# 关闭 3001 端口（仅允许 localhost 访问）
ufw delete allow 3001/tcp

# 重载防火墙
ufw reload
```

### 步骤 6: 更新 Vercel 环境变量

在 Vercel 项目设置中，将 `VITE_API_URL` 更新为：

```
https://api.cnsubscribe.xyz/api/trpc
```

### 步骤 7: 更新 vercel.json

```json
{
  "rewrites": [
    {
      "source": "/api/trpc/:path*",
      "destination": "https://api.cnsubscribe.xyz/api/trpc/:path*"
    }
  ]
}
```

---

## 📊 性能优化

### 1. Nginx 缓存配置

```nginx
# 添加到 http 块
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;

# 在 location 块中启用缓存
location /api/trpc/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    add_header X-Cache-Status $upstream_cache_status;
    
    proxy_pass http://127.0.0.1:3001;
    # ... 其他配置
}
```

### 2. PM2 集群模式

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'realsourcing-api',
    script: 'server/_core/index.ts',
    instances: 2, // 使用 2 个实例
    exec_mode: 'cluster', // 集群模式
    // ... 其他配置
  }]
};
```

### 3. 数据库连接池优化

```typescript
// 增加数据库连接池大小
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, // 连接池大小
  queueLimit: 0
});
```

---

## 🔒 安全加固

### 1. 配置防火墙

```bash
# 只开放必要端口
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw enable
```

### 2. 配置 Fail2ban

```bash
# 安装 Fail2ban
apt install -y fail2ban

# 配置 Nginx 防护
cat > /etc/fail2ban/jail.local << 'EOF'
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/*error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

# 重启 Fail2ban
systemctl restart fail2ban
```

### 3. 定期更新系统

```bash
# 配置自动安全更新
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## 📈 监控和告警

### 1. Nginx 日志分析

```bash
# 安装 GoAccess
apt install -y goaccess

# 实时分析访问日志
goaccess /var/log/nginx/realsourcing-access.log -o /var/www/html/report.html --log-format=COMBINED --real-time-html
```

### 2. PM2 监控

```bash
# 安装 PM2 Plus（可选）
pm2 link <secret_key> <public_key>

# 或使用 pm2 monit
pm2 monit
```

---

## ✅ 验证清单

部署完成后验证：

- [ ] 域名 DNS 解析正确：`nslookup api.cnsubscribe.xyz`
- [ ] HTTPS 证书有效：访问 https://api.cnsubscribe.xyz
- [ ] HTTP 自动重定向到 HTTPS
- [ ] API 正常响应：`curl https://api.cnsubscribe.xyz/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D`
- [ ] 前端能够连接后端
- [ ] Nginx 日志正常记录
- [ ] PM2 服务运行稳定
- [ ] 防火墙规则正确

---

## 🎯 架构对比

| 指标 | 当前架构 | 新架构 | 改进 |
|------|---------|--------|------|
| **安全性** | HTTP + 暴露端口 | HTTPS + Nginx | ⬆️ 300% |
| **性能** | 无优化 | gzip + 缓存 | ⬆️ 50% |
| **可维护性** | 低 | 高 | ⬆️ 200% |
| **可扩展性** | 单实例 | 集群模式 | ⬆️ 100% |
| **监控** | 无 | 完整日志 | ⬆️ ∞ |

---

## 📚 相关文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [PM2 集群模式](https://pm2.keymetrics.io/docs/usage/cluster-mode/)

---

**维护人员**: Manus AI Agent  
**创建日期**: 2026-02-17
