/**
 * 产品推荐算法 (Product Recommendation)
 * 
 * 基于买家画像和产品特征进行智能匹配推荐
 * 考虑因素:
 * - 品类匹配 (Category Match): 30%
 * - 价格匹配 (Price Match): 25%
 * - 历史行为 (Historical Behavior): 20%
 * - 产品质量 (Product Quality): 15%
 * - 供应能力 (Supply Capability): 10%
 */

import { Product, ViralScore } from './viral-scoring.js';

export interface BuyerProfile {
  id: number;
  shopCategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  historicalCategories?: string[];
  historicalPriceAvg?: number;
  preferredLeadTime?: number;
  minFactoryRating?: number;
  country?: string;
}

export interface Recommendation {
  product: Product;
  matchScore: number;
  matchReasons: string[];
  viralScore?: ViralScore;
  priority: 'high' | 'medium' | 'low';
}

/**
 * 为买家推荐产品
 */
export function recommendProducts(
  buyer: BuyerProfile,
  products: Product[],
  limit: number = 10
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  for (const product of products) {
    const matchScore = calculateMatchScore(buyer, product);
    const matchReasons = generateMatchReasons(buyer, product, matchScore);
    const priority = getRecommendationPriority(matchScore);
    
    recommendations.push({
      product,
      matchScore: Math.round(matchScore),
      matchReasons,
      priority,
    });
  }
  
  // 按匹配度排序
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  
  // 返回前N个
  return recommendations.slice(0, limit);
}

/**
 * 计算买家与产品的匹配度 (0-100分)
 */
function calculateMatchScore(buyer: BuyerProfile, product: Product): number {
  let score = 0;
  
  // 1. 品类匹配 (0-30分)
  score += calculateCategoryMatch(buyer, product);
  
  // 2. 价格匹配 (0-25分)
  score += calculatePriceMatch(buyer, product);
  
  // 3. 历史行为匹配 (0-20分)
  score += calculateHistoricalMatch(buyer, product);
  
  // 4. 产品质量匹配 (0-15分)
  score += calculateQualityMatch(buyer, product);
  
  // 5. 供应能力匹配 (0-10分)
  score += calculateSupplyMatch(buyer, product);
  
  return Math.min(score, 100);
}

/**
 * 品类匹配评分 (0-30分)
 */
function calculateCategoryMatch(buyer: BuyerProfile, product: Product): number {
  let score = 0;
  
  // 主营品类匹配
  if (buyer.shopCategory && buyer.shopCategory === product.category) {
    score += 30;
  } else if (buyer.shopCategory && isSimilarCategory(buyer.shopCategory, product.category)) {
    score += 20;
  } else if (buyer.shopCategory) {
    score += 5;
  } else {
    score += 15; // 无品类信息,给中等分
  }
  
  return score;
}

/**
 * 价格匹配评分 (0-25分)
 */
function calculatePriceMatch(buyer: BuyerProfile, product: Product): number {
  let score = 0;
  
  // 价格区间匹配
  if (buyer.priceRange) {
    const { min, max } = buyer.priceRange;
    if (product.price >= min && product.price <= max) {
      score += 15; // 在区间内
    } else if (product.price < min) {
      const diff = (min - product.price) / min;
      score += Math.max(15 - diff * 10, 5); // 低于区间,扣分
    } else {
      const diff = (product.price - max) / max;
      score += Math.max(15 - diff * 15, 0); // 高于区间,扣更多分
    }
  } else {
    score += 10; // 无价格信息,给基础分
  }
  
  // 历史均价匹配
  if (buyer.historicalPriceAvg) {
    const priceDiff = Math.abs(product.price - buyer.historicalPriceAvg);
    const diffRatio = priceDiff / buyer.historicalPriceAvg;
    
    if (diffRatio <= 0.2) score += 10; // 差异20%以内
    else if (diffRatio <= 0.5) score += 7; // 差异50%以内
    else if (diffRatio <= 1.0) score += 4; // 差异100%以内
    else score += 1;
  } else {
    score += 5; // 无历史价格,给基础分
  }
  
  return Math.min(score, 25);
}

/**
 * 历史行为匹配评分 (0-20分)
 */
function calculateHistoricalMatch(buyer: BuyerProfile, product: Product): number {
  let score = 0;
  
  // 历史品类匹配
  if (buyer.historicalCategories && buyer.historicalCategories.length > 0) {
    if (buyer.historicalCategories.includes(product.category)) {
      score += 15; // 购买过相同品类
    } else if (buyer.historicalCategories.some(cat => isSimilarCategory(cat, product.category))) {
      score += 10; // 购买过相似品类
    } else {
      score += 3; // 新品类,给少量分
    }
  } else {
    score += 8; // 无历史数据,给中等分
  }
  
  // 复购可能性
  if (buyer.historicalCategories && buyer.historicalCategories.includes(product.category)) {
    const frequency = buyer.historicalCategories.filter(c => c === product.category).length;
    score += Math.min(frequency * 2, 5); // 频繁购买同品类,加分
  }
  
  return Math.min(score, 20);
}

/**
 * 产品质量匹配评分 (0-15分)
 */
