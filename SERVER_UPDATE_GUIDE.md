# 🔄 服务器代码更新指南

## 当前问题

前端显示"No webinars yet"，无法读取数据库中的 26 个 webinar。

**根本原因**: 服务器上的代码是旧版本，缺少 `webinar.listAll` 公开 API。

---

## 解决方案

### 方法 1: 使用更新脚本（推荐）

1. **下载更新脚本**
   - 脚本位置: `/home/ubuntu/update-server.sh`
   - 或从 GitHub 下载最新版本

2. **上传到服务器**
   ```bash
   scp update-server.sh root@47.99.205.136:/root/
   ```

3. **SSH 到服务器并执行**
   ```bash
   ssh root@47.99.205.136
   chmod +x /root/update-server.sh
   /root/update-server.sh
   ```

### 方法 2: 手动更新（简单直接）

```bash
# 1. SSH 到服务器
ssh root@47.99.205.136

# 2. 进入项目目录
cd /var/www/realsourcing

# 3. 拉取最新代码
git pull origin main

# 4. 重启服务
pm2 restart realsourcing-api

# 5. 验证
pm2 logs realsourcing-api --lines 20

# 6. 测试 API
curl "http://localhost:3001/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A3%7D%7D%7D"
```

---

## 验证步骤

### 1. 检查 API 是否正常

```bash
# 测试公开接口（不需要登录）
curl "http://47.99.205.136/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A3%7D%7D%7D"
```

**预期结果**: 返回 webinar 数据（JSON 格式）

### 2. 检查前端是否能读取数据

访问: https://real-sourcing.vercel.app/webinars

**预期结果**: 显示 26 个 webinar 列表

---

## 常见问题

### Q1: git pull 提示有本地修改

```bash
# 强制更新（会丢弃本地修改）
git reset --hard origin/main
git pull origin main
```

### Q2: PM2 重启失败

```bash
# 查看错误日志
pm2 logs realsourcing-api --err

# 停止并重新启动
pm2 stop realsourcing-api
pm2 start realsourcing-api
```

### Q3: API 仍然返回 404

```bash
# 检查代码是否真的更新了
cd /var/www/realsourcing
git log --oneline -5

# 检查 webinar router 文件
grep -n "listAll" server/routers/webinar.router.ts
```

---

## 完整的更新流程

```bash
# 1. SSH 登录
ssh root@47.99.205.136

# 2. 备份当前代码（可选）
cd /var/www
tar -czf realsourcing-backup-$(date +%Y%m%d).tar.gz realsourcing/

# 3. 更新代码
cd /var/www/realsourcing
git stash  # 保存本地修改
git pull origin main
git stash pop  # 恢复本地修改（如果有）

# 4. 重启服务
pm2 restart realsourcing-api

# 5. 等待服务启动
sleep 5

# 6. 查看日志
pm2 logs realsourcing-api --lines 30

# 7. 测试 API
curl -s "http://localhost:3001/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D" | python3 -m json.tool

# 8. 测试通过 Nginx
curl -s "http://47.99.205.136/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D" | python3 -m json.tool
```

---

## 成功标志

✅ `git pull` 成功  
✅ PM2 状态显示 `online`  
✅ API 返回 webinar 数据  
✅ 前端页面显示 webinar 列表  

---

**创建时间**: 2026-02-17  
**维护人员**: Manus AI Agent
