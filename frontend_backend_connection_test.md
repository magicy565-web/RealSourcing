# RealSourcing 前后端连接测试报告

**测试时间**: 2026-02-17  
**测试人员**: Manus AI

---

## 测试环境

### 前端部署
- **平台**: Vercel
- **URL**: https://real-sourcing.vercel.app
- **状态**: ✅ 部署成功，页面正常显示

### 后端部署
- **平台**: 阿里云 ECS
- **IP**: 47.99.205.136
- **端口**: 3001
- **进程**: PM2 管理，进程 ID 38481
- **状态**: ✅ 服务运行中

---

## 测试结果

### ✅ 前端访问测试
- 页面加载正常
- UI 显示完整
- 静态资源加载成功

### ❌ 前后端连接测试
**错误信息**:
```
ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR
```

**问题分析**:
1. Vercel 无法连接到阿里云服务器的 3001 端口
2. 后端服务监听在 `:::3001`（IPv6 地址）
3. 可能的原因：
   - 阿里云安全组未开放 3001 端口
   - 后端服务只监听 IPv6，不监听 IPv4
   - 防火墙阻止外部访问

---

## 诊断步骤

### 1. 端口监听状态
```bash
tcp6  0  0  :::3001  :::*  LISTEN  38481/node
```
✅ 后端服务正在监听 3001 端口（IPv6）

### 2. 本地连接测试
```bash
curl http://47.99.205.136:3001/api/trpc/webinar.list
```
❌ 连接超时，无响应

### 3. Vercel Rewrite 配置
```json
{
  "source": "/api/trpc/:path*",
  "destination": "http://47.99.205.136:3001/api/trpc/:path*"
}
```
✅ 配置正确

---

## 问题根源

**核心问题**: 阿里云 ECS 的 3001 端口未对外开放

### 可能的原因

1. **安全组规则**
   - 阿里云安全组默认只开放常用端口（22, 80, 443）
   - 3001 端口未添加到入站规则

2. **防火墙配置**
   - 服务器本地防火墙（iptables/firewalld）可能阻止 3001 端口

3. **IPv6 vs IPv4**
   - 后端只监听 IPv6 (:::3001)
   - 外部访问可能需要 IPv4 支持

---

## 解决方案

### 方案 1: 开放 3001 端口（推荐）

**步骤**:
1. 登录阿里云控制台
2. 进入 ECS 实例 → 安全组
3. 添加入站规则：
   - 端口范围: 3001/3001
   - 授权对象: 0.0.0.0/0
   - 协议: TCP

### 方案 2: 使用 Nginx 反向代理

配置 Nginx 将 80/443 端口转发到 3001:
```nginx
server {
    listen 80;
    server_name 47.99.205.136;
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

然后修改 vercel.json:
```json
{
  "source": "/api/trpc/:path*",
  "destination": "http://47.99.205.136/api/trpc/:path*"
}
```

### 方案 3: 修改后端监听地址

修改后端配置，同时监听 IPv4 和 IPv6:
```javascript
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:3001');
});
```

---

## 推荐行动

**立即执行**: 开放阿里云安全组 3001 端口

**优先级**: 🔴 高
**预计时间**: 5 分钟
**风险等级**: 低

---

## 下一步

1. ✅ 开放 3001 端口
2. 🔄 重新测试前后端连接
3. ✅ 验证数据读取功能
4. 📝 完成最终测试报告
