/**
 * 谈判助手 (Negotiation Assistant)
 * 
 * 为买家提供智能谈判建议和话术
 * 包括:
 * - 价格分析
 * - 谈判策略
 * - 话术模板
 * - 风险提示
 */

import { Product } from './viral-scoring.js';

export interface NegotiationAssistance {
  priceAnalysis: {
    factoryPrice: number;
    marketAverage: number;
    recommendedTarget: number;
    negotiationSpace: number;
    currency: string;
  };
  strategy: {
    approach: 'aggressive' | 'moderate' | 'conservative';
    keyPoints: string[];
    timeline: string;
  };
  script: {
    opening: string;
    priceDiscussion: string;
    moqNegotiation: string;
    qualityAssurance: string;
    paymentTerms: string;
    closing: string;
  };
  risks: string[];
  tips: string[];
}

/**
 * 生成谈判建议
 */
export function generateNegotiationAssistance(
  product: Product,
  buyerContext?: {
    targetPrice?: number;
    targetMoq?: number;
    urgency?: 'high' | 'medium' | 'low';
  }
): NegotiationAssistance {
  const priceAnalysis = analyzePricing(product, buyerContext?.targetPrice);
  const strategy = determineStrategy(product, priceAnalysis, buyerContext);
  const script = generateScript(product, priceAnalysis, strategy);
  const risks = identifyRisks(product, priceAnalysis);
  const tips = generateTips(product, strategy);
  
  return {
    priceAnalysis,
    strategy,
    script,
    risks,
    tips,
  };
}

/**
 * 价格分析
 */
function analyzePricing(
  product: Product,
  targetPrice?: number
): NegotiationAssistance['priceAnalysis'] {
  // 估算工厂价格 (通常是市场价的60-70%)
  const factoryPrice = product.price * 0.65;
  
  // 估算市场平均价
  const marketAverage = product.price * 1.15;
  
  // 推荐目标价格 (工厂价的85-90%)
  const recommendedTarget = targetPrice || product.price * 0.88;
  
  // 谈判空间
  const negotiationSpace = ((product.price - recommendedTarget) / product.price) * 100;
  
  return {
    factoryPrice: parseFloat(factoryPrice.toFixed(2)),
    marketAverage: parseFloat(marketAverage.toFixed(2)),
    recommendedTarget: parseFloat(recommendedTarget.toFixed(2)),
    negotiationSpace: parseFloat(negotiationSpace.toFixed(1)),
    currency: 'USD',
  };
}

/**
 * 确定谈判策略
 */
function determineStrategy(
  product: Product,
  priceAnalysis: NegotiationAssistance['priceAnalysis'],
  buyerContext?: {
    targetPrice?: number;
    targetMoq?: number;
    urgency?: 'high' | 'medium' | 'low';
  }
): NegotiationAssistance['strategy'] {
  let approach: 'aggressive' | 'moderate' | 'conservative' = 'moderate';
  
  // 根据价格空间决定策略
  if (priceAnalysis.negotiationSpace > 15) {
    approach = 'aggressive';
  } else if (priceAnalysis.negotiationSpace < 8) {
    approach = 'conservative';
  }
  
  // 根据紧急程度调整
  if (buyerContext?.urgency === 'high') {
    approach = 'conservative';
  }
  
  const keyPoints = generateKeyPoints(product, priceAnalysis, approach);
  const timeline = determineTimeline(approach, buyerContext?.urgency);
  
  return {
    approach,
    keyPoints,
    timeline,
  };
}

/**
 * 生成关键谈判点
 */
function generateKeyPoints(
  product: Product,
  priceAnalysis: NegotiationAssistance['priceAnalysis'],
  approach: string
): string[] {
  const points: string[] = [];
  
  // 价格谈判点
  if (approach === 'aggressive') {
    points.push(`争取 ${priceAnalysis.negotiationSpace}% 的价格折扣`);
  } else if (approach === 'moderate') {
    points.push(`争取 ${(priceAnalysis.negotiationSpace * 0.7).toFixed(1)}% 的价格折扣`);
  } else {
    points.push(`争取 ${(priceAnalysis.negotiationSpace * 0.5).toFixed(1)}% 的价格折扣`);
  }
  
  // MOQ谈判点
  if (product.moq > 500) {
    points.push(`协商降低MOQ至 ${Math.floor(product.moq * 0.7)} 件`);
  }
  
  // 交货期谈判点
  if (product.leadTime > 30) {
    points.push(`要求缩短交货期至 ${Math.floor(product.leadTime * 0.8)} 天`);
  }
  
  // 付款条件
  points.push('争取 30% 定金 + 70% 发货前付款');
  
  // 质量保证
  points.push('要求提供样品和质检报告');
  
  return points;
}

/**
 * 确定谈判时间线
 */
function determineTimeline(
  approach: string,
  urgency?: 'high' | 'medium' | 'low'
): string {
  if (urgency === 'high') {
    return '1-2轮谈判,3-5天内完成';
  }
  
  if (approach === 'aggressive') {
    return '3-4轮谈判,1-2周完成';
  } else if (approach === 'moderate') {
    return '2-3轮谈判,1周内完成';
  } else {
    return '1-2轮谈判,3-5天内完成';
  }
}

/**
 * 生成谈判话术
 */
function generateScript(
  product: Product,
  priceAnalysis: NegotiationAssistance['priceAnalysis'],
  strategy: NegotiationAssistance['strategy']
): NegotiationAssistance['script'] {
  return {
    opening: generateOpeningScript(product),
    priceDiscussion: generatePriceScript(product, priceAnalysis, strategy.approach),
    moqNegotiation: generateMoqScript(product),
    qualityAssurance: generateQualityScript(product),
    paymentTerms: generatePaymentScript(),
    closing: generateClosingScript(product),
  };
}

