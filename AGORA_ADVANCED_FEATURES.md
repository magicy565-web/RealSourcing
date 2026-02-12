# 声网高级功能集成指南

## 📋 概述

本文档详细说明如何在 RealSourcing 项目中集成声网的两大高级功能：
1. **对话式 AI 引擎（ConvoAI）** - 实时语音 AI 助手
2. **互动白板（Whiteboard）** - 多人实时协作白板

---

## 🤖 对话式 AI 引擎（ConvoAI）

### 功能说明

ConvoAI 可以在 Webinar 中提供实时 AI 语音助手，帮助买家和工厂进行：
- 实时翻译（中英文互译）
- 价格分析和建议
- 质量认证验证
- 供应链咨询
- 谈判策略建议

### API 接口

**创建 AI 智能体**

```http
POST https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/{appid}/join
Authorization: Basic <credentials>
Content-Type: application/json
```

**请求参数**

```json
{
  "name": "sourcing_assistant_001",
  "properties": {
    "channel": "webinar_channel_name",
    "token": "agora_rtc_token",
    "agent_rtc_uid": "0",
    "remote_rtc_uids": ["*"],
    "enable_string_uid": false,
    "idle_timeout": 120,
    "asr": {
      "language": "zh-CN",
      "vendor": "fengming"
    },
    "tts": {
      "vendor": "minimax",
      "params": {
        "group_id": "your_group_id",
        "key": "your_api_key",
        "model": "speech-01-turbo",
        "voice_setting": {
          "voice_id": "female-shaonv",
          "speed": 1,
          "vol": 1
        }
      }
    },
    "llm": {
      "url": "https://api.openai.com/v1/chat/completions",
      "api_key": "your_openai_key",
      "system_messages": [
        {
          "role": "system",
          "content": "You are a professional sourcing assistant helping international buyers negotiate with Chinese factories. Provide pricing analysis, quality verification, and negotiation strategies."
        }
      ],
      "params": {
        "model": "gpt-4",
        "max_tokens": 500,
        "temperature": 0.7
      },
      "greeting_message": "Hello! I'm your AI sourcing assistant. I can help you with pricing analysis, quality verification, and negotiation strategies. How can I assist you today?"
    }
  }
}
```

**响应**

```json
{
  "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
  "create_ts": 1737111452,
  "status": "RUNNING"
}
```

### 集成步骤

#### 1. 创建 ConvoAI Service

```typescript
// client/src/lib/convoai.ts
import axios from 'axios';

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const AGORA_API_KEY = import.meta.env.VITE_AGORA_API_KEY;
const AGORA_API_SECRET = import.meta.env.VITE_AGORA_API_SECRET;

export class ConvoAIService {
  private baseURL = 'https://api.agora.io/cn/api/conversational-ai-agent/v2';
  private credentials: string;

  constructor() {
    this.credentials = btoa(`${AGORA_API_KEY}:${AGORA_API_SECRET}`);
  }

  async createAgent(config: {
    channel: string;
    token: string;
    greeting?: string;
  }) {
    const response = await axios.post(
      `${this.baseURL}/projects/${AGORA_APP_ID}/join`,
      {
        name: `agent_${Date.now()}`,
        properties: {
          channel: config.channel,
          token: config.token,
          agent_rtc_uid: '0',
          remote_rtc_uids: ['*'],
          idle_timeout: 120,
          asr: {
            language: 'zh-CN',
            vendor: 'fengming',
          },
          tts: {
            vendor: 'minimax',
            params: {
              // 配置 TTS 参数
            },
          },
          llm: {
            url: 'https://api.openai.com/v1/chat/completions',
            api_key: import.meta.env.VITE_OPENAI_API_KEY,
            greeting_message: config.greeting || 'Hello! I am your AI sourcing assistant.',
            system_messages: [
              {
                role: 'system',
                content: 'You are a professional sourcing assistant...',
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${this.credentials}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async stopAgent(agentId: string) {
    await axios.delete(
      `${this.baseURL}/projects/${AGORA_APP_ID}/agents/${agentId}`,
      {
        headers: {
          Authorization: `Basic ${this.credentials}`,
        },
      }
    );
  }
}

export const convoAIService = new ConvoAIService();
```

