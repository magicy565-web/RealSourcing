/**
 * 订单管理 tRPC 路由
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getRFQs,
  getRFQById,
  createRFQ,
  updateRFQ,
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  acceptQuotation,
  rejectQuotation,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  getOrderItems,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
} from "../db_extended";
import { checkAndTrackUsage } from "../saas-core";

export const orderRouter = router({
  // ============================================================================
  // 询价单 (RFQ)
  // ============================================================================
  
  /**
   * 获取询价单列表
   */
  listRFQs: protectedProcedure
    .input(z.object({
      buyerId: z.number().optional(),
      status: z.enum(["draft", "published", "closed", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      return await getRFQs(input.buyerId, input.status);
    }),
  
  /**
   * 获取询价单详情
   */
  getRFQById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return await getRFQById(input.id);
    }),
  
  /**
   * 创建询价单
   */
  createRFQ: protectedProcedure
    .input(z.object({
      webinarId: z.number().optional(),
      title: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
      specifications: z.record(z.unknown()).optional(),
      targetPrice: z.number().optional(),
      currency: z.string().default("USD"),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      targetDeliveryDate: z.string().optional(),
      deliveryTerms: z.string().optional(),
      paymentTerms: z.string().optional(),
      attachments: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 检查配额
      await checkAndTrackUsage(ctx.user.id, "inquiry", 1, {
        title: input.title,
      });
      
      const rfqId = await createRFQ({
        ...input,
        buyerId: ctx.user.id,
        targetPrice: input.targetPrice?.toString(),
        targetDeliveryDate: input.targetDeliveryDate ? new Date(input.targetDeliveryDate) : undefined,
      });
      
      return { id: rfqId };
    }),
  
  /**
   * 更新询价单
   */
  updateRFQ: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "published", "closed", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateRFQ(id, data);
      return { success: true };
    }),
  
  // ============================================================================
  // 报价单 (Quotation)
  // ============================================================================
  
  /**
   * 获取报价单列表
   */
  listQuotations: protectedProcedure
    .input(z.object({
      rfqId: z.number().optional(),
      factoryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await getQuotations(input.rfqId, input.factoryId);
    }),
  
  /**
   * 获取报价单详情
   */
  getQuotationById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return await getQuotationById(input.id);
    }),
  
  /**
   * 创建报价单
   */
  createQuotation: protectedProcedure
    .input(z.object({
      rfqId: z.number(),
      factoryId: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
      currency: z.string().default("USD"),
      quantity: z.number(),
      unit: z.string().optional(),
      leadTime: z.string().optional(),
      deliveryTerms: z.string().optional(),
      paymentTerms: z.string().optional(),
      validUntil: z.string().optional(),
      notes: z.string().optional(),
      attachments: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const quotationId = await createQuotation({
        ...input,
        userId: ctx.user.id,
        quotationNumber: `QT${Date.now()}`,
        unitPrice: input.unitPrice.toString(),
        totalPrice: input.totalPrice.toString(),
        validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
      });
      
      return { id: quotationId };
    }),
  
  /**
   * 接受报价
   */
  acceptQuotation: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await acceptQuotation(input.id);
      return { success: true };
    }),
  
  /**
   * 拒绝报价
   */
  rejectQuotation: protectedProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      await rejectQuotation(input.id, input.reason);
      return { success: true };
    }),
  
  // ============================================================================
  // 订单 (Order)
  // ============================================================================
  
  /**
   * 获取订单列表
   */
  listOrders: protectedProcedure
    .input(z.object({
      buyerId: z.number().optional(),
      factoryId: z.number().optional(),
      status: z.enum(["draft", "pending", "confirmed", "production", "shipped", "delivered", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      return await getOrders(input.buyerId, input.factoryId, input.status);
    }),
  
  /**
   * 获取订单详情
   */
  getOrderById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return await getOrderById(input.id);
    }),
  
  /**
   * 创建订单
   */
  createOrder: protectedProcedure
    .input(z.object({
      factoryId: z.number(),
      webinarId: z.number().optional(),
      rfqId: z.number().optional(),
      quotationId: z.number().optional(),
      type: z.enum(["intent", "formal"]).default("intent"),
      totalAmount: z.number(),
      currency: z.string().default("USD"),
      paymentTerms: z.string().optional(),
      deliveryTerms: z.string().optional(),
      deliveryAddress: z.string().optional(),
      targetDeliveryDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orderId = await createOrder({
        ...input,
        buyerId: ctx.user.id,
        orderNumber: `ORD${Date.now()}`,
        totalAmount: input.totalAmount.toString(),
        targetDeliveryDate: input.targetDeliveryDate ? new Date(input.targetDeliveryDate) : undefined,
      });
      
      return { id: orderId };
    }),
  
  /**
   * 更新订单
   */
  updateOrder: protectedProcedure
    .input(z.object({
      id: z.number(),
      deliveryAddress: z.string().optional(),
      notes: z.string().optional(),
      contractUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateOrder(id, data);
      return { success: true };
    }),
  
  /**
   * 更新订单状态
   */
  updateOrderStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "pending", "confirmed", "production", "shipped", "delivered", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      await updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
  
  // ============================================================================
  // 订单项 (Order Item)
  // ============================================================================
  
  /**
   * 获取订单项列表
   */
  getOrderItems: protectedProcedure
    .input(z.object({
      orderId: z.number(),
    }))
    .query(async ({ input }) => {
      return await getOrderItems(input.orderId);
    }),
  
  /**
   * 添加订单项
   */
  addOrderItem: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      productId: z.number().optional(),
      productName: z.string(),
      sku: z.string().optional(),
      specifications: z.record(z.unknown()).optional(),
      quantity: z.number(),
      unit: z.string().optional(),
      unitPrice: z.number(),
      totalPrice: z.number(),
      currency: z.string().default("USD"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const itemId = await createOrderItem({
        ...input,
        unitPrice: input.unitPrice.toString(),
        totalPrice: input.totalPrice.toString(),
      });
      
      return { id: itemId };
    }),
  
  /**
   * 更新订单项
   */
  updateOrderItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      quantity: z.number().optional(),
      unitPrice: z.number().optional(),
      totalPrice: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateOrderItem(id, {
        ...data,
        unitPrice: data.unitPrice?.toString(),
        totalPrice: data.totalPrice?.toString(),
      });
      return { success: true };
    }),
  
  /**
   * 删除订单项
   */
  deleteOrderItem: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await deleteOrderItem(input.id);
      return { success: true };
    }),
});
