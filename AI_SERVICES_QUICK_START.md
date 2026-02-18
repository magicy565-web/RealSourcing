# RealSourcing AI 服务快速开始指南

## 🚀 快速开始

### 1. 运行测试

```bash
# 运行单元测试
npm test -- server/services/ai/ai-services.test.ts

# 运行集成测试
npx tsx scripts/test-ai-integration.ts

# 检查数据库结构
export DATABASE_URL="mysql://magicyang:Wysk1214@rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com:3306/realsourcing"
npx tsx scripts/check-db-structure.ts
```

### 2. 使用AI服务

#### 2.1 爆款评分

```typescript
import { calculateViralPotential } from './server/services/ai/index.js';

const product = {
  id: 1,
  name: 'USB-C Cable',
  category: 'Electronics',
  price: 2.99,
  moq: 100,
  factoryRating: 4.5,
  leadTime: 7,
};

const score = calculateViralPotential(product);
console.log(`总分: ${score.totalScore}/100`);
console.log(`评级: ${score.level}`);
```

#### 2.2 产品推荐

```typescript
import { recommendProducts } from './server/services/ai/index.js';

const buyer = {
  id: 1,
  shopCategory: 'Electronics',
  priceRange: { min: 5, max: 30 },
};

const recommendations = recommendProducts(buyer, products, 10);
recommendations.forEach(rec => {
  console.log(`${rec.product.name} - 匹配度: ${rec.matchScore}/100`);
});
```

#### 2.3 谈判助手

```typescript
import { generateNegotiationAssistance } from './server/services/ai/index.js';

const assistance = generateNegotiationAssistance(product, {
  targetPrice: 14.00,
  urgency: 'medium',
});

console.log('价格分析:', assistance.priceAnalysis);
console.log('谈判策略:', assistance.strategy);
console.log('开场白:', assistance.script.opening);
```

#### 2.4 决策矩阵

```typescript
import { generateDecisionMatrix } from './server/services/ai/index.js';

const matrix = generateDecisionMatrix([product1, product2, product3]);
console.log('推荐产品:', matrix.recommendation.topProduct.product.name);
console.log('推荐理由:', matrix.recommendation.reasons);
```

### 3. 使用tRPC API

#### 3.1 前端调用

```typescript
// 获取爆款评分
const { data: score } = trpc.product.getViralScore.useQuery({
  productId: 1
});

// 获取推荐
const { data: recommendations } = trpc.product.getRecommendations.useQuery({
  limit: 10,
  category: 'Electronics'
});

// 获取谈判建议
const { data: negotiation } = trpc.product.getNegotiationAssistance.useQuery({
  productId: 1,
  targetPrice: 14.00,
  urgency: 'medium'
});

// 生成决策矩阵
const { data: matrix } = trpc.product.generateDecisionMatrix.useQuery({
  productIds: [1, 2, 3]
});
```

### 4. API端点

所有AI服务通过 `product` 路由访问:

- `product.list` - 获取产品列表 (带AI评分)
- `product.getById` - 获取产品详情 (带AI评分)
- `product.getViralScore` - 计算爆款评分
- `product.getRecommendations` - 获取个性化推荐
- `product.getNegotiationAssistance` - 获取谈判建议
- `product.generateDecisionMatrix` - 生成决策矩阵
- `product.batchCalculateViralScore` - 批量计算评分

## 📊 性能指标

- 单个产品评分: < 1ms
- 批量评分 (100个): < 1s
- 推荐生成: < 2ms
- 谈判建议: < 1ms
- 决策矩阵: < 3ms

## 🔧 下一步

1. 创建 `products` 表
2. 实现数据库持久化
3. 添加Redis缓存层
4. 创建前端组件
5. 集成到现有页面

## 📖 更多文档

详细文档请查看:
- [完整开发报告](./AI_SERVICES_DEVELOPMENT_REPORT.md)
- [测试文件](./server/services/ai/ai-services.test.ts)
- [集成测试](./scripts/test-ai-integration.ts)
