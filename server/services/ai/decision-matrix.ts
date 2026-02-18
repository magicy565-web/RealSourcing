/**
 * 决策矩阵生成器 (Decision Matrix Generator)
 * 
 * 帮助买家对比多个产品,做出最优采购决策
 * 包括:
 * - 多维度对比
 * - 财务预测
 * - AI推荐
 * - 行动计划
 */

import { Product, ViralScore, calculateViralPotential } from './viral-scoring.js';

export interface DecisionMatrix {
  products: ProductComparison[];
  recommendation: {
    topProduct: ProductComparison;
    reasons: string[];
    actionPlan: string[];
    alternativeOptions: ProductComparison[];
  };
  summary: {
    totalProducts: number;
    avgScore: number;
    bestCategory: string;
    priceRange: { min: number; max: number };
  };
}

export interface ProductComparison {
  product: Product;
  viralScore: ViralScore;
  scores: {
    overall: number;
    quality: number;
    price: number;
    supply: number;
    market: number;
    risk: number;
  };
  profitForecast: {
    costPerUnit: number;
    suggestedRetailPrice: number;
    profitPerUnit: number;
    profitMarginPercent: number;
    breakEvenUnits: number;
    roi: number;
  };
  risks: string[];
  strengths: string[];
}

/**
 * 生成决策矩阵
 */
export function generateDecisionMatrix(products: Product[]): DecisionMatrix {
  if (products.length === 0) {
    throw new Error('至少需要一个产品来生成决策矩阵');
  }
  
  // 1. 为每个产品生成完整的对比数据
  const productComparisons = products.map(product => 
    generateProductComparison(product)
  );
  
  // 2. 按综合得分排序
  productComparisons.sort((a, b) => b.scores.overall - a.scores.overall);
  
  // 3. 生成推荐
  const recommendation = generateRecommendation(productComparisons);
  
  // 4. 生成总结
  const summary = generateSummary(productComparisons);
  
  return {
    products: productComparisons,
    recommendation,
    summary,
  };
}

/**
 * 生成单个产品的完整对比数据
 */
function generateProductComparison(product: Product): ProductComparison {
  // 计算爆款评分
  const viralScore = calculateViralPotential(product);
  
  // 计算各维度得分
  const scores = calculateDimensionScores(product, viralScore);
  
  // 计算利润预测
  const profitForecast = calculateProfitForecast(product);
  
  // 识别风险
  const risks = identifyProductRisks(product, scores);
  
  // 识别优势
  const strengths = identifyProductStrengths(product, scores);
  
  return {
    product,
    viralScore,
    scores,
    profitForecast,
    risks,
    strengths,
  };
}

/**
 * 计算各维度得分
 */
function calculateDimensionScores(
  product: Product,
  viralScore: ViralScore
): ProductComparison['scores'] {
  // 质量得分 (0-100)
  const quality = calculateQualityScore(product);
  
  // 价格得分 (0-100)
  const price = calculatePriceScore(product);
  
  // 供应得分 (0-100)
  const supply = calculateSupplyScore(product);
  
  // 市场得分 (0-100)
  const market = viralScore.breakdown.marketDemand * (100 / 30);
  
  // 风险得分 (0-100, 越高风险越低)
  const risk = calculateRiskScore(product);
  
  // 综合得分 (加权平均)
  const overall = Math.round(
    quality * 0.25 +
    price * 0.20 +
    supply * 0.20 +
    market * 0.20 +
    risk * 0.15
  );
  
  return {
    overall,
    quality: Math.round(quality),
    price: Math.round(price),
    supply: Math.round(supply),
    market: Math.round(market),
    risk: Math.round(risk),
  };
}

/**
 * 质量得分
 */
function calculateQualityScore(product: Product): number {
  let score = 0;
  
  // 工厂评分 (0-60分)
  if (product.factoryRating >= 4.8) score += 60;
  else if (product.factoryRating >= 4.5) score += 50;
  else if (product.factoryRating >= 4.0) score += 40;
  else if (product.factoryRating >= 3.5) score += 30;
  else score += 20;
  
  // 评价数量 (0-40分)
  const reviewCount = product.reviewCount || 0;
  if (reviewCount >= 500) score += 40;
  else if (reviewCount >= 200) score += 30;
  else if (reviewCount >= 100) score += 25;
  else if (reviewCount >= 50) score += 20;
  else if (reviewCount >= 20) score += 15;
  else if (reviewCount >= 10) score += 10;
  else score += 5;
  
  return Math.min(score, 100);
}

/**
 * 价格得分
 */
