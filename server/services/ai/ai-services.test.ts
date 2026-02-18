import { describe, it, expect } from 'vitest';
import {
  calculateViralPotential,
  calculateBatchViralPotential,
  Product,
} from './viral-scoring.js';
import {
  recommendProducts,
  BuyerProfile,
} from './recommendation.js';
import {
  generateNegotiationAssistance,
} from './negotiation.js';
import {
  generateDecisionMatrix,
} from './decision-matrix.js';

// ============================================================================
// 测试数据
// ============================================================================

const testProduct: Product = {
  id: 1,
  name: 'USB-C Cable',
  category: 'Electronics',
  price: 2.99,
  moq: 100,
  factoryRating: 4.5,
  leadTime: 7,
  viewCount: 1500,
  inquiryCount: 25,
  orderCount: 12,
  reviewCount: 50,
};

const highQualityProduct: Product = {
  id: 2,
  name: 'Premium Wireless Charger',
  category: 'Electronics',
  price: 15.99,
  moq: 50,
  factoryRating: 4.9,
  leadTime: 5,
  viewCount: 5000,
  inquiryCount: 100,
  orderCount: 50,
  reviewCount: 200,
};

const lowQualityProduct: Product = {
  id: 3,
  name: 'Generic Phone Case',
  category: 'Accessories',
  price: 0.99,
  moq: 2000,
  factoryRating: 2.5,
  leadTime: 60,
  viewCount: 50,
  inquiryCount: 2,
  orderCount: 0,
  reviewCount: 5,
};

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
// 爆款评分测试
// ============================================================================

