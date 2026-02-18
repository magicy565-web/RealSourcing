/**
 * 爆款评分算法 (Viral Potential Scoring)
 * 
 * 评估产品成为爆款的潜力,综合考虑:
 * - 市场需求 (Market Demand): 30%
 * - 竞争程度 (Competition): 20%
 * - 利润空间 (Profit Margin): 20%
 * - 供应稳定性 (Supply Stability): 15%
 * - 营销难易度 (Marketing Ease): 15%
 */

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  moq: number;
  factoryRating: number;
  leadTime: number;
  viewCount?: number;
  inquiryCount?: number;
  orderCount?: number;
  reviewCount?: number;
}

export interface ViralScore {
  totalScore: number;
  level: 'extreme' | 'high' | 'medium' | 'low';
  breakdown: {
    marketDemand: number;
    competition: number;
    profitMargin: number;
    supplyStability: number;
    marketingEase: number;
  };
  insights: string[];
  recommendations: string[];
}

/**
 * 计算产品的爆款潜力评分
 */
export function calculateViralPotential(product: Product): ViralScore {
  // 1. 市场需求评分 (0-30分)
  const marketDemand = calculateMarketDemand(product);
  
  // 2. 竞争程度评分 (0-20分)
  const competition = calculateCompetition(product);
  
  // 3. 利润空间评分 (0-20分)
  const profitMargin = calculateProfitMargin(product);
  
  // 4. 供应稳定性评分 (0-15分)
  const supplyStability = calculateSupplyStability(product);
  
  // 5. 营销难易度评分 (0-15分)
  const marketingEase = calculateMarketingEase(product);
  
  const totalScore = Math.round(
    marketDemand + competition + profitMargin + supplyStability + marketingEase
  );
  
  const level = getScoreLevel(totalScore);
  const insights = generateInsights(product, totalScore, {
    marketDemand,
    competition,
    profitMargin,
    supplyStability,
    marketingEase,
  });
  const recommendations = generateRecommendations(product, totalScore, {
    marketDemand,
    competition,
    profitMargin,
    supplyStability,
    marketingEase,
  });
  
  return {
    totalScore,
    level,
    breakdown: {
      marketDemand: Math.round(marketDemand),
      competition: Math.round(competition),
      profitMargin: Math.round(profitMargin),
      supplyStability: Math.round(supplyStability),
      marketingEase: Math.round(marketingEase),
    },
    insights,
    recommendations,
  };
}

/**
 * 批量计算产品的爆款评分
 */
export function calculateBatchViralPotential(
  products: Product[]
): Map<number, ViralScore> {
  const scores = new Map<number, ViralScore>();
  
  for (const product of products) {
    scores.set(product.id, calculateViralPotential(product));
  }
  
  return scores;
}

/**
 * 计算市场需求评分 (0-30分)
 * 基于: 浏览量、询盘量、订单量、品类热度
 */
function calculateMarketDemand(product: Product): number {
  let score = 0;
  
  // 浏览量评分 (0-10分)
  const viewCount = product.viewCount || 0;
  if (viewCount > 10000) score += 10;
  else if (viewCount > 5000) score += 8;
  else if (viewCount > 1000) score += 6;
  else if (viewCount > 500) score += 4;
  else if (viewCount > 100) score += 2;
  
  // 询盘量评分 (0-10分)
  const inquiryCount = product.inquiryCount || 0;
  if (inquiryCount > 100) score += 10;
  else if (inquiryCount > 50) score += 8;
  else if (inquiryCount > 20) score += 6;
  else if (inquiryCount > 10) score += 4;
  else if (inquiryCount > 5) score += 2;
  
  // 订单量评分 (0-10分)
  const orderCount = product.orderCount || 0;
  if (orderCount > 50) score += 10;
  else if (orderCount > 20) score += 8;
  else if (orderCount > 10) score += 6;
  else if (orderCount > 5) score += 4;
  else if (orderCount > 1) score += 2;
  
  return Math.min(score, 30);
}

/**
 * 计算竞争程度评分 (0-20分)
 * 竞争越低,得分越高
 */
function calculateCompetition(product: Product): number {
  let score = 20; // 从满分开始扣分
  
  // 品类竞争度 (扣0-10分)
  const highCompetitionCategories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Toys'
  ];
  const mediumCompetitionCategories = [
    'Sports', 'Automotive', 'Beauty', 'Office'
  ];
  
  if (highCompetitionCategories.includes(product.category)) {
    score -= 10;
  } else if (mediumCompetitionCategories.includes(product.category)) {
    score -= 5;
  }
  
  // 价格竞争度 (扣0-10分)
  // 价格越低,竞争越激烈
  if (product.price < 5) score -= 10;
  else if (product.price < 10) score -= 7;
  else if (product.price < 20) score -= 4;
  else if (product.price < 50) score -= 2;
  
  return Math.max(score, 0);
}

/**
 * 计算利润空间评分 (0-20分)
 * 基于: 价格、MOQ、预估成本
 */
function calculateProfitMargin(product: Product): number {
  let score = 0;
  
  // 价格评分 (0-10分)
  // 价格适中最好,太低利润低,太高难卖
  if (product.price >= 10 && product.price <= 50) score += 10;
  else if (product.price >= 5 && product.price < 10) score += 7;
  else if (product.price >= 50 && product.price <= 100) score += 7;
  else if (product.price >= 2 && product.price < 5) score += 4;
  else if (product.price > 100) score += 4;
  else score += 2;
  
  // MOQ评分 (0-10分)
  // MOQ越低越好,降低买家门槛
  if (product.moq <= 50) score += 10;
  else if (product.moq <= 100) score += 8;
  else if (product.moq <= 200) score += 6;
  else if (product.moq <= 500) score += 4;
  else if (product.moq <= 1000) score += 2;
  
  return Math.min(score, 20);
}

