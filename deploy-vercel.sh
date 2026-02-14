#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RealSourcing Vercel 快速部署脚本
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RealSourcing Vercel 部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI 安装完成"
    echo ""
fi

# 检查是否已登录
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "❌ 未登录 Vercel"
    echo "🔑 请登录 Vercel 账号..."
    vercel login
    echo ""
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📝 请先创建 .env 文件并配置环境变量"
    echo "💡 参考 .env.vercel.example 文件"
    exit 1
fi

# 选择部署环境
echo "🚀 选择部署环境:"
echo "  1) 预览环境 (Preview)"
echo "  2) 生产环境 (Production)"
echo ""
read -p "请输入选项 [1-2]: " env_choice

case $env_choice in
    1)
        echo ""
        echo "📦 开始部署到预览环境..."
        vercel
        ;;
    2)
        echo ""
        echo "⚠️  即将部署到生产环境，请确认："
        echo "  - 数据库已完成迁移"
        echo "  - 环境变量已在 Vercel Dashboard 配置"
        echo "  - 代码已经过测试"
        echo ""
        read -p "确认部署到生产环境? [y/N]: " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo ""
            echo "🚀 开始部署到生产环境..."
            vercel --prod
        else
            echo "❌ 已取消部署"
            exit 0
        fi
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 后续步骤："
echo "  1. 在 Vercel Dashboard 配置环境变量"
echo "  2. 配置自定义域名（可选）"
echo "  3. 测试应用功能"
echo "  4. 查看部署日志"
echo ""
echo "📚 详细文档: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
