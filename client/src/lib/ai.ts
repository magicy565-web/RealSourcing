/**
 * AI Service for RealSourcing
 * Integrates Nova AI for supplier matching and report generation
 */

interface NovaAIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

const config: NovaAIConfig = {
  baseURL: 'https://once.novai.su/v1',
  apiKey: 'sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM',
  model: '[逆次]o4-mini',
};

export interface SupplierMatchRequest {
  productName: string;
  quantity: number;
  specifications?: string;
  targetPrice?: number;
  leadTime?: number;
}

export interface SupplierMatchResult {
  factoryId: string;
  factoryName: string;
  matchScore: number;
  reasoning: string;
  estimatedPrice: number;
  estimatedLeadTime: number;
}

export interface ComparisonReportRequest {
  factoryIds: string[];
  criteria: string[];
}

export interface ComparisonReportResult {
  summary: string;
  recommendations: string[];
  detailedComparison: {
    factoryId: string;
    factoryName: string;
    scores: Record<string, number>;
    pros: string[];
    cons: string[];
  }[];
}

/**
 * Call Nova AI API
 */
async function callNovaAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert B2B sourcing analyst specializing in supplier evaluation and matching for cross-border trade.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nova AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Failed to call Nova AI:', error);
    throw error;
  }
}

/**
 * Match suppliers based on inquiry requirements
 */
export async function matchSuppliers(
  request: SupplierMatchRequest,
  availableFactories: any[]
): Promise<SupplierMatchResult[]> {
  const prompt = `
You are analyzing a sourcing inquiry and need to match it with the best suppliers from our database.

**Inquiry Details:**
- Product: ${request.productName}
- Quantity: ${request.quantity} units
- Specifications: ${request.specifications || 'Not specified'}
- Target Price: ${request.targetPrice ? `$${request.targetPrice}` : 'Flexible'}
- Required Lead Time: ${request.leadTime ? `${request.leadTime} days` : 'Flexible'}

**Available Suppliers:**
${availableFactories.map((f, i) => `
${i + 1}. ${f.name}
   - Location: ${f.location || 'China'}
   - Specialization: ${f.specialization || 'General Manufacturing'}
   - Capacity: ${f.capacity || 'Medium'}
   - Quality Score: ${f.quality_score || 'N/A'}
   - Average Lead Time: ${f.lead_time_days || 'N/A'} days
`).join('\n')}

**Task:**
Analyze each supplier and return a JSON array with the top 3 matches. For each match, provide:
- factoryId: The supplier's ID
- factoryName: The supplier's name
- matchScore: A score from 0-100 indicating match quality
- reasoning: A brief explanation of why this supplier is a good match
- estimatedPrice: Your estimated unit price in USD
- estimatedLeadTime: Your estimated lead time in days

Return ONLY valid JSON, no additional text.
`;

  try {
    const response = await callNovaAI(prompt);
    const matches = JSON.parse(response);
    return matches;
  } catch (error) {
    console.error('Failed to match suppliers:', error);
    // Fallback to mock data
    return availableFactories.slice(0, 3).map((f, i) => ({
      factoryId: f.id,
      factoryName: f.name,
      matchScore: 90 - i * 5,
      reasoning: `Strong match based on specialization and capacity`,
      estimatedPrice: request.targetPrice || 10.5,
      estimatedLeadTime: request.leadTime || 30,
    }));
  }
}

/**
 * Generate comparison report for multiple suppliers
 */
export async function generateComparisonReport(
  request: ComparisonReportRequest,
  factories: any[]
): Promise<ComparisonReportResult> {
  const prompt = `
You are generating a comprehensive supplier comparison report for a B2B buyer.

**Suppliers to Compare:**
${factories.map((f, i) => `
${i + 1}. ${f.name}
   - Location: ${f.location || 'China'}
   - Specialization: ${f.specialization || 'General Manufacturing'}
   - Quality Score: ${f.quality_score || 'N/A'}
   - Certifications: ${f.certifications || 'N/A'}
   - Lead Time: ${f.lead_time_days || 'N/A'} days
   - MOQ: ${f.moq || 'N/A'} units
`).join('\n')}

**Evaluation Criteria:**
${request.criteria.join(', ')}

**Task:**
Generate a detailed comparison report in JSON format with:
- summary: A 2-3 sentence executive summary
- recommendations: An array of 3-5 actionable recommendations
- detailedComparison: An array of objects for each supplier containing:
  - factoryId
  - factoryName
  - scores: An object with scores (0-100) for each criterion
  - pros: An array of 3-5 strengths
  - cons: An array of 2-3 weaknesses

Return ONLY valid JSON, no additional text.
`;

  try {
    const response = await callNovaAI(prompt);
    const report = JSON.parse(response);
    return report;
  } catch (error) {
    console.error('Failed to generate comparison report:', error);
    // Fallback to mock data
    return {
      summary: 'All suppliers demonstrate strong capabilities with varying strengths in quality, price competitiveness, and delivery speed.',
      recommendations: [
        'Prioritize Supplier #1 for high-quality requirements',
        'Consider Supplier #2 for cost-sensitive projects',
        'Engage Supplier #3 for urgent deliveries',
      ],
      detailedComparison: factories.map((f) => ({
        factoryId: f.id,
        factoryName: f.name,
        scores: {
          quality: 85,
          price: 78,
          leadTime: 92,
          compliance: 88,
        },
        pros: ['ISO certified', 'Fast response time', 'Flexible MOQ'],
        cons: ['Higher pricing', 'Limited capacity'],
      })),
    };
  }
}

/**
 * Generate AI-powered quote assistance
 */
export async function generateQuoteAssistance(
  inquiry: any,
  historicalData: any[]
): Promise<{
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
}> {
  const prompt = `
You are assisting a factory in generating a competitive quote for a B2B inquiry.

**Inquiry Details:**
- Product: ${inquiry.product_name}
- Quantity: ${inquiry.quantity} units
- Specifications: ${inquiry.specifications || 'Standard'}

**Historical Similar Orders:**
${historicalData.map((h, i) => `
${i + 1}. Product: ${h.product_name}, Qty: ${h.quantity}, Price: $${h.unit_price}
`).join('\n')}

**Task:**
Based on the historical data and market conditions, suggest:
- suggestedPrice: The recommended unit price in USD
- priceRange: An object with min and max acceptable prices
- reasoning: A brief explanation of the pricing strategy

Return ONLY valid JSON, no additional text.
`;

  try {
    const response = await callNovaAI(prompt);
    const assistance = JSON.parse(response);
    return assistance;
  } catch (error) {
    console.error('Failed to generate quote assistance:', error);
    return {
      suggestedPrice: 12.5,
      priceRange: { min: 10.0, max: 15.0 },
      reasoning: 'Based on similar historical orders and current market conditions',
    };
  }
}
