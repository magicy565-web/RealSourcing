# 声网（Agora）完整集成指南

## 📋 目录

1. [环境配置](#环境配置)
2. [后端API](#后端api)
3. [前端集成](#前端集成)
4. [使用示例](#使用示例)
5. [常见问题](#常见问题)

---

## 环境配置

### 必需的环境变量

```env
# RTC/RTM Token生成（从声网控制台获取）
AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE=c9b17e2664044dfe8160140d7e581d89

# 前端使用
VITE_AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882

# 云端录制和实时转录（从声网控制台获取）
AGORA_CUSTOMER_ID=f48e44adf06a425a869ebebd62e90ad2
AGORA_CUSTOMER_SECRET=fea9118eeff340b8b9f00a53f215883b

# 互动白板（从声网控制台获取）
WHITEBOARD_AK=<从控制台获取>
WHITEBOARD_SK=<从控制台获取>

# 阿里云OSS（用于存储录制和字幕）
OSS_BUCKET=<bucket名称>
OSS_REGION=<地域>
OSS_ACCESS_KEY_ID=<accessKeyId>
OSS_ACCESS_KEY_SECRET=<accessKeySecret>
```

---

## 后端API

### 1. RTC Token生成

**端点**: `agora.getRtcToken`

**请求**:
```typescript
const { data } = await trpc.agora.getRtcToken.useQuery({
  channelName: 'my-channel',
  uid: 12345,
});
```

**响应**:
```typescript
{
  token: 'string'
}
```

---

### 2. RTM Token生成

**端点**: `agora.getRtmToken`

**请求**:
```typescript
const { data } = await trpc.agora.getRtmToken.useQuery({
  userId: 'user-123',
});
```

**响应**:
```typescript
{
  token: 'string'
}
```

---

### 3. 同时生成RTC和RTM Token

**端点**: `agora.getDualTokens`

**请求**:
```typescript
const { data } = await trpc.agora.getDualTokens.useQuery({
  channelName: 'my-channel',
  uid: 12345,
});
```

**响应**:
```typescript
{
  rtcToken: 'string',
  rtmToken: 'string',
  appId: 'string'
}
```

---

### 4. 互动白板

#### 创建房间

**端点**: `agora.whiteboard.createRoom`

```typescript
const { mutateAsync } = trpc.agora.whiteboard.createRoom.useMutation();
const room = await mutateAsync({
  name: 'My Whiteboard Room',
  limit: 100,
});
// 返回: { uuid: string, teamUUID: string }
```

#### 生成Room Token

**端点**: `agora.whiteboard.generateRoomToken`

```typescript
const { data } = await trpc.agora.whiteboard.generateRoomToken.useQuery({
  roomUuid: 'room-uuid-here',
  role: 'writer', // 'admin' | 'writer' | 'reader'
  expirationMs: 3600000, // 1小时
});
// 返回: { token: string }
```

#### 发起文档转换

**端点**: `agora.whiteboard.startDocumentConversion`

```typescript
const { mutateAsync } = trpc.agora.whiteboard.startDocumentConversion.useMutation();
const task = await mutateAsync({
  fileUrl: 'https://example.com/document.pptx',
  type: 'pptx', // 'pptx' | 'pdf' | 'doc'
});
// 返回: { uuid: string, status: string }
```

#### 查询转换进度

**端点**: `agora.whiteboard.queryDocumentConversion`

```typescript
const { data } = await trpc.agora.whiteboard.queryDocumentConversion.useQuery({
  taskUuid: 'task-uuid-here',
});
```

---

### 5. 云端录制

#### 启动录制

**端点**: `agora.recording.start`

```typescript
const { mutateAsync } = trpc.agora.recording.start.useMutation();
const result = await mutateAsync({
  channelName: 'my-channel',
  uid: 'recorder-bot-uid',
  token: 'rtc-token',
});
// 返回: { resourceId: string, sid: string }
```

#### 查询录制状态

**端点**: `agora.recording.query`

```typescript
const { data } = await trpc.agora.recording.query.useQuery({
  resourceId: 'resource-id',
  sid: 'session-id',
});
```

#### 停止录制

**端点**: `agora.recording.stop`

```typescript
const { mutateAsync } = trpc.agora.recording.stop.useMutation();
const result = await mutateAsync({
  resourceId: 'resource-id',
  sid: 'session-id',
  channelName: 'my-channel',
  uid: 'recorder-bot-uid',
});
```

---

### 6. 实时转录翻译

#### 启动转录

**端点**: `agora.transcription.start`

```typescript
const { mutateAsync } = trpc.agora.transcription.start.useMutation();
const result = await mutateAsync({
  channelName: 'my-channel',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en-US', 'ja-JP'],
});
// 返回: { agentId: string }
```

#### 查询转录状态

**端点**: `agora.transcription.query`

```typescript
const { data } = await trpc.agora.transcription.query.useQuery({
  agentId: 'agent-id',
});
```

#### 更新转录配置

**端点**: `agora.transcription.update`

```typescript
const { mutateAsync } = trpc.agora.transcription.update.useMutation();
await mutateAsync({
  agentId: 'agent-id',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en-US'],
});
```

#### 停止转录

**端点**: `agora.transcription.stop`

```typescript
const { mutateAsync } = trpc.agora.transcription.stop.useMutation();
await mutateAsync({
  agentId: 'agent-id',
});
```

---

## 前端集成

### 1. 视频通话组件

```typescript
import { AgoraVideoCall } from '@/components/AgoraVideoCall';

export function MyVideoPage() {
  return (
    <AgoraVideoCall
      channelName="my-channel"
      userId="user-123"
      onCallEnd={() => console.log('Call ended')}
    />
  );
}
```

### 2. 互动白板组件

```typescript
import { AgoraWhiteboard } from '@/components/AgoraWhiteboard';

export function MyWhiteboardPage() {
  return (
    <AgoraWhiteboard
      roomUuid="existing-room-uuid"
      onRoomCreated={(uuid, token) => {
        console.log('Room created:', uuid);
      }}
    />
  );
}
```

### 3. 实时转录翻译组件

```typescript
import { AgoraTranscription } from '@/components/AgoraTranscription';

export function MyTranscriptionPage() {
  return (
    <AgoraTranscription
      channelName="my-channel"
      sourceLanguage="zh-CN"
      targetLanguages={['en-US', 'ja-JP']}
      onTranscriptionStart={(agentId) => {
        console.log('Transcription started:', agentId);
      }}
    />
  );
}
```

---

## 使用示例

### 完整的视频会议场景

```typescript
import { useState } from 'react';
import { AgoraVideoCall } from '@/components/AgoraVideoCall';
import { AgoraTranscription } from '@/components/AgoraTranscription';
import { AgoraWhiteboard } from '@/components/AgoraWhiteboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function VideoConferenceRoom() {
  const [channelName] = useState('conference-room-1');
  const [userId] = useState('user-123');
  const [recordingStarted, setRecordingStarted] = useState(false);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">视频通话</TabsTrigger>
          <TabsTrigger value="whiteboard">互动白板</TabsTrigger>
          <TabsTrigger value="transcription">实时转录</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <AgoraVideoCall
            channelName={channelName}
            userId={userId}
          />
          <Button
            onClick={() => setRecordingStarted(!recordingStarted)}
            variant={recordingStarted ? 'destructive' : 'default'}
          >
            {recordingStarted ? '停止录制' : '启动录制'}
          </Button>
        </TabsContent>

        <TabsContent value="whiteboard">
          <AgoraWhiteboard />
        </TabsContent>

        <TabsContent value="transcription">
          <AgoraTranscription
            channelName={channelName}
            sourceLanguage="zh-CN"
            targetLanguages={['en-US']}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 常见问题

### Q: Token过期了怎么办？

**A**: Token默认有效期为1小时。当Token即将过期时，需要重新调用API获取新的Token。建议在Token过期前30分钟时刷新。

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // 重新获取Token
    refetch();
  }, 30 * 60 * 1000); // 30分钟后

  return () => clearTimeout(timer);
}, []);
```

### Q: 如何处理网络中断？

**A**: 建议实现自动重连机制：

```typescript
const handleNetworkError = async () => {
  // 重新加入频道
  await client.leave();
  await client.join({
    appid: appId,
    channel: channelName,
    token: newToken,
    uid: userId,
  });
};
```

### Q: 白板和视频如何同时使用？

**A**: 可以在同一个页面中并排显示两个组件：

```typescript
<div className="grid grid-cols-2 gap-4">
  <AgoraVideoCall {...props} />
  <AgoraWhiteboard {...props} />
</div>
```

### Q: 如何保存转录结果？

**A**: 转录结果可以通过WebSocket实时接收，然后存储到数据库：

```typescript
// 在后端创建一个tRPC mutation来保存转录
const saveTranscription = trpc.transcription.save.useMutation();

// 接收到转录数据时
socket.on('transcription', (data) => {
  saveTranscription.mutate({
    agentId: data.agentId,
    text: data.text,
    language: data.language,
  });
});
```

---

## 相关资源

- [声网官方文档](https://doc.shengwang.cn/)
- [Agora RTC SDK for Web](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Agora RTM SDK](https://docs.agora.io/en/signaling/get-started/get-started-sdk)
- [Interactive Whiteboard](https://docs.agora.io/en/interactive-whiteboard/overview/product-overview)
- [Cloud Recording API](https://docs.agora.io/en/cloud-recording/overview/product-overview)

---

## 支持

如有问题，请联系：
- 声网技术支持：https://agora-ticket.agora.io
- 项目技术支持：[您的支持渠道]