/**
 * 计算供应稳定性评分 (0-15分)
 * 基于: 工厂评分、交货期、历史订单
 */
function calculateSupplyStability(product: Product): number {
  let score = 0;
  
  // 工厂评分 (0-8分)
  if (product.factoryRating >= 4.5) score += 8;
  else if (product.factoryRating >= 4.0) score += 6;
  else if (product.factoryRating >= 3.5) score += 4;
  else if (product.factoryRating >= 3.0) score += 2;
  
  // 交货期评分 (0-7分)
  // 交货期越短越好
  if (product.leadTime <= 7) score += 7;
  else if (product.leadTime <= 14) score += 5;
  else if (product.leadTime <= 30) score += 3;
  else if (product.leadTime <= 60) score += 1;
  
  return Math.min(score, 15);
}

/**
 * 计算营销难易度评分 (0-15分)
 * 基于: 品类、价格、视觉吸引力
 */
function calculateMarketingEase(product: Product): number {
  let score = 0;
  
  // 品类营销难度 (0-8分)
  const easyMarketingCategories = [
    'Fashion', 'Beauty', 'Home Decor', 'Gadgets', 'Toys'
  ];
  const mediumMarketingCategories = [
    'Electronics', 'Sports', 'Kitchen', 'Pet Supplies'
  ];
  
  if (easyMarketingCategories.includes(product.category)) {
    score += 8;
  } else if (mediumMarketingCategories.includes(product.category)) {
    score += 5;
  } else {
    score += 2;
  }
  
  // 价格营销难度 (0-7分)
  // 价格适中最容易营销
  if (product.price >= 5 && product.price <= 30) score += 7;
  else if (product.price >= 2 && product.price < 5) score += 5;
  else if (product.price >= 30 && product.price <= 100) score += 5;
  else if (product.price < 2) score += 2;
  else score += 3;
  
  return Math.min(score, 15);
}

/**
 * 根据总分确定评级
 */
function getScoreLevel(totalScore: number): 'extreme' | 'high' | 'medium' | 'low' {
  if (totalScore >= 80) return 'extreme';
  if (totalScore >= 60) return 'high';
  if (totalScore >= 40) return 'medium';
  return 'low';
}

/**
 * 生成洞察
 */
function generateInsights(
  product: Product,
  totalScore: number,
  breakdown: Record<string, number>
): string[] {
  const insights: string[] = [];
  
  // 总体评价
  if (totalScore >= 80) {
    insights.push(`🔥 这是一个极具爆款潜力的产品!总分 ${totalScore}/100`);
  } else if (totalScore >= 60) {
    insights.push(`✨ 这个产品有较高的爆款潜力,总分 ${totalScore}/100`);
  } else if (totalScore >= 40) {
    insights.push(`💡 这个产品有中等的爆款潜力,总分 ${totalScore}/100`);
  } else {
    insights.push(`⚠️ 这个产品的爆款潜力较低,总分 ${totalScore}/100`);
  }
  
  // 最强项
  const maxKey = Object.keys(breakdown).reduce((a, b) => 
    breakdown[a] > breakdown[b] ? a : b
  );
  const strengthMap: Record<string, string> = {
    marketDemand: '市场需求',
    competition: '竞争优势',
    profitMargin: '利润空间',
    supplyStability: '供应稳定性',
    marketingEase: '营销难易度',
  };
  insights.push(`💪 最强项: ${strengthMap[maxKey]} (${breakdown[maxKey]}分)`);
  
  // 最弱项
  const minKey = Object.keys(breakdown).reduce((a, b) => 
    breakdown[a] < breakdown[b] ? a : b
  );
  if (breakdown[minKey] < 10) {
    insights.push(`⚠️ 需要改进: ${strengthMap[minKey]} (${breakdown[minKey]}分)`);
  }
  
  return insights;
}

/**
 * 生成建议
 */
function generateRecommendations(
  product: Product,
  totalScore: number,
  breakdown: Record<string, number>
): string[] {
  const recommendations: string[] = [];
  
  // 市场需求建议
  if (breakdown.marketDemand < 15) {
    recommendations.push('增加产品曝光,通过社交媒体和广告提升浏览量');
  }
  
  // 竞争建议
  if (breakdown.competition < 10) {
    recommendations.push('考虑差异化策略,突出产品独特卖点');
  }
  
  // 利润建议
  if (breakdown.profitMargin < 10) {
    if (product.moq > 500) {
      recommendations.push('与工厂协商降低MOQ,降低买家门槛');
    }
    if (product.price < 5) {
      recommendations.push('考虑提高价格或寻找更高利润的产品线');
    }
  }
  
  // 供应建议
  if (breakdown.supplyStability < 8) {
    if (product.factoryRating < 4.0) {
      recommendations.push('寻找评分更高的供应商,确保供应稳定性');
    }
    if (product.leadTime > 30) {
      recommendations.push('协商缩短交货期,提升客户满意度');
    }
  }
  
  // 营销建议
  if (breakdown.marketingEase < 8) {
    recommendations.push('制作高质量的产品图片和视频,提升营销效果');
  }
  
  // 总体建议
  if (totalScore >= 80) {
    recommendations.push('立即推广!这个产品有极高的成功概率');
  } else if (totalScore >= 60) {
    recommendations.push('值得投入资源推广,预期有良好回报');
  } else if (totalScore >= 40) {
    recommendations.push('先小规模测试市场反应,再决定是否扩大投入');
  } else {
    recommendations.push('建议重新评估产品选择,或优化产品和供应链');
  }
  
  return recommendations;
}