describe('Viral Scoring - 爆款评分', () => {
  describe('calculateViralPotential', () => {
    it('应该返回有效的评分结构', () => {
      const score = calculateViralPotential(testProduct);
      
      expect(score).toHaveProperty('totalScore');
      expect(score).toHaveProperty('level');
      expect(score).toHaveProperty('breakdown');
      expect(score).toHaveProperty('insights');
      expect(score).toHaveProperty('recommendations');
    });
    
    it('总分应该在0-100之间', () => {
      const score = calculateViralPotential(testProduct);
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
      expect(score.totalScore).toBeLessThanOrEqual(100);
    });
    
    it('breakdown各项之和应该等于总分', () => {
      const score = calculateViralPotential(testProduct);
      const sum = Object.values(score.breakdown).reduce((a, b) => a + b, 0);
      expect(sum).toBe(score.totalScore);
    });
    
    it('高质量产品应该得到高分', () => {
      const score = calculateViralPotential(highQualityProduct);
      expect(score.totalScore).toBeGreaterThan(70);
      expect(score.level).toMatch(/high|extreme/);
    });
    
    it('低质量产品应该得到低分', () => {
      const score = calculateViralPotential(lowQualityProduct);
      expect(score.totalScore).toBeLessThan(50);
      expect(score.level).toMatch(/low|medium/);
    });
    
    it('应该生成洞察', () => {
      const score = calculateViralPotential(testProduct);
      expect(score.insights).toBeInstanceOf(Array);
      expect(score.insights.length).toBeGreaterThan(0);
    });
    
    it('应该生成建议', () => {
      const score = calculateViralPotential(testProduct);
      expect(score.recommendations).toBeInstanceOf(Array);
      expect(score.recommendations.length).toBeGreaterThan(0);
    });
  });
  
  describe('calculateBatchViralPotential', () => {
    it('应该批量计算多个产品的评分', () => {
      const products = [testProduct, highQualityProduct, lowQualityProduct];
      const scores = calculateBatchViralPotential(products);
      
      expect(scores.size).toBe(3);
      expect(scores.has(1)).toBe(true);
      expect(scores.has(2)).toBe(true);
      expect(scores.has(3)).toBe(true);
    });
    
    it('批量计算应该快速完成', () => {
      const products = Array.from({ length: 100 }, (_, i) => ({
        ...testProduct,
        id: i + 1,
      }));
      
      const startTime = Date.now();
      const scores = calculateBatchViralPotential(products);
      const endTime = Date.now();
      
      expect(scores.size).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
  
  describe('边界情况测试', () => {
    it('应该处理缺失的可选字段', () => {
      const minimalProduct: Product = {
        id: 99,
        name: 'Test Product',
        category: 'Test',
        price: 10,
        moq: 100,
        factoryRating: 4.0,
        leadTime: 14,
      };
      
      const score = calculateViralPotential(minimalProduct);
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
      expect(score.totalScore).toBeLessThanOrEqual(100);
    });
    
    it('应该处理极端价格', () => {
      const expensiveProduct = { ...testProduct, price: 1000 };
      const cheapProduct = { ...testProduct, price: 0.5 };
      
      const expensiveScore = calculateViralPotential(expensiveProduct);
      const cheapScore = calculateViralPotential(cheapProduct);
      
      expect(expensiveScore.totalScore).toBeGreaterThanOrEqual(0);
      expect(cheapScore.totalScore).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// 推荐系统测试
// ============================================================================

describe('Recommendation System - 推荐系统', () => {
  describe('recommendProducts', () => {
    it('应该返回推荐列表', () => {
      const products = [testProduct, highQualityProduct, lowQualityProduct];
      const recommendations = recommendProducts(testBuyer, products, 2);
      
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });
    
    it('推荐应该按匹配度排序', () => {
      const products = [testProduct, highQualityProduct, lowQualityProduct];
      const recommendations = recommendProducts(testBuyer, products, 3);
      
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].matchScore).toBeGreaterThanOrEqual(
          recommendations[i + 1].matchScore
        );
      }
    });
    
    it('品类匹配应该影响排名', () => {
      const electronicsProduct = { ...testProduct, category: 'Electronics' };
      const fashionProduct = { ...testProduct, id: 10, category: 'Fashion' };
      
      const recommendations = recommendProducts(
        testBuyer,
        [electronicsProduct, fashionProduct],
        2
      );
      
      expect(recommendations[0].product.category).toBe('Electronics');
    });
    
    it('价格区间应该影响匹配度', () => {
      const inRangeProduct = { ...testProduct, price: 15 };
      const outRangeProduct = { ...testProduct, id: 11, price: 100 };
      
      const recommendations = recommendProducts(
        testBuyer,
        [inRangeProduct, outRangeProduct],
        2
      );
      
      expect(recommendations[0].product.price).toBe(15);
    });
    
    it('应该生成匹配原因', () => {
      const products = [testProduct];
      const recommendations = recommendProducts(testBuyer, products, 1);
      
      expect(recommendations[0].matchReasons).toBeInstanceOf(Array);
      expect(recommendations[0].matchReasons.length).toBeGreaterThan(0);
    });
    
    it('应该设置正确的优先级', () => {
      const products = [highQualityProduct, lowQualityProduct];
      const recommendations = recommendProducts(testBuyer, products, 2);
      
      expect(recommendations[0].priority).toMatch(/high|medium|low/);
    });
  });
  
  describe('边界情况测试', () => {
    it('应该处理空产品列表', () => {
      const recommendations = recommendProducts(testBuyer, [], 10);
      expect(recommendations).toEqual([]);
    });
    
    it('应该处理缺失买家信息', () => {
      const minimalBuyer: BuyerProfile = { id: 1 };
      const products = [testProduct];
      
      const recommendations = recommendProducts(minimalBuyer, products, 1);
      expect(recommendations.length).toBe(1);
    });
  });
});

// ============================================================================
// 谈判助手测试
// ============================================================================

describe('Negotiation Assistant - 谈判助手', () => {
  describe('generateNegotiationAssistance', () => {
    it('应该返回完整的谈判建议结构', () => {
      const assistance = generateNegotiationAssistance(testProduct);
      
      expect(assistance).toHaveProperty('priceAnalysis');
      expect(assistance).toHaveProperty('strategy');
      expect(assistance).toHaveProperty('script');
      expect(assistance).toHaveProperty('risks');
      expect(assistance).toHaveProperty('tips');
    });
    
    it('价格分析应该合理', () => {
      const assistance = generateNegotiationAssistance(testProduct);
      const { priceAnalysis } = assistance;
      
      expect(priceAnalysis.factoryPrice).toBeLessThan(testProduct.price);
      expect(priceAnalysis.marketAverage).toBeGreaterThan(testProduct.price);
      expect(priceAnalysis.recommendedTarget).toBeLessThan(testProduct.price);
      expect(priceAnalysis.negotiationSpace).toBeGreaterThan(0);
    });
    
    it('应该生成谈判策略', () => {
      const assistance = generateNegotiationAssistance(testProduct);
      const { strategy } = assistance;
      
      expect(strategy.approach).toMatch(/aggressive|moderate|conservative/);
      expect(strategy.keyPoints).toBeInstanceOf(Array);
      expect(strategy.keyPoints.length).toBeGreaterThan(0);
      expect(strategy.timeline).toBeTruthy();
    });
    
    it('应该生成完整的话术库', () => {
      const assistance = generateNegotiationAssistance(testProduct);
      const { script } = assistance;
      
      expect(script.opening).toBeTruthy();
      expect(script.priceDiscussion).toBeTruthy();
      expect(script.moqNegotiation).toBeTruthy();
      expect(script.qualityAssurance).toBeTruthy();
      expect(script.paymentTerms).toBeTruthy();
      expect(script.closing).toBeTruthy();
    });
    
    it('应该识别风险', () => {
      const assistance = generateNegotiationAssistance(lowQualityProduct);
      expect(assistance.risks).toBeInstanceOf(Array);
      expect(assistance.risks.length).toBeGreaterThan(0);
    });
    
    it('应该提供谈判技巧', () => {
      const assistance = generateNegotiationAssistance(testProduct);
      expect(assistance.tips).toBeInstanceOf(Array);
      expect(assistance.tips.length).toBeGreaterThan(0);
    });
    
    it('应该根据买家上下文调整策略', () => {
      const urgentAssistance = generateNegotiationAssistance(testProduct, {
        urgency: 'high',
      });
      
      expect(urgentAssistance.strategy.approach).toBe('conservative');
    });
  });
});

// ============================================================================
// 决策矩阵测试
// ============================================================================

describe('Decision Matrix - 决策矩阵', () => {
  describe('generateDecisionMatrix', () => {
    it('应该生成完整的决策矩阵', () => {
      const products = [testProduct, highQualityProduct];
      const matrix = generateDecisionMatrix(products);
      
      expect(matrix).toHaveProperty('products');
      expect(matrix).toHaveProperty('recommendation');
      expect(matrix).toHaveProperty('summary');
    });
    
    it('产品应该按综合得分排序', () => {
      const products = [lowQualityProduct, highQualityProduct, testProduct];
      const matrix = generateDecisionMatrix(products);
      
      for (let i = 0; i < matrix.products.length - 1; i++) {
        expect(matrix.products[i].scores.overall).toBeGreaterThanOrEqual(
          matrix.products[i + 1].scores.overall
        );
      }
    });
    
    it('每个产品应该有完整的对比数据', () => {
      const products = [testProduct];
      const matrix = generateDecisionMatrix(products);
      const product = matrix.products[0];
      
      expect(product).toHaveProperty('product');
      expect(product).toHaveProperty('viralScore');
      expect(product).toHaveProperty('scores');
      expect(product).toHaveProperty('profitForecast');
      expect(product).toHaveProperty('risks');
      expect(product).toHaveProperty('strengths');
    });
    
    it('利润预测应该合理', () => {
      const products = [testProduct];
      const matrix = generateDecisionMatrix(products);
      const forecast = matrix.products[0].profitForecast;
      
      expect(forecast.costPerUnit).toBeGreaterThan(0);
      expect(forecast.suggestedRetailPrice).toBeGreaterThan(forecast.costPerUnit);
      expect(forecast.profitPerUnit).toBeGreaterThan(0);
      expect(forecast.profitMarginPercent).toBeGreaterThan(0);
      expect(forecast.profitMarginPercent).toBeLessThan(100);
      expect(forecast.roi).toBeGreaterThan(0);
    });
    
    it('应该生成推荐', () => {
      const products = [testProduct, highQualityProduct];
      const matrix = generateDecisionMatrix(products);
      const { recommendation } = matrix;
      
      expect(recommendation.topProduct).toBeTruthy();
      expect(recommendation.reasons).toBeInstanceOf(Array);
      expect(recommendation.reasons.length).toBeGreaterThan(0);
      expect(recommendation.actionPlan).toBeInstanceOf(Array);
      expect(recommendation.actionPlan.length).toBeGreaterThan(0);
    });
    
    it('应该提供备选方案', () => {
      const products = [testProduct, highQualityProduct, lowQualityProduct];
      const matrix = generateDecisionMatrix(products);
      
      expect(matrix.recommendation.alternativeOptions).toBeInstanceOf(Array);
      expect(matrix.recommendation.alternativeOptions.length).toBeGreaterThan(0);
    });
    
    it('应该生成总结', () => {
      const products = [testProduct, highQualityProduct];
      const matrix = generateDecisionMatrix(products);
      const { summary } = matrix;
      
      expect(summary.totalProducts).toBe(2);
      expect(summary.avgScore).toBeGreaterThan(0);
      expect(summary.bestCategory).toBeTruthy();
      expect(summary.priceRange.min).toBeLessThanOrEqual(summary.priceRange.max);
    });
  });
  
  describe('边界情况测试', () => {
    it('应该处理单个产品', () => {
      const matrix = generateDecisionMatrix([testProduct]);
      expect(matrix.products.length).toBe(1);
      expect(matrix.recommendation.topProduct).toBeTruthy();
    });
    
    it('应该拒绝空产品列表', () => {
      expect(() => generateDecisionMatrix([])).toThrow();
    });
  });
});

// ============================================================================
// 集成测试
// ============================================================================

describe('Integration Tests - 集成测试', () => {
  it('完整的产品评估流程', () => {
    // 1. 计算爆款评分
    const viralScore = calculateViralPotential(testProduct);
    expect(viralScore.totalScore).toBeGreaterThan(0);
    
    // 2. 生成推荐
    const recommendations = recommendProducts(
      testBuyer,
      [testProduct, highQualityProduct],
      2
    );
    expect(recommendations.length).toBeGreaterThan(0);
    
    // 3. 生成谈判建议
    const negotiation = generateNegotiationAssistance(recommendations[0].product);
    expect(negotiation.priceAnalysis).toBeTruthy();
    
    // 4. 生成决策矩阵
    const matrix = generateDecisionMatrix([testProduct, highQualityProduct]);
    expect(matrix.recommendation.topProduct).toBeTruthy();
  });
  
  it('批量处理性能测试', () => {
    const products = Array.from({ length: 50 }, (_, i) => ({
      ...testProduct,
      id: i + 1,
      price: 5 + Math.random() * 50,
      moq: 50 + Math.floor(Math.random() * 500),
    }));
    
    const startTime = Date.now();
    
    // 批量评分
    const scores = calculateBatchViralPotential(products);
    
    // 批量推荐
    const recommendations = recommendProducts(testBuyer, products, 10);
    
    // 决策矩阵
    const matrix = generateDecisionMatrix(products.slice(0, 10));
    
    const endTime = Date.now();
    
    expect(scores.size).toBe(50);
    expect(recommendations.length).toBe(10);
    expect(matrix.products.length).toBe(10);
    expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
  });
});
