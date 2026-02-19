# Webinar 功能开发 - 下一步行动指南

**日期**: 2026-02-19  
**状态**: ✅ 本地开发环境已就绪  
**下一步**: 在您的本地环境测试和完善 Agora 视频功能

---

## 🎯 当前状态总结

### ✅ 已完成的工作

1. **数据库连接** - 通过 SSH 隧道成功连接到 RDS
2. **后端 API** - Webinar 和 Agora Token API 正常工作
3. **前端页面** - 列表页、详情页、直播间页面全部实现
4. **Agora 集成** - Token 生成和初始化代码已完成

### 🟡 待验证的功能

1. **Agora 视频通话** - 需要在真实浏览器环境测试（沙盒环境无法访问摄像头）
2. **远程用户连接** - 需要多个用户同时加入测试
3. **屏幕共享** - 需要浏览器权限验证
4. **Netless 白板** - 尚未集成（后续任务）

---

## 📋 立即行动清单

### 第一步：克隆项目到本地

```bash
# 1. 克隆项目
git clone https://github.com/magicy565-web/RealSourcing.git
cd RealSourcing

# 2. 安装依赖
pnpm install

# 3. 复制环境变量
cp .env.example .env  # 如果有示例文件
# 或者手动创建 .env 文件
```

### 第二步：配置环境变量

创建 `.env` 文件，添加以下内容：

```bash
# ==========================================
# 数据库配置
# ==========================================
# 选项 1：直接连接 RDS（需要在 RDS 白名单中添加您的 IP）
DATABASE_URL=mysql://magicyang:Wysk1214@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/realsourcing

# 选项 2：通过 SSH 隧道连接（推荐）
# 先运行：sshpass -p 'Wysk1214' ssh -f -N -L 3307:rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306 root@47.99.205.136
# DATABASE_URL=mysql://magicyang:Wysk1214@localhost:3307/realsourcing

# ==========================================
# Agora 配置（视频通话）
# ==========================================
AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE=c9b17e2664044dfe8160140d7e581d89
VITE_AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882

# ==========================================
# AI 配置
# ==========================================
AI_PROVIDER=auto
OPENAI_API_KEY=sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM
OPENAI_BASE_URL=https://once.novai.su/v1
OPENAI_MODEL=gpt-4.1-mini

# ==========================================
# JWT 和 Cookie
# ==========================================
JWT_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3
COOKIE_SECRET=pQGxvZ7LZ8F5Y3vK4zJ9X8W2N6M5L4K3

# ==========================================
# Netless 白板配置（可选）
# ==========================================
WHITEBOARD_AK=your-whiteboard-ak
WHITEBOARD_SK=your-whiteboard-sk

# ==========================================
# OAuth 配置（可选）
# ==========================================
OAUTH_SERVER_URL=your-oauth-server-url
```

### 第三步：启动开发服务器

```bash
# 启动开发服务器（前端 + 后端）
pnpm dev
```

服务器将在以下地址运行：
- **前端**: http://localhost:3001/
- **后端 API**: http://localhost:3001/api/trpc

### 第四步：测试 Webinar 功能

1. **打开浏览器**，访问：http://localhost:3001/webinars

2. **测试列表页**：
   - ✅ 应该显示所有 Webinar
   - ✅ 统计卡片显示正确数量
   - ✅ 点击任意 Webinar 卡片

3. **测试详情页**：
   - ✅ 应该显示 Webinar 详细信息
   - ✅ 点击 "Join Live Webinar" 按钮

4. **测试直播间**：
   - 🟡 页面应该加载
   - 🟡 浏览器会请求摄像头和麦克风权限
   - 🟡 **允许权限后**，应该看到您的视频画面
   - 🟡 底部控制栏可以控制麦克风和摄像头

---

## 🔧 故障排查

### 问题 1：数据库连接失败

**症状**：
```
Connection lost: The server closed the connection.
```

**解决方案**：

**方案 A：添加 IP 到 RDS 白名单**
1. 登录阿里云控制台
2. 找到 RDS 实例：`rm-bp1h4o9up7249uep3to`
3. 进入"数据安全性" > "白名单设置"
4. 添加您的公网 IP（可以访问 https://ipinfo.io/ip 查看）
5. 格式：`your.ip.address.here/32` 或 `your.ip.address.here`

**方案 B：使用 SSH 隧道**
```bash
# 安装 sshpass（如果没有）
# macOS: brew install sshpass
# Ubuntu: sudo apt-get install sshpass

# 建立 SSH 隧道
sshpass -p 'Wysk1214' ssh -f -N \
  -L 3307:rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306 \
  -o ServerAliveInterval=60 \
  root@47.99.205.136

# 修改 .env 中的 DATABASE_URL
DATABASE_URL=mysql://magicyang:Wysk1214@localhost:3307/realsourcing

# 重启开发服务器
```

