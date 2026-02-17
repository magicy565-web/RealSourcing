# RealSourcing 后端部署总结

## 部署完成情况

### ✅ 已完成

1. **Directus 清理**
   - 完全移除 Directus 容器和相关配置
   - 清理 RDS 数据库中的 Directus 系统表
   - 释放服务器资源（从 800MB+ 降至 240MB）

2. **Node.js 环境配置**
   - Node.js 22.22.0
   - PM2 6.0.14（进程管理器）
   - pnpm 10.29.3（包管理器）
   - 配置开机自启动

3. **后端服务部署**
   - 部署路径：`/var/www/realsourcing`
   - 服务端口：3001
   - 内存占用：~240MB（符合 2GB 服务器要求）
   - 进程名称：`realsourcing-api`
   - 状态：✅ 运行中

4. **数据库连接**
   - RDS MySQL：`rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com`
   - 数据库名：`realsourcing`
   - 用户：`magicyang`
   - 状态：✅ 连接正常

5. **Nginx 反向代理**
   - 配置文件：`/etc/nginx/sites-available/api.cnsubscribe.xyz`
   - 监听端口：80（HTTP）
   - 代理目标：`http://localhost:3001`
   - 状态：✅ 运行中

6. **SSL 证书**
   - 域名：`api.cnsubscribe.xyz`
   - DNS A 记录：已配置指向 `47.99.205.136`
   - 状态：⏳ 等待 DNS 全球传播
   - 自动申请脚本：`/root/apply-ssl.sh`（每 10 分钟检查一次）

### 🔄 进行中

- **SSL 证书申请**：等待 DNS 传播完成（预计 30 分钟内）
- **前端环境变量更新**：需要在 Vercel 配置新的 API 地址

### 📊 服务器资源使用

| 项目 | 使用量 | 总量 | 占比 |
|------|--------|------|------|
| 内存 | ~240MB | 2GB | 12% |
| CPU | <1% | 1核 | <1% |
| 磁盘 | ~2GB | 40GB | 5% |

## API 访问方式

### 当前可用（HTTP）
```
http://47.99.205.136/api/trpc/...
```

### DNS 生效后（HTTPS）
```
https://api.cnsubscribe.xyz/api/trpc/...
```

## API 端点示例

### 公开端点
- `webinarEnhanced.listAll` - 获取所有 webinar 列表（需要 input 参数）

### 认证端点（需要登录）
- `webinar.list` - 获取用户的 webinar 列表
- `webinar.create` - 创建 webinar
- `factory.list` - 获取工厂列表
- `dashboard.stats` - 获取仪表板统计

## 环境变量配置

位置：`/var/www/realsourcing/.env`

```env
# Database
DATABASE_URL=mysql://<user>:<password>@<rds-host>:3306/realsourcing

# Server
PORT=3001
NODE_ENV=production

# Agora
AGORA_APP_ID=<your_agora_app_id>
AGORA_APP_CERTIFICATE=<your_agora_certificate>

# OSS
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=<your_oss_access_key>
OSS_ACCESS_KEY_SECRET=<your_oss_secret>
OSS_BUCKET=<your_bucket_name>
```

## PM2 管理命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs realsourcing-api

# 重启服务
pm2 restart realsourcing-api

# 停止服务
pm2 stop realsourcing-api

# 保存配置
pm2 save
```

## Nginx 管理命令

```bash
# 测试配置
nginx -t

# 重新加载配置
systemctl reload nginx

# 查看状态
systemctl status nginx

# 查看访问日志
tail -f /var/log/nginx/api.access.log

# 查看错误日志
tail -f /var/log/nginx/api.error.log
```

## SSL 证书状态检查

```bash
# 查看 SSL 申请日志
tail -f /var/log/ssl-apply.log

# 手动运行 SSL 申请脚本
/root/apply-ssl.sh

# 查看定时任务
crontab -l
```

## 下一步操作

1. **更新 Vercel 前端环境变量**
   - 变量名：`VITE_API_URL` 或类似
   - 临时值：`http://47.99.205.136`
   - 最终值：`https://api.cnsubscribe.xyz`（SSL 生效后）

2. **测试前端与后端连接**
   - 登录功能
   - Webinar 列表显示
   - 工厂数据加载

3. **监控 SSL 证书申请**
   - 检查 `/var/log/ssl-apply.log`
   - DNS 生效后自动申请成功

4. **更新前端 API 地址为 HTTPS**
   - 在 Vercel 更新环境变量
   - 重新部署前端

## 故障排除

### 后端服务无响应
```bash
pm2 restart realsourcing-api
pm2 logs realsourcing-api --lines 50
```

### Nginx 502 错误
```bash
# 检查后端是否运行
pm2 status
curl http://localhost:3001/api/trpc/auth.me

# 检查 Nginx 配置
nginx -t
systemctl status nginx
```

### 数据库连接失败
```bash
# 检查 RDS 连接
mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com -u magicyang -p

# 检查环境变量
cat /var/www/realsourcing/.env | grep DATABASE_URL
```

## 架构优势

相比 Directus CMS：

| 特性 | Directus | 自定义 Node.js API |
|------|----------|-------------------|
| 内存占用 | 500-800MB | 240MB |
| 启动时间 | 30-60秒 | 5-10秒 |
| 可控性 | 受限于 Directus 版本 | 完全控制 |
| 升级风险 | 高（数据库迁移问题） | 低（自主控制） |
| 性能 | 中等 | 优秀 |
| 定制化 | 受限 | 无限制 |

## 联系信息

- 服务器 IP：47.99.205.136
- SSH 用户：root
- API 域名：api.cnsubscribe.xyz
- 前端域名：（Vercel 托管）
