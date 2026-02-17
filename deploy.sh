#!/bin/bash

# RealSourcing 自动部署脚本
# 用于 GitHub Actions 或手动部署

set -e  # 遇到错误立即退出

echo "========================================="
echo "RealSourcing 自动部署开始"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# 进入项目目录
cd /var/www/realsourcing

# 备份当前版本
BACKUP_DIR="/var/backups/realsourcing"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "备份当前版本到: $BACKUP_FILE"
tar -czf $BACKUP_FILE --exclude=node_modules --exclude=.git .

# 拉取最新代码
echo "拉取最新代码..."
git fetch origin
git reset --hard origin/main

# 安装依赖（如果 package.json 有变化）
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo "检测到 package.json 变化，重新安装依赖..."
    pnpm install --prod
fi

# 重启服务
echo "重启 PM2 服务..."
pm2 restart realsourcing-api

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 健康检查
echo "执行健康检查..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "http://localhost:3001/api/trpc/webinar.listAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D" > /dev/null 2>&1; then
        echo "✅ 健康检查通过"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "健康检查失败，重试 $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ 健康检查失败，回滚到上一版本"
    tar -xzf $BACKUP_FILE -C /var/www/realsourcing
    pm2 restart realsourcing-api
    exit 1
fi

# 显示服务状态
echo "PM2 服务状态:"
pm2 status realsourcing-api

echo "========================================="
echo "✅ 部署成功完成"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="
