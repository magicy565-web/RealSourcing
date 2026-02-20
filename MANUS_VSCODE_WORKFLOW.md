# Manus + VSCode 协同开发工作流

**目标**: 建立高效的 AI 辅助开发流程，确保代码质量和快速迭代

---

## 🎯 工作流概览

```
用户需求 → Manus 分析 → Manus 编码 → 推送到 GitHub
                                          ↓
                            您使用 VSCode SSH 连接服务器
                                          ↓
                              拉取代码 → 本地测试 → 验证
                                          ↓
                          测试通过 → 推送 → Vercel 自动部署
```

---

## 👥 角色分工

### Manus (AI Agent)
- ✅ 分析需求和技术方案
- ✅ 编写代码和修复 bug
- ✅ 推送代码到 GitHub
- ✅ 部署到阿里云 ECS
- ✅ 生成文档和测试报告

### 您 (开发者)
- ✅ 提出需求和反馈问题
- ✅ 使用 VSCode 连接服务器
- ✅ 本地测试和验证功能
- ✅ 最终确认和部署决策

---

## 🔄 完整开发流程

### 场景 1: 修复 Bug

#### 1. 您发现问题
```
问题: 注册功能无法使用
现象: 点击按钮没有反应
```

#### 2. 向 Manus 报告
```
"注册功能无法使用，点击按钮没有反应"
```

#### 3. Manus 诊断和修复
- 分析前后端代码
- 定位问题根源
- 修复代码并推送到 GitHub
- 部署到阿里云 ECS

#### 4. 您验证修复
```bash
# 步骤 1: 使用 VSCode Remote-SSH 连接服务器
# (参考 VSCODE_REMOTE_SSH_GUIDE.md)

# 步骤 2: 拉取最新代码
cd /var/www/realsourcing
git pull origin main

# 步骤 3: 重启服务
pm2 restart realsourcing-api

# 步骤 4: 测试注册 API
curl -X POST https://api.cnsubscribe.xyz/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{"json":{"name":"Test","email":"test@example.com","password":"password123","role":"buyer"}}'

# 步骤 5: 在浏览器测试前端
# 访问 https://real-sourcing.vercel.app/register
```

#### 5. 反馈结果
- ✅ 如果成功: "注册功能已修复，测试通过！"
- ❌ 如果失败: "还是有问题，错误信息是..."

---

### 场景 2: 开发新功能

#### 1. 您提出需求
```
"我需要一个产品搜索功能，可以按名称和类别筛选"
```

#### 2. Manus 设计方案
- 分析需求
- 设计 API 接口
- 规划前后端实现

#### 3. Manus 实现功能
- 后端: 创建 `product.search` tRPC 接口
- 前端: 创建搜索组件
- 推送代码到 GitHub

#### 4. 您本地测试
```bash
# 方法 A: 在服务器上测试
# 使用 VSCode Remote-SSH 连接
cd /var/www/realsourcing
git pull
pm2 restart realsourcing-api

# 方法 B: 在本地测试
# 克隆项目到本地
git clone https://github.com/magicy565-web/RealSourcing.git
cd RealSourcing
pnpm install
./dev.sh full
```

#### 5. 迭代优化
- 测试发现问题 → 反馈给 Manus
- Manus 修复 → 您再次测试
- 直到功能完善

---

## 🛠️ 常用开发场景

### 场景 A: 快速验证 API

**目标**: 不启动前端，直接测试后端 API

```bash
# 方法 1: 使用 curl
curl -X POST https://api.cnsubscribe.xyz/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"buyer@test.com","password":"password123"}}'

# 方法 2: 使用 VSCode Thunder Client 插件
# 1. 安装 Thunder Client 插件
# 2. 创建新请求
# 3. 设置 URL 和 Body
# 4. 点击 Send
```

### 场景 B: 调试前端组件

**目标**: 修改前端代码并实时查看效果

```bash
# 步骤 1: 在本地启动前端
cd /path/to/RealSourcing
pnpm dev

# 步骤 2: 在 VSCode 中编辑组件
# 例如: client/src/pages/Register.tsx

# 步骤 3: 保存文件
# Vite 会自动热重载，浏览器立即更新

# 步骤 4: 在浏览器中测试
# 访问 http://localhost:5173/register
```

