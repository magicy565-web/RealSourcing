# RealSourcing 部署检查清单

## ✅ 已完成的任务

### 1. 后端基础设施
- [x] 清理 Directus CMS 容器和配置
- [x] 清理 RDS 数据库中的 Directus 系统表
- [x] 安装 Node.js 22.22.0
- [x] 安装 PM2 6.0.14 进程管理器
- [x] 安装 pnpm 10.29.3 包管理器
- [x] 配置 PM2 开机自启动

### 2. 后端部署
- [x] 部署代码到 `/var/www/realsourcing`
- [x] 配置环境变量（.env 文件）
- [x] 安装项目依赖（pnpm install）
- [x] 启动后端服务（PM2）
- [x] 验证服务运行状态（内存 ~240MB）

### 3. 数据库连接
- [x] 配置 RDS MySQL 连接
- [x] 验证数据库连接正常
- [x] 确认 webinar 数据存在（26 条记录）

### 4. Nginx 配置
- [x] 安装 Nginx 和 Certbot
- [x] 创建反向代理配置
- [x] 配置支持 IP 和域名访问
- [x] 启用 Nginx 配置
- [x] 验证 HTTP 访问正常

### 5. SSL 证书
- [x] 配置 DNS A 记录（api.cnsubscribe.xyz → 47.99.205.136）
- [x] 创建 SSL 自动申请脚本
- [x] 配置定时任务（每 10 分钟检查 DNS）
- [⏳] 等待 DNS 全球传播
- [⏳] 等待 SSL 证书自动申请

### 6. 前端配置
- [x] 更新 main.tsx 支持环境变量
- [x] 创建 .env.production 文件
- [x] 创建 .env.local 模板
- [x] 提交代码到 GitHub
- [⏳] 配置 Vercel 环境变量
- [⏳] 重新部署前端

### 7. 文档
- [x] 创建部署总结文档（DEPLOYMENT_SUMMARY.md）
- [x] 创建 Vercel 部署指南（VERCEL_DEPLOYMENT_GUIDE.md）
- [x] 创建部署检查清单（本文件）

## ⏳ 待完成的任务

### 1. Vercel 前端部署
- [ ] 登录 Vercel Dashboard
- [ ] 配置环境变量 `VITE_API_URL=http://47.99.205.136/api/trpc`
- [ ] 触发重新部署
- [ ] 验证构建成功

### 2. 前后端连接测试
- [ ] 访问前端网站
- [ ] 测试 API 请求（查看 Network 标签）
- [ ] 验证 API 地址正确（指向 47.99.205.136）
- [ ] 测试登录功能
- [ ] 测试 Webinar 列表加载
- [ ] 测试工厂数据显示

### 3. CORS 配置（如果需要）
- [ ] 检查是否有 CORS 错误
- [ ] 如有错误，在 Nginx 或后端添加 CORS 头
- [ ] 重新测试跨域请求

### 4. SSL 证书生效后
- [ ] 检查 `/var/log/ssl-apply.log` 确认证书申请成功
- [ ] 测试 HTTPS 访问：`https://api.cnsubscribe.xyz`
- [ ] 更新 Vercel 环境变量为 HTTPS URL
- [ ] 重新部署前端
- [ ] 验证 HTTPS 连接正常

### 5. 最终验证
- [ ] 完整的用户注册流程
- [ ] 完整的用户登录流程
- [ ] Webinar 创建功能
- [ ] Webinar 列表显示
- [ ] 工厂管理功能
- [ ] 产品管理功能
- [ ] Agora 实时通信测试
- [ ] 文件上传到 OSS

### 6. 性能和监控
- [ ] 检查服务器资源使用率
- [ ] 设置日志轮转（logrotate）
- [ ] 配置监控告警（可选）
- [ ] 备份数据库（可选）

## 🔧 快速命令参考

### 检查后端状态
```bash
ssh root@47.99.205.136
pm2 status
pm2 logs realsourcing-api --lines 20
```