**方案 C：使用本地 MySQL**
```bash
# 1. 安装 MySQL
# macOS: brew install mysql
# Ubuntu: sudo apt-get install mysql-server

# 2. 创建数据库
mysql -u root -p
CREATE DATABASE realsourcing;

# 3. 修改 .env
DATABASE_URL=mysql://root:your_password@localhost:3306/realsourcing

# 4. 运行数据库迁移
pnpm db:push
```

---

### 问题 2：Agora 无法连接

**症状**：
- 页面一直显示 "Connecting to webinar..."
- 控制台有 Agora 相关错误

**解决方案**：

**检查 1：浏览器权限**
- 确保允许浏览器访问摄像头和麦克风
- Chrome: 地址栏左侧的锁图标 > 网站设置 > 摄像头/麦克风 > 允许

**检查 2：Agora App ID**
- 确认 `.env` 中的 `AGORA_APP_ID` 正确
- 确认 `VITE_AGORA_APP_ID` 与 `AGORA_APP_ID` 一致

**检查 3：网络连接**
- Agora 需要访问外网
- 如果在公司网络，可能需要配置代理

**检查 4：浏览器控制台**
```javascript
// 打开浏览器控制台（F12），查看错误信息
// 常见错误：
// - "INVALID_APP_ID" -> 检查 App ID
// - "INVALID_TOKEN" -> Token 过期或生成失败
// - "CAN_NOT_GET_GATEWAY_SERVER" -> 网络问题
// - "PERMISSION_DENIED" -> 浏览器权限被拒绝
```

---

### 问题 3：页面显示空白或错误

**症状**：
- 页面加载失败
- 显示 "Webinar not found"

**解决方案**：

**检查 1：开发服务器**
```bash
# 确保开发服务器正在运行
ps aux | grep "pnpm dev"

# 如果没有运行，重新启动
cd /path/to/RealSourcing
pnpm dev
```

**检查 2：API 调用**
```bash
# 测试 Webinar API
curl "http://localhost:3001/api/trpc/webinarEnhanced.listAll?input=%7B%22json%22%3A%7B%22limit%22%3A5%7D%7D"

# 应该返回 JSON 数据，而不是错误
```

**检查 3：浏览器缓存**
- 清除浏览器缓存
- 或使用无痕模式（Ctrl+Shift+N / Cmd+Shift+N）

---

## 📝 开发建议

### 1. 使用浏览器开发者工具

**打开方式**：
- Windows/Linux: `F12` 或 `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

**有用的面板**：
- **Console**: 查看错误日志和 Agora 日志
- **Network**: 查看 API 请求和响应
- **Application**: 查看 Cookie 和 LocalStorage
- **Sources**: 调试前端代码

### 2. 查看后端日志

开发服务器会在终端输出详细日志：

```bash
# 正常的日志示例
[07:54:43] INFO: API Request
    path: "webinarEnhanced.getById"
    type: "query"
    durationMs: 2358

[07:54:43] INFO: API Request
    path: "agora.getRtcToken"
    type: "query"
    durationMs: 0
```

如果看到错误，会显示详细的错误信息和堆栈跟踪。

### 3. 使用 Git 进行版本控制

```bash
# 查看当前修改
git status

# 查看具体改动
git diff

# 提交修改
git add .
git commit -m "feat: integrate Agora video calling"

# 推送到 GitHub
git push origin main
```

---

## 🚀 后续开发任务

### 优先级 1：完善 Agora 功能

**任务清单**：
- [ ] 验证本地视频播放
- [ ] 测试远程用户连接（需要两个浏览器窗口）
- [ ] 实现屏幕共享功能测试
- [ ] 添加网络质量指示器
- [ ] 实现自动重连机制
- [ ] 优化视频编码参数

**预计时间**：2-3 小时

---

### 优先级 2：集成 Netless 白板

**任务清单**：
- [ ] 配置 Netless 账号和凭证
- [ ] 创建白板房间 API
- [ ] 集成 Fastboard 组件
- [ ] 实现白板工具栏
- [ ] 添加文档转换功能
- [ ] 测试多用户协作

**预计时间**：3-4 小时

**参考文档**：
- Netless 官方文档：https://docs.netless.link/
- Fastboard 快速开始：https://github.com/netless-io/fastboard

---

### 优先级 3：完善聊天功能

**任务清单**：
- [ ] 实现实时消息发送（WebSocket 或轮询）
- [ ] 添加消息历史存储
- [ ] 支持表情选择器
- [ ] 实现图片上传和预览
- [ ] 添加消息通知
- [ ] 实现 @提及功能

**预计时间**：2-3 小时

---

### 优先级 4：添加高级功能

**任务清单**：
- [ ] 云端录制（Agora Cloud Recording）
- [ ] 实时转录翻译（Agora RTT）
- [ ] AI 助手集成
- [ ] 数据分析和统计
- [ ] 导出会议记录

**预计时间**：4-6 小时

---

## 📚 重要文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| **本地开发指南** | `LOCAL_DEVELOPMENT_GUIDE.md` | 完整的环境搭建步骤 |
| **开发总结** | `WEBINAR_LOCAL_DEV_SUMMARY.md` | 已完成工作的详细记录 |
| **进度报告** | `WEBINAR_DEV_PROGRESS_REPORT.md` | 当前状态和技术细节 |
| **下一步指南** | `NEXT_STEPS_GUIDE.md` | 本文档 |
| **数据库指南** | `RealSourcing-数据库维护与开发指南.md` | 数据库架构和维护 |
| **前端 UI 指南** | `RealSourcing-前端UI集成开发文档.md` | 前端组件和 AI 集成 |

---

## 🆘 获取帮助

### 常见问题

**Q1: 如何查看当前 Agora 连接状态？**

打开浏览器控制台，输入：
```javascript
// 查看 Agora 客户端状态
console.log(agoraService.getConnectionState());

