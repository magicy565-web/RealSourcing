import AgoraRTM from 'agora-rtm';

type RTM = InstanceType<typeof AgoraRTM.RTM>;

/**
 * RTM Client Manager
 * 管理 Agora RTM 客户端的连接、消息发送和接收
 */

let rtmClient: RTM | null = null;
let currentUserId: string | null = null;

export interface RTMMessage {
  text: string;
  senderId: string;
  timestamp: number;
  messageType: 'text' | 'image' | 'file';
}

export interface RTMEventHandlers {
  onMessageReceived?: (message: RTMMessage) => void;
  onConnectionStateChanged?: (state: string, reason: string) => void;
  onTokenPrivilegeWillExpire?: () => void;
}

/**
 * 初始化 RTM 客户端
 */
export async function initRTMClient(appId: string, userId: string): Promise<RTM> {
  if (rtmClient) {
    console.warn('RTM client already initialized');
    return rtmClient;
  }

  try {
    rtmClient = new AgoraRTM.RTM(appId, userId, {
      token: undefined, // 如果需要 Token，在这里传入
      presenceTimeout: 300,
    });

    currentUserId = userId;

    console.log('RTM client initialized successfully');
    return rtmClient;
  } catch (error) {
    console.error('Failed to initialize RTM client:', error);
    throw error;
  }
}

/**
 * 登录 RTM
 */
export async function loginRTM(): Promise<void> {
  if (!rtmClient) {
    throw new Error('RTM client not initialized. Call initRTMClient first.');
  }

  try {
    await rtmClient.login({ token: undefined });
    console.log('RTM login successful');
  } catch (error) {
    console.error('RTM login failed:', error);
    throw error;
  }
}

/**
 * 登出 RTM
 */
export async function logoutRTM(): Promise<void> {
  if (!rtmClient) {
    console.warn('RTM client not initialized');
    return;
  }

  try {
    await rtmClient.logout();
    console.log('RTM logout successful');
  } catch (error) {
    console.error('RTM logout failed:', error);
    throw error;
  }
}

/**
 * 发送点对点消息（1对1私聊）
 */
export async function sendPrivateMessage(
  targetUserId: string,
  message: string
): Promise<void> {
  if (!rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const result = await rtmClient.publish(targetUserId, message, {
      customType: 'PlainTxt',
      channelType: 'USER', // 关键：使用 USER 类型实现点对点消息
    });

    console.log('Private message sent successfully:', result);
  } catch (error) {
    console.error('Failed to send private message:', error);
    throw error;
  }
}

/**
 * 发送频道消息
 */
export async function sendChannelMessage(
  channelName: string,
  message: string
): Promise<void> {
  if (!rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    const result = await rtmClient.publish(channelName, message, {
      customType: 'PlainTxt',
      channelType: 'MESSAGE',
    });

    console.log('Channel message sent successfully:', result);
  } catch (error) {
    console.error('Failed to send channel message:', error);
    throw error;
  }
}

/**
 * 订阅频道
 */
export async function subscribeChannel(channelName: string): Promise<void> {
  if (!rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    await rtmClient.subscribe(channelName);
    console.log(`Subscribed to channel: ${channelName}`);
  } catch (error) {
    console.error('Failed to subscribe to channel:', error);
    throw error;
  }
}

/**
 * 取消订阅频道
 */
export async function unsubscribeChannel(channelName: string): Promise<void> {
  if (!rtmClient) {
    throw new Error('RTM client not initialized');
  }

  try {
    await rtmClient.unsubscribe(channelName);
    console.log(`Unsubscribed from channel: ${channelName}`);
  } catch (error) {
    console.error('Failed to unsubscribe from channel:', error);
    throw error;
  }
}

/**
 * 添加事件监听器
 */
export function addRTMEventListeners(handlers: RTMEventHandlers): void {
  if (!rtmClient) {
    throw new Error('RTM client not initialized');
  }

  // 监听接收到的消息
  if (handlers.onMessageReceived) {
    rtmClient.addEventListener('message', (event: any) => {
      const message: RTMMessage = {
        text: event.message,
        senderId: event.publisher,
        timestamp: event.timestamp || Date.now(),
        messageType: 'text',
      };
      handlers.onMessageReceived?.(message);
    });
  }

  // 监听连接状态变化
  if (handlers.onConnectionStateChanged) {
    rtmClient.addEventListener('status', (event: any) => {
      handlers.onConnectionStateChanged?.(event.state, event.reason);
    });
  }

  // 监听 Token 即将过期
  if (handlers.onTokenPrivilegeWillExpire) {
    rtmClient.addEventListener('TokenPrivilegeWillExpire', () => {
      handlers.onTokenPrivilegeWillExpire?.();
    });
  }
}

/**
 * 移除所有事件监听器
 */
export function removeAllRTMEventListeners(): void {
  if (!rtmClient) {
    return;
  }

  // RTM SDK 2.x 使用 removeAllListeners
  // @ts-ignore
  if (typeof rtmClient.removeAllListeners === 'function') {
    // @ts-ignore
    rtmClient.removeAllListeners();
  }
}

/**
 * 获取当前 RTM 客户端实例
 */
export function getRTMClient(): RTM | null {
  return rtmClient;
}

/**
 * 获取当前用户 ID
 */
export function getCurrentUserId(): string | null {
  return currentUserId;
}

/**
 * 销毁 RTM 客户端
 */
export async function destroyRTMClient(): Promise<void> {
  if (!rtmClient) {
    return;
  }

  try {
    await logoutRTM();
    removeAllRTMEventListeners();
    rtmClient = null;
    currentUserId = null;
    console.log('RTM client destroyed');
  } catch (error) {
    console.error('Failed to destroy RTM client:', error);
    throw error;
  }
}
