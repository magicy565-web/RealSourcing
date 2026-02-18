#!/bin/bash

# RealSourcing 一键部署与数据导入脚本 (2026-02-18)
# 用于在 ECS 服务器上拉取最新代码并导入 AI 爆款评分测试数据

echo "🚀 开始 RealSourcing 自动化部署..."

# 1. 进入项目目录
# 请根据实际情况修改路径，默认为当前目录
PROJECT_DIR=$(pwd)
echo "📂 当前目录: $PROJECT_DIR"

# 2. 拉取最新代码
echo "📥 正在从 GitHub 拉取最新代码..."
git pull origin main

# 3. 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  未发现 .env 文件，正在创建默认配置..."
    cat > .env << 'EOF'
DATABASE_URL=mysql://magicyang:Wysk1214@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/realsourcing
JWT_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3
COOKIE_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3
AI_PROVIDER=auto
OPENAI_API_KEY=sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM
OPENAI_BASE_URL=https://once.novai.su/v1
OPENAI_MODEL=gpt-4.1-mini
AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE=c9b17e2664044dfe8160140d7e581d89
NODE_ENV=production
EOF
    echo "✅ .env 文件已创建"
else
    echo "✅ .env 文件已存在"
fi

# 4. 安装依赖
echo "📦 正在安装项目依赖..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo "⚠️  未发现 pnpm，尝试使用 npm 安装..."
    npm install
fi

# 5. 测试数据库连接
echo "🔌 正在测试数据库连接..."
node test-db-simple.js

if [ $? -eq 0 ]; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败，请检查 RDS 白名单和 .env 配置"
    exit 1
fi

# 6. 导入测试数据
echo "🌱 正在导入 AI 爆款评分测试数据..."
if command -v pnpm &> /dev/null; then
    pnpm tsx scripts/seed-factory-products.ts
else
    npx tsx scripts/seed-factory-products.ts
fi

if [ $? -eq 0 ]; then
    echo "✅ 数据导入成功！"
else
    echo "❌ 数据导入失败"
    exit 1
fi

# 7. 重启服务 (可选)
echo "🔄 正在尝试重启服务..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo "✅ PM2 服务已重启"
else
    echo "ℹ️  未发现 PM2，请手动启动服务 (例如: npm start)"
fi

echo "🎉 部署与数据导入完成！"
echo "📈 您现在可以在前端查看 AI 爆款评分和推荐功能了。"
