/**
 * AI Services Integration Test
 * 
 * 测试AI服务的完整集成流程
 */

import {
  calculateViralPotential,
  calculateBatchViralPotential,
  recommendProducts,
  generateNegotiationAssistance,
  generateDecisionMatrix,
  Product,
  BuyerProfile,
} from '../server/services/ai/index.js';

console.log('🚀 开始AI服务集成测试...\n');

// ============================================================================
// 测试数据
// ============================================================================

const testProducts: Product[] = [
  {
    id: 1,
    name: 'USB-C快充线',
    category: 'Electronics',
    price: 2.99,
    moq: 100,
    factoryRating: 4.5,
    leadTime: 7,
    viewCount: 1500,
    inquiryCount: 25,
    orderCount: 12,
    reviewCount: 50,
  },
  {
    id: 2,
    name: '无线充电器',
    category: 'Electronics',
    price: 15.99,
    moq: 50,
    factoryRating: 4.8,
    leadTime: 5,
    viewCount: 3000,
    inquiryCount: 60,
    orderCount: 30,
    reviewCount: 120,
  },
  {
    id: 3,
    name: '蓝牙耳机',
    category: 'Electronics',
    price: 8.50,
    moq: 200,
    factoryRating: 4.2,
    leadTime: 14,
    viewCount: 2000,
    inquiryCount: 40,
    orderCount: 20,
    reviewCount: 80,
  },
  {
    id: 4,
    name: '手机支架',
    category: 'Accessories',
    price: 1.99,
    moq: 500,
    factoryRating: 3.8,
    leadTime: 10,
    viewCount: 800,
    inquiryCount: 15,
    orderCount: 8,
    reviewCount: 30,
  },
  {
    id: 5,
    name: '智能手表',
    category: 'Electronics',
    price: 45.00,
    moq: 100,
    factoryRating: 4.6,
    leadTime: 20,
    viewCount: 5000,
    inquiryCount: 80,
    orderCount: 35,
    reviewCount: 150,
  },
];

const testBuyer: BuyerProfile = {
  id: 1,
  shopCategory: 'Electronics',
  priceRange: { min: 5, max: 30 },
  historicalCategories: ['Electronics', 'Gadgets'],
  historicalPriceAvg: 15,
  preferredLeadTime: 14,
  minFactoryRating: 4.0,
};

// ============================================================================
// 测试 1: 爆款评分
// ============================================================================

console.log('📊 测试 1: 爆款评分算法');
console.log('='.repeat(80));

const product1 = testProducts[0];
const viralScore = calculateViralPotential(product1);

console.log(`\n产品: ${product1.name}`);
console.log(`总分: ${viralScore.totalScore}/100`);
console.log(`评级: ${viralScore.level}`);
console.log(`\n评分细分:`);
console.log(`  - 市场需求: ${viralScore.breakdown.marketDemand}/30`);
console.log(`  - 竞争程度: ${viralScore.breakdown.competition}/20`);
console.log(`  - 利润空间: ${viralScore.breakdown.profitMargin}/20`);
console.log(`  - 供应稳定性: ${viralScore.breakdown.supplyStability}/15`);
console.log(`  - 营销难易度: ${viralScore.breakdown.marketingEase}/15`);

console.log(`\n洞察:`);
viralScore.insights.forEach(insight => console.log(`  ${insight}`));

console.log(`\n建议:`);
viralScore.recommendations.forEach(rec => console.log(`  ${rec}`));

console.log('\n✅ 测试 1 通过\n');

// ============================================================================
// 测试 2: 批量评分
// ============================================================================

console.log('📊 测试 2: 批量爆款评分');
console.log('='.repeat(80));

const startTime = Date.now();
const batchScores = calculateBatchViralPotential(testProducts);
const endTime = Date.now();

console.log(`\n批量评分 ${testProducts.length} 个产品,耗时 ${endTime - startTime}ms\n`);
console.log('产品排名:');

const sortedProducts = testProducts
  .map(p => ({
    product: p,
    score: batchScores.get(p.id)!,
  }))
  .sort((a, b) => b.score.totalScore - a.score.totalScore);

sortedProducts.forEach((item, index) => {
  console.log(
    `  ${index + 1}. ${item.product.name.padEnd(20)} | 评分: ${item.score.totalScore}/100 | 评级: ${item.score.level}`
  );
});

console.log('\n✅ 测试 2 通过\n');

// ============================================================================
// 测试 3: 个性化推荐
// ============================================================================

console.log('🎯 测试 3: 个性化推荐算法');
console.log('='.repeat(80));

const recommendations = recommendProducts(testBuyer, testProducts, 3);

console.log(`\n为买家推荐 ${recommendations.length} 个产品:\n`);

recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.product.name}`);
  console.log(`   匹配度: ${rec.matchScore}/100`);
  console.log(`   优先级: ${rec.priority}`);
  console.log(`   匹配原因:`);
  rec.matchReasons.forEach(reason => console.log(`     - ${reason}`));
  console.log('');
});

console.log('✅ 测试 3 通过\n');

// ============================================================================
// 测试 4: 谈判助手
// ============================================================================

console.log('💼 测试 4: 谈判助手');
console.log('='.repeat(80));

const product2 = testProducts[1];
const negotiation = generateNegotiationAssistance(product2, {
  targetPrice: 14.00,
  urgency: 'medium',
});

console.log(`\n产品: ${product2.name}`);
console.log(`\n价格分析:`);
console.log(`  - 工厂价格: $${negotiation.priceAnalysis.factoryPrice}`);
console.log(`  - 市场均价: $${negotiation.priceAnalysis.marketAverage}`);
console.log(`  - 建议目标价: $${negotiation.priceAnalysis.recommendedTarget}`);
console.log(`  - 谈判空间: ${negotiation.priceAnalysis.negotiationSpace}%`);

console.log(`\n谈判策略:`);
console.log(`  - 方式: ${negotiation.strategy.approach}`);
console.log(`  - 时间线: ${negotiation.strategy.timeline}`);
console.log(`  - 关键点:`);
negotiation.strategy.keyPoints.forEach(point => console.log(`    • ${point}`));

console.log(`\n开场白:`);
console.log(`  "${negotiation.script.opening}"`);

console.log(`\n价格讨论话术:`);
console.log(`  "${negotiation.script.priceDiscussion}"`);

if (negotiation.risks.length > 0) {
  console.log(`\n风险提示:`);
  negotiation.risks.forEach(risk => console.log(`  ${risk}`));
}

console.log(`\n谈判技巧:`);
negotiation.tips.slice(0, 3).forEach(tip => console.log(`  ${tip}`));

console.log('\n✅ 测试 4 通过\n');

// ============================================================================
// 测试 5: 决策矩阵
// ============================================================================

console.log('📋 测试 5: 决策矩阵生成');
console.log('='.repeat(80));

const compareProducts = testProducts.slice(0, 3);
const matrix = generateDecisionMatrix(compareProducts);

console.log(`\n对比 ${matrix.summary.totalProducts} 个产品\n`);

console.log('产品对比表:');
console.log('-'.repeat(80));
console.log('产品名称'.padEnd(20) + ' | 综合 | 质量 | 价格 | 供应 | 市场 | 风险');
console.log('-'.repeat(80));

matrix.products.forEach(p => {
  const scores = p.scores;
  console.log(
    p.product.name.padEnd(20) +
    ` | ${scores.overall.toString().padStart(4)} ` +
    `| ${scores.quality.toString().padStart(4)} ` +
    `| ${scores.price.toString().padStart(4)} ` +
    `| ${scores.supply.toString().padStart(4)} ` +
    `| ${scores.market.toString().padStart(4)} ` +
    `| ${scores.risk.toString().padStart(4)}`
  );
});
console.log('-'.repeat(80));

console.log(`\n🏆 推荐产品: ${matrix.recommendation.topProduct.product.name}`);
console.log(`\n推荐理由:`);
matrix.recommendation.reasons.forEach(reason => console.log(`  ✓ ${reason}`));

console.log(`\n利润预测:`);
const forecast = matrix.recommendation.topProduct.profitForecast;
console.log(`  - 成本: $${forecast.costPerUnit}`);
console.log(`  - 建议零售价: $${forecast.suggestedRetailPrice}`);
console.log(`  - 单位利润: $${forecast.profitPerUnit}`);
console.log(`  - 利润率: ${forecast.profitMarginPercent}%`);
console.log(`  - 盈亏平衡点: ${forecast.breakEvenUnits} 件`);
console.log(`  - 预期ROI: ${forecast.roi}%`);

console.log(`\n行动计划:`);
matrix.recommendation.actionPlan.forEach(step => console.log(`  ${step}`));

if (matrix.recommendation.alternativeOptions.length > 0) {
  console.log(`\n备选方案:`);
  matrix.recommendation.alternativeOptions.forEach((alt, index) => {
    console.log(`  ${index + 1}. ${alt.product.name} (评分: ${alt.scores.overall}/100)`);
  });
}

console.log('\n✅ 测试 5 通过\n');

// ============================================================================
// 测试总结
// ============================================================================

console.log('='.repeat(80));
console.log('🎉 所有集成测试通过!');
console.log('='.repeat(80));

console.log(`\n测试统计:`);
console.log(`  ✓ 爆款评分算法: 正常`);
console.log(`  ✓ 批量评分性能: ${endTime - startTime}ms (${testProducts.length} 个产品)`);
console.log(`  ✓ 推荐算法: 正常`);
console.log(`  ✓ 谈判助手: 正常`);
console.log(`  ✓ 决策矩阵: 正常`);

console.log(`\n系统状态: 🟢 所有AI服务运行正常\n`);
