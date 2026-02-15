import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { generateRtcToken, generateRtmToken, generateDualTokens } from "../lib/agora-token";
import {
  generateWhiteboardSDKToken,
  generateWhiteboardRoomToken,
  generateWhiteboardTaskToken,
  createWhiteboardRoom,
  getWhiteboardRooms,
  getWhiteboardRoomInfo,
  startDocumentConversion,
  queryDocumentConversion,
} from "../services/agora-whiteboard";
import {
  startCloudRecording,
  queryCloudRecording,
  stopCloudRecording,
} from "../services/agora-recording";
import {
  startSpeechToText,
  querySpeechToText,
  updateSpeechToText,
  stopSpeechToText,
} from "../services/agora-speech-to-text";

const WHITEBOARD_AK = process.env.WHITEBOARD_AK || "";
const WHITEBOARD_SK = process.env.WHITEBOARD_SK || "";

export const agoraRouter = router({
  /**
   * RTC Token生成
   */
  getRtcToken: publicProcedure
    .input(
      z.object({
        channelName: z.string(),
        uid: z.union([z.number(), z.string()]),
      })
    )
    .query(async ({ input }) => {
      const token = generateRtcToken(input.channelName, input.uid);
      if (!token) {
        throw new Error("Failed to generate RTC token");
      }
      return { token };
    }),

  /**
   * RTM Token生成
   */
  getRtmToken: publicProcedure
    .input(
      z.object({
        userId: z.union([z.number(), z.string()]),
      })
    )
    .query(async ({ input }) => {
      const token = generateRtmToken(input.userId);
      if (!token) {
        throw new Error("Failed to generate RTM token");
      }
      return { token };
    }),

  /**
   * 同时生成RTC和RTM Token
   */
  getDualTokens: publicProcedure
    .input(
      z.object({
        channelName: z.string(),
        uid: z.union([z.number(), z.string()]),
      })
    )
    .query(async ({ input }) => {
      const tokens = generateDualTokens(input.channelName, input.uid);
      if (!tokens.rtcToken || !tokens.rtmToken) {
        throw new Error("Failed to generate tokens");
      }
      return tokens;
    }),

  /**
   * 互动白板 - 生成SDK Token
   */
  whiteboard: router({
    generateSDKToken: protectedProcedure.query(async () => {
      if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
        throw new Error("Whiteboard credentials not configured");
      }
      const token = generateWhiteboardSDKToken(WHITEBOARD_AK, WHITEBOARD_SK);
      return { token };
    }),

    /**
     * 创建白板房间
     */
    createRoom: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          limit: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
          throw new Error("Whiteboard credentials not configured");
        }
        const sdkToken = generateWhiteboardSDKToken(WHITEBOARD_AK, WHITEBOARD_SK);
        const room = await createWhiteboardRoom(sdkToken, WHITEBOARD_AK, input);
        return room;
      }),

    /**
     * 获取房间列表
     */
    listRooms: protectedProcedure.query(async () => {
      if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
        throw new Error("Whiteboard credentials not configured");
      }
      const sdkToken = generateWhiteboardSDKToken(WHITEBOARD_AK, WHITEBOARD_SK);
      const rooms = await getWhiteboardRooms(sdkToken, WHITEBOARD_AK);
      return { rooms };
    }),

    /**
     * 获取房间详情
     */
    getRoomInfo: protectedProcedure
      .input(z.object({ roomUuid: z.string() }))
      .query(async ({ input }) => {
        if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
          throw new Error("Whiteboard credentials not configured");
        }
        const sdkToken = generateWhiteboardSDKToken(WHITEBOARD_AK, WHITEBOARD_SK);
        const info = await getWhiteboardRoomInfo(sdkToken, input.roomUuid);
        return info;
      }),

    /**
     * 生成Room Token
     */
    generateRoomToken: protectedProcedure
      .input(
        z.object({
          roomUuid: z.string(),
          role: z.enum(["admin", "writer", "reader"]).default("writer"),
          expirationMs: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
          throw new Error("Whiteboard credentials not configured");
        }
        const roleMap = { admin: 0, writer: 1, reader: 2 };
        const token = generateWhiteboardRoomToken(
          WHITEBOARD_AK,
          WHITEBOARD_SK,
          input.roomUuid,
          roleMap[input.role] as 0 | 1 | 2,
          input.expirationMs
        );
        return { token };
      }),

    /**
     * 发起文档转换
     */
    startDocumentConversion: protectedProcedure
      .input(
        z.object({
          fileUrl: z.string().url(),
          type: z.enum(["pptx", "pdf", "doc"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
          throw new Error("Whiteboard credentials not configured");
        }
        const sdkToken = generateWhiteboardSDKToken(WHITEBOARD_AK, WHITEBOARD_SK);
        const result = await startDocumentConversion(sdkToken, input.fileUrl, {
          type: input.type,
        });
        return result;
      }),

    /**
     * 查询文档转换进度
     */
    queryDocumentConversion: protectedProcedure
      .input(z.object({ taskUuid: z.string() }))
      .query(async ({ input }) => {
        if (!WHITEBOARD_AK || !WHITEBOARD_SK) {
          throw new Error("Whiteboard credentials not configured");
        }
        const sdkToken = generateWhiteboardSDKToken(WHITEBOARD_AK, WHITEBOARD_SK);
        const result = await queryDocumentConversion(sdkToken, input.taskUuid);
        return result;
      }),
  }),

  /**
   * 云端录制
   */
  recording: router({
    /**
     * 启动云端录制
     */
    start: protectedProcedure
      .input(
        z.object({
          channelName: z.string(),
          uid: z.string(),
          token: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await startCloudRecording(
          input.channelName,
          input.uid,
          input.token
        );
        return result;
      }),

    /**
     * 查询录制状态
     */
    query: protectedProcedure
      .input(
        z.object({
          resourceId: z.string(),
          sid: z.string(),
        })
      )
      .query(async ({ input }) => {
        const result = await queryCloudRecording(input.resourceId, input.sid);
        return result;
      }),

    /**
     * 停止录制
     */
    stop: protectedProcedure
      .input(
        z.object({
          resourceId: z.string(),
          sid: z.string(),
          channelName: z.string(),
          uid: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await stopCloudRecording(
          input.resourceId,
          input.sid,
          input.channelName,
          input.uid
        );
        return result;
      }),
  }),

  /**
   * 实时转录翻译
   */
  transcription: router({
    /**
     * 启动实时转录
     */
    start: protectedProcedure
      .input(
        z.object({
          channelName: z.string(),
          sourceLanguage: z.string().default("zh-CN"),
          targetLanguages: z.array(z.string()).default(["en-US"]),
        })
      )
      .mutation(async ({ input }) => {
        const agentId = await startSpeechToText(
          input.channelName,
          input.sourceLanguage,
          input.targetLanguages
        );
        return { agentId };
      }),

    /**
     * 查询转录状态
     */
    query: protectedProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        const result = await querySpeechToText(input.agentId);
        return result;
      }),

    /**
     * 更新转录配置
     */
    update: protectedProcedure
      .input(
        z.object({
          agentId: z.string(),
          sourceLanguage: z.string().optional(),
          targetLanguages: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateSpeechToText(
          input.agentId,
          input.sourceLanguage,
          input.targetLanguages
        );
        return { success: true };
      }),

    /**
     * 停止转录
     */
    stop: protectedProcedure
      .input(z.object({ agentId: z.string() }))
      .mutation(async ({ input }) => {
        await stopSpeechToText(input.agentId);
        return { success: true };
      }),
  }),
});
