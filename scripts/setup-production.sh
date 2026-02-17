#!/bin/bash

###############################################################################
# RealSourcing 生产环境一键部署脚本
# 
# 功能：
# - 安装和配置 Nginx
# - 配置域名和 HTTPS 证书
# - 配置 Git 仓库
# - 配置 PM2 和自动重启
# - 配置防火墙和安全加固
# - 配置监控和日志
#
# 使用方法：
# bash setup-production.sh
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行此脚本"
    exit 1
fi

# 配置变量
DOMAIN="api.cnsubscribe.xyz"
EMAIL="magic@gmail.com"
PROJECT_PATH="/var/www/realsourcing"
GIT_REPO="https://github.com/magicy565-web/RealSourcing.git"
APP_PORT=3001

log_info "================================================"
log_info "RealSourcing 生产环境部署开始"
log_info "================================================"

###############################################################################
# 步骤 1: 更新系统并安装必要软件
###############################################################################
log_info "步骤 1/10: 更新系统并安装必要软件..."

apt update -y
apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx git curl wget ufw fail2ban

log_success "系统更新完成"

###############################################################################
# 步骤 2: 安装 Node.js 和 pnpm（如果未安装）
###############################################################################
log_info "步骤 2/10: 检查 Node.js 和 pnpm..."

if ! command -v node &> /dev/null; then
    log_info "安装 Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi

if ! command -v pnpm &> /dev/null; then
    log_info "安装 pnpm..."
    npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
    log_info "安装 PM2..."
    npm install -g pm2
fi

if ! command -v tsx &> /dev/null; then
    log_info "安装 tsx..."
    npm install -g tsx
fi

log_success "Node.js 环境检查完成"

###############################################################################
# 步骤 3: 配置项目目录和 Git 仓库
###############################################################################
log_info "步骤 3/10: 配置项目目录..."

if [ ! -d "$PROJECT_PATH" ]; then
    log_info "克隆项目仓库..."
    mkdir -p /var/www
    git clone $GIT_REPO $PROJECT_PATH
else
    log_info "项目目录已存在，初始化 Git..."
    cd $PROJECT_PATH
    
    # 如果不是 Git 仓库，初始化
    if [ ! -d ".git" ]; then
        git init
        git remote add origin $GIT_REPO
    fi
    
    # 拉取最新代码
    git fetch origin
    git reset --hard origin/main
fi

cd $PROJECT_PATH

# 配置 Git 用户信息
git config user.name "Deploy Bot"
git config user.email "deploy@realsourcing.com"

log_success "项目目录配置完成"

###############################################################################
# 步骤 4: 安装项目依赖
###############################################################################
log_info "步骤 4/10: 安装项目依赖..."

cd $PROJECT_PATH
pnpm install --frozen-lockfile || pnpm install

log_success "依赖安装完成"

###############################################################################
# 步骤 5: 配置 Nginx
###############################################################################
log_info "步骤 5/10: 配置 Nginx..."

# 创建 Nginx 配置文件
cat > /etc/nginx/sites-available/realsourcing << 'NGINX_EOF'
# HTTP 配置 - 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
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
    listen [::]:443 ssl http2;
    server_name api.cnsubscribe.xyz;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/api.cnsubscribe.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cnsubscribe.xyz/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.cnsubscribe.xyz/chain.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # 日志配置
    access_log /var/log/nginx/realsourcing-access.log;
    error_log /var/log/nginx/realsourcing-error.log;
    
    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_min_length 256;
    
    # 客户端上传大小限制
    client_max_body_size 50M;
    
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
        proxy_set_header X-Forwarded-Host $server_name;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓存配置
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
NGINX_EOF

# 创建 certbot 验证目录
mkdir -p /var/www/certbot

# 启用站点配置
ln -sf /etc/nginx/sites-available/realsourcing /etc/nginx/sites-enabled/

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

log_success "Nginx 配置完成"

###############################################################################
# 步骤 6: 配置 SSL 证书
###############################################################################
log_info "步骤 6/10: 配置 SSL 证书..."

# 临时启动 Nginx（用于 Let's Encrypt 验证）
systemctl start nginx

# 检查证书是否已存在
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log_info "获取 SSL 证书..."
    certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
else
    log_info "SSL 证书已存在，跳过..."
fi

# 重新加载 Nginx
systemctl reload nginx

log_success "SSL 证书配置完成"

###############################################################################
# 步骤 7: 配置 PM2
###############################################################################
log_info "步骤 7/10: 配置 PM2..."

# 创建日志目录
mkdir -p $PROJECT_PATH/logs

# 停止旧进程（如果存在）
pm2 delete realsourcing-api 2>/dev/null || true

# 使用 ecosystem.config.js 启动
cd $PROJECT_PATH
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root

log_success "PM2 配置完成"

###############################################################################
# 步骤 8: 配置防火墙
###############################################################################
log_info "步骤 8/10: 配置防火墙..."

# 配置 UFW
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

log_success "防火墙配置完成"

###############################################################################
# 步骤 9: 配置 Fail2ban
###############################################################################
log_info "步骤 9/10: 配置 Fail2ban..."

# 配置 Nginx 防护
cat > /etc/fail2ban/jail.local << 'FAIL2BAN_EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/*error.log
FAIL2BAN_EOF

# 重启 Fail2ban
systemctl restart fail2ban

log_success "Fail2ban 配置完成"

###############################################################################
# 步骤 10: 验证部署
###############################################################################
log_info "步骤 10/10: 验证部署..."

# 等待服务启动
sleep 5

# 检查 Nginx 状态
if systemctl is-active --quiet nginx; then
    log_success "Nginx 运行正常"
else
    log_error "Nginx 未运行"
    exit 1
fi

# 检查 PM2 状态
if pm2 list | grep -q "realsourcing-api.*online"; then
    log_success "PM2 应用运行正常"
else
    log_error "PM2 应用未运行"
    exit 1
fi

# 检查本地 API
if curl -s http://127.0.0.1:3001/health > /dev/null 2>&1; then
    log_success "本地 API 响应正常"
else
    log_warning "本地 API 可能未完全启动，请稍后检查"
fi

###############################################################################
# 完成
###############################################################################
log_info "================================================"
log_success "🎉 生产环境部署完成！"
log_info "================================================"
echo ""
log_info "部署信息："
log_info "  - 域名: https://$DOMAIN"
log_info "  - 项目路径: $PROJECT_PATH"
log_info "  - 应用端口: $APP_PORT (仅 localhost)"
log_info "  - PM2 进程: realsourcing-api"
echo ""
log_info "常用命令："
log_info "  - 查看 PM2 状态: pm2 status"
log_info "  - 查看 PM2 日志: pm2 logs realsourcing-api"
log_info "  - 查看 Nginx 日志: tail -f /var/log/nginx/realsourcing-access.log"
log_info "  - 重启应用: pm2 restart realsourcing-api"
log_info "  - 重启 Nginx: systemctl restart nginx"
echo ""
log_info "下一步："
log_info "  1. 配置域名 DNS: A 记录指向 $(curl -s ifconfig.me)"
log_info "  2. 更新 Vercel 环境变量: VITE_API_URL=https://$DOMAIN/api/trpc"
log_info "  3. 更新 vercel.json: destination=https://$DOMAIN/api/trpc/:path*"
log_info "  4. 配置 GitHub Secrets 用于自动部署"
echo ""
log_success "部署脚本执行完成！"
