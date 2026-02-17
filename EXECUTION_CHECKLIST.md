# RealSourcing 数据库增强执行清单

**创建日期**: 2026-02-17  
**状态**: 🟡 待执行  
**预计完成时间**: 2-3 周

---

## 📋 执行概览

本清单将指导你和你的团队完成 RealSourcing 数据库增强的所有步骤。请按照优先级顺序执行,并在完成后勾选对应的复选框。

---

## 🚨 阶段 0: 准备工作 (必须完成)

### 0.1 环境准备

- [ ] **备份生产数据库**
  ```bash
  mysqldump -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
  ⚠️ **重要**: 将备份文件保存到安全位置

- [ ] **验证数据库连接**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT VERSION();"
  ```

- [ ] **检查磁盘空间**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'magicyang' GROUP BY table_schema;"
  ```

- [ ] **克隆最新代码**
  ```bash
  cd /home/ubuntu
  git clone https://github.com/magicy565-web/RealSourcing.git
  cd RealSourcing
  git pull origin main
  ```

---

## 🔥 阶段 1: 数据库迁移 (P0 - 最高优先级)

**预计时间**: 1-2 天  
**负责人**: 后端开发 / DBA

### 1.1 测试环境迁移

- [ ] **在测试数据库执行迁移脚本**
  ```bash
  # 如果有测试数据库,先在测试环境执行
  mysql -u [test_user] -p -h [test_host] [test_db] < migrations/001_database_enhancement.sql
  ```

- [ ] **验证测试环境表结构**
  ```bash
  mysql -u [test_user] -p -h [test_host] [test_db] -e "SHOW TABLES;"
  mysql -u [test_user] -p -h [test_host] [test_db] -e "DESCRIBE webinars;"
  mysql -u [test_user] -p -h [test_host] [test_db] -e "DESCRIBE buyer_profiles;"
  ```

- [ ] **测试环境功能测试**
  - 测试现有功能是否正常
  - 测试新增字段是否可用
  - 测试新表是否创建成功

### 1.2 生产环境迁移

⚠️ **建议在低峰期执行 (如凌晨 2-4 点)**

- [ ] **再次备份生产数据库**
  ```bash
  mysqldump -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **执行生产环境迁移**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang < migrations/001_database_enhancement.sql
  ```

- [ ] **验证生产环境表结构**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SHOW TABLES;"
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "DESCRIBE webinars;"
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT COUNT(*) FROM buyer_profiles;"
  ```

- [ ] **验证现有数据完整性**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT COUNT(*) FROM webinars;"
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT COUNT(*) FROM webinar_products;"
  ```

### 1.3 迁移后验证

- [ ] **检查索引是否创建**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SHOW INDEX FROM webinars;"
  ```

