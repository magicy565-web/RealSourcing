import axios from 'axios';
import { ENV } from '../_core/env.js';
import crypto from 'crypto';

// 白板API基础URL
const WHITEBOARD_API_BASE = 'https://api.netless.link/v5';

/**
 * 生成互动白板SDK Token
 * 用于服务端调用白板RESTful API
 */
export function generateWhiteboardSDKToken(
  ak: string,
  sk: string,
  expirationMs: number = 0
): string {
  const payload = {
    iss: ak,
    exp: expirationMs === 0 ? 0 : Math.floor(Date.now() / 1000) + Math.floor(expirationMs / 1000),
    role: 0, // Admin role
  };

  // 简化的Token生成（实际应使用netless-token库）
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  const message = `${header}.${body}`;
  const signature = crypto
    .createHmac('sha256', sk)
    .update(message)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `NETLESSSDK_${message}.${signature}`;
}

/**
 * 生成互动白板Room Token
 * 用于客户端加入白板房间
 */
export function generateWhiteboardRoomToken(
  ak: string,
  sk: string,
  roomUuid: string,
  role: 0 | 1 | 2 = 1, // 0: Admin, 1: Writer, 2: Reader
  expirationMs: number = 3600000 // 默认1小时
): string {
  const payload = {
    iss: ak,
    exp: Math.floor(Date.now() / 1000) + Math.floor(expirationMs / 1000),
    role,
    uuid: roomUuid,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  const message = `${header}.${body}`;
  const signature = crypto
    .createHmac('sha256', sk)
    .update(message)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `NETLESSROOM_${message}.${signature}`;
}

/**
 * 生成互动白板Task Token
 * 用于文档转换任务
 */
export function generateWhiteboardTaskToken(
  ak: string,
  sk: string,
  taskUuid: string,
  role: 0 | 1 | 2 = 1,
  expirationMs: number = 3600000
): string {
  const payload = {
    iss: ak,
    exp: Math.floor(Date.now() / 1000) + Math.floor(expirationMs / 1000),
    role,
    uuid: taskUuid,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  const message = `${header}.${body}`;
  const signature = crypto
    .createHmac('sha256', sk)
    .update(message)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `NETLESSTASK_${message}.${signature}`;
}

/**
 * 创建白板房间
 */
export async function createWhiteboardRoom(
  sdkToken: string,
  appId: string,
  options?: {
    name?: string;
    limit?: number;
  }
): Promise<{ uuid: string; teamUUID: string }> {
  try {
    const response = await axios.post(
      `${WHITEBOARD_API_BASE}/rooms`,
      {
        name: options?.name || `room-${Date.now()}`,
        limit: options?.limit || 100,
      },
      {
        headers: {
          'Authorization': `Bearer ${sdkToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Whiteboard] Room created:', response.data);
    return {
      uuid: response.data.uuid,
      teamUUID: response.data.teamUUID,
    };
  } catch (error: any) {
    console.error('[Whiteboard] Failed to create room:', error.response?.data || error.message);
    throw new Error(`Failed to create whiteboard room: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 获取白板房间列表
 */
export async function getWhiteboardRooms(
  sdkToken: string,
  appId: string
): Promise<any[]> {
  try {
    const response = await axios.get(
      `${WHITEBOARD_API_BASE}/rooms`,
      {
        headers: {
          'Authorization': `Bearer ${sdkToken}`,
        },
      }
    );

    console.log('[Whiteboard] Rooms fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Whiteboard] Failed to fetch rooms:', error.response?.data || error.message);
    throw new Error(`Failed to fetch whiteboard rooms: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 获取白板房间详情
 */
export async function getWhiteboardRoomInfo(
  sdkToken: string,
  roomUuid: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${WHITEBOARD_API_BASE}/rooms/${roomUuid}`,
      {
        headers: {
          'Authorization': `Bearer ${sdkToken}`,
        },
      }
    );

    console.log('[Whiteboard] Room info fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Whiteboard] Failed to fetch room info:', error.response?.data || error.message);
    throw new Error(`Failed to fetch whiteboard room info: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 发起文档转换任务
 */
export async function startDocumentConversion(
  sdkToken: string,
  fileUrl: string,
  options?: {
    type?: 'pptx' | 'pdf' | 'doc';
    preview?: boolean;
  }
): Promise<{ uuid: string; status: string }> {
  try {
    const response = await axios.post(
      `${WHITEBOARD_API_BASE}/tasks`,
      {
        sourceUrl: fileUrl,
        type: options?.type || 'pptx',
        preview: options?.preview ?? true,
      },
      {
        headers: {
          'Authorization': `Bearer ${sdkToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Whiteboard] Document conversion started:', response.data);
    return {
      uuid: response.data.uuid,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error('[Whiteboard] Failed to start document conversion:', error.response?.data || error.message);
    throw new Error(`Failed to start document conversion: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 查询文档转换进度
 */
export async function queryDocumentConversion(
  sdkToken: string,
  taskUuid: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${WHITEBOARD_API_BASE}/tasks/${taskUuid}`,
      {
        headers: {
          'Authorization': `Bearer ${sdkToken}`,
        },
      }
    );

    console.log('[Whiteboard] Document conversion status:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Whiteboard] Failed to query document conversion:', error.response?.data || error.message);
    throw new Error(`Failed to query document conversion: ${error.response?.data?.message || error.message}`);
  }
}