function calculateQualityMatch(buyer: BuyerProfile, product: Product): number {
  let score = 0;
  
  // 工厂评分匹配
  if (buyer.minFactoryRating) {
    if (product.factoryRating >= buyer.minFactoryRating) {
      score += 10;
    } else {
      const diff = buyer.minFactoryRating - product.factoryRating;
      score += Math.max(10 - diff * 5, 0);
    }
  } else {
    // 无要求,按工厂评分给分
    if (product.factoryRating >= 4.5) score += 10;
    else if (product.factoryRating >= 4.0) score += 8;
    else if (product.factoryRating >= 3.5) score += 6;
    else score += 3;
  }
  
  // 评价数量
  if (product.reviewCount) {
    if (product.reviewCount >= 100) score += 5;
    else if (product.reviewCount >= 50) score += 4;
    else if (product.reviewCount >= 20) score += 3;
    else if (product.reviewCount >= 10) score += 2;
    else score += 1;
  } else {
    score += 2;
  }
  
  return Math.min(score, 15);
}

/**
 * 供应能力匹配评分 (0-10分)
 */
function calculateSupplyMatch(buyer: BuyerProfile, product: Product): number {
  let score = 0;
  
  // 交货期匹配
  if (buyer.preferredLeadTime) {
    if (product.leadTime <= buyer.preferredLeadTime) {
      score += 5;
    } else {
      const diff = product.leadTime - buyer.preferredLeadTime;
      score += Math.max(5 - diff / 10, 0);
    }
  } else {
    // 无要求,交货期越短越好
    if (product.leadTime <= 7) score += 5;
    else if (product.leadTime <= 14) score += 4;
    else if (product.leadTime <= 30) score += 3;
    else score += 1;
  }
  
  // MOQ合理性
  if (product.moq <= 100) score += 5;
  else if (product.moq <= 500) score += 4;
  else if (product.moq <= 1000) score += 2;
  else score += 1;
  
  return Math.min(score, 10);
}

/**
 * 判断两个品类是否相似
 */
function isSimilarCategory(cat1: string, cat2: string): boolean {
  const categoryGroups = [
    ['Electronics', 'Gadgets', 'Smart Devices'],
    ['Fashion', 'Apparel', 'Clothing', 'Accessories'],
    ['Home & Garden', 'Home Decor', 'Furniture', 'Kitchen'],
    ['Beauty', 'Cosmetics', 'Personal Care'],
    ['Sports', 'Fitness', 'Outdoor'],
    ['Toys', 'Games', 'Baby Products'],
    ['Automotive', 'Car Accessories', 'Tools'],
  ];
  
  for (const group of categoryGroups) {
    if (group.includes(cat1) && group.includes(cat2)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 生成匹配原因
 */
function generateMatchReasons(
  buyer: BuyerProfile,
  product: Product,
  matchScore: number
): string[] {
  const reasons: string[] = [];
  
  // 品类匹配
  if (buyer.shopCategory === product.category) {
    reasons.push(`完美匹配您的主营品类: ${product.category}`);
  } else if (buyer.shopCategory && isSimilarCategory(buyer.shopCategory, product.category)) {
    reasons.push(`与您的主营品类相似: ${product.category}`);
  }
  
  // 价格匹配
  if (buyer.priceRange) {
    const { min, max } = buyer.priceRange;
    if (product.price >= min && product.price <= max) {
      reasons.push(`价格在您的预算范围内: $${product.price}`);
    }
  }
  
  // 历史行为
  if (buyer.historicalCategories?.includes(product.category)) {
    reasons.push('您之前购买过此类产品');
  }
  
  // 产品质量
  if (product.factoryRating >= 4.5) {
    reasons.push(`工厂评分优秀: ${product.factoryRating}/5.0`);
  }
  
  // 供应优势
  if (product.leadTime <= 7) {
    reasons.push(`快速交货: ${product.leadTime}天`);
  }
  if (product.moq <= 100) {
    reasons.push(`低起订量: ${product.moq}件`);
  }
  
  // 热度
  if (product.viewCount && product.viewCount > 1000) {
    reasons.push(`热门产品: ${product.viewCount}次浏览`);
  }
  
  return reasons;
}

/**
 * 确定推荐优先级
 */
function getRecommendationPriority(matchScore: number): 'high' | 'medium' | 'low' {
  if (matchScore >= 80) return 'high';
  if (matchScore >= 60) return 'medium';
  return 'low';
}

/**
 * 基于协同过滤的推荐 (简化版)
 * 找到相似买家购买的产品
 */
export function collaborativeFilteringRecommendation(
  buyerId: number,
  similarBuyerIds: number[],
  allPurchases: Map<number, number[]>, // buyerId -> productIds
  products: Product[],
  limit: number = 10
): Product[] {
  const buyerPurchases = allPurchases.get(buyerId) || [];
  const recommendedProductIds = new Set<number>();
  
  // 收集相似买家购买的产品
  for (const similarBuyerId of similarBuyerIds) {
    const purchases = allPurchases.get(similarBuyerId) || [];
    for (const productId of purchases) {
      // 排除当前买家已购买的产品
      if (!buyerPurchases.includes(productId)) {
        recommendedProductIds.add(productId);
      }
    }
  }
  
  // 返回推荐产品
  const recommendedProducts = products.filter(p => 
    recommendedProductIds.has(p.id)
  );
  
  return recommendedProducts.slice(0, limit);
}