// 查看远程用户列表
console.log(agoraService.getRemoteUsers());
```

**Q2: 如何重新生成 Agora Token？**

Token 会在每次加入频道时自动生成。如果需要手动测试：
```bash
curl "http://localhost:3001/api/trpc/agora.getRtcToken?input=%7B%22json%22%3A%7B%22channelName%22%3A%22webinar_1%22%2C%22uid%22%3A%22user_123%22%7D%7D"
```

**Q3: 如何测试多用户视频通话？**

1. 在两个不同的浏览器（或无痕窗口）中打开同一个 Webinar 直播间
2. 两个窗口都允许摄像头和麦克风权限
3. 应该能在各自的窗口中看到对方的视频

**Q4: SSH 隧道断开了怎么办？**

```bash
# 检查隧道状态
ps aux | grep "ssh.*3307" | grep -v grep

# 如果没有输出，重新建立隧道
sshpass -p 'Wysk1214' ssh -f -N \
  -L 3307:rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306 \
  -o ServerAliveInterval=60 \
  root@47.99.205.136
```

---

## ✅ 验收标准

在完成本地开发后，请确认以下功能正常：

### 基础功能
- [ ] Webinar 列表页正常显示
- [ ] Webinar 详情页正常加载
- [ ] 可以点击 "Join Live Webinar" 进入直播间

### Agora 视频功能
- [ ] 浏览器请求摄像头和麦克风权限
- [ ] 允许权限后，能看到自己的视频画面
- [ ] 麦克风和摄像头按钮可以正常切换
- [ ] 多个用户可以同时加入并看到彼此
- [ ] 屏幕共享功能正常工作

### UI 和交互
- [ ] 聊天框可以输入和发送消息
- [ ] 选项卡（Chat, People, Factories, Q&A）可以切换
- [ ] 控制栏按钮有正确的视觉反馈
- [ ] 页面布局在不同屏幕尺寸下正常

### 性能和稳定性
- [ ] 页面加载速度快（< 3 秒）
- [ ] 视频流畅，无明显卡顿
- [ ] 长时间运行无内存泄漏
- [ ] 网络波动时能自动重连

---

## 🎉 完成后的下一步

当您在本地完成开发和测试后：

### 1. 提交代码到 GitHub

```bash
# 查看修改
git status
git diff

# 提交所有修改
git add .
git commit -m "feat: complete Webinar live room with Agora integration"

# 推送到 GitHub
git push origin main
```

### 2. 触发 Vercel 自动部署

推送到 GitHub 后，Vercel 会自动：
1. 检测到代码变更
2. 构建项目
3. 部署到生产环境
4. 提供部署预览链接

### 3. 验证生产环境

访问您的 Vercel 生产域名，确认：
- [ ] 所有页面正常加载
- [ ] Agora 视频功能正常
- [ ] 数据库连接正常（使用生产环境的 `DATABASE_URL`）
- [ ] 性能和稳定性符合预期

### 4. 监控和优化

- 使用 Vercel Analytics 监控性能
- 使用 Agora Console 查看使用统计
- 收集用户反馈
- 持续优化和改进

---

## 📞 联系方式

如果遇到无法解决的问题，可以：

1. **查看文档**：先查阅本项目的其他文档
2. **查看日志**：检查浏览器控制台和服务器日志
3. **搜索错误**：将错误信息复制到 Google 搜索
4. **查看官方文档**：
   - Agora: https://docs.agora.io/
   - Netless: https://docs.netless.link/
   - tRPC: https://trpc.io/docs
   - React: https://react.dev/

---

**祝您开发顺利！🚀**

如果有任何问题或需要进一步的帮助，请随时联系。
