# RealSourcing 去MOCK化部署检查清单

## ✅ 已完成的工作

### 1. 数据库连接 ✅
- [x] 配置 RDS 数据库连接
- [x] 创建 `.env` 配置文件
- [x] 测试数据库连接成功
- [x] 验证数据库版本（MySQL 8.0.36）

### 2. 数据初始化 ✅
- [x] 创建数据初始化脚本 `scripts/init-real-data.ts`
- [x] 添加 5 家真实工厂数据
- [x] 添加 4 个真实 Webinar 数据
- [x] 建立工厂-Webinar 关联关系
- [x] 验证数据导入成功（11 工厂，35 Webinar）

### 3. API 路由 ✅
- [x] 验证 webinar.router.ts 完整性
- [x] 验证 factory.router.ts 完整性
- [x] 确认所有 CRUD 操作可用
- [x] 测试 tRPC 路由正常工作

### 4. 前端代码 ✅
- [x] Webinars 页面使用 tRPC API
- [x] Factories 页面使用 tRPC API
- [x] 移除 Mock 数据依赖
- [x] 清空 mock-data.ts 文件
- [x] 配置 tRPC 客户端

### 5. 文档 ✅
- [x] 创建完成报告 `DEMOCK_COMPLETION_REPORT.md`
- [x] 创建快速启动指南 `QUICK_START_GUIDE.md`
- [x] 创建部署检查清单（本文件）
- [x] 代码提交到 GitHub

## 🔄 待完成的部署任务

### Vercel 前端部署

#### 步骤 1: 配置环境变量
- [ ] 登录 Vercel Dashboard
- [ ] 进入 RealSourcing 项目设置
- [ ] 添加以下环境变量：

```
DATABASE_URL=mysql://magicyang:****@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/realsourcing
SESSION_SECRET=realsourcing-secret-key-2026
AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE=c9b17e2664044dfe8160140d7e581d89
AGORA_CUSTOMER_ID=f48e44adf06a425a869ebebd62e90ad2
AGORA_CUSTOMER_SECRET=fea9118eeff340b8b9f00a53f215883b
VITE_AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
WHITEBOARD_AK=SURxe60Za4Na_LbR
WHITEBOARD_SK=iSb7lL_rxn3rjIZJSVPdOiSm8Kzh1SmN
VITE_WHITEBOARD_APP_ID=An5FAAdKEfGBPUteaMCQZA/HawDYn5_ZHWEOg
OPENAI_API_KEY=sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM
OPENAI_BASE_URL=https://once.novai.su/v1
OPENAI_MODEL=[逆次]o4-mini
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=<从本地.env复制>
OSS_ACCESS_KEY_SECRET=<从本地.env复制>
OSS_BUCKET=demand-os-discord
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
NODE_ENV=production
```

#### 步骤 2: 配置 API 端点
- [ ] 添加 `VITE_API_URL` 环境变量
  - 如果使用 ECS 后端: `http://47.99.205.136/api/trpc`
  - 如果使用 Vercel 全栈: `/api/trpc`

#### 步骤 3: 重新部署
- [ ] 触发 Vercel 重新部署
- [ ] 等待构建完成
- [ ] 检查部署日志

### 部署验证

#### 功能测试
- [ ] 访问前端首页
- [ ] 测试 Webinars 列表加载
- [ ] 测试 Factories 列表加载
- [ ] 测试搜索功能
- [ ] 测试筛选功能
- [ ] 测试 Webinar 详情页
- [ ] 测试 Factory 详情页

#### 数据验证
- [ ] 确认显示真实工厂数据（深圳精密模具等）
- [ ] 确认显示真实 Webinar 数据（橡塑展等）
- [ ] 确认工厂评分正确显示
- [ ] 确认认证信息正确显示

#### 性能测试
- [ ] 首页加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载正常
- [ ] 无控制台错误

## 🐛 常见问题排查

### API 连接失败
**症状**: 前端无法加载数据，控制台显示网络错误

**解决方案**:
1. 检查 `VITE_API_URL` 是否正确配置
2. 检查 CORS 设置
3. 确认后端服务器正在运行
4. 检查防火墙设置

### 数据显示为空
**症状**: 页面加载成功但没有数据

**解决方案**:
1. 检查数据库连接
2. 运行 `verify-data.ts` 验证数据
3. 检查 API 路由是否正确
4. 查看浏览器控制台错误

### 认证失败
**症状**: 无法登录或访问受保护的路由

**解决方案**:
1. 检查 `SESSION_SECRET` 配置
2. 确认 cookie 设置正确
3. 检查 CORS credentials 配置

## 📊 当前系统状态

| 组件 | 状态 | 说明 |
|------|------|------|
| 数据库连接 | ✅ | RDS MySQL 8.0.36 |
| 真实数据 | ✅ | 11 工厂，35 Webinar |
| API 路由 | ✅ | tRPC 完整实现 |
| 前端代码 | ✅ | 已移除 Mock 依赖 |
| 本地测试 | ✅ | 数据验证通过 |
| GitHub | ✅ | 代码已推送 |
| Vercel 部署 | ⏳ | 待配置环境变量 |

## 🚀 快速命令

### 本地开发
```bash
# 启动开发服务器
cd /home/ubuntu/RealSourcing
pnpm dev

# 验证数据
pnpm exec tsx verify-data.ts

# 测试数据库连接
pnpm exec tsx test-db-connection.ts
```

### 数据管理
```bash
# 重新初始化数据
pnpm exec tsx scripts/init-real-data.ts

# 查询数据库
mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com -u magicyang -p realsourcing
```

### Git 操作
```bash
# 查看状态
git status

# 推送更新
git add .
git commit -m "更新说明"
git push origin main
```

## 📝 部署记录

| 日期 | 操作 | 状态 | 备注 |
|------|------|------|------|
| 2026-02-17 | 配置数据库连接 | ✅ | RDS MySQL |
| 2026-02-17 | 导入真实数据 | ✅ | 5 工厂，4 Webinar |
| 2026-02-17 | 更新前端代码 | ✅ | 移除 Mock 依赖 |
| 2026-02-17 | 推送到 GitHub | ✅ | commit 540ce57 |
| 2026-02-17 | Vercel 部署 | ⏳ | 待配置 |

## 🎯 下一步行动

### 立即执行（优先级：高）
1. **配置 Vercel 环境变量**
   - 所有必需的环境变量
   - 特别注意 `VITE_API_URL`

2. **触发 Vercel 重新部署**
   - 确保使用最新代码
   - 检查构建日志

3. **验证部署**
   - 测试所有核心功能
   - 确认数据正确显示

### 后续优化（优先级：中）
4. **添加更多真实数据**
   - 更多工厂信息
   - 更多 Webinar 数据
   - 产品数据

5. **性能优化**
   - API 缓存
   - 图片优化
   - 数据库索引

6. **监控和日志**
   - 错误追踪
   - 性能监控
   - 访问日志

## 📞 支持信息

- **GitHub 仓库**: https://github.com/magicy565-web/RealSourcing
- **文档**: 查看 `DEMOCK_COMPLETION_REPORT.md`
- **快速启动**: 查看 `QUICK_START_GUIDE.md`

---

**最后更新**: 2026-02-17  
**当前状态**: 🟡 等待 Vercel 部署  
**完成度**: 85%
