import axios from 'axios';
import { ENV } from '../_core/env';

// 声网云端录制 API 基础 URL
const AGORA_RECORDING_API_BASE = 'https://api.agora.io/v1/apps';

/**
 * 生成 HTTP Basic Auth 认证头
 */
function getAuthHeader(): string {
  const credentials = `${ENV.agoraCustomerId}:${ENV.agoraCustomerSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * 启动云端录制
 * @param channelName - RTC 频道名称
 * @param uid - 录制机器人的 UID
 * @param token - RTC Token
 * @returns 录制资源 ID 和 SID
 */
export async function startCloudRecording(
  channelName: string,
  uid: string,
  token: string
): Promise<{ resourceId: string; sid: string }> {
  try {
    // 步骤 1: 获取录制资源 ID
    const acquireResponse = await axios.post(
      `${AGORA_RECORDING_API_BASE}/${ENV.agoraAppId}/cloud_recording/acquire`,
      {
        cname: channelName,
        uid,
        clientRequest: {
          resourceExpiredHour: 24,
          scene: 0, // 0: 实时音视频录制
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
      }
    );

    const resourceId = acquireResponse.data.resourceId;
    console.log(`[Agora Recording] Resource ID acquired: ${resourceId}`);

    // 步骤 2: 启动录制
    const startResponse = await axios.post(
      `${AGORA_RECORDING_API_BASE}/${ENV.agoraAppId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
      {
        cname: channelName,
        uid,
        clientRequest: {
          token,
          recordingConfig: {
            maxIdleTime: 30, // 最大空闲时间（秒）
            streamTypes: 2, // 0: 仅音频, 1: 仅视频, 2: 音视频
            channelType: 0, // 0: 通信场景, 1: 直播场景
            videoStreamType: 0, // 0: 高清流, 1: 低清流
            subscribeVideoUids: ['#allstream#'], // 订阅所有用户的视频
            subscribeAudioUids: ['#allstream#'], // 订阅所有用户的音频
          },
          recordingFileConfig: {
            avFileType: ['hls', 'mp4'], // 录制文件格式
          },
          storageConfig: {
            vendor: 2, // 2: 阿里云 OSS
            region: 3, // 3: 华东 1（杭州）
            bucket: ENV.ossBucket,
            accessKey: ENV.ossAccessKeyId,
            secretKey: ENV.ossAccessKeySecret,
            endpoint: `https://${ENV.ossBucket}.${ENV.ossRegion}.aliyuncs.com`,
            fileNamePrefix: ['recordings', channelName],
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

    const sid = startResponse.data.sid;
    console.log(`[Agora Recording] Recording started with SID: ${sid}`);

    return { resourceId, sid };
  } catch (error: any) {
    console.error('[Agora Recording] Failed to start recording:', error.response?.data || error.message);
    throw new Error(`Failed to start cloud recording: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 查询云端录制状态
 * @param resourceId - 录制资源 ID
 * @param sid - 录制会话 ID
 * @returns 录制状态信息
 */
export async function queryCloudRecording(
  resourceId: string,
  sid: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${AGORA_RECORDING_API_BASE}/${ENV.agoraAppId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/query`,
      {
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );

    console.log(`[Agora Recording] Query result:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Agora Recording] Failed to query recording:', error.response?.data || error.message);
    throw new Error(`Failed to query cloud recording: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 停止云端录制
 * @param resourceId - 录制资源 ID
 * @param sid - 录制会话 ID
 * @param channelName - RTC 频道名称
 * @param uid - 录制机器人的 UID
 * @returns 录制文件信息
 */
export async function stopCloudRecording(
  resourceId: string,
  sid: string,
  channelName: string,
  uid: string
): Promise<any> {
  try {
    const response = await axios.post(
      `${AGORA_RECORDING_API_BASE}/${ENV.agoraAppId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
      {
        cname: channelName,
        uid,
        clientRequest: {},
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
      }
    );

    console.log(`[Agora Recording] Recording stopped:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Agora Recording] Failed to stop recording:', error.response?.data || error.message);
    throw new Error(`Failed to stop cloud recording: ${error.response?.data?.message || error.message}`);
  }
}