function calculatePriceScore(product: Product): number {
  let score = 50; // 基础分
  
  // 价格合理性 (0-50分)
  if (product.price >= 10 && product.price <= 50) {
    score += 50; // 最佳价格区间
  } else if (product.price >= 5 && product.price < 10) {
    score += 40;
  } else if (product.price >= 50 && product.price <= 100) {
    score += 40;
  } else if (product.price >= 2 && product.price < 5) {
    score += 25;
  } else if (product.price > 100) {
    score += 20;
  } else {
    score += 10;
  }
  
  return Math.min(score, 100);
}

/**
 * 供应得分
 */
function calculateSupplyScore(product: Product): number {
  let score = 0;
  
  // MOQ (0-40分)
  if (product.moq <= 50) score += 40;
  else if (product.moq <= 100) score += 35;
  else if (product.moq <= 200) score += 30;
  else if (product.moq <= 500) score += 20;
  else if (product.moq <= 1000) score += 10;
  else score += 5;
  
  // 交货期 (0-40分)
  if (product.leadTime <= 7) score += 40;
  else if (product.leadTime <= 14) score += 35;
  else if (product.leadTime <= 21) score += 30;
  else if (product.leadTime <= 30) score += 25;
  else if (product.leadTime <= 45) score += 15;
  else score += 5;
  
  // 工厂稳定性 (0-20分)
  if (product.factoryRating >= 4.5) score += 20;
  else if (product.factoryRating >= 4.0) score += 15;
  else if (product.factoryRating >= 3.5) score += 10;
  else score += 5;
  
  return Math.min(score, 100);
}

/**
 * 风险得分 (越高风险越低)
 */
function calculateRiskScore(product: Product): number {
  let score = 100; // 从满分开始扣分
  
  // 工厂风险
  if (product.factoryRating < 3.5) score -= 30;
  else if (product.factoryRating < 4.0) score -= 15;
  
  // 交货期风险
  if (product.leadTime > 60) score -= 25;
  else if (product.leadTime > 45) score -= 15;
  else if (product.leadTime > 30) score -= 8;
  
  // MOQ风险
  if (product.moq > 2000) score -= 25;
  else if (product.moq > 1000) score -= 15;
  else if (product.moq > 500) score -= 8;
  
  // 价格风险
  if (product.price < 2) score -= 15; // 价格太低,质量风险
  else if (product.price > 200) score -= 15; // 价格太高,销售风险
  
  return Math.max(score, 0);
}

/**
 * 计算利润预测
 */
function calculateProfitForecast(product: Product): ProductComparison['profitForecast'] {
  // 成本 = 产品价格 (假设这是FOB价格)
  const costPerUnit = product.price;
  
  // 建议零售价 = 成本 * 2.5 (标准零售倍率)
  const suggestedRetailPrice = parseFloat((costPerUnit * 2.5).toFixed(2));
  
  // 单位利润
  const profitPerUnit = parseFloat((suggestedRetailPrice - costPerUnit).toFixed(2));
  
  // 利润率
  const profitMarginPercent = parseFloat(
    ((profitPerUnit / suggestedRetailPrice) * 100).toFixed(1)
  );
  
  // 盈亏平衡点 (假设固定成本为MOQ * 单位成本 * 0.2)
  const fixedCosts = product.moq * costPerUnit * 0.2;
  const breakEvenUnits = Math.ceil(fixedCosts / profitPerUnit);
  
  // ROI (假设投资 = MOQ * 成本)
  const investment = product.moq * costPerUnit;
  const expectedRevenue = product.moq * profitPerUnit;
  const roi = parseFloat(((expectedRevenue / investment) * 100).toFixed(1));
  
  return {
    costPerUnit,
    suggestedRetailPrice,
    profitPerUnit,
    profitMarginPercent,
    breakEvenUnits,
    roi,
  };
}

/**
 * 识别产品风险
 */
function identifyProductRisks(
  product: Product,
  scores: ProductComparison['scores']
): string[] {
  const risks: string[] = [];
  
  if (scores.quality < 60) {
    risks.push('⚠️ 质量评分较低,建议要求样品和质检报告');
  }
  
  if (scores.supply < 60) {
    risks.push('⚠️ 供应能力较弱,可能影响交货');
  }
  
  if (scores.risk < 60) {
    risks.push('⚠️ 整体风险较高,建议谨慎评估');
  }
  
  if (product.moq > 1000) {
    risks.push('⚠️ 起订量较高,首次合作风险较大');
  }
  
  if (product.leadTime > 45) {
    risks.push('⚠️ 交货期较长,可能错过市场时机');
  }
  
  if (product.factoryRating < 4.0) {
    risks.push('⚠️ 工厂评分偏低,建议实地考察');
  }
  
  return risks;
}

/**
 * 识别产品优势
 */
