import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions, setAuthCookie } from "./_core/cookies.js";
import { hashPassword, verifyPassword } from "./_core/password.js";
import { signToken } from "./_core/auth.js";
import { getUserByOpenId, upsertUser } from "./db.js";
import { eq } from "drizzle-orm";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import { z } from "zod";

import { checkQuota, recordResourceUsage } from "./middleware/quota.js";
import { triggerWebinarStatusEvent } from "./middleware/auto-events.js";
import { generateAIReport, type ReportType } from "./lib/ai-report-generator.js";
import { subscriptionRouter } from "./routers/subscription.router.js";
import { paymentRouter } from "./routers/payment.router.js";
import { usageRouter } from "./routers/usage.router.js";
import { aiRouter } from "./routers/ai.router.js";
import { rtmRouter } from "./routers/rtm.router.js";
import { factoryRouter } from "./routers/factory.router.js";
import { orderRouter } from "./routers/order.router.js";
import { subscriptionEnhancedRouter } from "./routers/subscription_enhanced.router.js";
import { agoraRouter } from "./routers/agora.router.js";
import { webinarRouter } from "./routers/webinar.router.js";
import {
  createWebinar, getWebinars, getWebinarById, updateWebinar, deleteWebinar,
  createFactory, getFactories, getFactoryById, updateFactory,
  addFactoryToWebinar, getWebinarFactories,
  createReport, getReports, getReportById,
  addNegotiationEvent, getWebinarTimeline,
  getFactoryOrders,
  getDashboardStats,
} from "./db.js";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(['buyer', 'factory', 'user']).default('user'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { email, password, name, role } = input;
        
        // Check if user already exists
        const existingUser = await getUserByOpenId(email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
        
        // Hash password
        const passwordHash = hashPassword(password);
        
        // Create user
        const user = await upsertUser({
          openId: email,
          email,
          name,
          role,
          passwordHash,
          status: 'active',
          emailVerified: 0,
        });
        
        // Generate token and set cookie
        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(ctx.res as any, token);
        
        return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const { email, password } = input;
        
        // Find user by email (using openId as email for simplicity)
        const user = await getUserByOpenId(email);
        
        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password');
        }
        
        // Verify password
        if (!verifyPassword(password, user.passwordHash)) {
          throw new Error('Invalid email or password');
        }
        
        // Generate token and set cookie
        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(ctx.res as any, token);
        
        return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req as any);
      (ctx.res as any).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Agora Services (RTC, RTM, Whiteboard, Recording, Transcription)
  agora: agoraRouter,

  // Dashboard
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return getDashboardStats(ctx.user.id);
    }),
  }),

  // Webinars (Enhanced with permissions)
  webinarEnhanced: webinarRouter,

  // Webinars (Legacy)
  webinar: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getWebinars(input?.status);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getWebinarById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        language: z.string().optional(),
        scheduledAt: z.string().optional(),
        duration: z.number().optional(),
        workSpec: z.string().optional(),
        factoryIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check quota for factory users
        if (ctx.user.role === "factory") {
          const quotaCheck = await checkQuota(ctx.user.id, ctx.user.role, "webinar_created");
          if (!quotaCheck.canProceed) {
            throw new Error(quotaCheck.reason || "Webinar creation quota exceeded");
          }
        }

        const { factoryIds, scheduledAt, ...rest } = input;
        const id = await createWebinar({
          ...rest,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          createdById: ctx.user.id,
        });

        if (factoryIds && factoryIds.length > 0) {
          for (const factoryId of factoryIds) {
            await addFactoryToWebinar(id, factoryId);
          }
        }

        // Record usage for factory users
        if (ctx.user.role === "factory") {
          await recordResourceUsage(ctx.user.id, "webinar_created", 1, {
            webinarId: id,
            title: input.title,
          });
        }

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "scheduled", "live", "completed", "archived"]).optional(),
        category: z.string().optional(),
        language: z.string().optional(),
        duration: z.number().optional(),
        workSpec: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Get old status if status is being updated
        if (data.status) {
          const oldWebinar = await getWebinarById(id);
          if (oldWebinar && oldWebinar.status !== data.status) {
            // Trigger status change event
            await triggerWebinarStatusEvent(id, oldWebinar.status, data.status as any);
          }
        }
        
        await updateWebinar(id, data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteWebinar(input.id);
        return { success: true };
      }),

    factories: protectedProcedure
      .input(z.object({ webinarId: z.number() }))
      .query(async ({ input }) => {
        return getWebinarFactories(input.webinarId);
      }),

    addFactory: protectedProcedure
      .input(z.object({
        webinarId: z.number(),
        factoryId: z.number(),
        role: z.enum(["presenter", "participant"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await addFactoryToWebinar(input.webinarId, input.factoryId, input.role);
        return { success: true };
      }),

    timeline: protectedProcedure
      .input(z.object({ webinarId: z.number() }))
      .query(async ({ input }) => {
        return getWebinarTimeline(input.webinarId);
      }),

    addEvent: protectedProcedure
      .input(z.object({
        webinarId: z.number(),
        type: z.enum(["system", "factory", "presentation", "pricing", "ai_insight", "negotiation", "ai_alert", "agreement"]),
        title: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await addNegotiationEvent(input);
        return { id };
      }),
  }),

  // Factories
  factory: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getFactories(input?.search);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getFactoryById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        location: z.string().optional(),
        category: z.string().optional(),
        employees: z.string().optional(),
        annualRevenue: z.string().optional(),
        established: z.string().optional(),
        website: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        specialties: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createFactory({
          ...input,
          userId: ctx.user.id,
        } as any);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        location: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["pending", "verified", "suspended"]).optional(),
        overallScore: z.number().optional(),
        qualityScore: z.number().optional(),
        deliveryScore: z.number().optional(),
        communicationScore: z.number().optional(),
        pricingScore: z.number().optional(),
        complianceScore: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        
        // Convert number scores to string if necessary for database
        if (data.overallScore !== undefined) updateData.overallScore = data.overallScore.toString();
        if (data.qualityScore !== undefined) updateData.qualityScore = data.qualityScore.toString();
        if (data.deliveryScore !== undefined) updateData.deliveryScore = data.deliveryScore.toString();
        if (data.communicationScore !== undefined) updateData.communicationScore = data.communicationScore.toString();
        if (data.pricingScore !== undefined) updateData.pricingScore = data.pricingScore.toString();
        if (data.complianceScore !== undefined) updateData.complianceScore = data.complianceScore.toString();

        await updateFactory(id, updateData);
        return { success: true };
      }),

    orders: protectedProcedure
      .input(z.object({ factoryId: z.number() }))
      .query(async ({ input }) => {
        return getFactoryOrders(input.factoryId);
      }),
  }),

  // Subscriptions
  subscription: subscriptionRouter,

  // Payments
  payment: paymentRouter,

  // Usage tracking
  usage: usageRouter,

  // AI Chat
  ai: aiRouter,

  // RTM Messages
  rtm: rtmRouter,

  // Factory Management (Enhanced)
  factoryEnhanced: factoryRouter,

  // Order Management
  order: orderRouter,

  // Subscription Management (Enhanced)
  subscriptionEnhanced: subscriptionEnhancedRouter,

  // Reports
  report: router({
    list: protectedProcedure.query(async () => {
      return getReports();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getReportById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        type: z.enum(["supplier_evaluation", "profit_analysis", "negotiation_summary"]),
        webinarId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createReport({
          ...input,
          createdById: ctx.user.id,
        });
        return { id };
      }),

    generate: protectedProcedure
      .input(z.object({
        webinarId: z.number(),
        reportType: z.enum(["supplier_evaluation", "profit_analysis", "negotiation_summary"]),
        additionalContext: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate AI report
        const aiReport = await generateAIReport({
          webinarId: input.webinarId,
          reportType: input.reportType as ReportType,
          additionalContext: input.additionalContext,
        });

        // Save report to database
        const reportId = await createReport({
          title: aiReport.title,
          type: input.reportType,
          webinarId: input.webinarId,
          createdById: ctx.user.id,
          aiAnalysis: JSON.stringify(aiReport),
        });

        return {
          id: reportId,
          report: aiReport,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