### 检查 Nginx 状态
```bash
ssh root@47.99.205.136
systemctl status nginx
tail -f /var/log/nginx/api.access.log
```

### 检查 SSL 申请进度
```bash
ssh root@47.99.205.136
tail -f /var/log/ssl-apply.log
```

### 测试 API 端点
```bash
# 测试健康检查
curl http://47.99.205.136/api/trpc/auth.me

# 测试 webinar 列表（需要认证）
curl http://47.99.205.136/api/trpc/webinar.list
```

### 重启服务
```bash
ssh root@47.99.205.136
pm2 restart realsourcing-api
systemctl reload nginx
```

## 📊 当前系统状态

| 组件 | 状态 | 地址/端口 | 备注 |
|------|------|----------|------|
| Node.js 后端 | ✅ 运行中 | localhost:3001 | PM2 管理 |
| Nginx 反向代理 | ✅ 运行中 | 0.0.0.0:80 | HTTP |
| RDS MySQL | ✅ 连接正常 | rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306 | 26 条 webinar |
| OSS 存储 | ✅ 配置完成 | oss-cn-hangzhou | bucket: demand-os-discord |
| DNS | ⏳ 传播中 | api.cnsubscribe.xyz | 已配置 A 记录 |
| SSL 证书 | ⏳ 等待中 | - | 自动申请脚本运行中 |
| 前端 (Vercel) | ⏳ 待更新 | - | 需要配置环境变量 |

## 🎯 下一步行动

### 立即执行
1. **配置 Vercel 环境变量**
   - 登录 https://vercel.com
   - 进入 RealSourcing 项目
   - Settings → Environment Variables
   - 添加 `VITE_API_URL=http://47.99.205.136/api/trpc`
   - 保存并重新部署

2. **测试前后端连接**
   - 访问 Vercel 部署的前端
   - 打开浏览器开发者工具
   - 检查 Network 请求是否指向正确的 API

### 30 分钟内
3. **检查 SSL 证书申请**
   - SSH 到服务器
   - 查看 `/var/log/ssl-apply.log`
   - 如果成功，更新 Vercel 环境变量为 HTTPS

### 完成后
4. **全面测试**
   - 测试所有主要功能
   - 记录任何问题
   - 优化性能

5. **文档更新**
   - 更新 README.md
   - 记录已知问题
   - 编写运维手册

## 📝 注意事项

### 安全
- ⚠️ 当前使用 HTTP，数据未加密
- ✅ SSL 证书申请后将自动升级到 HTTPS
- ✅ 数据库密码已配置在 .env 文件中
- ⚠️ 建议定期更换数据库密码

### 性能
- ✅ 内存占用 ~240MB（符合 2GB 服务器要求）
- ✅ CPU 使用率 <1%
- ✅ PM2 自动重启机制已启用
- ⚠️ 建议配置日志轮转避免磁盘占满

### 备份
- ⚠️ 未配置自动备份
- 建议：每周备份 RDS 数据库
- 建议：定期备份 OSS 文件

### 监控
- ✅ PM2 提供基本监控
- ⚠️ 未配置告警
- 建议：配置服务器监控（如阿里云云监控）

## 🆘 故障排除

### 后端无响应
```bash
pm2 restart realsourcing-api
pm2 logs realsourcing-api --lines 50
```

### 前端无法连接后端
1. 检查 Vercel 环境变量
2. 检查 CORS 配置
3. 检查 API 地址是否正确

### 数据库连接失败
1. 检查 RDS 白名单
2. 检查 .env 文件配置
3. 测试数据库连接

### SSL 证书申请失败
1. 检查 DNS 是否生效
2. 检查 Nginx 配置
3. 查看详细日志：`/var/log/letsencrypt/letsencrypt.log`

## 📞 联系信息

- **服务器**: 47.99.205.136
- **域名**: api.cnsubscribe.xyz
- **GitHub**: https://github.com/magicy565-web/RealSourcing
- **Vercel**: （待配置）

---

**最后更新**: 2026-02-17
**部署状态**: 🟡 部分完成（等待前端部署和 SSL 证书）
