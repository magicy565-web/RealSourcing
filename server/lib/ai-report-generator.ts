import OpenAI from "openai";
import { getWebinarById, getWebinarFactories, getWebinarTimeline } from "../db.js";

// Initialize OpenAI client with third-party API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM",
  baseURL: process.env.OPENAI_BASE_URL || "https://once.novai.su/v1",
});

// Model name for third-party API
const AI_MODEL = process.env.OPENAI_MODEL || "[逆次]o4-mini";

// Report type definitions
export type ReportType = "supplier_evaluation" | "profit_analysis" | "negotiation_summary";

interface ReportGenerationOptions {
  webinarId: number;
  reportType: ReportType;
  additionalContext?: Record<string, any>;
}

interface GeneratedReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  recommendations: string[];
  metadata: Record<string, any>;
}

interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, any>;
}

/**
 * Generate AI-powered report based on webinar data
 */
export async function generateAIReport(
  options: ReportGenerationOptions
): Promise<GeneratedReport> {
  const { webinarId, reportType, additionalContext } = options;

  // Gather data for report generation
  const webinar = await getWebinarById(webinarId);
  if (!webinar) {
    throw new Error(`Webinar ${webinarId} not found`);
  }

  const factories = await getWebinarFactories(webinarId);
  const timeline = await getWebinarTimeline(webinarId);

  // Build context for AI
  const context = {
    webinar: {
      title: webinar.title,
      description: webinar.description,
      category: webinar.category,
      duration: webinar.duration,
      status: webinar.status,
    },
    factories: factories.map((f: any) => ({
      name: f.name,
      location: f.location,
      category: f.category,
      overallScore: f.overallScore,
      qualityScore: f.qualityScore,
      deliveryScore: f.deliveryScore,
      communicationScore: f.communicationScore,
      pricingScore: f.pricingScore,
    })),
    timeline: timeline.map((e: any) => ({
      type: e.type,
      title: e.title,
      description: e.description,
      createdAt: e.createdAt,
    })),
    additionalContext,
  };

  // Generate report based on type
  switch (reportType) {
    case "supplier_evaluation":
      return await generateSupplierEvaluationReport(context);
    case "profit_analysis":
      return await generateProfitAnalysisReport(context);
    case "negotiation_summary":
      return await generateNegotiationSummaryReport(context);
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}

/**
 * Generate Supplier Evaluation Report
 */
async function generateSupplierEvaluationReport(context: any): Promise<GeneratedReport> {
  const prompt = `
You are an expert sourcing analyst. Generate a comprehensive supplier evaluation report based on the following data:

Webinar: ${context.webinar.title}
Description: ${context.webinar.description || "N/A"}
Category: ${context.webinar.category || "N/A"}

Factories:
${context.factories.map((f: any, i: number) => `
${i + 1}. ${f.name}
   - Location: ${f.location}
   - Category: ${f.category}
   - Overall Score: ${f.overallScore || "N/A"}
   - Quality Score: ${f.qualityScore || "N/A"}
   - Delivery Score: ${f.deliveryScore || "N/A"}
   - Communication Score: ${f.communicationScore || "N/A"}
   - Pricing Score: ${f.pricingScore || "N/A"}
`).join("\n")}

Timeline Events:
${context.timeline.slice(0, 10).map((e: any, i: number) => `
${i + 1}. [${e.type}] ${e.title}
   ${e.description || ""}
`).join("\n")}

Generate a detailed supplier evaluation report with the following structure:
1. Executive Summary (2-3 sentences)
2. Factory Comparison (compare all factories on key metrics)
3. Strengths and Weaknesses (for each factory)
4. Risk Assessment (identify potential risks)
5. Recommendations (which factory to choose and why)

Format the response as JSON with this structure:
{
  "title": "Supplier Evaluation Report",
  "summary": "Executive summary here",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content",
      "data": { "key": "value" }
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "metadata": { "confidence": 0.85, "dataQuality": "high" }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert sourcing analyst. Generate detailed, data-driven reports in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const report = JSON.parse(content);
    return report as GeneratedReport;
  } catch (error) {
    console.error("Failed to generate supplier evaluation report:", error);
    
    // Return fallback report
    return generateFallbackSupplierReport(context);
  }
}

/**
 * Generate Profit Analysis Report
 */
async function generateProfitAnalysisReport(context: any): Promise<GeneratedReport> {
  const prompt = `
You are a financial analyst specializing in sourcing and procurement. Generate a profit analysis report based on the following data:

Webinar: ${context.webinar.title}
Factories: ${context.factories.length} factories evaluated

Additional Context:
${JSON.stringify(context.additionalContext || {}, null, 2)}

Generate a detailed profit analysis report with the following structure:
1. Cost Breakdown (estimate costs based on typical sourcing scenarios)
2. Profit Margin Analysis (calculate potential profit margins)
3. Volume Impact (how volume affects profitability)
4. Risk-Adjusted Returns (consider risks in profit calculations)
5. Financial Recommendations (optimize for profitability)

Format the response as JSON with this structure:
{
  "title": "Profit Analysis Report",
  "summary": "Executive summary here",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content",
      "data": { "estimatedCost": 1000, "estimatedProfit": 300 }
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "metadata": { "confidence": 0.75, "assumptions": ["assumption 1"] }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a financial analyst. Generate detailed profit analysis reports in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const report = JSON.parse(content);
    return report as GeneratedReport;
  } catch (error) {
    console.error("Failed to generate profit analysis report:", error);
    
    // Return fallback report
    return generateFallbackProfitReport(context);
  }
}

/**
 * Generate Negotiation Summary Report
 */
async function generateNegotiationSummaryReport(context: any): Promise<GeneratedReport> {
  const prompt = `
You are a negotiation expert. Generate a negotiation summary report based on the following data:

Webinar: ${context.webinar.title}
Status: ${context.webinar.status}
Duration: ${context.webinar.duration} minutes

Timeline Events:
${context.timeline.map((e: any, i: number) => `
${i + 1}. [${e.type}] ${e.title}
   ${e.description || ""}
   Time: ${e.createdAt}
`).join("\n")}

Generate a detailed negotiation summary report with the following structure:
1. Negotiation Overview (what was discussed)
2. Key Milestones (important events in the timeline)
3. Agreements Reached (what was agreed upon)
4. Outstanding Issues (what still needs to be resolved)
5. Next Steps (recommended actions)

Format the response as JSON with this structure:
{
  "title": "Negotiation Summary Report",
  "summary": "Executive summary here",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content",
      "data": { "key": "value" }
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "metadata": { "completionRate": 0.8, "issuesCount": 2 }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a negotiation expert. Generate detailed negotiation summary reports in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const report = JSON.parse(content);
    return report as GeneratedReport;
  } catch (error) {
    console.error("Failed to generate negotiation summary report:", error);
    
    // Return fallback report
    return generateFallbackNegotiationReport(context);
  }
}

/**
 * Fallback reports when AI generation fails
 */
function generateFallbackSupplierReport(context: any): GeneratedReport {
  return {
    title: "Supplier Evaluation Report",
    summary: `Evaluation of ${context.factories.length} suppliers for ${context.webinar.title}`,
    sections: [
      {
        title: "Factory Overview",
        content: `Evaluated ${context.factories.length} factories: ${context.factories.map((f: any) => f.name).join(", ")}`,
        data: { factoryCount: context.factories.length },
      },
      {
        title: "Scoring Summary",
        content: "Detailed scoring analysis is being generated. Please check back later.",
      },
    ],
    recommendations: [
      "Review detailed factory profiles before making a decision",
      "Request samples from top-rated factories",
      "Verify certifications and compliance documentation",
    ],
    metadata: {
      confidence: 0.5,
      dataQuality: "limited",
      fallback: true,
    },
  };
}

function generateFallbackProfitReport(context: any): GeneratedReport {
  return {
    title: "Profit Analysis Report",
    summary: "Preliminary profit analysis based on available data",
    sections: [
      {
        title: "Cost Estimation",
        content: "Detailed cost analysis is being generated. Please provide additional pricing information.",
      },
      {
        title: "Profit Projections",
        content: "Profit projections will be available once pricing data is confirmed.",
      },
    ],
    recommendations: [
      "Negotiate volume discounts for better margins",
      "Compare shipping costs across suppliers",
      "Consider payment terms impact on cash flow",
    ],
    metadata: {
      confidence: 0.4,
      assumptions: ["Standard industry margins", "Typical shipping costs"],
      fallback: true,
    },
  };
}

function generateFallbackNegotiationReport(context: any): GeneratedReport {
  return {
    title: "Negotiation Summary Report",
    summary: `Summary of negotiation session for ${context.webinar.title}`,
    sections: [
      {
        title: "Session Overview",
        content: `Negotiation session lasted ${context.webinar.duration || "N/A"} minutes with ${context.timeline.length} recorded events.`,
        data: { eventCount: context.timeline.length },
      },
      {
        title: "Key Events",
        content: context.timeline.slice(0, 5).map((e: any) => `- ${e.title}`).join("\n"),
      },
    ],
    recommendations: [
      "Follow up on outstanding action items",
      "Schedule next meeting to finalize details",
      "Document all agreements in writing",
    ],
    metadata: {
      completionRate: 0.6,
      issuesCount: 0,
      fallback: true,
    },
  };
}
