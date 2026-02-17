# RealSourcing CI/CD 自动化部署方案

**创建日期**: 2026-02-17  
**目标**: 建立稳定、长期的自动化部署流程，确保代码更新后自动部署到生产环境

---

## 📋 当前问题

### 问题 1: 手动部署不可靠
- 代码推送到 GitHub 后，需要手动 SSH 到服务器拉取代码
- 容易忘记重启服务，导致新代码不生效
- 没有部署记录和回滚机制

### 问题 2: 前后端部署不同步
- 前端自动部署到 Vercel（✅ 已自动化）
- 后端需要手动部署到阿里云（❌ 未自动化）
- 导致前后端版本不匹配

### 问题 3: 环境配置不一致
- 本地开发环境和生产环境配置不同
- 容易出现"本地能跑，服务器不行"的问题

---

## 🎯 解决方案

### 方案 A: GitHub Actions + SSH 部署（推荐）

**优点**:
- ✅ 完全免费
- ✅ 与 GitHub 深度集成
- ✅ 配置简单，易于维护
- ✅ 支持自动回滚

**流程**:
```
代码推送到 GitHub
    ↓
GitHub Actions 自动触发
    ↓
SSH 连接到阿里云服务器
    ↓
拉取最新代码
    ↓
安装依赖（如有更新）
    ↓
重启 PM2 服务
    ↓
健康检查
    ↓
部署成功/失败通知
```

### 方案 B: Docker + 容器化部署

**优点**:
- ✅ 环境一致性好
- ✅ 易于扩展和迁移
- ✅ 支持多实例负载均衡

**缺点**:
- ❌ 需要学习 Docker
- ❌ 资源占用较大
- ❌ 配置复杂度高

### 方案 C: 使用 Vercel 部署全栈

**优点**:
- ✅ 前后端统一部署
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS

**缺点**:
- ❌ 需要迁移数据库到 Vercel 支持的数据库
- ❌ 有使用限制和费用
- ❌ 失去对服务器的完全控制

---

## ✅ 推荐方案：GitHub Actions 自动部署

### 架构图

```
┌─────────────────┐
│  开发者推送代码  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub 仓库     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  GitHub Actions                      │
│  ┌─────────────────────────────┐   │
│  │ 1. 检出代码                  │   │
│  │ 2. 测试（可选）              │   │
│  │ 3. SSH 连接阿里云            │   │
│  │ 4. 拉取最新代码              │   │
│  │ 5. 安装依赖                  │   │
│  │ 6. 重启服务                  │   │
│  │ 7. 健康检查                  │   │
│  └─────────────────────────────┘   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  阿里云 ECS (47.99.205.136)          │
│  ┌─────────────────────────────┐   │
│  │ /var/www/realsourcing        │   │
│  │ PM2: realsourcing-api        │   │
│  │ 端口: 3001                   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Vercel (前端)                       │
│  https://real-sourcing.vercel.app   │
└─────────────────────────────────────┘
```

---

## 🔧 实施步骤

### 步骤 1: 配置服务器 SSH 密钥

在阿里云服务器上生成部署密钥：

```bash
# SSH 到服务器
ssh root@47.99.205.136

# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# 添加公钥到 authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# 查看私钥（用于 GitHub Secrets）
cat ~/.ssh/github_deploy
```

### 步骤 2: 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|---|------|
| `DEPLOY_HOST` | `47.99.205.136` | 服务器 IP |
| `DEPLOY_USER` | `root` | SSH 用户名 |
| `DEPLOY_KEY` | `<私钥内容>` | SSH 私钥 |
| `DEPLOY_PATH` | `/var/www/realsourcing` | 部署路径 |

### 步骤 3: 创建 GitHub Actions 工作流

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Aliyun

