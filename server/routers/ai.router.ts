import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { OpenAI } from "openai";

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
});
