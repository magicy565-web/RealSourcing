import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import * as schema from "../../drizzle/schema.js";
import { eq, desc, and, sql, like } from "drizzle-orm";
import {
  calculateViralPotential,
  calculateBatchViralPotential,
  recommendProducts,
  generateNegotiationAssistance,
  generateDecisionMatrix,
  Product,
  BuyerProfile,
} from "../services/ai/index.js";

/**
 * Product Router with AI Services Integration
 * 
 * 提供产品相关的API,集成AI功能:
 * - 产品列表 (带爆款评分)
 * - 产品详情 (带爆款评分)
 * - 爆款评分
 * - 个性化推荐
 * - 谈判助手
 * - 决策矩阵
 */

export const productRouter = router({
  /**
   * 根据工厂ID获取产品列表
   */
  listByFactory: publicProcedure
    .input(z.object({
      factoryId: z.number(),
      includeViralScore: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // 从数据库查询该工厂的产品
      const dbProducts = await db
        .select()
        .from(schema.factoryProducts)
        .where(
          and(
            eq(schema.factoryProducts.factoryId, input.factoryId),
            eq(schema.factoryProducts.status, 'published')
          )
        );
      
      // 转换为 AI 服务需要的格式
      const products: Product[] = dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Unknown',
        price: parseFloat(p.priceRange?.split('-')[0]?.replace(/[^0-9.]/g, '') || '0'),
        moq: p.minOrderQuantity || 0,
        factoryRating: 4.5, // TODO: 从工厂表获取
        leadTime: parseInt(p.leadTime?.split('-')[0] || '0'),
        viewCount: p.viewCount || 0,
        inquiryCount: p.inquiryCount || 0,
        orderCount: 0,
        reviewCount: 0,
      }));
      
      // 如果需要AI评分,计算评分
      if (input.includeViralScore && products.length > 0) {
        const scores = calculateBatchViralPotential(products);
        return dbProducts.map((product: any, index: number) => ({
          ...product,
          viralScore: scores.get(products[index].id),
        }));
      }
      
      return dbProducts;
    }),

  /**
   * 获取产品列表 (带AI评分)
   */
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
      includeViralScore: z.boolean().default(true),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // 从数据库查询产品
      let query = db.select().from(schema.factoryProducts);
      
      // 添加过滤条件
      const conditions = [];
      if (input?.category) {
        conditions.push(eq(schema.factoryProducts.category, input.category));
      }
      if (input?.search) {
        conditions.push(
          like(schema.factoryProducts.name, `%${input.search}%`)
        );
      }
      // 只显示已发布的产品
      conditions.push(eq(schema.factoryProducts.status, 'published'));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const dbProducts = await query
        .limit(input?.limit || 20)
        .offset(input?.offset || 0);
      
      // 转换为 AI 服务需要的格式
      const products: Product[] = dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Unknown',
        price: parseFloat(p.priceRange?.split('-')[0]?.replace(/[^0-9.]/g, '') || '0'),
        moq: p.minOrderQuantity || 0,
        factoryRating: 4.5, // TODO: 从工厂表获取
        leadTime: parseInt(p.leadTime?.split('-')[0] || '0'),
        viewCount: p.viewCount || 0,
        inquiryCount: p.inquiryCount || 0,
        orderCount: 0, // TODO: 从订单表统计
        reviewCount: 0, // TODO: 从评论表统计
      }));
      
      // 如果需要AI评分,计算评分
      if (input?.includeViralScore !== false && products.length > 0) {
        const scores = calculateBatchViralPotential(products);
        return dbProducts.map((product: any, index: number) => ({
          ...product,
          viralScore: scores.get(products[index].id),
        }));
      }
      
      return dbProducts;
    }),
  
  /**
   * 获取产品详情 (带AI评分)
   */
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
      includeViralScore: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // 临时返回模拟数据
      const mockProduct: Product = {
        id: input.id,
        name: 'USB-C Cable',
        category: 'Electronics',
        price: 2.99,
        moq: 100,
        factoryRating: 4.5,
        leadTime: 7,
        viewCount: 1500,
        inquiryCount: 25,
        orderCount: 12,
        reviewCount: 50,
      };
      
      if (input.includeViralScore) {
        const viralScore = calculateViralPotential(mockProduct);
        return {
          ...mockProduct,
          viralScore,
        };
      }
      
      return mockProduct;
    }),
  
  /**
   * 计算产品爆款评分
   */
  getViralScore: publicProcedure
    .input(z.object({
      productId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // TODO: 从数据库获取产品数据
      const mockProduct: Product = {
        id: input.productId,
        name: 'USB-C Cable',
        category: 'Electronics',
        price: 2.99,
        moq: 100,
        factoryRating: 4.5,
        leadTime: 7,
        viewCount: 1500,
        inquiryCount: 25,
        orderCount: 12,
        reviewCount: 50,
      };
      
      const viralScore = calculateViralPotential(mockProduct);
      
      // TODO: 将评分保存到数据库 ai_analysis_results 表
      
      return viralScore;
    }),
  
  /**
   * 获取个性化产品推荐
   */
  getRecommendations: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      category: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // 构建买家画像
      const buyerProfile: BuyerProfile = {
        id: ctx.user.id,
        shopCategory: input?.category,
        // TODO: 从用户历史数据中提取更多信息
      };
      
      // 获取候选产品
      // TODO: 从数据库获取产品
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'USB-C Cable',
          category: 'Electronics',
          price: 2.99,
          moq: 100,
          factoryRating: 4.5,
          leadTime: 7,
        },
        {
          id: 2,
          name: 'Wireless Charger',
          category: 'Electronics',
          price: 15.99,
          moq: 50,
          factoryRating: 4.8,
          leadTime: 5,
        },
      ];
      
      // 生成推荐
      const recommendations = recommendProducts(
        buyerProfile,
        mockProducts,
        input?.limit || 10
      );
      
      // TODO: 将推荐记录保存到 ai_recommendations 表
      
      return recommendations;
    }),
  
  /**
   * 获取谈判建议
   */
  getNegotiationAssistance: protectedProcedure
    .input(z.object({
      productId: z.number(),
      targetPrice: z.number().optional(),
      targetMoq: z.number().optional(),
      urgency: z.enum(['high', 'medium', 'low']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // TODO: 从数据库获取产品数据
      const mockProduct: Product = {
        id: input.productId,
        name: 'USB-C Cable',
        category: 'Electronics',
        price: 2.99,
        moq: 100,
        factoryRating: 4.5,
        leadTime: 7,
      };
      
      const assistance = generateNegotiationAssistance(mockProduct, {
        targetPrice: input.targetPrice,
        targetMoq: input.targetMoq,
        urgency: input.urgency,
      });
      
      return assistance;
    }),
  
  /**
   * 生成决策矩阵 (对比多个产品)
   */
  generateDecisionMatrix: protectedProcedure
    .input(z.object({
      productIds: z.array(z.number()).min(1).max(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // TODO: 从数据库批量获取产品数据
      const mockProducts: Product[] = input.productIds.map(id => ({
        id,
        name: `Product ${id}`,
        category: 'Electronics',
        price: 5 + Math.random() * 50,
        moq: 50 + Math.floor(Math.random() * 500),
        factoryRating: 3.5 + Math.random() * 1.5,
        leadTime: 7 + Math.floor(Math.random() * 30),
      }));
      
      const matrix = generateDecisionMatrix(mockProducts);
      
      return matrix;
    }),
  
  /**
   * 批量计算产品爆款评分
   */
  batchCalculateViralScore: publicProcedure
    .input(z.object({
      productIds: z.array(z.number()),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // TODO: 从数据库批量获取产品数据
      const mockProducts: Product[] = input.productIds.map(id => ({
        id,
        name: `Product ${id}`,
        category: 'Electronics',
        price: 5 + Math.random() * 50,
        moq: 100,
        factoryRating: 4.0,
        leadTime: 14,
      }));
      
      const scores = calculateBatchViralPotential(mockProducts);
      
      // 转换为数组格式返回
      return Array.from(scores.entries()).map(([productId, score]: [number, any]) => ({
        productId,
        score,
      }));
    }),
});