#### 2. 在 NegotiationRoom 中集成

```typescript
// 在 NegotiationRoom.tsx 中添加
const [aiAgentId, setAiAgentId] = useState<string | null>(null);

const handleEnableAI = async () => {
  try {
    const agent = await convoAIService.createAgent({
      channel: webinar.agora_channel_name,
      token: webinar.agora_token,
      greeting: `Welcome to ${webinar.title}. I'm your AI sourcing assistant.`,
    });
    setAiAgentId(agent.agent_id);
    
    addMessage({
      id: `ai-join-${Date.now()}`,
      sender: 'AI Assistant',
      role: 'system',
      content: 'AI Assistant has joined the session',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to enable AI:', error);
  }
};

const handleDisableAI = async () => {
  if (aiAgentId) {
    await convoAIService.stopAgent(aiAgentId);
    setAiAgentId(null);
  }
};
```

---

## 📝 互动白板（Whiteboard）

### 功能说明

互动白板可以在 Webinar 中实现：
- 产品图纸标注
- 设计方案讨论
- 价格表格协作编辑
- 文档共享和批注

### API 接口

**1. 生成 SDK Token**

```http
POST https://api.netless.link/v5/tokens/teams
region: cn-hz
Content-Type: application/json
```

```json
{
  "accessKey": "your_access_key",
  "secretAccessKey": "your_secret_key",
  "lifespan": 3600000,
  "role": "admin"
}
```

**2. 创建白板房间**

```http
POST https://api.netless.link/v5/rooms
region: cn-hz
token: <sdk_token>
Content-Type: application/json
```

```json
{
  "name": "webinar_whiteboard_001",
  "limit": 50
}
```

**响应**

```json
{
  "uuid": "room_uuid",
  "teamUUID": "team_uuid",
  "appUUID": "app_uuid",
  "isRecord": false,
  "isBan": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "limit": 50
}
```

### 集成步骤

#### 1. 安装白板 SDK

```bash
pnpm add @netless/fastboard-react
```

#### 2. 创建 Whiteboard Service

```typescript
// client/src/lib/whiteboard.ts
import axios from 'axios';

const WHITEBOARD_AK = import.meta.env.VITE_WHITEBOARD_ACCESS_KEY;
const WHITEBOARD_SK = import.meta.env.VITE_WHITEBOARD_SECRET_KEY;
const REGION = 'cn-hz';

export class WhiteboardService {
  private baseURL = 'https://api.netless.link/v5';

  async generateToken() {
    const response = await axios.post(
      `${this.baseURL}/tokens/teams`,
      {
        accessKey: WHITEBOARD_AK,
        secretAccessKey: WHITEBOARD_SK,
        lifespan: 3600000,
        role: 'admin',
      },
      {
        headers: {
          region: REGION,
        },
      }
    );
    return response.data;
  }

  async createRoom(name: string) {
    const token = await this.generateToken();
    
    const response = await axios.post(
      `${this.baseURL}/rooms`,
      {
        name,
        limit: 50,
      },
      {
        headers: {
          token,
          region: REGION,
        },
      }
    );
    
    return {
      ...response.data,
      token,
    };
  }
}

export const whiteboardService = new WhiteboardService();
```

#### 3. 创建 Whiteboard 组件

```typescript
// client/src/components/Whiteboard.tsx
import { useEffect, useRef } from 'react';
import { createFastboard, FastboardApp } from '@netless/fastboard-react';

interface WhiteboardProps {
  roomUUID: string;
  roomToken: string;
}

