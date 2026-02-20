#!/bin/bash

# RealSourcing 本地开发环境启动脚本
# 用法: ./dev.sh [backend|frontend|full]

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm 未安装，请先安装: npm install -g pnpm"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装"
        exit 1
    fi
    
    print_success "依赖检查通过"
}

# 安装依赖
install_deps() {
    if [ ! -d "node_modules" ]; then
        print_info "首次运行，正在安装依赖..."
        pnpm install
        print_success "依赖安装完成"
    fi
}

# 生成 Prisma Client
generate_prisma() {
    if [ ! -d "node_modules/@prisma/client" ]; then
        print_info "生成 Prisma Client..."
        npx prisma generate
        print_success "Prisma Client 生成完成"
    fi
}

# 启动后端
start_backend() {
    print_info "启动后端服务..."
    print_info "后端地址: http://localhost:3001"
    print_info "API 端点: http://localhost:3001/api/trpc"
    echo ""
    pnpm dev:server
}

# 启动前端
start_frontend() {
    print_info "启动前端服务..."
    print_info "前端地址: http://localhost:5173"
    echo ""
    pnpm dev
}

# 启动完整环境
start_full() {
    print_info "启动完整开发环境..."
    print_warning "这将在后台启动后端，前台启动前端"
    print_warning "按 Ctrl+C 停止前端，然后运行 'pkill -f \"tsx server/index.ts\"' 停止后端"
    echo ""
    
    # 后台启动后端
    pnpm dev:server > /tmp/realsourcing-backend.log 2>&1 &
    BACKEND_PID=$!
    print_success "后端已启动 (PID: $BACKEND_PID)"
    print_info "后端日志: tail -f /tmp/realsourcing-backend.log"
    
    # 等待后端启动
    sleep 3
    
    # 前台启动前端
    print_info "启动前端..."
    pnpm dev
    
    # 前端退出后，停止后端
    print_warning "停止后端服务..."
    kill $BACKEND_PID 2>/dev/null || true
}

# 主逻辑
main() {
    cd "$(dirname "$0")"
    
    print_info "🚀 RealSourcing 开发环境"
    echo ""
    
    check_dependencies
    install_deps
    generate_prisma
    
    echo ""
    
    MODE=${1:-full}
    
    case $MODE in
        backend)
            start_backend
            ;;
        frontend)
            start_frontend
            ;;
        full)
            start_full
            ;;
        *)
            echo "用法: $0 [backend|frontend|full]"
            echo ""
            echo "  backend  - 仅启动后端服务"
            echo "  frontend - 仅启动前端服务"
            echo "  full     - 启动完整环境 (默认)"
            exit 1
            ;;
    esac
}

main "$@"
