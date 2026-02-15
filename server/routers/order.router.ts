import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  getFactoryOrders,
  createQuotation,
  getQuotations,
  getQuotationById,
  createOrderItem
} from "../db_extended.js";

export const orderRouter = router({
  // 获取订单列表
  list: protectedProcedure
    .input(z.object({
      role: z.enum(["buyer", "factory"]),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (input.role === "buyer") {
        return getOrders(ctx.user.id, undefined, input.status);
      } else {
        // 假设用户只有一个工厂，实际应根据业务逻辑获取
        return getOrders(undefined, ctx.user.id, input.status);
      }
    }),

  // 获取订单详情
  detail: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return getOrderById(input.id);
    }),

  // 创建报价单
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

  // 获取报价列表
  listQuotations: protectedProcedure
    .input(z.object({
      rfqId: z.number().optional(),
      factoryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return getQuotations(input.rfqId, input.factoryId);
    }),

  // 创建订单
  create: protectedProcedure
    .input(z.object({
      factoryId: z.number(),
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

  // 更新订单状态
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      await updateOrderStatus(input.id, input.status);
      return { success: true };
    }),

  // 添加订单项
  addItem: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      productId: z.number().optional(),
      productName: z.string(),
      sku: z.string().optional(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
      currency: z.string().default("USD"),
    }))
    .mutation(async ({ input }) => {
      const itemId = await createOrderItem({
        ...input,
        unitPrice: input.unitPrice.toString(),
        totalPrice: input.totalPrice.toString(),
      });
      return { id: itemId };
    }),
});