/**
 * 开场白
 */
function generateOpeningScript(product: Product): string {
  return `您好!我对贵司的 ${product.name} 很感兴趣。我们是一家专业的进口商,正在寻找长期稳定的供应商。我看到贵司在这个品类有很好的口碑,希望能进一步了解产品详情和合作可能性。`;
}

/**
 * 价格讨论话术
 */
function generatePriceScript(
  product: Product,
  priceAnalysis: NegotiationAssistance['priceAnalysis'],
  approach: string
): string {
  if (approach === 'aggressive') {
    return `关于价格,我们做过市场调研,目前的报价 $${product.price} 相比市场平均价格偏高。考虑到我们的采购量和长期合作意向,希望能得到 $${priceAnalysis.recommendedTarget} 的优惠价格。这个价格对双方都是合理的,也能帮助我们在市场上更有竞争力。`;
  } else if (approach === 'moderate') {
    return `关于价格,我们希望能在 $${priceAnalysis.recommendedTarget} 左右。我们计划长期合作,如果首单合作顺利,后续订单量会持续增加。希望贵司能考虑给予一定的价格优惠。`;
  } else {
    return `贵司的报价 $${product.price} 我们基本可以接受,但希望能在此基础上有一些优惠空间,比如 $${priceAnalysis.recommendedTarget}。我们对产品质量要求较高,价格合理的话可以立即下单。`;
  }
}

/**
 * MOQ协商话术
 */
function generateMoqScript(product: Product): string {
  if (product.moq > 500) {
    const targetMoq = Math.floor(product.moq * 0.7);
    return `关于起订量,${product.moq} 件对我们来说稍微偏高。作为首次合作,我们希望先从 ${targetMoq} 件开始测试市场反应。如果市场反馈良好,后续订单会快速增加。这样对双方都是较低风险的开始方式。`;
  } else {
    return `${product.moq} 件的起订量对我们来说是可以接受的。如果产品质量和交货期都能保证,我们可以立即下单。`;
  }
}

/**
 * 质量保证话术
 */
function generateQualityScript(product: Product): string {
  return `关于质量保证,我们希望:\n1. 下单前能收到样品进行测试\n2. 提供相关的质检报告和认证证书\n3. 大货生产前进行首件确认\n4. 发货前进行第三方质检\n这些是我们的标准流程,希望贵司能配合。`;
}

/**
 * 付款条件话术
 */
function generatePaymentScript(): string {
  return `关于付款条件,我们通常的做法是:\n1. 签订合同后支付 30% 定金\n2. 收到发货通知后支付 70% 尾款\n3. 通过 T/T 或 L/C 方式付款\n这是行业标准做法,希望贵司能接受。如果有其他付款方式建议,我们也可以讨论。`;
}

/**
 * 结束语
 */
function generateClosingScript(product: Product): string {
  return `感谢您的耐心沟通!如果我们能在价格、MOQ和质量保证方面达成一致,我们可以立即进入下单流程。我们非常看好 ${product.name} 的市场潜力,希望能与贵司建立长期稳定的合作关系。期待您的回复!`;
}

/**
 * 识别风险
 */
function identifyRisks(
  product: Product,
  priceAnalysis: NegotiationAssistance['priceAnalysis']
): string[] {
  const risks: string[] = [];
  
  // 价格风险
  if (priceAnalysis.negotiationSpace < 5) {
    risks.push('⚠️ 价格谈判空间较小,可能难以获得大幅折扣');
  }
  
  // 工厂评分风险
  if (product.factoryRating < 4.0) {
    risks.push('⚠️ 工厂评分较低,建议仔细核实质量和交货能力');
  }
  
  // 交货期风险
  if (product.leadTime > 45) {
    risks.push('⚠️ 交货期较长,可能影响市场时机');
  }
  
  // MOQ风险
  if (product.moq > 1000) {
    risks.push('⚠️ 起订量较高,首次合作风险较大');
  }
  
  // 价格过低风险
  if (product.price < 3) {
    risks.push('⚠️ 价格较低,利润空间有限,注意成本控制');
  }
  
  return risks;
}

/**
 * 生成谈判技巧
 */
function generateTips(
  product: Product,
  strategy: NegotiationAssistance['strategy']
): string[] {
  const tips: string[] = [];
  
  // 通用技巧
  tips.push('💡 保持专业和礼貌,建立良好的第一印象');
  tips.push('💡 强调长期合作意向,而不是一次性交易');
  tips.push('💡 准备好竞品报价作为谈判筹码');
  
  // 策略相关技巧
  if (strategy.approach === 'aggressive') {
    tips.push('💡 可以适当表现出对多家供应商的考察');
    tips.push('💡 强调采购量和市场潜力');
  } else if (strategy.approach === 'moderate') {
    tips.push('💡 平衡价格和质量,不要只关注价格');
    tips.push('💡 展示专业性,让工厂看到合作价值');
  } else {
    tips.push('💡 快速决策,展现诚意');
    tips.push('💡 关注质量和服务,价格适当让步');
  }
  
  // 产品相关技巧
  if (product.factoryRating >= 4.5) {
    tips.push('💡 这是优质供应商,可以适当在价格上让步');
  }
  
  if (product.moq <= 100) {
    tips.push('💡 低MOQ是优势,可以快速测试市场');
  }
  
  return tips;
}
