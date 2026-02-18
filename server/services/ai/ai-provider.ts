/**
 * Multi-Provider AI Service Manager
 * 
 * 管理多个AI提供商,实现智能路由和降级策略
 * 
 * 支持的提供商:
 * - OpenAI Compatible (逆次)
 * - Google Gemini (海外场景)
 * - 阿里云百炼 (国内场景)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'openai' | 'gemini' | 'bailian';
export type UserRegion = 'cn' | 'global';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
  priority: number; // 优先级,数字越小优先级越高
  regions: UserRegion[]; // 适用地区
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI提供商管理器
 */
export class AIProviderManager {
  private providers: Map<AIProvider, AIProviderConfig> = new Map();
  private geminiClient?: GoogleGenerativeAI;
  
  constructor() {
    this.initializeProviders();
  }
  
  /**
   * 初始化所有AI提供商
   */
  private initializeProviders() {
    // OpenAI Compatible (逆次)
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL || 'https://once.novai.su/v1',
        model: process.env.OPENAI_MODEL || '[逆次]o4-mini',
        enabled: true,
        priority: 2,
        regions: ['cn', 'global'],
      });
    }
    
    // Google Gemini (海外场景)
    if (process.env.GEMINI_API_KEY) {
      this.providers.set('gemini', {
        provider: 'gemini',
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        enabled: true,
        priority: 1,
        regions: ['global'],
      });
      
      // 初始化Gemini客户端
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    
    // 阿里云百炼 (国内场景)
    if (process.env.ALIBABA_BAILIAN_API_KEY) {
      this.providers.set('bailian', {
        provider: 'bailian',
        apiKey: process.env.ALIBABA_BAILIAN_API_KEY,
        baseUrl: process.env.ALIBABA_BAILIAN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: process.env.ALIBABA_BAILIAN_MODEL || 'qwen-plus',
        enabled: true,
        priority: 1,
        regions: ['cn'],
      });
    }
    
    console.log(`[AI Provider] Initialized ${this.providers.size} providers:`, 
      Array.from(this.providers.keys()));
  }
  
  /**
   * 根据地区和策略选择最佳AI提供商
   */
  selectProvider(
    region?: UserRegion,
    preferredProvider?: AIProvider
  ): AIProviderConfig | null {
    // 如果指定了提供商,优先使用
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      if (provider.enabled) {
        return provider;
      }
    }
    
    // 根据环境变量的AI_PROVIDER设置
    const envProvider = process.env.AI_PROVIDER as AIProvider;
    if (envProvider && envProvider !== 'auto' && this.providers.has(envProvider)) {
      const provider = this.providers.get(envProvider)!;
      if (provider.enabled) {
        return provider;
      }
    }
    
    // 自动选择: 根据地区和优先级
    const userRegion = region || (process.env.DEFAULT_REGION as UserRegion) || 'cn';
    
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.enabled && p.regions.includes(userRegion))
      .sort((a, b) => a.priority - b.priority);
    
    if (availableProviders.length === 0) {
      console.error('[AI Provider] No available providers for region:', userRegion);
      return null;
    }
    
    const selected = availableProviders[0];
    console.log(`[AI Provider] Selected ${selected.provider} for region ${userRegion}`);
    return selected;
  }
  
  /**
   * 调用AI完成接口 (统一接口)
   */
  async complete(
    request: AICompletionRequest,
    options?: {
      region?: UserRegion;
      preferredProvider?: AIProvider;
      retryOnFailure?: boolean;
    }
  ): Promise<AICompletionResponse> {
    const provider = this.selectProvider(options?.region, options?.preferredProvider);
    
    if (!provider) {
      throw new Error('No AI provider available');
    }
    
    try {
      return await this.callProvider(provider, request);
    } catch (error: any) {
      console.error(`[AI Provider] ${provider.provider} failed:`, error.message);
      
      // 如果允许重试,尝试降级到其他提供商
      if (options?.retryOnFailure) {
        return await this.fallbackComplete(request, provider.provider, options.region);
      }
      
      throw error;
    }
  }
  
  /**
   * 降级策略: 尝试其他可用提供商
   */
  private async fallbackComplete(
    request: AICompletionRequest,
    failedProvider: AIProvider,
    region?: UserRegion
  ): Promise<AICompletionResponse> {
    const userRegion = region || (process.env.DEFAULT_REGION as UserRegion) || 'cn';
    
    const fallbackProviders = Array.from(this.providers.values())
      .filter(p => 
        p.enabled && 
        p.provider !== failedProvider && 
        p.regions.includes(userRegion)
      )
      .sort((a, b) => a.priority - b.priority);
    
    for (const provider of fallbackProviders) {
      try {
        console.log(`[AI Provider] Falling back to ${provider.provider}`);
        return await this.callProvider(provider, request);
      } catch (error: any) {
        console.error(`[AI Provider] ${provider.provider} also failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All AI providers failed');
  }
  
  /**
   * 调用具体的AI提供商
   */
  private async callProvider(
    provider: AIProviderConfig,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    switch (provider.provider) {
      case 'openai':
        return await this.callOpenAI(provider, request);
      case 'gemini':
        return await this.callGemini(provider, request);
      case 'bailian':
        return await this.callBailian(provider, request);
      default:
        throw new Error(`Unknown provider: ${provider.provider}`);
    }
  }
  
  /**
   * 调用 OpenAI Compatible API
   */
  private async callOpenAI(
    provider: AIProviderConfig,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      provider: 'openai',
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }
  
  /**
   * 调用 Google Gemini API
   */
  private async callGemini(
    provider: AIProviderConfig,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }
    
    const model = this.geminiClient.getGenerativeModel({ 
      model: request.model || provider.model 
    });
    
    // 转换消息格式
    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');
    
    // 构建prompt
    let prompt = '';
    if (systemMessage) {
      prompt += `${systemMessage.content}\n\n`;
    }
    
    for (const msg of userMessages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      content: text,
      provider: 'gemini',
      model: provider.model,
      usage: {
        promptTokens: 0, // Gemini不返回token使用量
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
  
  /**
   * 调用阿里云百炼 API (OpenAI兼容模式)
   */
  private async callBailian(
    provider: AIProviderConfig,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bailian API error: ${response.status} ${error}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      provider: 'bailian',
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }
  
  /**
   * 获取所有可用提供商
   */
  getAvailableProviders(region?: UserRegion): AIProviderConfig[] {
    const userRegion = region || (process.env.DEFAULT_REGION as UserRegion) || 'cn';
    
    return Array.from(this.providers.values())
      .filter(p => p.enabled && p.regions.includes(userRegion))
      .sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * 检查提供商健康状态
   */
  async checkHealth(provider: AIProvider): Promise<boolean> {
    const config = this.providers.get(provider);
    if (!config || !config.enabled) {
      return false;
    }
    
    try {
      const response = await this.callProvider(config, {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        maxTokens: 10,
      });
      
      return response.content.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// 全局单例
let aiProviderManager: AIProviderManager | null = null;

export function getAIProviderManager(): AIProviderManager {
  if (!aiProviderManager) {
    aiProviderManager = new AIProviderManager();
  }
  return aiProviderManager;
}

/**
 * 便捷函数: 调用AI完成接口
 */
export async function callAI(
  messages: AIMessage[],
  options?: {
    region?: UserRegion;
    provider?: AIProvider;
    temperature?: number;
    maxTokens?: number;
    retryOnFailure?: boolean;
  }
): Promise<AICompletionResponse> {
  const manager = getAIProviderManager();
  
  return await manager.complete(
    {
      messages,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    },
    {
      region: options?.region,
      preferredProvider: options?.provider,
      retryOnFailure: options?.retryOnFailure ?? true,
    }
  );
}
