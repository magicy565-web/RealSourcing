# 声网（Agora）功能集成研究笔记

## 1. 互动白板（Interactive Whiteboard）

### Token类型
- **SDK Token**: 用于服务端调用白板RESTful API，权限最高（Admin）
- **Room Token**: 用于客户端加入白板房间，绑定特定房间UUID
- **Task Token**: 用于文档转换任务，绑定特定任务UUID

### Token角色权限
- **0 (Admin)**: 最高权限，用于服务端
- **1 (Writer)**: 写入权限，用于普通用户
- **2 (Reader)**: 只读权限，用于观看者

### Token生成方式
1. **服务端代码生成**（推荐）
   - 使用 `netless-token` 库
   - 支持 JavaScript/TypeScript/Java/Go/PHP/Ruby/C#
   - 需要 AK 和 SK（访问密钥对）

2. **RESTful API生成**
   - 调用声网白板服务端API
   - 需要 SDK Token

3. **声网控制台生成**
   - 仅用于测试，生成永久Admin Token
   - 不应下发给客户端

### 白板工作流
```
1. 服务端生成SDK Token
2. 服务端用SDK Token调用API创建房间 → 获得房间UUID
3. 服务端生成Room Token（绑定房间UUID）
4. 服务端下发Room Token + 房间UUID给客户端
5. 客户端用Room Token加入房间
```

### 关键配置
- 需要在声网控制台获取：AppIdentifier、AK、SK
- Token有效期：可设置为0（永不过期）或指定毫秒数
- 安全建议：AK和SK仅保存在服务端，不下发给客户端

---

## 2. RTM（Real-Time Messaging）

### Token生成
- 使用 `RtmTokenBuilder.buildToken()`
- 参数：AppID、AppCertificate、userId、Role、expirationTs
- 角色：`RtmRole.Rtm_User`

### 特点
- 与RTC Token不同，RTM Token仅用于消息服务
- 可以同时生成具备RTC和RTM权限的Token（通过特殊方式）
- 有效期：默认1小时

---

## 3. RTC（Real-Time Communication）

### Token生成
- 使用 `RtcTokenBuilder.buildTokenWithUid()` 或 `.buildTokenWithAccount()`
- 参数：AppID、AppCertificate、channelName、uid/account、Role、expirationTs
- 角色：`RtcRole.PUBLISHER` 或 `RtcRole.SUBSCRIBER`

### 特点
- 绑定特定频道和用户
- 支持UID（数字）和Account（字符串）两种模式
- 有效期：默认1小时

---

## 4. 云端录制（Cloud Recording）

### API流程
1. **获取资源ID** (Acquire)
   - 调用 `/cloud_recording/acquire`
   - 返回 resourceId

2. **启动录制** (Start)
   - 调用 `/cloud_recording/resourceid/{resourceId}/mode/mix/start`
   - 需要RTC Token
   - 配置：streamTypes、recordingFileConfig、storageConfig

3. **查询状态** (Query)
   - 调用 `/cloud_recording/resourceid/{resourceId}/sid/{sid}/mode/mix/query`

4. **停止录制** (Stop)
   - 调用 `/cloud_recording/resourceid/{resourceId}/sid/{sid}/mode/mix/stop`

### 认证方式
- HTTP Basic Auth
- 使用 AGORA_CUSTOMER_ID 和 AGORA_CUSTOMER_SECRET

### 存储配置
- 支持阿里云OSS、Amazon S3等
- 文件格式：HLS、MP4

---

## 5. 实时转录翻译（Speech-to-Text & Translation）

### API流程
1. **启动服务** (Join)
   - 调用 `/api/speech-to-text/v1/projects/{appId}/join`
   - 配置：languages、rtcConfig、translateConfig、captionConfig

2. **查询状态** (Query)
   - 调用 `/api/speech-to-text/v1/projects/{appId}/agents/{agentId}`

3. **更新配置** (Update)
   - 调用 `/api/speech-to-text/v1/projects/{appId}/agents/{agentId}/update`

4. **停止服务** (Leave)
   - 调用 `/api/speech-to-text/v1/projects/{appId}/agents/{agentId}/leave`

### 特点
- 支持多语言（zh-CN、en-US等）
- 可配置翻译目标语言
- 字幕自动保存到OSS

---

## 6. 环境变量配置

```env
# RTC/RTM Token生成
AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882
AGORA_APP_CERTIFICATE=c9b17e2664044dfe8160140d7e581d89

# 前端使用
VITE_AGORA_APP_ID=0deed6e0ce284935b09babccaa5eb882

# 云端录制和转录（RESTful API）
AGORA_CUSTOMER_ID=f48e44adf06a425a869ebebd62e90ad2
AGORA_CUSTOMER_SECRET=fea9118eeff340b8b9f00a53f215883b

# 互动白板（需要从控制台获取）
WHITEBOARD_AK=<从控制台获取>
WHITEBOARD_SK=<从控制台获取>
WHITEBOARD_APP_ID=<从控制台获取>

# 阿里云OSS（用于存储录制和字幕）
OSS_BUCKET=<bucket名称>
OSS_REGION=<地域>
OSS_ACCESS_KEY_ID=<accessKeyId>
OSS_ACCESS_KEY_SECRET=<accessKeySecret>
```

---

## 7. 已实现的功能

✅ **已完成**
- RTC Token生成（server/lib/agora-token.ts）
- RTM消息存储和查询（server/routers/rtm.router.ts）
- 云端录制API（server/services/agora-recording.ts）
- 实时转录翻译API（server/services/agora-speech-to-text.ts）

❌ **缺失**
- RTM Token生成
- 互动白板Token生成和房间管理
- tRPC路由暴露（录制、转录、白板API）
- 前端SDK集成示例

---

## 8. 下一步实现计划

1. **补全Token生成**
   - 添加RTM Token生成
   - 添加白板Token生成（SDK/Room/Task）

2. **创建白板服务**
   - 房间创建和管理
   - Token生成和下发

3. **暴露tRPC路由**
   - agora.recording.*
   - agora.transcription.*
   - agora.whiteboard.*

4. **前端集成**
   - Agora RTC SDK集成
   - Agora RTM SDK集成
   - 白板SDK集成
   - UI组件开发

5. **数据库Schema**
   - 白板房间表
   - 录制任务表
   - 转录任务表
