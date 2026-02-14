import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  saveRtmMessage,
  getPrivateMessages,
  getChannelMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  upsertConversation,
  getUserConversations,
  clearConversationUnread,
  toggleConversationPin,
  toggleConversationMute,
} from "../db";
import { createAuditLog } from "../db_extended"; // Fixed import path

export const rtmRouter = router({
  /**
   * 保存消息到数据库
   */
  saveMessage: protectedProcedure
    .input(
      z.object({
        senderId: z.number(),
        receiverId: z.number().optional(),
        channelName: z.string().optional(),
        messageType: z.enum(["private", "channel"]),
        contentType: z.enum(["text", "image", "file"]).default("text"),
        content: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => { // Added ctx here
      const messageId = await saveRtmMessage(input);
      
      // 如果是私聊消息，更新会话列表
      if (input.messageType === "private" && input.receiverId) {
        // 更新发送者的会话
        await upsertConversation({
          userId: input.senderId,
          targetUserId: input.receiverId,
          conversationType: "private",
          lastMessageId: messageId,
          lastMessageContent: input.content,
          lastMessageAt: new Date(),
          unreadCount: 0,
        });
        
        // 更新接收者的会话
        await upsertConversation({
          userId: input.receiverId,
          targetUserId: input.senderId,
          conversationType: "private",
          lastMessageId: messageId,
          lastMessageContent: input.content,
          lastMessageAt: new Date(),
          unreadCount: 1,
        });
      }
      
      // 如果是频道消息，更新频道会话
      if (input.messageType === "channel" && input.channelName) {
        await upsertConversation({
          userId: input.senderId,
          channelName: input.channelName,
          conversationType: "channel",
          lastMessageId: messageId,
          lastMessageContent: input.content,
          lastMessageAt: new Date(),
          unreadCount: 0,
        });
      }

      // 记录审计日志
      await createAuditLog({
        userId: ctx.user.id,
        action: "send_message",
        entityType: "message",
        entityId: messageId,
        metadata: { channelName: input.channelName },
      });
      
      return { messageId };
    }),

  /**
   * 获取私聊消息历史
   */
  getPrivateMessages: protectedProcedure
    .input(
      z.object({
        userId1: z.number(),
        userId2: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const messages = await getPrivateMessages(input.userId1, input.userId2, input.limit);
      return messages.reverse(); // 返回时间正序
    }),

  /**
   * 获取频道消息历史
   */
  getChannelMessages: protectedProcedure
    .input(
      z.object({
        channelName: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const messages = await getChannelMessages(input.channelName, input.limit);
      return messages.reverse(); // 返回时间正序
    }),

  /**
   * 标记消息为已读
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        senderId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await markMessagesAsRead(input.userId, input.senderId);
      await clearConversationUnread(input.userId, input.senderId);
      return { success: true };
    }),

  /**
   * 获取未读消息数量
   */
  getUnreadCount: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        senderId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const count = await getUnreadMessageCount(input.userId, input.senderId);
      return { count };
    }),

  /**
   * 获取会话列表
   */
  getConversations: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const conversations = await getUserConversations(input.userId);
      return conversations;
    }),

  /**
   * 置顶/取消置顶会话
   */
  togglePin: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await toggleConversationPin(input.conversationId);
      return { success: true };
    }),

  /**
   * 免打扰/取消免打扰
   */
  toggleMute: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await toggleConversationMute(input.conversationId);
      return { success: true };
    }),
});
