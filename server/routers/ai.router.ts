import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc.js";
import { OpenAI } from "openai";
import {
  extractPurchaseInfo,
  generateIntentContract,
  assistConversation,
  translateText,
} from '../services/ai-conversation.js';

// AI Configuration from environment or user provided defaults
const AI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || "sk-LIs2MGKmDuGZhcfHbvLs1EiWHPwm2ELf3E8JkJXlFXgFLPBM",
  baseURL: process.env.OPENAI_BASE_URL || "https://once.novai.su/v1",
  model: process.env.OPENAI_MODEL || "[逆次]o4-mini",
};

const openai = new OpenAI({
  apiKey: AI_CONFIG.apiKey,
  baseURL: AI_CONFIG.baseURL,
});

export const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        message: z.string(),
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ).optional(),
        context: z.object({
          webinarTitle: z.string().optional(),
          webinarId: z.number().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = `You are a professional AI Sourcing Assistant for the platform "RealSourcing". 
Your goal is to help buyers and factories during their negotiation sessions.
Context: ${input.context?.webinarTitle ? `The current session is "${input.context.webinarTitle}".` : "You are in a live sourcing negotiation."}
Be professional, concise, and provide actionable insights on pricing, quality, and supply chain logistics.`;

        const messages: any[] = [
          { role: "system", content: systemPrompt },
          ...(input.history || []),
          { role: "user", content: input.message },
        ];

        const response = await openai.chat.completions.create({
          model: AI_CONFIG.model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        });

        return {
          success: true,
          content: response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
        };
      } catch (error: any) {
        console.error("AI Chat Error:", error);
        return {
          success: false,
          error: error.message || "Failed to connect to AI service.",
          content: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
        };
      }
    }),

  /**
   * 从对话中提取采购信息
   */
  extractPurchaseInfo: protectedProcedure
    .input(
      z.object({
        conversationHistory: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const purchaseInfo = await extractPurchaseInfo(input.conversationHistory);
      return purchaseInfo;
    }),

  /**
   * 生成意向合同
   */
  generateContract: protectedProcedure
    .input(
      z.object({
        buyerName: z.string(),
        factoryName: z.string(),
        purchaseInfo: z.object({
          productName: z.string().optional(),
          quantity: z.number().optional(),
          targetPrice: z.number().optional(),
          currency: z.string().optional(),
          deliveryDate: z.string().optional(),
          paymentTerms: z.string().optional(),
          qualityRequirements: z.array(z.string()).optional(),
          additionalNotes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const contract = await generateIntentContract(
        input.buyerName,
        input.factoryName,
        input.purchaseInfo
      );
      return contract;
    }),

  /**
   * AI 辅助对话
   */
  assistConversation: protectedProcedure
    .input(
      z.object({
        conversationContext: z.string(),
        userQuestion: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await assistConversation(
        input.conversationContext,
        input.userQuestion
      );
      return { response };
    }),

  /**
   * AI 翻译
   */
  translate: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        sourceLang: z.enum(['zh', 'en']),
        targetLang: z.enum(['zh', 'en']),
      })
    )
    .mutation(async ({ input }) => {
      const translatedText = await translateText(
        input.text,
        input.sourceLang,
        input.targetLang
      );
      return { translatedText };
    }),

  /**
   * 获取个性化产品推荐
   */
  getRecommendations: protectedProcedure
    .input(z.object({
      webinarId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db.js");
      const { aiRecommendations } = await import("../../drizzle/schema.js");
      const { eq, and, desc } = await import("drizzle-orm");
      const db = getDb();
      
      const recommendations = await db.query.aiRecommendations.findMany({
        where: and(
          eq(aiRecommendations.userId, ctx.user.id),
          eq(aiRecommendations.webinarId, input.webinarId)
        ),
        orderBy: [desc(aiRecommendations.matchScore)],
        limit: input.limit,
      });

      return recommendations;
    }),

  /**
   * 生成Webinar报告
   */
  generateWebinarReport: protectedProcedure
    .input(z.object({
      webinarId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db.js");
      const { webinarReports, liveInteractions } = await import("../../drizzle/schema.js");
      const db = getDb();
      const { eq, sql } = await import("drizzle-orm");

      // 获取互动数据
      const interactions = await db.query.liveInteractions.findMany({
        where: eq(liveInteractions.webinarId, input.webinarId),
      });

      // 统计产品浏览
      const productViews = interactions.filter(
        i => i.interactionType === 'product_view'
      );
      
      const productStats = productViews.reduce((acc, view) => {
        if (view.productId) {
          acc[view.productId] = (acc[view.productId] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);

      const hotProducts = Object.entries(productStats)
        .map(([productId, count]) => ({
          productId: Number(productId),
          score: count,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // 统计高意向买家
      const userInteractionCounts = interactions.reduce((acc, interaction) => {
        acc[interaction.userId] = (acc[interaction.userId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const highIntentBuyers = Object.entries(userInteractionCounts)
        .map(([userId, count]) => ({
          userId: Number(userId),
          score: count,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      // 生成AI洞察
      const aiInsights = `本次会议产生了 ${interactions.length} 次互动。热门产品共 ${hotProducts.length} 个，高意向买家 ${highIntentBuyers.length} 名。`;

      // 保存报告
      const existing = await db.query.webinarReports.findFirst({
        where: eq(webinarReports.webinarId, input.webinarId),
      });

      if (existing) {
        await db.update(webinarReports)
          .set({
            totalFavorites: interactions.filter(i => i.interactionType === 'product_favorite').length,
            totalInquiries: interactions.filter(i => i.interactionType === 'inquiry').length,
            hotProducts,
            highIntentBuyers,
            aiInsights,
            generatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(webinarReports.webinarId, input.webinarId));
      } else {
        await db.insert(webinarReports).values({
          webinarId: input.webinarId,
          totalFavorites: interactions.filter(i => i.interactionType === 'product_favorite').length,
          totalInquiries: interactions.filter(i => i.interactionType === 'inquiry').length,
          hotProducts,
          highIntentBuyers,
          aiInsights,
          generatedAt: new Date(),
        });
      }

      return { success: true, insights: aiInsights };
    }),

  /**
   * 获取Webinar报告
   */
  getWebinarReport: publicProcedure
    .input(z.object({
      webinarId: z.number(),
    }))
    .query(async ({ input }) => {
      const { getDb } = await import("../db.js");
      const { webinarReports } = await import("../../drizzle/schema.js");
      const db = getDb();
      const { eq } = await import("drizzle-orm");
      
      const report = await db.query.webinarReports.findFirst({
        where: eq(webinarReports.webinarId, input.webinarId),
      });

      return report;
    }),
});
