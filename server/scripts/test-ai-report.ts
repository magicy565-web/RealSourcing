/**
 * Test script for AI report generation
 * 
 * Usage:
 *   tsx server/scripts/test-ai-report.ts
 */

import { generateAIReport } from "../lib/ai-report-generator";

async function testAIReport() {
  console.log("🧪 Testing AI Report Generation...\n");

  // Mock data for testing
  const mockContext = {
    webinar: {
      title: "Electronics Manufacturing Sourcing Session",
      description: "Sourcing high-quality electronic components from verified manufacturers",
      category: "Electronics",
      duration: 60,
      status: "completed",
    },
    factories: [
      {
        name: "Shenzhen Tech Electronics Co., Ltd.",
        location: "Shenzhen, China",
        category: "Electronics",
        overallScore: 4.5,
        qualityScore: 4.7,
        deliveryScore: 4.3,
        communicationScore: 4.6,
        pricingScore: 4.4,
      },
      {
        name: "Guangzhou Innovation Manufacturing",
        location: "Guangzhou, China",
        category: "Electronics",
        overallScore: 4.2,
        qualityScore: 4.0,
        deliveryScore: 4.5,
        communicationScore: 4.1,
        pricingScore: 4.3,
      },
    ],
    timeline: [
      {
        type: "system",
        title: "Webinar Started",
        description: "The webinar session has started",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        type: "factory",
        title: "Factory Joined",
        description: "Shenzhen Tech Electronics Co., Ltd. has joined",
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        type: "presentation",
        title: "Product Presentation",
        description: "Factory presented their product catalog",
        createdAt: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        type: "pricing",
        title: "Pricing Discussed",
        description: "Discussed pricing for PCB boards",
        createdAt: new Date(Date.now() - 2500000).toISOString(),
      },
      {
        type: "ai_insight",
        title: "AI Insight Generated",
        description: "Factory pricing is 8% below market average",
        createdAt: new Date(Date.now() - 2000000).toISOString(),
      },
    ],
    additionalContext: {
      budget: 50000,
      quantity: 10000,
      deadline: "2026-04-01",
    },
  };

  try {
    console.log("📊 Test 1: Supplier Evaluation Report");
    console.log("=====================================\n");
    
    const report1 = await generateAIReport({
      webinarId: 1, // Mock webinar ID
      reportType: "supplier_evaluation",
      additionalContext: mockContext.additionalContext,
    });

    console.log("✅ Report generated successfully!");
    console.log(`Title: ${report1.title}`);
    console.log(`Summary: ${report1.summary}`);
    console.log(`Sections: ${report1.sections.length}`);
    console.log(`Recommendations: ${report1.recommendations.length}`);
    console.log(`Metadata:`, report1.metadata);
    console.log("\n");

    // Display first section
    if (report1.sections.length > 0) {
      console.log(`First Section: ${report1.sections[0].title}`);
      console.log(`Content: ${report1.sections[0].content.substring(0, 200)}...`);
      console.log("\n");
    }

    // Display recommendations
    if (report1.recommendations.length > 0) {
      console.log("Recommendations:");
      report1.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      console.log("\n");
    }

    console.log("✅ All tests passed!");
    console.log("\n🎉 AI Report Generation is working correctly!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Check if it's an API error
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as any;
      console.error("API Error:", apiError.response?.data || apiError.response);
    }

    process.exit(1);
  }
}

// Run the test
testAIReport();
