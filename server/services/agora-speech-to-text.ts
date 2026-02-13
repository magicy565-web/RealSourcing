import axios from 'axios';
import { ENV } from '../_core/env';

// 声网实时转录翻译 API 基础 URL
const AGORA_STT_API_BASE = 'https://api.sd-rtn.com/api/speech-to-text/v1';

/**
 * 生成 HTTP Basic Auth 认证头
 */
function getAuthHeader(): string {
  const credentials = `${ENV.agoraCustomerId}:${ENV.agoraCustomerSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * 启动实时语音转文字服务
 * @param channelName - RTC 频道名称
 * @param sourceLanguage - 源语言（如 'zh-CN', 'en-US'）
 * @param targetLanguages - 目标翻译语言列表（如 ['en-US']）
 * @returns Agent ID
 */
export async function startSpeechToText(
  channelName: string,
  sourceLanguage: string = 'zh-CN',
  targetLanguages: string[] = ['en-US']
): Promise<string> {
  try {
    const response = await axios.post(
      `${AGORA_STT_API_BASE}/projects/${ENV.agoraAppId}/join`,
      {
        languages: [sourceLanguage],
        name: `realsourcing-${channelName}`,
        maxIdleTime: 60, // 最大空闲时间（秒）
        rtcConfig: {
          channelName,
          subBotUid: `${Math.floor(Math.random() * 1000000)}`, // 订阅机器人 UID
          pubBotUid: `${Math.floor(Math.random() * 1000000) + 1000000}`, // 发布机器人 UID
        },
        translateConfig: {
          languages: [
            {
              source: sourceLanguage,
              target: targetLanguages,
            },
          ],
        },
        captionConfig: {
          storage: {
            vendor: 2, // 2: 阿里云 OSS
            region: 3, // 3: 华东 1（杭州）
            bucket: ENV.ossBucket,
            accessKey: ENV.ossAccessKeyId,
            secretKey: ENV.ossAccessKeySecret,
            fileNamePrefix: ['captions', channelName],
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
      }
    );

    const agentId = response.data.agent_id;
    console.log(`[Agora STT] Speech-to-text service started with Agent ID: ${agentId}`);
    return agentId;
  } catch (error: any) {
    console.error('[Agora STT] Failed to start speech-to-text:', error.response?.data || error.message);
    throw new Error(`Failed to start speech-to-text: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 查询实时语音转文字服务状态
 * @param agentId - Agent ID
 * @returns 服务状态信息
 */
export async function querySpeechToText(agentId: string): Promise<any> {
  try {
    const response = await axios.get(
      `${AGORA_STT_API_BASE}/projects/${ENV.agoraAppId}/agents/${agentId}`,
      {
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );

    console.log(`[Agora STT] Query result:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Agora STT] Failed to query speech-to-text:', error.response?.data || error.message);
    throw new Error(`Failed to query speech-to-text: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 更新实时语音转文字服务配置
 * @param agentId - Agent ID
 * @param sourceLanguage - 新的源语言
 * @param targetLanguages - 新的目标翻译语言列表
 */
export async function updateSpeechToText(
  agentId: string,
  sourceLanguage?: string,
  targetLanguages?: string[]
): Promise<void> {
  try {
    const updateConfig: any = {};

    if (sourceLanguage) {
      updateConfig.languages = [sourceLanguage];
    }

    if (targetLanguages && targetLanguages.length > 0) {
      updateConfig.translateConfig = {
        languages: [
          {
            source: sourceLanguage || 'zh-CN',
            target: targetLanguages,
          },
        ],
      };
    }

    await axios.post(
      `${AGORA_STT_API_BASE}/projects/${ENV.agoraAppId}/agents/${agentId}/update`,
      updateConfig,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
      }
    );

    console.log(`[Agora STT] Speech-to-text service updated for Agent ID: ${agentId}`);
  } catch (error: any) {
    console.error('[Agora STT] Failed to update speech-to-text:', error.response?.data || error.message);
    throw new Error(`Failed to update speech-to-text: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 停止实时语音转文字服务
 * @param agentId - Agent ID
 */
export async function stopSpeechToText(agentId: string): Promise<void> {
  try {
    await axios.post(
      `${AGORA_STT_API_BASE}/projects/${ENV.agoraAppId}/agents/${agentId}/leave`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
      }
    );

    console.log(`[Agora STT] Speech-to-text service stopped for Agent ID: ${agentId}`);
  } catch (error: any) {
    console.error('[Agora STT] Failed to stop speech-to-text:', error.response?.data || error.message);
    throw new Error(`Failed to stop speech-to-text: ${error.response?.data?.message || error.message}`);
  }
}
