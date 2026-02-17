# 🚀 RealSourcing 自动化部署配置指南

## 📋 前置准备

### 1. 在阿里云服务器上配置 Git

```bash
# SSH 到服务器
ssh root@47.99.205.136

# 进入项目目录
cd /var/www/realsourcing

# 初始化 Git 仓库（如果还没有）
git init
git remote add origin https://github.com/magicy565-web/RealSourcing.git

# 配置 Git 用户信息
git config user.name "Deploy Bot"
git config user.email "deploy@realsourcing.com"

# 拉取代码
git fetch origin
git checkout main
git pull origin main
```

### 2. 生成 SSH 部署密钥

```bash
# 在服务器上生成 SSH 密钥
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# 添加公钥到 authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 查看私钥（复制到 GitHub Secrets）
cat ~/.ssh/github_deploy
```

### 3. 配置 GitHub Secrets

访问: https://github.com/magicy565-web/RealSourcing/settings/secrets/actions

添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|---|------|
| `DEPLOY_HOST` | `47.99.205.136` | 阿里云服务器 IP |
| `DEPLOY_USER` | `root` | SSH 用户名 |
| `DEPLOY_KEY` | `<私钥内容>` | 从上面生成的私钥 |
| `DEPLOY_PATH` | `/var/www/realsourcing` | 项目部署路径 |

**重要**: 复制私钥时，包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`

### 4. 配置 PM2

```bash
# 在服务器上安装 PM2（如果还没有）
npm install -g pm2

# 创建日志目录
mkdir -p /var/www/realsourcing/logs

# 使用 ecosystem.config.js 启动服务
cd /var/www/realsourcing
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置 PM2 开机自启
pm2 startup
```

---

## 🧪 测试自动部署

### 方法 1: 推送代码触发

```bash
# 在本地修改代码
echo "# Test deployment" >> README.md

# 提交并推送
git add .
git commit -m "test: trigger auto deployment"
git push origin main
```

### 方法 2: 手动触发

1. 访问: https://github.com/magicy565-web/RealSourcing/actions
2. 选择 "Deploy to Aliyun ECS" 工作流
3. 点击 "Run workflow"
4. 选择 `main` 分支
5. 点击 "Run workflow" 按钮

---

## 📊 监控部署状态

### 查看 GitHub Actions 日志

访问: https://github.com/magicy565-web/RealSourcing/actions

### 查看服务器日志

```bash
# SSH 到服务器
ssh root@47.99.205.136

# 查看 PM2 状态
pm2 status

# 查看实时日志
pm2 logs realsourcing-api

# 查看最近 50 行日志
pm2 logs realsourcing-api --lines 50

# 只查看错误日志
pm2 logs realsourcing-api --err
```

---

## 🔧 故障排查

### 问题 1: GitHub Actions 连接服务器失败

**错误信息**: `Permission denied (publickey)`

**解决方案**:
1. 检查 `DEPLOY_KEY` Secret 是否正确配置
2. 确认私钥格式完整（包括开始和结束标记）
3. 验证服务器上的 `authorized_keys` 包含对应的公钥

```bash
# 在服务器上验证
cat ~/.ssh/authorized_keys | grep "github-actions-deploy"
```

### 问题 2: Git pull 失败

**错误信息**: `fatal: not a git repository`

**解决方案**:
```bash
# SSH 到服务器
ssh root@47.99.205.136

# 重新初始化 Git
cd /var/www/realsourcing
git init
git remote add origin https://github.com/magicy565-web/RealSourcing.git
git fetch origin
git reset --hard origin/main
```

### 问题 3: PM2 重启失败

**错误信息**: `[PM2][ERROR] Process realsourcing-api not found`

**解决方案**:
```bash
# 使用 ecosystem.config.js 启动
cd /var/www/realsourcing
pm2 start ecosystem.config.js

# 保存配置
pm2 save
```

### 问题 4: API 健康检查失败

**可能原因**:
1. 服务启动需要更多时间
2. 端口被占用
3. 环境变量配置错误

**解决方案**:
```bash
# 检查端口占用
netstat -tlnp | grep 3001

# 检查 PM2 日志
pm2 logs realsourcing-api --lines 100

# 手动测试 API
curl http://localhost:3001/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D
```

---

## 🔄 回滚部署

如果新版本有问题，可以快速回滚：

```bash
# SSH 到服务器
ssh root@47.99.205.136

# 进入项目目录
cd /var/www/realsourcing

# 查看最近的提交
git log --oneline -10

# 回滚到指定提交
git reset --hard <commit-hash>

# 重启服务
pm2 restart realsourcing-api

# 验证
pm2 logs realsourcing-api
```

---

## ✅ 部署成功验证

部署成功后，验证以下项目：

### 1. 服务状态
```bash
pm2 status
# 应该显示 realsourcing-api 状态为 online
```

### 2. API 可访问性
```bash
curl http://47.99.205.136:3001/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D
# 应该返回 JSON 数据
```

### 3. 前端连接
访问: https://real-sourcing.vercel.app
- 检查是否能看到 webinar 列表
- 验证数据是否正确显示

---

## 📚 相关命令速查

### Git 操作
```bash
git status                    # 查看状态
git log --oneline -10        # 查看最近 10 次提交
git reset --hard origin/main # 强制同步远程
```

### PM2 操作
```bash
pm2 list                     # 列出所有进程
pm2 restart realsourcing-api # 重启服务
pm2 stop realsourcing-api    # 停止服务
pm2 delete realsourcing-api  # 删除进程
pm2 logs                     # 查看所有日志
pm2 monit                    # 监控面板
```

### 系统操作
```bash
netstat -tlnp | grep 3001    # 检查端口
ps aux | grep node           # 查看 Node 进程
df -h                        # 检查磁盘空间
free -h                      # 检查内存
```

---

## 🎯 下一步优化

- [ ] 添加自动化测试到 CI/CD
- [ ] 配置部署通知（钉钉/企业微信）
- [ ] 设置多环境部署（dev/staging/prod）
- [ ] 配置性能监控和告警
- [ ] 实现蓝绿部署或金丝雀发布

---

**维护人员**: Manus AI Agent  
**创建日期**: 2026-02-17  
**最后更新**: 2026-02-17
