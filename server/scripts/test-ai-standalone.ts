/**
 * Standalone test for AI report generation (without database)
 * 
 * Usage:
 *   pnpm exec tsx server/scripts/test-ai-standalone.ts
 */

import OpenAI from "openai";

// Initialize OpenAI client with third-party API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM",
  baseURL: process.env.OPENAI_BASE_URL || "https://once.novai.su/v1",
});

const AI_MODEL = process.env.OPENAI_MODEL || "[逆次]o4-mini";

async function testAI() {
  console.log("🧪 Testing Third-party AI Service...\n");
  console.log(`API Base URL: ${process.env.OPENAI_BASE_URL || "https://once.novai.su/v1"}`);
  console.log(`Model: ${AI_MODEL}\n`);

  const mockContext = {
    webinar: {
      title: "Electronics Manufacturing Sourcing Session",
      description: "Sourcing high-quality electronic components",
      category: "Electronics",
    },
    factories: [
      {
        name: "Shenzhen Tech Electronics Co., Ltd.",
        location: "Shenzhen, China",
        overallScore: 4.5,
        qualityScore: 4.7,
        deliveryScore: 4.3,
      },
      {
        name: "Guangzhou Innovation Manufacturing",
        location: "Guangzhou, China",
        overallScore: 4.2,
        qualityScore: 4.0,
        deliveryScore: 4.5,
      },
    ],
  };

  const prompt = `
You are an expert sourcing analyst. Generate a supplier evaluation report based on the following data:

Webinar: ${mockContext.webinar.title}
Description: ${mockContext.webinar.description}

Factories:
${mockContext.factories.map((f, i) => `
${i + 1}. ${f.name}
   - Location: ${f.location}
   - Overall Score: ${f.overallScore}
   - Quality Score: ${f.qualityScore}
   - Delivery Score: ${f.deliveryScore}
`).join("\n")}

Generate a brief supplier evaluation report with:
1. Executive Summary (2-3 sentences)
2. Factory Comparison
3. Recommendation

Format the response as JSON with this structure:
{
  "title": "Supplier Evaluation Report",
  "summary": "Executive summary here",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "metadata": { "confidence": 0.85 }
}
`;

  try {
    console.log("📤 Sending request to AI...\n");

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
      max_tokens: 1500,
    });

    console.log("✅ Response received!\n");

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content");
    }

    console.log("📄 Raw Response:");
    console.log(content);
    console.log("\n");

    const report = JSON.parse(content);

    console.log("📊 Parsed Report:");
    console.log("=================");
    console.log(`Title: ${report.title}`);
    console.log(`Summary: ${report.summary}`);
    console.log(`Sections: ${report.sections?.length || 0}`);
    console.log(`Recommendations: ${report.recommendations?.length || 0}`);
    console.log("\n");

    if (report.sections && report.sections.length > 0) {
      console.log("First Section:");
      console.log(`  Title: ${report.sections[0].title}`);
      console.log(`  Content: ${report.sections[0].content.substring(0, 150)}...`);
      console.log("\n");
    }

    if (report.recommendations && report.recommendations.length > 0) {
      console.log("Recommendations:");
      report.recommendations.forEach((rec: string, i: number) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      console.log("\n");
    }

    console.log("✅ AI Test Passed!");
    console.log("🎉 Third-party AI service is working correctly!");

  } catch (error) {
    console.error("❌ Test failed:", error);

    if (error instanceof Error) {
      console.error("\nError Details:");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }

    // Check if it's an API error
    if (error && typeof error === "object") {
      const apiError = error as any;
      if (apiError.response) {
        console.error("\nAPI Response:");
        console.error("Status:", apiError.response.status);
        console.error("Data:", JSON.stringify(apiError.response.data, null, 2));
      }
      if (apiError.error) {
        console.error("\nAPI Error:", JSON.stringify(apiError.error, null, 2));
      }
    }

    process.exit(1);
  }
}

// Run the test
testAI();
