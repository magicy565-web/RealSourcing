#!/bin/bash

###############################################################################
# RealSourcing 数据库一键部署脚本
# 用途: 在生产服务器上快速部署数据库
# 使用: ./scripts/deploy-db.sh [环境]
# 环境: development | staging | production (默认: development)
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 环境参数
ENV=${1:-development}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  RealSourcing 数据库部署工具${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}环境: ${ENV}${NC}"
echo ""

# 1. 检查环境变量文件
echo -e "${BLUE}[1/6]${NC} 检查环境配置..."
if [ ! -f ".env.${ENV}" ] && [ ! -f ".env" ]; then
    echo -e "${RED}❌ 错误: 未找到环境配置文件 .env.${ENV} 或 .env${NC}"
    echo -e "${YELLOW}   请先创建环境配置文件${NC}"
    exit 1
fi

# 加载环境变量
if [ -f ".env.${ENV}" ]; then
    export $(cat .env.${ENV} | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ 已加载 .env.${ENV}${NC}"
elif [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ 已加载 .env${NC}"
fi

# 检查 DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ 错误: DATABASE_URL 未设置${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 数据库连接: ${DATABASE_URL}${NC}"
echo ""

# 2. 检查依赖
echo -e "${BLUE}[2/6]${NC} 检查依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装 Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  未安装 pnpm，尝试使用 npm...${NC}"
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ 错误: 未安装 npm${NC}"
        exit 1
    fi
    PKG_MANAGER="npm"
else
    PKG_MANAGER="pnpm"
fi
echo -e "${GREEN}✅ 包管理器: ${PKG_MANAGER}${NC}"

# 检查 MySQL 客户端
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  未安装 MySQL 客户端，将使用 Node.js 脚本${NC}"
    USE_NODE_SCRIPT=true
else
    echo -e "${GREEN}✅ MySQL 客户端: $(mysql --version | head -n 1)${NC}"
    USE_NODE_SCRIPT=false
fi
echo ""

# 3. 安装依赖（如果需要）
echo -e "${BLUE}[3/6]${NC} 安装依赖..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   正在安装依赖...${NC}"
    $PKG_MANAGER install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已存在${NC}"
fi
echo ""

# 4. 备份数据库（生产环境）
if [ "$ENV" = "production" ]; then
    echo -e "${BLUE}[4/6]${NC} 备份数据库..."
    BACKUP_FILE="backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p backups
    
    if [ "$USE_NODE_SCRIPT" = true ]; then
        echo -e "${YELLOW}   使用 Node.js 脚本备份...${NC}"
        npx tsx scripts/db-backup.ts
    else
        echo -e "${YELLOW}   使用 mysqldump 备份...${NC}"
        # 从 DATABASE_URL 提取连接信息
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
        DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\).*/\1/p')
        DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p')
        DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        
        mysqldump -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"
    fi
    
    echo -e "${GREEN}✅ 备份完成: ${BACKUP_FILE}${NC}"
else
    echo -e "${BLUE}[4/6]${NC} 跳过备份（非生产环境）"
fi
echo ""

# 5. 执行数据库初始化
echo -e "${BLUE}[5/6]${NC} 初始化数据库..."
npx tsx scripts/db-init.ts
echo ""

# 6. 验证部署
echo -e "${BLUE}[6/6]${NC} 验证部署..."
npx tsx scripts/db-verify.ts

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 数据库部署完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 启动应用: ${BLUE}pnpm dev${NC}"
echo -e "  2. 查看日志: ${BLUE}tail -f logs/app.log${NC}"
echo -e "  3. 访问应用: ${BLUE}http://localhost:5000${NC}"
echo ""
