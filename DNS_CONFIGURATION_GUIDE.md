# 🌐 域名 DNS 配置指南

## 当前状态

✅ **已完成**:
- Nginx 反向代理已配置
- 服务器端配置完成
- 后端 API 运行在 localhost:3001

❌ **待完成**:
- 域名 DNS 解析配置

---

## 📋 需要配置的 DNS 记录

### 域名服务商：阿里云

访问: https://dns.console.aliyun.com

### 配置步骤

1. **登录阿里云控制台**
   - 访问: https://dns.console.aliyun.com
   - 找到域名: `cnsubscribe.xyz`

2. **添加 A 记录**

| 记录类型 | 主机记录 | 记录值 | TTL | 说明 |
|---------|---------|--------|-----|------|
| A | api | 47.99.205.136 | 600 | 后端 API 服务器 |

### 详细配置

- **记录类型**: A
- **主机记录**: api
- **解析线路**: 默认
- **记录值**: 47.99.205.136
- **TTL**: 600 秒（10分钟）
- **状态**: 启用

---

## 🧪 验证 DNS 配置

### 方法 1: 使用 nslookup

```bash
nslookup api.cnsubscribe.xyz
```

**预期输出**:
```
Server:         8.8.8.8
Address:        8.8.8.8#53

Non-authoritative answer:
Name:   api.cnsubscribe.xyz
Address: 47.99.205.136
```

### 方法 2: 使用 dig

```bash
dig api.cnsubscribe.xyz +short
```

**预期输出**:
```
47.99.205.136
```

### 方法 3: 使用 curl

```bash
curl -I http://api.cnsubscribe.xyz/health
```

**预期输出**:
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/plain
...
```

---

## ⏱️ DNS 生效时间

- **本地生效**: 立即（清除 DNS 缓存后）
- **全球生效**: 10-30 分钟（取决于 TTL 设置）
- **建议**: 配置后等待 10 分钟再测试

---

## 🔧 清除 DNS 缓存

### Windows
```cmd
ipconfig /flushdns
```

### macOS
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Linux
```bash
sudo systemd-resolve --flush-caches
# 或
sudo /etc/init.d/nscd restart
```

---

## 📊 配置完成后的架构

```
用户浏览器
    ↓ HTTPS
Vercel 前端 (https://real-sourcing.vercel.app)
    ↓ HTTP
域名 (http://api.cnsubscribe.xyz)
    ↓ DNS 解析
阿里云服务器 (47.99.205.136:80)
    ↓ Nginx 反向代理
Node.js API (localhost:3001)
    ↓
阿里云 RDS MySQL
```

---

## ✅ 配置完成检查清单

- [ ] 在阿里云 DNS 控制台添加 A 记录
- [ ] 等待 10 分钟让 DNS 生效
- [ ] 使用 nslookup 验证 DNS 解析
- [ ] 使用 curl 测试 API 访问
- [ ] 更新 Vercel 环境变量
- [ ] 测试前端连接

---

## 🚨 故障排查

### 问题 1: DNS 无法解析

**症状**: `Could not resolve host: api.cnsubscribe.xyz`

**解决方案**:
1. 检查 DNS 记录是否正确添加
2. 确认记录状态为"启用"
3. 等待更长时间（最多 30 分钟）
4. 清除本地 DNS 缓存

### 问题 2: 连接超时

**症状**: `Connection timed out`

**解决方案**:
1. 检查阿里云安全组是否开放 80 端口
2. 检查 Nginx 是否运行: `systemctl status nginx`
3. 检查防火墙: `ufw status`

### 问题 3: 502 Bad Gateway

**症状**: Nginx 返回 502 错误

**解决方案**:
1. 检查后端服务是否运行: `pm2 status`
2. 检查端口 3001 是否监听: `netstat -tlnp | grep 3001`
3. 查看 Nginx 错误日志: `tail -f /var/log/nginx/realsourcing-error.log`

---

## 📞 下一步

配置完成后，请通知我，我将：
1. 验证 DNS 解析
2. 测试 API 访问
3. 更新前端配置
4. 测试完整的前后端连接

---

**创建时间**: 2026-02-17  
**维护人员**: Manus AI Agent