### 场景 C: 数据库调试

**目标**: 查看和修改数据库数据

```bash
# 方法 1: 使用 Prisma Studio
npx prisma studio
# 访问 http://localhost:5555

# 方法 2: 使用 MySQL 客户端
mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com \
      -u magicyang \
      -p \
      realsourcing
# 输入密码: Wysk1214

# 查询用户
SELECT * FROM users;

# 删除测试数据
DELETE FROM users WHERE email LIKE '%test%';
```

---

## 📋 最佳实践

### 1. 开发前准备

- ✅ 确保本地环境已安装 Node.js 和 pnpm
- ✅ 配置好 VSCode Remote-SSH
- ✅ 熟悉项目结构和技术栈

### 2. 代码修改流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支 (可选)
git checkout -b feature/your-feature-name

# 3. 修改代码

# 4. 本地测试

# 5. 提交代码
git add .
git commit -m "feat: 你的功能描述"
git push origin main
```

### 3. 测试策略

- ✅ **单元测试**: 后端 API 测试 (使用 curl 或 Thunder Client)
- ✅ **集成测试**: 前后端联调测试
- ✅ **端到端测试**: 在浏览器中完整操作流程

### 4. 问题排查

```bash
# 1. 查看后端日志
pm2 logs realsourcing-api

# 2. 查看 Nginx 日志
tail -f /var/log/nginx/error.log

# 3. 查看浏览器控制台
# 按 F12 打开开发者工具

# 4. 查看网络请求
# 在开发者工具的 Network 标签页
```

---

## 🚀 高效协作技巧

### 技巧 1: 使用 Git 分支

```bash
# 主分支 (main): 稳定版本
# 开发分支 (dev): 开发中的功能
# 功能分支 (feature/*): 单个功能开发

# 创建功能分支
git checkout -b feature/product-search

# 开发完成后合并到 main
git checkout main
git merge feature/product-search
git push origin main
```

### 技巧 2: 使用环境变量

```bash
# 本地开发: .env.local
VITE_API_URL=http://localhost:3001/api/trpc

# 生产环境: .env (Vercel)
VITE_API_URL=https://api.cnsubscribe.xyz/api/trpc
```

### 技巧 3: 快速回滚

```bash
# 如果新代码有问题，快速回滚到上一个版本
git revert HEAD
git push origin main

# 或者回滚到指定提交
git reset --hard <commit-hash>
git push origin main --force
```

---

## 📊 开发效率对比

| 方式 | 开发速度 | 测试效率 | 部署风险 |
|------|---------|---------|---------|
| **直接在生产环境调试** | ⭐⭐ | ⭐ | ⚠️ 高 |
| **Manus + VSCode 协同** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 低 |

---

## 🎓 学习资源

### 推荐阅读
- [tRPC 官方文档](https://trpc.io/docs)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [VSCode Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)

### 项目文档
- `README.md` - 项目概览
- `MODULAR_MONOLITH_ARCHITECTURE.md` - 架构设计
- `DEPLOYMENT_GUIDE.md` - 部署指南
- `VSCODE_REMOTE_SSH_GUIDE.md` - VSCode SSH 配置

---

## 📞 获取帮助

### 遇到问题时

1. **查看日志**: `pm2 logs realsourcing-api`
2. **查看文档**: 项目根目录的 Markdown 文档
3. **询问 Manus**: 描述问题和错误信息
4. **GitHub Issues**: 提交 Issue 记录问题

---

## 🎉 总结

通过 **Manus + VSCode + SSH** 协同开发，您可以：

- ✅ **快速迭代**: Manus 编码，您测试，效率翻倍
- ✅ **降低风险**: 本地测试通过后再部署
- ✅ **提升质量**: 完整的测试流程保证代码质量
- ✅ **灵活控制**: 随时可以接管开发或回滚

**现在就开始使用这套工作流，让开发变得更高效！** 🚀
