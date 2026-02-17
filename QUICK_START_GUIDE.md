# RealSourcing 快速启动指南

## 🚀 本地开发

### 前提条件

- Node.js 18+
- pnpm 8+
- MySQL 8.0+ (或访问 RDS 数据库)

### 1. 克隆项目

```bash
git clone https://github.com/magicy565-web/RealSourcing.git
cd RealSourcing
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要的配置：

```env
# 数据库（必需）
DATABASE_URL=mysql://username:password@host:port/database

# Session（必需）
SESSION_SECRET=your-secret-key

# 声网（必需）
AGORA_APP_ID=your-app-id
AGORA_APP_CERTIFICATE=your-certificate

# 其他配置...
```

### 4. 测试数据库连接

```bash
pnpm exec tsx test-db-connection.ts
```

应该看到：
```
✅ 数据库连接成功！
📊 数据库信息: [ { db: 'realsourcing', version: '8.0.36' } ]
```

### 5. 初始化数据（可选）

如果数据库是空的，运行数据初始化脚本：

```bash
pnpm exec tsx scripts/init-real-data.ts
```

### 6. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5000` 启动。

### 7. 访问应用

打开浏览器访问：
- 前端: http://localhost:5000
- API: http://localhost:5000/api/trpc

## 📦 生产部署

### Vercel 部署（推荐）

1. **连接 GitHub 仓库**
   - 访问 [Vercel](https://vercel.com)
   - 导入 GitHub 仓库 `magicy565-web/RealSourcing`

2. **配置环境变量**
   
   在 Vercel 项目设置中添加所有环境变量（参考 `.env.example`）

3. **部署**
   
   Vercel 会自动检测配置并部署

### 手动部署

1. **构建项目**

```bash
pnpm build
```

2. **启动生产服务器**

```bash
pnpm start
```

## 🔧 常用命令

```bash
# 开发
pnpm dev                    # 启动开发服务器
pnpm build                  # 构建生产版本
pnpm start                  # 启动生产服务器

# 数据库
pnpm db:push               # 推送schema到数据库
pnpm db:migrate            # 运行数据库迁移

# 测试
pnpm test                  # 运行测试

# 数据管理
pnpm exec tsx scripts/init-real-data.ts    # 初始化真实数据
pnpm exec tsx verify-data.ts               # 验证数据
```

## 🐛 故障排除

### 数据库连接失败

1. 检查 `DATABASE_URL` 是否正确
2. 确认数据库服务器正在运行
3. 检查防火墙/白名单设置

### API 请求失败

1. 检查后端服务器是否启动
2. 确认 `VITE_API_URL` 配置正确
3. 查看浏览器控制台错误信息

### 前端无法访问

1. 确认端口 5000 未被占用
2. 检查防火墙设置
3. 尝试清除浏览器缓存

## 📚 更多文档

- [完整部署报告](./DEMOCK_COMPLETION_REPORT.md)
- [项目架构](./PRODUCTION_ARCHITECTURE.md)
- [API 文档](./docs/)

## 💡 提示

- 开发环境使用相对路径 `/api/trpc`
- 生产环境需要配置完整的 `VITE_API_URL`
- 所有敏感信息都应该通过环境变量配置
- 不要将 `.env` 文件提交到 Git

## 🆘 获取帮助

如有问题，请：
1. 查看文档
2. 检查 GitHub Issues
3. 联系开发团队

---

**祝您使用愉快！** 🎉