on:
  push:
    branches:
      - main
  workflow_dispatch: # 允许手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 🔑 Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.DEPLOY_KEY }}
      
      - name: 🚀 Deploy to server
        env:
          HOST: ${{ secrets.DEPLOY_HOST }}
          USER: ${{ secrets.DEPLOY_USER }}
          PATH: ${{ secrets.DEPLOY_PATH }}
        run: |
          ssh -o StrictHostKeyChecking=no $USER@$HOST << 'EOF'
            set -e
            echo "📂 进入项目目录..."
            cd $PATH
            
            echo "📥 拉取最新代码..."
            git pull origin main
            
            echo "📦 安装依赖..."
            pnpm install --frozen-lockfile
            
            echo "🔄 重启 PM2 服务..."
            pm2 restart realsourcing-api
            
            echo "⏳ 等待服务启动..."
            sleep 5
            
            echo "🏥 健康检查..."
            pm2 status realsourcing-api
            
            echo "✅ 部署成功！"
          EOF
      
      - name: 🧪 API 健康检查
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.DEPLOY_HOST }}:3001/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D)
          if [ $response -eq 200 ]; then
            echo "✅ API 健康检查通过"
          else
            echo "❌ API 健康检查失败 (HTTP $response)"
            exit 1
          fi
```

### 步骤 4: 配置 PM2 生态系统文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'realsourcing-api',
    script: 'server/_core/index.ts',
    interpreter: 'tsx',
    cwd: '/var/www/realsourcing',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/www/realsourcing/logs/error.log',
    out_file: '/var/www/realsourcing/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

---

## 📊 部署监控

### 查看部署状态

```bash
# 查看 PM2 状态
pm2 status

# 查看实时日志
pm2 logs realsourcing-api

# 查看最近 100 行日志
pm2 logs realsourcing-api --lines 100

# 查看错误日志
pm2 logs realsourcing-api --err
```

### 回滚到上一个版本

```bash
# SSH 到服务器
ssh root@47.99.205.136

# 进入项目目录
cd /var/www/realsourcing

# 查看提交历史
git log --oneline -10

# 回滚到指定提交
git reset --hard <commit-hash>

# 重启服务
pm2 restart realsourcing-api
```

---

## 🔒 安全建议

### 1. 使用专用部署用户

不要使用 root 用户部署，创建专用用户：

```bash
# 创建部署用户
adduser deployer

# 添加到 sudo 组
usermod -aG sudo deployer

# 配置项目目录权限
chown -R deployer:deployer /var/www/realsourcing
```

### 2. 限制 SSH 访问

编辑 `/etc/ssh/sshd_config`：

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

### 3. 配置防火墙

```bash
# 只开放必要端口
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3001/tcp # API
ufw enable
```

---

## 📝 部署检查清单

部署前检查：
- [ ] 代码已推送到 GitHub main 分支
- [ ] GitHub Secrets 已正确配置
- [ ] 服务器 SSH 密钥已添加
- [ ] .env 文件已在服务器上配置
- [ ] 数据库连接正常

部署后验证：
- [ ] PM2 服务状态为 online
- [ ] API 健康检查通过
- [ ] 前端能够连接后端
- [ ] 数据能够正常读取
- [ ] 日志没有错误信息

---

## 🚨 故障排查

### 问题 1: GitHub Actions 部署失败

**检查**:
- GitHub Secrets 是否正确配置
- SSH 密钥是否有效
- 服务器网络是否正常

### 问题 2: PM2 重启后服务不可用

**检查**:
- 查看 PM2 日志：`pm2 logs realsourcing-api`
- 检查端口占用：`netstat -tlnp | grep 3001`
- 验证环境变量：`pm2 env 0`

### 问题 3: API 返回 404

**检查**:
- 代码是否真正更新：`git log -1`
- PM2 是否使用最新代码：`pm2 restart realsourcing-api`
- 路由配置是否正确

---

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [SSH 密钥配置](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## 🎯 下一步优化

1. **添加自动化测试**
   - 单元测试
   - 集成测试
   - E2E 测试

2. **配置蓝绿部署**
   - 零停机部署
   - 自动回滚

3. **监控和告警**
   - 性能监控
   - 错误追踪
   - 告警通知

4. **多环境支持**
   - 开发环境
   - 测试环境
   - 生产环境

---

**维护人员**: Manus AI Agent  
**最后更新**: 2026-02-17
