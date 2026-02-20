# VSCode Remote SSH 开发指南

**目标**: 使用 VSCode 直接连接到阿里云 ECS 服务器进行实时开发和调试

---

## 📋 前置要求

- ✅ VSCode 已安装
- ✅ 阿里云 ECS 服务器信息：
  - **IP**: `47.99.205.136`
  - **用户**: `root`
  - **密码**: `Wysk1214`
  - **项目路径**: `/var/www/realsourcing`

---

## 🚀 快速开始

### 步骤 1: 安装 Remote-SSH 插件

1. 打开 VSCode
2. 点击左侧扩展图标 (或按 `Ctrl+Shift+X`)
3. 搜索 `Remote - SSH`
4. 点击 **Install** 安装插件

### 步骤 2: 配置 SSH 连接

#### 方法 A: 使用 VSCode 界面配置

1. 按 `F1` 打开命令面板
2. 输入 `Remote-SSH: Connect to Host...`
3. 选择 `Configure SSH Hosts...`
4. 选择第一个配置文件 (通常是 `~/.ssh/config`)
5. 添加以下配置：

```ssh-config
Host realsourcing-ecs
    HostName 47.99.205.136
    User root
    Port 22
    ServerAliveInterval 60
```

6. 保存文件

#### 方法 B: 手动编辑配置文件

**Windows**: 编辑 `C:\Users\你的用户名\.ssh\config`  
**Mac/Linux**: 编辑 `~/.ssh/config`

添加以下内容：

```ssh-config
Host realsourcing-ecs
    HostName 47.99.205.136
    User root
    Port 22
    ServerAliveInterval 60
```

### 步骤 3: 连接到服务器

1. 按 `F1` 打开命令面板
2. 输入 `Remote-SSH: Connect to Host...`
3. 选择 `realsourcing-ecs`
4. 输入密码: `Wysk1214`
5. 等待 VSCode 连接并安装 VSCode Server

### 步骤 4: 打开项目文件夹

1. 连接成功后，点击 `File` → `Open Folder...`
2. 输入路径: `/var/www/realsourcing`
3. 点击 `OK`

---

## 💻 开发工作流

### 1. 启动后端服务

在 VSCode 终端中执行：

```bash
cd /var/www/realsourcing
pnpm dev:server
```

后端将在 `http://localhost:3001` 启动。

### 2. 启动前端服务 (可选)

如果需要在服务器上测试前端：

```bash
cd /var/www/realsourcing
pnpm dev
```

前端将在 `http://localhost:5173` 启动。

**注意**: 由于服务器没有图形界面，建议在本地启动前端，配置 `VITE_API_URL=https://api.cnsubscribe.xyz/api/trpc`。

### 3. 实时编辑代码

- 在 VSCode 中直接编辑文件
- 保存后，后端会自动重启 (使用 `tsx --watch`)
- 前端会自动热重载 (Vite HMR)

### 4. 查看日志

```bash
# 查看 PM2 日志
pm2 logs realsourcing-api

# 或查看实时输出
pnpm dev:server
```

### 5. 测试 API

在 VSCode 终端中：

```bash
# 测试注册 API
curl -X POST https://api.cnsubscribe.xyz/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{"json":{"name":"Test","email":"test@example.com","password":"password123","role":"buyer"}}'

# 测试登录 API
curl -X POST https://api.cnsubscribe.xyz/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"buyer@test.com","password":"password123"}}'
```

### 6. 提交代码

```bash
git add .
git commit -m "feat: 你的修改说明"
git push origin main
```

---

## 🛠️ 常用命令

### 数据库操作

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 Schema 到数据库
npx prisma db push

# 填充测试数据
pnpm tsx prisma/seed.ts

# 打开 Prisma Studio (数据库可视化工具)
npx prisma studio
```

### 服务管理

```bash
# 重启后端服务
pm2 restart realsourcing-api

# 查看服务状态
pm2 list

# 查看服务日志
pm2 logs realsourcing-api

# 停止服务
pm2 stop realsourcing-api

# 删除服务
pm2 delete realsourcing-api
```

### 依赖管理

```bash
# 安装新依赖
pnpm add <package-name>

# 安装开发依赖
pnpm add -D <package-name>

# 更新依赖
pnpm update
```

---

## 🎯 推荐的 VSCode 插件

安装以下插件以提升开发体验：

1. **Prisma** - Prisma Schema 语法高亮和自动补全
2. **ESLint** - JavaScript/TypeScript 代码检查
3. **Prettier** - 代码格式化
4. **GitLens** - Git 增强工具
5. **Thunder Client** - API 测试工具 (类似 Postman)
6. **Error Lens** - 实时显示错误和警告

---

## 🔧 常见问题

### Q1: 无法连接到服务器

**解决方案**:
1. 检查服务器 IP 是否正确
2. 确认防火墙允许 SSH (端口 22)
3. 尝试使用密码认证而不是密钥

### Q2: VSCode Server 安装失败

**解决方案**:
```bash
# 在服务器上手动清理
rm -rf ~/.vscode-server
```

然后重新连接。

### Q3: 权限不足

**解决方案**:
```bash
# 修改项目目录权限
sudo chown -R root:root /var/www/realsourcing
sudo chmod -R 755 /var/www/realsourcing
```

### Q4: 端口已被占用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

---

## 📚 进阶技巧

### 1. 使用 SSH 密钥认证 (推荐)

生成 SSH 密钥对：

```bash
# 在本地机器上执行
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥复制到服务器
ssh-copy-id root@47.99.205.136
```

然后更新 `~/.ssh/config`:

```ssh-config
Host realsourcing-ecs
    HostName 47.99.205.136
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
```

### 2. 端口转发

如果需要在本地访问服务器上的服务：

```ssh-config
Host realsourcing-ecs
    HostName 47.99.205.136
    User root
    Port 22
    LocalForward 3001 localhost:3001
    LocalForward 5173 localhost:5173
```

这样您可以在本地浏览器访问 `http://localhost:3001`。

### 3. 多终端管理

使用 VSCode 的分屏终端功能：

- **终端 1**: 运行后端 (`pnpm dev:server`)
- **终端 2**: 查看 PM2 日志 (`pm2 logs`)
- **终端 3**: 执行 Git 命令

---

## 🎉 开发流程示例

### 场景: 修复注册功能

1. **连接服务器**: 使用 Remote-SSH 连接到 `realsourcing-ecs`
2. **打开项目**: 打开 `/var/www/realsourcing`
3. **查看日志**: 在终端运行 `pm2 logs realsourcing-api`
4. **定位问题**: 在 `server/modules/auth/auth.service.ts` 中找到注册逻辑
5. **修改代码**: 修复 bug 并保存
6. **重启服务**: `pm2 restart realsourcing-api`
7. **测试 API**: 使用 curl 或 Thunder Client 测试
8. **提交代码**: `git add . && git commit -m "fix: 修复注册功能" && git push`
9. **等待部署**: Vercel 自动部署前端

---

## 📞 技术支持

如有问题，请查看：
- 项目 README
- DEPLOYMENT_GUIDE.md
- PM2 日志: `pm2 logs realsourcing-api`
- Nginx 日志: `/var/log/nginx/error.log`

---

**配置完成后，您就可以像在本地一样开发 RealSourcing 项目了！** 🚀