- [ ] **检查新字段默认值**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT id, title, registrationCount, viewCount, shareCount FROM webinars LIMIT 5;"
  ```

- [ ] **检查新表是否为空**
  ```bash
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT COUNT(*) FROM buyer_profiles;"
  mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang -e "SELECT COUNT(*) FROM live_interactions;"
  ```

---

## 🔧 阶段 2: 更新 Drizzle Schema (P0)

**预计时间**: 1 天  
**负责人**: 后端开发

### 2.1 更新 Schema 文件

- [ ] **备份现有 schema.ts**
  ```bash
  cd /home/ubuntu/RealSourcing
  cp drizzle/schema.ts drizzle/schema_backup_$(date +%Y%m%d).ts
  ```

- [ ] **替换为增强版 schema**
  ```bash
  cp drizzle/schema_enhancement.ts drizzle/schema.ts
  ```

- [ ] **安装依赖**
  ```bash
  pnpm install
  ```

- [ ] **推送 schema 到数据库**
  ```bash
  pnpm run db:push
  ```

### 2.2 验证 TypeScript 类型

- [ ] **检查类型生成**
  ```bash
  pnpm run db:generate
  ```

- [ ] **检查 TypeScript 编译**
  ```bash
  pnpm run type-check
  ```

- [ ] **修复类型错误** (如果有)

---

## 🚀 阶段 3: 扩展 tRPC API (P0)

**预计时间**: 2-3 天  
**负责人**: 后端开发

### 3.1 更新 Webinar Router

- [ ] **打开 `server/routers/webinar.router.ts`**

- [ ] **添加新的 API 端点**:
  - [ ] `getEnhancedById` - 获取增强的 Webinar 详情
  - [ ] `listByIndustry` - 按行业筛选
  - [ ] `searchByTopics` - 按主题搜索
  - [ ] `getAIRecommendations` - 获取 AI 推荐
  - [ ] `incrementViewCount` - 增加浏览量
  - [ ] `incrementShareCount` - 增加分享次数

- [ ] **参考 `FRONTEND_ADAPTATION_GUIDE.md` 中的代码示例**

- [ ] **测试新 API 端点**
  ```bash
  pnpm run dev
  # 使用 Postman 或 curl 测试 API
  ```

### 3.2 新建 Buyer Router

- [ ] **创建 `server/routers/buyer.router.ts`**

- [ ] **添加 API 端点**:
  - [ ] `getProfile` - 获取买家画像
  - [ ] `updateProfile` - 更新买家画像
  - [ ] `incrementWebinarsAttended` - 增加参会次数

- [ ] **在 `server/routers/index.ts` 中注册 router**
  ```typescript
  import { buyerRouter } from './buyer.router';
  
  export const appRouter = router({
    webinar: webinarRouter,
    buyer: buyerRouter,
    // ... 其他 routers
  });
  ```

### 3.3 新建 AI Router (可选)

- [ ] **创建 `server/routers/ai.router.ts`**

- [ ] **添加 API 端点**:
  - [ ] `generateWebinarReport` - 生成会议报告
  - [ ] `analyzeBuyerIntent` - 分析买家意向
  - [ ] `recommendProducts` - 推荐产品

---

## 🎨 阶段 4: 更新前端类型定义 (P1)

**预计时间**: 1 天  
**负责人**: 前端开发

### 4.1 更新 Webinar 类型

- [ ] **打开 `client/src/types/webinar.ts`**

- [ ] **添加新字段** (参考 `FRONTEND_ADAPTATION_GUIDE.md`)
  - [ ] 讲师信息 (7 个字段)
  - [ ] 组织信息 (6 个字段)
  - [ ] 分类标签 (4 个字段)
  - [ ] 营销展示 (7 个字段)
  - [ ] 统计数据 (8 个字段)
  - [ ] 互动数据 (5 个字段)
  - [ ] SEO 字段 (4 个字段)
  - [ ] 设置字段 (8 个字段)
  - [ ] 商业数据 (4 个字段)

### 4.2 更新 WebinarProduct 类型

- [ ] **打开 `client/src/types/product.ts`**

- [ ] **添加新字段** (参考 `FRONTEND_ADAPTATION_GUIDE.md`)
  - [ ] 展示排序 (4 个字段)
  - [ ] 产品详情 (6 个字段)
  - [ ] 采购信息 (7 个字段)
  - [ ] 统计数据 (6 个字段)
  - [ ] 营销信息 (4 个字段)

### 4.3 新建 BuyerProfile 类型

- [ ] **创建 `client/src/types/buyer.ts`**

- [ ] **定义完整的 BuyerProfile 接口** (参考 `FRONTEND_ADAPTATION_GUIDE.md`)

### 4.4 新建 AI 相关类型

- [ ] **创建 `client/src/types/ai.ts`**

- [ ] **定义 AIRecommendation 接口**

- [ ] **定义 WebinarReport 接口**

---

## 🖼️ 阶段 5: 更新前端组件 (P1)

**预计时间**: 3-5 天  
**负责人**: 前端开发

### 5.1 增强 WebinarCard 组件

- [ ] **打开 `client/src/components/WebinarCard.tsx`**

- [ ] **添加新的展示元素**:
  - [ ] 讲师信息 (头像、姓名、职位)
  - [ ] 行业标签
  - [ ] 主题标签
  - [ ] 统计数据 (注册人数、浏览量、评分)
  - [ ] 核心亮点

- [ ] **参考 `FRONTEND_ADAPTATION_GUIDE.md` 中的代码示例**

- [ ] **测试组件渲染**

### 5.2 增强 WebinarDetail 页面

- [ ] **打开 `client/src/pages/WebinarDetail.tsx`**

- [ ] **添加新的展示区块**:
  - [ ] 讲师详细信息区
  - [ ] 主办方信息区
  - [ ] 议程展示区
  - [ ] 学习成果展示
  - [ ] 统计数据面板
  - [ ] 产品展示区 (增强版)

- [ ] **集成 AI 推荐组件**

- [ ] **测试页面功能**

### 5.3 新建 AIRecommendations 组件

- [ ] **创建 `client/src/components/AIRecommendations.tsx`**

- [ ] **实现功能**:
  - [ ] 获取 AI 推荐数据
  - [ ] 展示推荐产品卡片
  - [ ] 显示匹配度和匹配原因
  - [ ] 追踪点击事件

- [ ] **参考 `FRONTEND_ADAPTATION_GUIDE.md` 中的代码示例**

- [ ] **测试组件功能**

### 5.4 新建 WebinarReport 页面

- [ ] **创建 `client/src/pages/WebinarReport.tsx`**

- [ ] **实现功能**:
  - [ ] 核心数据卡片
  - [ ] 热门产品排行
  - [ ] 高意向买家列表
  - [ ] AI 洞察展示
  - [ ] AI 建议展示

- [ ] **参考 `FRONTEND_ADAPTATION_GUIDE.md` 中的代码示例**

- [ ] **添加路由**
  ```typescript
  // 在 App.tsx 或 router.tsx 中添加
  <Route path="/webinars/:id/report" element={<WebinarReport />} />
  ```

- [ ] **测试页面功能**

### 5.5 新建 BuyerProfileSettings 页面 (可选)

- [ ] **创建 `client/src/pages/BuyerProfileSettings.tsx`**

- [ ] **实现功能**:
  - [ ] 店铺信息表单
  - [ ] 经营特征表单
  - [ ] 采购偏好表单
  - [ ] 保存/更新功能

---

## 📊 阶段 6: 数据填充 (P1)

**预计时间**: 持续进行  
**负责人**: 运营 / 数据团队

### 6.1 填充现有 Webinar 数据

- [ ] **为现有 Webinar 添加讲师信息**
  ```sql
  UPDATE webinars SET 
    speaker = '讲师姓名',
    speakerTitle = '职位',
    speakerCompany = '公司',
    speakerBio = '简介'
  WHERE id = [webinar_id];
  ```

- [ ] **为现有 Webinar 添加行业和主题标签**
  ```sql
  UPDATE webinars SET 
    industry = 'Apparel',
    topics = '["Supply Chain", "Sustainability"]'
  WHERE id = [webinar_id];
  ```

- [ ] **为现有 Webinar 添加核心亮点**
  ```sql
  UPDATE webinars SET 
    highlights = '["亮点1", "亮点2", "亮点3"]'
  WHERE id = [webinar_id];
  ```

### 6.2 导入真实 B2B Webinar

根据《RealSourcing即将举办的真实B2BWebinar收集指南》:

- [ ] **从 Innovation Forum 收集活动**
  - [ ] 访问 https://www.innovationforum.co.uk/events
  - [ ] 收集至少 2 个相关活动

- [ ] **从 Eventbrite 收集活动**
  - [ ] 搜索 "B2B Webinar" 或 "Supply Chain"
  - [ ] 收集至少 2 个相关活动

- [ ] **从 LinkedIn Events 收集活动**
  - [ ] 搜索相关行业活动
  - [ ] 收集至少 2 个相关活动

- [ ] **填充到 external_events 表**
  ```sql
  INSERT INTO external_events (
    source, title, description, speaker, speakerTitle, 
    speakerCompany, organizer, registrationUrl, scheduledAt, 
    industry, topics
  ) VALUES (
    'Innovation Forum',
    '活动标题',
    '活动描述',
    '讲师姓名',
    '讲师职位',
    '讲师公司',
    '主办方',
    '注册链接',
    '2026-03-15 14:00:00',
    'Apparel',
    '["Supply Chain", "Sustainability"]'
  );
  ```

- [ ] **同步到 webinars 表** (手动或脚本)

### 6.3 填充产品详情

- [ ] **为现有产品添加详细信息**
  ```sql
  UPDATE webinar_products SET 
    specifications = '{"size": "30x15cm", "material": "ABS"}',
    features = '["3档调光", "USB充电"]',
    images = '["image1.jpg", "image2.jpg"]',
    moq = 100,
    leadTime = '7-10 days',
    customizable = 1
  WHERE id = [product_id];
  ```

### 6.4 创建示例买家画像

- [ ] **为测试用户创建买家画像**
  ```sql
  INSERT INTO buyer_profiles (
    userId, shopType, shopName, mainCategories, 
    priceRangeMin, priceRangeMax, preferredMoqMin, preferredMoqMax
  ) VALUES (
    [user_id],
    'TikTok Shop',
    'My Shop',
    '["Home & Garden", "Electronics"]',
    5.00,
    50.00,
    50,
    500
  );
  ```

---

## 🤖 阶段 7: AI 功能开发 (P2)

**预计时间**: 1-2 周  
**负责人**: AI/后端开发

### 7.1 买家画像分析

- [ ] **创建 `server/services/buyer-analysis.service.ts`**

- [ ] **实现功能**:
  - [ ] 分析买家采购历史
  - [ ] 识别产品偏好
  - [ ] 计算信用评分

### 7.2 产品推荐算法

- [ ] **创建 `server/services/recommendation.service.ts`**

- [ ] **实现功能**:
  - [ ] 基于买家画像匹配产品
  - [ ] 计算匹配度分数
  - [ ] 生成匹配原因

- [ ] **集成 OpenAI API** (可选)
  ```typescript
  import OpenAI from 'openai';
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
  });
  
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      { role: "system", content: "你是一个B2B产品推荐专家" },
      { role: "user", content: `分析买家画像并推荐产品: ${JSON.stringify(buyerProfile)}` }
    ]
  });
  ```

### 7.3 会议报告生成

- [ ] **创建 `server/services/report-generation.service.ts`**

- [ ] **实现功能**:
  - [ ] 统计会议数据
  - [ ] 识别热门产品
  - [ ] 识别高意向买家
  - [ ] 生成 AI 洞察 (使用 OpenAI)
  - [ ] 生成 AI 建议 (使用 OpenAI)

### 7.4 意向识别算法

- [ ] **创建 `server/services/intent-analysis.service.ts`**

- [ ] **实现功能**:
  - [ ] 分析用户行为 (浏览、收藏、询价)
  - [ ] 计算意向评分
  - [ ] 识别高意向客户

---

## 🧪 阶段 8: 测试与验证 (P1)

**预计时间**: 2-3 天  
**负责人**: QA / 全体开发

### 8.1 单元测试

- [ ] **测试 tRPC API 端点**
  ```bash
  pnpm run test:api
  ```

- [ ] **测试数据库查询**

- [ ] **测试 AI 服务**

### 8.2 集成测试

- [ ] **测试完整的用户流程**:
  - [ ] 浏览 Webinar 列表
  - [ ] 查看 Webinar 详情
  - [ ] 查看 AI 推荐产品
  - [ ] 收藏产品
  - [ ] 发送询价
  - [ ] 查看会议报告

### 8.3 性能测试

- [ ] **测试数据库查询性能**
  ```sql
  EXPLAIN SELECT * FROM webinars WHERE industry = 'Apparel';
  ```

- [ ] **测试 API 响应时间**

- [ ] **测试页面加载速度**

### 8.4 数据验证

- [ ] **验证数据完整性**
  ```sql
  SELECT COUNT(*) FROM webinars WHERE speaker IS NOT NULL;
  SELECT COUNT(*) FROM webinar_products WHERE moq IS NOT NULL;
  SELECT COUNT(*) FROM buyer_profiles;
  ```

- [ ] **验证数据准确性**

---

## 🚀 阶段 9: 部署到 Vercel (P1)

**预计时间**: 1 天  
**负责人**: DevOps / 后端开发

### 9.1 准备部署

- [ ] **提交所有代码到 GitHub**
  ```bash
  git add .
  git commit -m "feat: 完成数据库增强和前端适配"
  git push origin main
  ```

- [ ] **配置 Vercel 环境变量**
  - [ ] `DATABASE_URL`
  - [ ] `OPENAI_API_KEY`
  - [ ] `OPENAI_BASE_URL`
  - [ ] `OPENAI_MODEL`
  - [ ] `OSS_*` (阿里云 OSS 配置)
  - [ ] `AGORA_*` (声网配置)

### 9.2 部署

- [ ] **触发 Vercel 自动部署**
  - Vercel 会自动检测 GitHub 推送并部署

- [ ] **或手动部署**
  ```bash
  pnpm run vercel-build
  vercel --prod
  ```

### 9.3 验证生产环境

- [ ] **访问生产环境 URL**

- [ ] **测试核心功能**:
  - [ ] Webinar 列表加载
  - [ ] Webinar 详情展示
  - [ ] 产品展示
  - [ ] AI 推荐 (如果已实现)

- [ ] **检查浏览器控制台错误**

- [ ] **检查 Vercel 日志**

---

## 📈 阶段 10: 监控与优化 (持续)

**负责人**: 全体开发

### 10.1 性能监控

- [ ] **设置 Vercel Analytics**

- [ ] **监控 API 响应时间**

- [ ] **监控数据库查询性能**

### 10.2 数据监控

- [ ] **监控数据增长**
  ```sql
  SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
  FROM information_schema.tables
  WHERE table_schema = 'magicyang'
  ORDER BY (data_length + index_length) DESC;
  ```

- [ ] **监控数据质量**
  ```sql
  -- 检查 Webinar 信息完整度
  SELECT 
    COUNT(*) AS total,
    SUM(CASE WHEN speaker IS NOT NULL THEN 1 ELSE 0 END) AS with_speaker,
    SUM(CASE WHEN industry IS NOT NULL THEN 1 ELSE 0 END) AS with_industry,
    SUM(CASE WHEN topics IS NOT NULL THEN 1 ELSE 0 END) AS with_topics
  FROM webinars;
  ```

### 10.3 用户反馈

- [ ] **收集用户反馈**

- [ ] **分析用户行为数据**
  ```sql
  SELECT 
    eventType,
    COUNT(*) AS count
  FROM user_behavior_events
  WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY eventType
  ORDER BY count DESC;
  ```

- [ ] **优化用户体验**

---

## ✅ 完成标准

### 数据库层面

- [x] 所有迁移脚本成功执行
- [ ] 新增字段和表已创建
- [ ] 索引已正确创建
- [ ] 现有数据完整性保持

### 后端层面

- [ ] Drizzle Schema 已更新
- [ ] tRPC API 已扩展
- [ ] 新 API 端点可正常调用
- [ ] TypeScript 类型正确

### 前端层面

- [ ] 类型定义已更新
- [ ] 组件已增强/新建
- [ ] 页面正常渲染
- [ ] 无 TypeScript 错误

### 数据层面

- [ ] 至少 8 个真实 B2B Webinar 已导入
- [ ] 现有 Webinar 信息完整度 > 80%
- [ ] 产品信息完整度 > 70%
- [ ] 至少 10 个测试买家画像已创建

### 功能层面

- [ ] 讲师信息正常展示
- [ ] 行业/主题筛选正常工作
- [ ] 产品详情完整展示
- [ ] AI 推荐功能正常 (如果已实现)
- [ ] 会议报告正常生成 (如果已实现)

### 部署层面

- [ ] 代码已推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 生产环境功能正常
- [ ] 无严重 bug

---

## 🎉 项目完成!

当所有复选框都被勾选后,恭喜你!RealSourcing 已成功升级为**真实可用的 B2B SaaS 平台**!

### 下一步

1. **持续优化**: 根据用户反馈优化功能
2. **数据丰富**: 持续导入真实 B2B Webinar
3. **AI 增强**: 优化 AI 推荐和分析算法
4. **功能扩展**: 开发更多高级功能

---

**创建日期**: 2026-02-17  
**最后更新**: 2026-02-17  
**当前状态**: 🟡 待执行  
**完成进度**: 0% (0/100+ 任务)
