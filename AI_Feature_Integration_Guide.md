# RealSourcing AI 功能集成与数据库维护指南 (2026-02-18)

本文档旨在指导如何将 AI 爆款评分、智能推荐及谈判助手功能集成到 RealSourcing 项目中。由于网络环境限制，建议由具备数据库访问权限的账号执行数据导入操作。

---

## 1. 数据库架构调整 (Drizzle ORM)

### 1.1 核心表：`factory_products`
我们直接复用现有的 `factory_products` 表。为了支持 AI 爆款评分，请确保该表包含以下字段（或在 Mock 逻辑中映射）：

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `viewCount` | `int` | 浏览量 (用于市场需求评分) |
| `inquiryCount` | `int` | 询盘量 (用于转化率评分) |
| `minOrderQuantity` | `int` | 最小起订量 (MOQ) |
| `priceRange` | `varchar` | 价格区间 |

### 1.2 AI 结果缓存建议 (可选)
为了性能优化，建议在 `drizzle/schema.ts` 中增加一个 `ai_analysis_results` 表，用于缓存计算出的爆款评分，避免重复调用 LLM。

---

## 2. 数据导入指南 (Data Seeding)

我已经编写了一个自动化的数据导入脚本：`scripts/seed-factory-products.ts`。

### 执行步骤：
1.  **环境准备**：确保 `.env` 文件中有正确的 `DATABASE_URL`。
2.  **运行脚本**：
    ```bash
    pnpm tsx scripts/seed-factory-products.ts
    ```
3.  **脚本功能**：
    - 检查并自动创建测试工厂（如果不存在）。
    - 清理旧的测试产品数据。
    - 插入 10 个具有代表性的跨境电商热销产品（电子、办公、健身类）。
    - **自动触发 AI 爆款评分逻辑**，并输出评分结果到控制台。

---

## 3. 后端 AI 逻辑集成 (tRPC)

### 3.1 爆款评分 (Viral Scoring)
逻辑位于 `server/services/ai/viral-scoring.ts`。
- **算法模型**：市场需求 (30%) + 竞争程度 (20%) + 利润空间 (20%) + 供应稳定性 (15%) + 营销难易度 (15%)。
- **集成位置**：`server/routers/product.router.ts` 中的 `getViralScore` 过程。

### 3.2 智能推荐 (Recommendation)
逻辑位于 `server/services/ai/recommendation.ts`。
- **算法模型**：基于买家画像 (Buyer Profile) 和产品特征的向量匹配（当前为逻辑模拟）。

---

## 4. 前端 UI 组件集成 (React)

### 4.1 爆款评分徽章 (`ViralScoreBadge.tsx`)
位置：`client/src/components/ViralScoreBadge.tsx`
- **用法**：
  ```tsx
  <ViralScoreBadge score={85} level="high" showLabel={true} />
  ```

### 4.2 待开发建议
- **爆款看板**：在产品详情页集成雷达图，展示五个维度的得分情况。
- **谈判助手**：在 Webinar 聊天室侧边栏增加“AI 建议”按钮，调用 `negotiation.ts` 服务。

---

## 5. 交付文件清单

请确保另一个账号获取并处理以下文件：
1.  `scripts/seed-factory-products.ts` (数据导入核心)
2.  `client/src/components/ViralScoreBadge.tsx` (前端徽章组件)
3.  `server/routers/product.router.ts` (API 路由更新)
4.  `deploy_to_ecs.sh` (一键部署脚本)

---

## 6. 开发者备注
- **API Key**：请确保 `.env` 中的 `OPENAI_API_KEY` 或 `ALIBABA_BAILIAN_API_KEY` 有效。
- **数据库连接**：若遇到 `PROTOCOL_CONNECTION_LOST`，请检查阿里云 RDS 的白名单模式是否为“高安全模式”，并确认是否开启了外网访问。

---
*文档由 Manus AI 助手生成，用于 RealSourcing 项目交接。*
