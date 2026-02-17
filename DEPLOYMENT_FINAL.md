# 🚀 RealSourcing 长期部署方案

## ✅ 已完成的工作

### 1. 生产级架构
- ✅ Nginx 反向代理配置
- ✅ 域名 DNS 配置 (api.cnsubscribe.xyz)
- ✅ 安全组配置（仅开放 80/443/22）
- ✅ PM2 进程管理

### 2. 自动化部署脚本
- ✅ 带健康检查的部署脚本 (`deploy.sh`)
- ✅ 自动回滚机制
- ✅ 备份机制

### 3. 前端配置
- ✅ Vercel 自动部署
- ✅ API 端点配置

---

## 🔧 立即执行：部署最新代码

### 方法 1: SSH 手动部署（推荐）

```bash
# 1. SSH 登录
ssh root@47.99.205.136

# 2. 进入项目目录
cd /var/www/realsourcing

# 3. 下载部署脚本
curl -o deploy.sh https://raw.githubusercontent.com/magicy565-web/RealSourcing/main/deploy.sh
chmod +x deploy.sh

# 4. 执行部署
bash deploy.sh
```

### 方法 2: 一键命令

```bash
ssh root@47.99.205.136 "cd /var/www/realsourcing && git pull origin main && pm2 restart realsourcing-api"
```

---

## 🔄 长期方案：自动化部署

### 选项 A: Cron 定时检查（已准备好）

在服务器上执行：

```bash
ssh root@47.99.205.136

# 创建自动更新脚本
cat > /var/www/realsourcing/auto-update.sh << 'EOF'
#!/bin/bash
cd /var/www/realsourcing
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date)] 检测到新代码，开始部署..."
    bash /var/www/realsourcing/deploy.sh
fi
EOF

chmod +x /var/www/realsourcing/auto-update.sh

# 添加到 crontab (每5分钟检查一次)
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/realsourcing/auto-update.sh >> /var/log/realsourcing-auto-update.log 2>&1") | crontab -
```

**优点**:
- 简单可靠
- 无需额外服务
- 自动检测更新

**缺点**:
- 最多5分钟延迟

### 选项 B: GitHub Webhook（需要配置）

1. 在服务器上安装 webhook 服务
2. 配置 GitHub Webhook
3. 推送后立即部署

**优点**:
- 实时部署
- 更专业

**缺点**:
- 配置复杂
- 需要开放额外端口

---

## 📊 当前状态

| 组件 | 状态 | 说明 |
|------|------|------|
| Nginx | ✅ 运行中 | 反向代理正常 |
| PM2 | ✅ 运行中 | 进程管理正常 |
| DNS | ✅ 已配置 | api.cnsubscribe.xyz |
| 后端代码 | ⚠️ 待更新 | 需要执行部署脚本 |
| 前端 | ✅ 最新 | Vercel 自动部署 |
| 自动部署 | ⏳ 待配置 | 脚本已准备好 |

---

## 🎯 下一步操作

### 立即执行（5分钟）

```bash
# 复制这个命令直接执行
ssh root@47.99.205.136 << 'ENDSSH'
cd /var/www/realsourcing
git pull origin main
pm2 restart realsourcing-api
sleep 5
pm2 status
curl -s "http://localhost:3001/api/trpc/webinar.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D"
ENDSSH
```

### 配置自动化（10分钟）

执行上面"选项 A: Cron 定时检查"中的命令

---

## ✅ 验证成功

部署成功后，验证：

1. **后端 API**
   ```bash
   curl "http://47.99.205.136/api/trpc/webinar.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D"
   ```

2. **前端页面**
   访问: https://real-sourcing.vercel.app/webinars
   
   应该能看到 26 个 webinar 列表

---

**创建时间**: 2026-02-17  
**维护**: 自动化部署配置后无需手动维护