function identifyProductStrengths(
  product: Product,
  scores: ProductComparison['scores']
): string[] {
  const strengths: string[] = [];
  
  if (scores.overall >= 80) {
    strengths.push('✨ 综合评分优秀,强烈推荐');
  }
  
  if (scores.quality >= 80) {
    strengths.push('💎 质量优秀,值得信赖');
  }
  
  if (product.moq <= 100) {
    strengths.push('📦 低起订量,适合测试市场');
  }
  
  if (product.leadTime <= 14) {
    strengths.push('⚡ 交货快速,响应市场及时');
  }
  
  if (product.factoryRating >= 4.5) {
    strengths.push('🏆 优质供应商,供应稳定');
  }
  
  if (scores.price >= 80) {
    strengths.push('💰 价格合理,利润空间大');
  }
  
  return strengths;
}

/**
 * 生成推荐
 */
function generateRecommendation(
  comparisons: ProductComparison[]
): DecisionMatrix['recommendation'] {
  const topProduct = comparisons[0];
  const reasons = generateRecommendationReasons(topProduct, comparisons);
  const actionPlan = generateActionPlan(topProduct);
  const alternativeOptions = comparisons.slice(1, 3); // 前2个备选
  
  return {
    topProduct,
    reasons,
    actionPlan,
    alternativeOptions,
  };
}

/**
 * 生成推荐理由
 */
function generateRecommendationReasons(
  topProduct: ProductComparison,
  allProducts: ProductComparison[]
): string[] {
  const reasons: string[] = [];
  
  // 综合得分
  reasons.push(
    `综合评分最高: ${topProduct.scores.overall}/100,优于${allProducts.length - 1}个竞品`
  );
  
  // 最强维度
  const scores = topProduct.scores;
  const dimensions = [
    { name: '质量', score: scores.quality },
    { name: '价格', score: scores.price },
    { name: '供应', score: scores.supply },
    { name: '市场', score: scores.market },
  ];
  const topDimension = dimensions.reduce((a, b) => a.score > b.score ? a : b);
  
  if (topDimension.score >= 80) {
    reasons.push(`${topDimension.name}表现优秀: ${topDimension.score}/100`);
  }
  
  // 利润空间
  if (topProduct.profitForecast.profitMarginPercent >= 50) {
    reasons.push(
      `利润空间充足: ${topProduct.profitForecast.profitMarginPercent}%,预期ROI ${topProduct.profitForecast.roi}%`
    );
  }
  
  // 风险评估
  if (scores.risk >= 70) {
    reasons.push(`风险可控: 风险评分 ${scores.risk}/100`);
  }
  
  // 爆款潜力
  if (topProduct.viralScore.totalScore >= 70) {
    reasons.push(
      `爆款潜力${topProduct.viralScore.level === 'extreme' ? '极高' : '较高'}: ${topProduct.viralScore.totalScore}/100`
    );
  }
  
  return reasons;
}

/**
 * 生成行动计划
 */
function generateActionPlan(product: ProductComparison): string[] {
  const plan: string[] = [];
  
  // 第一步: 样品和验证
  plan.push('📋 第1步: 联系供应商,索取样品和产品规格书');
  
  // 第二步: 质量验证
  if (product.scores.quality < 80) {
    plan.push('🔍 第2步: 进行第三方质检,确保产品质量');
  } else {
    plan.push('✅ 第2步: 评估样品质量,确认符合要求');
  }
  
  // 第三步: 价格谈判
  const targetPrice = product.product.price * 0.9;
  plan.push(
    `💰 第3步: 价格谈判,争取 $${targetPrice.toFixed(2)} 的目标价格`
  );
  
  // 第四步: MOQ协商
  if (product.product.moq > 500) {
    const targetMoq = Math.floor(product.product.moq * 0.7);
    plan.push(`📦 第4步: 协商降低MOQ至 ${targetMoq} 件`);
  } else {
    plan.push(`📦 第4步: 确认MOQ ${product.product.moq} 件可接受`);
  }
  
  // 第五步: 合同签订
  plan.push('📝 第5步: 签订采购合同,明确质量、交期、付款条款');
  
  // 第六步: 下单
  plan.push('🚀 第6步: 支付定金,启动生产');
  
  // 第七步: 跟进
  plan.push('📊 第7步: 跟进生产进度,安排物流和清关');
  
  return plan;
}

/**
 * 生成总结
 */
function generateSummary(
  comparisons: ProductComparison[]
): DecisionMatrix['summary'] {
  const avgScore = Math.round(
    comparisons.reduce((sum, c) => sum + c.scores.overall, 0) / comparisons.length
  );
  
  // 找出最常见的品类
  const categories = comparisons.map(c => c.product.category);
  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bestCategory = Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b
  );
  
  // 价格区间
  const prices = comparisons.map(c => c.product.price);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
  
  return {
    totalProducts: comparisons.length,
    avgScore,
    bestCategory,
    priceRange,
  };
}
