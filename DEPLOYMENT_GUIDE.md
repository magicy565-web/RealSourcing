# RealSourcing 部署和使用指南

## ✅ 重构完成

已成功完成 Modular Monolith 架构重构！

### 核心改进

1. **删除 Drizzle ORM**，使用 **Prisma 5.22.0**
2. **模块化架构**：Auth, Webinar, Factory, Product 等模块独立
3. **tRPC 11.10.0**：端到端类型安全
4. **Express 服务器**：统一 API 入口
5. **数据库同步**：已推送到阿里云 RDS

---

## 🚀 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

`.env` 文件已配置好，包含：
- 数据库连接（阿里云 RDS）
- JWT Secret
- Agora 配置
- OSS 配置
- AI API 配置

### 3. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 4. 启动后端服务器

```bash
pnpm dev:server
```

服务器将运行在 `http://localhost:3001`

### 5. 启动前端开发服务器

```bash
pnpm dev
```

前端将运行在 `http://localhost:5173`

---

## 📦 生产部署

### 方案 A：阿里云 ECS（当前配置）

1. **SSH 登录 ECS**
   ```bash
   ssh root@47.99.205.136
   # 密码：Wysk1214
   ```

2. **克隆代码**
   ```bash
   cd /var/www
   git clone <your-repo-url> RealSourcing
   cd RealSourcing
   ```

3. **安装依赖**
   ```bash
   pnpm install
   pnpm prisma:generate
   ```

4. **构建项目**
   ```bash
   pnpm build
   pnpm build:server
   ```

5. **使用 PM2 运行**
   ```bash
   pm2 start dist/server/index.js --name realsourcing-api
   pm2 save
   pm2 startup
   ```

6. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # 前端静态文件
       location / {
           root /var/www/RealSourcing/dist/public;
           try_files $uri $uri/ /index.html;
       }

       # API 代理
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 方案 B：Vercel（前端） + ECS（后端）

1. **部署前端到 Vercel**
   ```bash
   vercel --prod
   ```

2. **配置 Vercel 环境变量**
   ```
   VITE_API_URL=http://47.99.205.136:3001/api/trpc
   ```

3. **后端继续运行在 ECS**（参考方案 A 步骤 3-5）

---

## 📡 API 文档

### tRPC Endpoints

所有 API 通过 tRPC 调用，基础 URL：`/api/trpc`

#### Auth 模块

- `auth.register` - 用户注册
- `auth.login` - 用户登录
- `auth.logout` - 用户登出
- `auth.me` - 获取当前用户信息

#### Webinar 模块

- `webinar.create` - 创建 Webinar
- `webinar.list` - 获取 Webinar 列表
- `webinar.getById` - 获取 Webinar 详情
- `webinar.update` - 更新 Webinar
- `webinar.delete` - 删除 Webinar
- `webinar.addParticipant` - 添加参会者
- `webinar.addProducts` - 添加产品

#### Factory 模块

- `factory.list` - 获取工厂列表
- `factory.getById` - 获取工厂详情

#### Product 模块

- `product.list` - 获取产品列表
- `product.getById` - 获取产品详情
- `product.listByFactory` - 获取工厂的产品列表

---

## 🗄️ 数据库管理

### 查看数据库

```bash
pnpm prisma:studio
```

将在浏览器打开 Prisma Studio（`http://localhost:5555`）

### 推送 Schema 变更

```bash
pnpm prisma:push
```

### 创建迁移

```bash
npx prisma migrate dev --name <migration_name>
```

---

## 🔧 故障排查

### 问题 1：后端无法连接数据库

**检查**：
```bash
# 测试数据库连接
mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com -u magicyang -p realsourcing
```

**解决**：
- 确认 `.env` 中 `DATABASE_URL` 正确
- 确认阿里云 RDS 白名单已添加 ECS IP

### 问题 2：前端无法调用 API

**检查**：
```bash
# 测试 API 是否可访问
curl http://localhost:3001/health
```

**解决**：
- 确认后端服务器正在运行
- 确认 `VITE_API_URL` 环境变量正确
- 检查 CORS 配置

### 问题 3：tRPC 类型错误

**解决**：
```bash
# 重新生成 Prisma Client
pnpm prisma:generate

# 重启 TypeScript 服务器（VSCode）
Cmd/Ctrl + Shift + P -> TypeScript: Restart TS Server
```

---

## 📊 项目结构

```
RealSourcing/
├── server/                  # 后端代码
│   ├── modules/             # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── webinar/         # Webinar 模块
│   │   ├── factory/         # 工厂模块
│   │   ├── product/         # 产品模块
│   │   └── ...
│   ├── shared/              # 共享基础设施
│   │   ├── prisma/          # Prisma 客户端
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── trpc/                # tRPC 配置
│   │   ├── context.ts       # Context
│   │   ├── trpc.ts          # tRPC 初始化
│   │   └── router.ts        # 根路由
│   └── index.ts             # 服务器入口
│
├── client/                  # 前端代码
│   └── src/
│       ├── lib/trpc.ts      # tRPC 客户端
│       ├── pages/           # 页面组件
│       └── components/      # UI 组件
│
├── prisma/                  # Prisma 配置
│   └── schema.prisma        # 数据库 Schema
│
├── .env                     # 环境变量
├── package.json             # 项目配置
└── README.md                # 项目说明
```

---

## 🎯 下一步优化建议

1. **添加更多模块**
   - Agora 集成（RTC, RTM, Whiteboard）
   - Subscription 订阅管理
   - Message 消息系统
   - Analytics 数据分析

2. **性能优化**
   - 添加 Redis 缓存
   - 实现 API 响应缓存
   - 优化数据库查询（索引、N+1 问题）

3. **安全加固**
   - 实现 Rate Limiting
   - 添加 CSRF 保护
   - 实现 API Key 管理

4. **监控和日志**
   - 集成 Sentry 错误追踪
   - 添加 Winston 日志系统
   - 实现性能监控

5. **测试**
   - 添加单元测试（Vitest）
   - 添加集成测试
   - 添加 E2E 测试（Playwright）

---

## 📞 支持

如有问题，请查看：
- 项目 README
- Prisma 文档：https://www.prisma.io/docs
- tRPC 文档：https://trpc.io/docs

---

**重构完成时间**：2026年2月20日  
**架构版本**：Modular Monolith v1.0  
**技术栈**：Prisma 5.22 + tRPC 11.10 + Express 5.2 + React 19
