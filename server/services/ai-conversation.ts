import { ENV } from '../_core/env';

/**
 * AI 对话引擎服务
 * 集成 Nova AI LLM 进行智能对话、采购信息提取和意向合同生成
 */

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PurchaseInfo {
  productName?: string;
  quantity?: number;
  targetPrice?: number;
  currency?: string;
  deliveryDate?: string;
  paymentTerms?: string;
  qualityRequirements?: string[];
  additionalNotes?: string;
}

export interface IntentContract {
  buyerName: string;
  factoryName: string;
  productDetails: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  deliveryDate: string;
  paymentTerms: string;
  qualityStandards: string;
  generatedAt: string;
}

/**
 * 调用 Nova AI LLM 进行对话
 */
export async function chatWithAI(
  messages: ConversationMessage[],
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-mini', // [逆次]o4-mini
        messages,
        temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Failed to chat with AI:', error);
    throw error;
  }
}

/**
 * 从对话中提取采购信息
 */
export async function extractPurchaseInfo(
  conversationHistory: string
): Promise<PurchaseInfo> {
  const systemPrompt = `你是一个专业的采购信息提取助手。请从以下对话记录中提取关键的采购信息，包括：
- 产品名称
- 采购数量
- 目标价格
- 货币单位
- 交货日期
- 付款条款
- 质量要求
- 其他备注

请以 JSON 格式返回提取的信息。如果某些信息未提及，请将对应字段设为 null。`;

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `对话记录：\n${conversationHistory}` },
  ];

  try {
    const response = await chatWithAI(messages, 0.3); // 使用较低的 temperature 以提高准确性
    
    // 尝试解析 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // 如果无法解析 JSON，返回空对象
    return {};
  } catch (error) {
    console.error('Failed to extract purchase info:', error);
    throw error;
  }
}

/**
 * 生成意向合同
 */
export async function generateIntentContract(
  buyerName: string,
  factoryName: string,
  purchaseInfo: PurchaseInfo
): Promise<IntentContract> {
  const systemPrompt = `你是一个专业的国际贸易合同起草助手。请根据以下采购信息生成一份正式的意向合同（Letter of Intent）。

合同应包括：
1. 买卖双方信息
2. 产品详细描述
3. 数量和单价
4. 总金额
5. 交货日期
6. 付款条款
7. 质量标准
8. 其他重要条款

请以专业、正式的语言撰写，并以 JSON 格式返回合同内容。`;

  const userPrompt = `请为以下交易生成意向合同：

买方：${buyerName}
卖方（工厂）：${factoryName}

采购信息：
${JSON.stringify(purchaseInfo, null, 2)}`;

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await chatWithAI(messages, 0.5);
    
    // 尝试解析 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const contractData = JSON.parse(jsonMatch[0]);
      return {
        ...contractData,
        generatedAt: new Date().toISOString(),
      };
    }
    
    // 如果无法解析 JSON，返回基本合同
    return {
      buyerName,
      factoryName,
      productDetails: purchaseInfo.productName || 'N/A',
      quantity: purchaseInfo.quantity || 0,
      unitPrice: purchaseInfo.targetPrice || 0,
      totalAmount: (purchaseInfo.quantity || 0) * (purchaseInfo.targetPrice || 0),
      currency: purchaseInfo.currency || 'USD',
      deliveryDate: purchaseInfo.deliveryDate || 'TBD',
      paymentTerms: purchaseInfo.paymentTerms || 'TBD',
      qualityStandards: purchaseInfo.qualityRequirements?.join(', ') || 'TBD',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to generate intent contract:', error);
    throw error;
  }
}

/**
 * AI 辅助实时对话（用于 Webinar 中的智能助手）
 */
export async function assistConversation(
  conversationContext: string,
  userQuestion: string
): Promise<string> {
  const systemPrompt = `你是一个专业的国际贸易和采购谈判助手。你的任务是：
1. 理解买家和工厂之间的对话上下文
2. 回答用户的问题
3. 提供专业的建议
4. 帮助双方达成共识

请用简洁、专业的语言回答，避免冗长的解释。`;

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `对话上下文：\n${conversationContext}\n\n用户问题：${userQuestion}` },
  ];

  try {
    return await chatWithAI(messages, 0.7);
  } catch (error) {
    console.error('Failed to assist conversation:', error);
    throw error;
  }
}

/**
 * 实时语音转文字（集成声网 ConvoAI）
 * 注意：这需要声网的 ConvoAI 服务，目前使用占位符实现
 */
export async function transcribeAudio(
  audioUrl: string,
  language: 'zh-CN' | 'en-US' = 'zh-CN'
): Promise<string> {
  // TODO: 集成声网 ConvoAI 的语音转文字服务
  // 这需要调用声网的 RESTful API
  
  console.warn('Audio transcription not yet implemented. Using placeholder.');
  return '[语音转文字功能待实现]';
}

/**
 * AI 智能翻译（中英互译）
 */
export async function translateText(
  text: string,
  sourceLang: 'zh' | 'en',
  targetLang: 'zh' | 'en'
): Promise<string> {
  if (sourceLang === targetLang) {
    return text;
  }

  const systemPrompt = `你是一个专业的翻译助手。请将以下文本从${sourceLang === 'zh' ? '中文' : '英文'}翻译成${targetLang === 'zh' ? '中文' : '英文'}。
要求：
1. 准确传达原文意思
2. 使用专业的商务语言
3. 保持原文的语气和风格
4. 只返回翻译结果，不要添加任何解释`;

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ];

  try {
    return await chatWithAI(messages, 0.3);
  } catch (error) {
    console.error('Failed to translate text:', error);
    throw error;
  }
}