export function Whiteboard({ roomUUID, roomToken }: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<FastboardApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initWhiteboard = async () => {
      const app = await createFastboard({
        sdkConfig: {
          appIdentifier: import.meta.env.VITE_WHITEBOARD_APP_ID,
          region: 'cn-hz',
        },
        joinRoom: {
          uuid: roomUUID,
          roomToken: roomToken,
        },
        managerConfig: {
          cursor: true,
        },
      });

      app.mount(containerRef.current!);
      appRef.current = app;
    };

    initWhiteboard();

    return () => {
      appRef.current?.destroy();
    };
  }, [roomUUID, roomToken]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white rounded-lg"
    />
  );
}
```

#### 4. 在 NegotiationRoom 中集成

```typescript
// 在 NegotiationRoom.tsx 中添加
const [whiteboardRoom, setWhiteboardRoom] = useState<{
  uuid: string;
  token: string;
} | null>(null);

const handleEnableWhiteboard = async () => {
  try {
    const room = await whiteboardService.createRoom(
      `webinar_${webinar.id}_whiteboard`
    );
    setWhiteboardRoom({
      uuid: room.uuid,
      token: room.token,
    });
  } catch (error) {
    console.error('Failed to enable whiteboard:', error);
  }
};

// 在 UI 中添加白板按钮和面板
{whiteboardRoom && (
  <div className="absolute inset-0 bg-white rounded-lg">
    <Whiteboard
      roomUUID={whiteboardRoom.uuid}
      roomToken={whiteboardRoom.token}
    />
  </div>
)}
```

---

## 🔧 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# Agora ConvoAI
VITE_AGORA_API_KEY=your_api_key
VITE_AGORA_API_SECRET=your_api_secret

# Whiteboard
VITE_WHITEBOARD_APP_ID=your_app_id
VITE_WHITEBOARD_ACCESS_KEY=your_access_key
VITE_WHITEBOARD_SECRET_KEY=your_secret_key

# OpenAI (for ConvoAI LLM)
VITE_OPENAI_API_KEY=your_openai_key
```

---

## 💰 成本估算

### ConvoAI 成本
- ASR（语音识别）：¥15/小时
- TTS（语音合成）：¥25/小时
- LLM（大模型）：根据 OpenAI 定价
- **总计**：约 ¥40-60/小时

### 互动白板成本
- 免费额度：10,000 分钟/月
- 超出后：¥0.01/分钟
- **总计**：约 ¥6/小时

### 建议
- MVP 阶段：使用免费额度测试
- 生产环境：按需启用，控制成本

---

## 📊 使用场景建议

### ConvoAI 适用场景
1. **语言障碍**：买家不懂中文，需要实时翻译
2. **专业咨询**：买家需要价格分析、质量建议
3. **24/7 支持**：非工作时间的自动接待

### 互动白板适用场景
1. **产品设计讨论**：标注图纸、修改方案
2. **价格谈判**：协作编辑报价表
3. **文档共享**：合同、认证文件批注

---

## 🚀 实施建议

### Phase 1（当前）
- ✅ 完成基础 RTC 音视频集成
- ✅ 完成实时聊天功能
- ✅ 完成 Webinar 创建和报名流程

### Phase 2（后续迭代）
- 🔲 集成 ConvoAI 对话式 AI
- 🔲 集成互动白板
- 🔲 添加 AI 翻译功能
- 🔲 添加文档协作功能

### Phase 3（高级功能）
- 🔲 AI 自动生成采购报告
- 🔲 智能供应商匹配
- 🔲 自动化谈判建议

---

## 📚 参考文档

- [声网 ConvoAI 文档](https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent)
- [声网互动白板文档](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-teams)
- [Agora RTC 文档](https://doc.shengwang.cn/doc/rtc/javascript/overview/product-overview)

---

**更新时间**：2026-02-12  
**版本**：v1.0  
**维护者**：RealSourcing 开发团队
