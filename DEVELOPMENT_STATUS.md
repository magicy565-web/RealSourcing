# RealSourcing 开发状态文档

**文档生成时间**: 2026-02-13  
**当前分支**: fix/dev-proxy-safeRequest  
**开发服务器**: https://3000-ia6h54nwtzklenvnr12pj-a2fbf452.sg1.manus.computer  
**代码总行数**: 20,605 行 TypeScript/TSX

---

## 一、项目概览

RealSourcing 是一个基于 Webinar 的 B2B 跨境采购撮合平台，通过实时视频会议连接海外采购商与中国源头工厂。项目采用现代化的全栈技术架构，集成了实时音视频（Agora SDK）、AI 辅助分析和智能匹配功能。

### 核心价值主张

**对海外采购商**：无需飞往中国参加展会，在线即可完成供应商考察，通过实时视频验证工厂真实性，打破 AI 时代虚假信息，即时通讯加在线报价加 AI 辅助分析，缩短采购决策周期。

**对中国工厂**：直接触达海外采购商，无需中间商，提升利润空间，通过 Webinar 展示产品创新和生产能力，AI 驱动的需求匹配，减少无效沟通。

**对平台运营方**：按结果付费（成交佣金），降低客户决策门槛，多方共赢的商业模式。

---

## 二、技术架构

### 前端技术栈

- **框架**: React 19.2.1 + Vite 7.1.9
- **UI 组件库**: Radix UI + shadcn/ui + TailwindCSS 4.1.14
- **路由**: wouter 3.7.1
- **状态管理**: TanStack Query 5.90.2
- **RPC 通信**: tRPC 11.6.0
- **实时视频**: Agora RTC SDK NG 4.24.2
- **图表**: Recharts 2.15.4
- **动画**: Framer Motion 12.23.22
- **表单**: React Hook Form 7.64.0 + Zod 4.1.12

### 后端技术栈

- **运行时**: Node.js 22.13.0
- **框架**: Express 4.21.2 + tRPC 11.6.0
- **数据库**: MySQL + Drizzle ORM 0.44.6
- **认证**: Manus OAuth + JWT (jose 6.1.0)
- **文件存储**: AWS S3 SDK
- **AI 集成**: OpenAI API (通过环境变量配置)
- **实时通信**: Agora Token 生成服务

### 数据库设计

项目使用 Drizzle ORM 管理数据库 Schema，当前实现了以下核心表：

1. **users** - 用户表（支持 OAuth 登录）
2. **webinars** - Webinar 表（标题、描述、状态、分类、时间）
3. **factories** - 工厂表（名称、位置、分类、评分、认证信息）
4. **webinar_factories** - Webinar 与工厂的多对多关系表
5. **reports** - 报告表（供应商评估、利润分析、谈判总结）
6. **negotiation_events** - 谈判事件时间轴表
7. **orders** - 订单表（产品、数量、价格、状态）
8. **webinar_resources** - Webinar 资源/附件表

---

## 三、已实现功能清单

### 3.1 用户认证系统

**实现状态**: ✅ 基础完成，⚠️ OAuth 配置待完善

**核心代码位置**:
- 服务端: `server/_core/oauth.ts`
- 客户端: `client/src/const.ts` (getLoginUrl)
- 路由: `server/routers.ts` (auth router)

**功能描述**:
- 支持 Manus OAuth 登录（需配置 OAUTH_SERVER_URL 环境变量）
- 用户会话管理（基于 Cookie）
- 用户信息查询 API (`auth.me`)
- 登出功能 (`auth.logout`)

**待完善**:
- 完整的注册流程
- 角色权限系统（6 种角色：super_admin, premium_member, regular_user, guest, premium_buyer, regular_buyer）
- 用户资料编辑

---

### 3.2 Dashboard 页面

**实现状态**: ✅ 完成

**核心代码位置**: `client/src/pages/Home.tsx`

**功能描述**:

Dashboard 页面展示平台的整体运营概览，包含五个统计卡片：Live Webinars（当前正在直播的数量）、Scheduled（即将举行的活动数量）、Factories（注册的供应商数量）、Participants（已批准的参与者数量）、Pending Reviews（待审核的数量）。

页面还包含 Recent Webinars 区域，显示最近的 4 个 Webinar，每个卡片展示标题、时间、参与人数、状态标签（Live/Scheduled/Completed），并提供快速操作按钮（Join/View Details）。

Pending Reviews 区域显示待审核的买家或工厂注册申请，每条记录包含用户名、公司名、角色标识、注册时间，以及 Approve 和 Reject 按钮，支持一键批准或拒绝。

**核心代码片段**:

```typescript
// 统计数据获取
useEffect(() => {
  setStats(mockStore.getDashboardStats());
  setRecentWebinars(mockStore.getWebinars().slice(0, 4));
  const allRegs = mockStore.getRegistrations();
  setPendingRegistrations(allRegs.filter(r => r.status === "pending").slice(0, 5));
}, []);

// 审批操作
const handleApprove = (regId: number) => {
  mockStore.updateRegistrationStatus(regId, "approved");
  setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
  setStats(mockStore.getDashboardStats());
};
```

---

### 3.3 Webinar 管理系统

**实现状态**: ✅ 核心功能完成，⚠️ 创建流程待优化

**核心代码位置**:
- 列表页: `client/src/pages/Webinars.tsx`
- 详情页: `client/src/pages/WebinarDetail.tsx`
- 创建页: `client/src/pages/WebinarCreate.tsx`
- API 路由: `server/routers.ts` (webinar router)

**功能描述**:

Webinars 列表页支持按状态筛选（All、Live、Scheduled、Completed），每个 Webinar 卡片显示封面图、标题、描述、时间、时长、参与人数限制、当前参与人数、工厂数量、买家数量、分类标签。Live 状态的 Webinar 显示红色脉冲圆点和 "Join Room" 按钮，Scheduled 状态显示蓝色标签，Completed 状态显示绿色标签。

Webinar 详情页展示完整的 Webinar 信息，包括封面图、标题、描述、主办方信息、时间、分类、语言、参与者列表（工厂和买家分开显示）、Decision Matrix（决策矩阵，展示各工厂在不同维度的评分对比）、相关报告链接。

创建 Webinar 流程包含基本信息填写（标题、描述、分类、语言、时间、时长）、工厂邀请（从工厂列表选择）、预览确认三个步骤。

**核心 API**:

```typescript
// Webinar CRUD API
webinar: router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getWebinars(input?.status);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getWebinarById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      scheduledAt: z.string().optional(),
      factoryIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { factoryIds, scheduledAt, ...rest } = input;
      const id = await createWebinar({
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdById: ctx.user.id,
      });
      
      if (factoryIds && factoryIds.length > 0) {
        for (const factoryId of factoryIds) {
          await addFactoryToWebinar(id, factoryId);
        }
      }
      
      return { id };
    }),
});
```

---

### 3.4 Negotiation Room（会议室）

**实现状态**: ✅ UI 完成，🚧 Agora 集成部分完成，⚠️ 实时聊天待实现

**核心代码位置**:
- 页面组件: `client/src/pages/NegotiationRoom.tsx`
- Agora 服务: `client/src/lib/agora.ts`
- Token 生成: `server/lib/agora-token.ts`

**功能描述**:

Negotiation Room 是平台的核心功能，提供实时视频会议环境。页面顶部显示 Webinar 标题、Live 标签、会议计时器（格式：HH:MM:SS）。左侧是视频区域，采用网格布局显示所有参与者的视频流，每个视频框显示参与者姓名、公司名、角色标签（Factory/Buyer）、音视频状态图标。

底部控制栏包含摄像头开关、麦克风开关、屏幕共享、设置、Leave 按钮（红色）。右侧面板包含三个标签页：Chat（聊天）、People（参与者列表）、AI Insights（AI 分析）。

Chat 标签页提供聊天输入框和快捷问题按钮（如 "What's the unit price for 1,000+ units?"），支持 AI 辅助回复。People 标签页显示所有参与者的在线状态、角色、公司信息。AI Insights 标签页显示实时分析指标（Confidence 87%、Risk Level Low、Market Fit High）。

**Agora 集成核心代码**:

```typescript
// Agora 服务封装 (client/src/lib/agora.ts)
export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localTracks: AgoraTrack = {};
  private remoteUsers: Map<string | number, {
    videoTrack?: IRemoteVideoTrack;
    audioTrack?: IRemoteAudioTrack;
  }> = new Map();

  async init(config: AgoraConfig): Promise<void> {
    this.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8',
    });
    
    this.registerEventHandlers();
    
    await this.client.join(
      config.appId || AGORA_APP_ID,
      config.channel,
      config.token || null,
      config.uid || null
    );
  }

  async createLocalTracks(): Promise<AgoraTrack> {
    const [audioTrack, videoTrack] = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);
    
    this.localTracks = { audioTrack, videoTrack };
    
    if (this.client) {
      await this.client.publish([audioTrack, videoTrack]);
    }
    
    return this.localTracks;
  }

  private registerEventHandlers(): void {
    if (!this.client) return;
    
    this.client.on('user-published', async (user, mediaType) => {
      await this.client!.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        const remoteUser = this.remoteUsers.get(user.uid) || {};
        remoteUser.videoTrack = user.videoTrack;
        this.remoteUsers.set(user.uid, remoteUser);
      }
      
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });
  }
}
```

**Token 生成服务**:

```typescript
// server/lib/agora-token.ts
export function generateRtcToken(channelName: string, uid: number | string) {
  const APP_ID = process.env.AGORA_APP_ID || '';
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';
  
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    Number(uid),
    role,
    privilegeExpiredTs
  );
  
  return token;
}
```

**待实现功能**:
- WebSocket 或 SSE 实现实时聊天
- 参与者列表的实时更新
- AI Insights 的实时分析和更新
- 屏幕共享功能
- 会议录制功能

---

### 3.5 工厂管理系统

**实现状态**: ✅ 核心功能完成

**核心代码位置**:
- 列表页: `client/src/pages/Factories.tsx`
- 详情页: `client/src/pages/FactoryDetail.tsx`
- API 路由: `server/routers.ts` (factory router)

**功能描述**:

工厂列表页支持按验证状态筛选（All、Verified、Pending、Suspended），每个工厂卡片显示公司名称、Verified 标签、位置、分类、员工规模、综合评分（0-100，带星星图标和颜色编码）、参与的 Webinar 数量、完成的订单数量、View Details 按钮。

工厂详情页包含五个标签页：Overview（概览）、Score Breakdown（评分分解）、Webinar History（Webinar 历史）、Order History（订单历史）、AI Analysis（AI 分析）。

Overview 标签页显示公司基本信息（员工数、年收入、网站、电话、邮箱）、认证证书列表（ISO 9001、ISO 14001、CE、FCC、RoHS）、产品专长标签（LED Controllers、Smart Switches、IoT Sensors、Power Adapters）。

Score Breakdown 标签页使用水平进度条展示五个维度的评分：Quality（95）、Delivery（90）、Communication（88）、Pricing（93）、Compliance（91），每个维度使用不同颜色的进度条（绿色/蓝色）。

**核心 API**:

```typescript
// Factory CRUD API
factory: router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getFactories(input?.search);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getFactoryById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      location: z.string().optional(),
      category: z.string().optional(),
      certifications: z.array(z.string()).optional(),
      specialties: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createFactory({
        ...input,
        addedById: ctx.user.id,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "verified", "suspended"]).optional(),
      overallScore: z.number().optional(),
      qualityScore: z.number().optional(),
      deliveryScore: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateFactory(id, data);
      return { success: true };
    }),
});
```

---

### 3.6 报告系统

**实现状态**: ✅ 基础完成，⚠️ 报告生成逻辑待实现

**核心代码位置**:
- 列表页: `client/src/pages/Reports.tsx`
- API 路由: `server/routers.ts` (report router)

**功能描述**:

报告系统支持三种类型的报告：Supplier Evaluation（供应商评估）、Profit Analysis（利润分析）、Negotiation Summary（谈判总结）。报告列表页显示所有已生成的报告，每个报告卡片包含标题、类型标签、状态（Generating/Completed/Failed）、分析的工厂数量、创建时间、View Report 按钮。

**核心 API**:

```typescript
report: router({
  list: protectedProcedure.query(async () => {
    return getReports();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getReportById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      type: z.enum(["supplier_evaluation", "profit_analysis", "negotiation_summary"]),
      webinarId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createReport({
        ...input,
        createdById: ctx.user.id,
      });
      return { id };
    }),
});
```

---

## 四、待实现功能清单

### 4.1 高优先级功能

#### 询价与报价系统

**目标**: 实现从 Webinar 到成交的完整业务流程

**需要实现**:
1. 询价管理页面（买家视角）
   - 显示发出的询价列表（状态、工厂、产品、数量、目标价格）
   - 筛选：待回复、已收到报价、谈判中、已接受
   - 对比报价功能（选择多个报价，生成 AI 对比报告）
   - 接受报价按钮（创建订单）

2. 询价管理页面（工厂视角）
   - 显示收到的询价列表（状态、产品、数量、目标价格、买家信息）
   - 筛选：待报价、已报价、已接受、已拒绝
   - 快速报价功能（填写单价、MOQ、交付时间、付款条款）
   - AI 辅助报价按钮（获取建议报价和市场价格区间）

3. 数据库 Schema（需要添加）:

```sql
CREATE TABLE inquiries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  webinar_id INT,
  buyer_id INT NOT NULL,
  factory_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  target_price DECIMAL(10, 2),
  requirements TEXT,
  status ENUM('pending', 'quoted', 'negotiating', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (factory_id) REFERENCES factories(id),
  FOREIGN KEY (webinar_id) REFERENCES webinars(id)
);

CREATE TABLE quotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inquiry_id INT NOT NULL,
  factory_id INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  moq INT NOT NULL,
  lead_time_days INT NOT NULL,
  payment_terms VARCHAR(255),
  notes TEXT,
  ai_confidence DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id),
  FOREIGN KEY (factory_id) REFERENCES factories(id)
);
```

4. API 设计:

```typescript
inquiry: router({
  create: protectedProcedure
    .input(z.object({
      webinarId: z.number().optional(),
      factoryId: z.number(),
      productName: z.string(),
      quantity: z.number(),
      targetPrice: z.number().optional(),
      requirements: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createInquiry({
        ...input,
        buyerId: ctx.user.id,
      });
      return { id };
    }),

  list: protectedProcedure
    .input(z.object({ 
      role: z.enum(["buyer", "factory"]),
      status: z.string().optional() 
    }))
    .query(async ({ ctx, input }) => {
      if (input.role === "buyer") {
        return getInquiriesByBuyer(ctx.user.id, input.status);
      } else {
        return getInquiriesByFactory(ctx.user.factoryId, input.status);
      }
    }),

  submitQuote: protectedProcedure
    .input(z.object({
      inquiryId: z.number(),
      unitPrice: z.number(),
      moq: z.number(),
      leadTimeDays: z.number(),
      paymentTerms: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createQuote({
        ...input,
        factoryId: ctx.user.factoryId,
      });
      return { id };
    }),
});
```

---

#### 实时聊天功能

**目标**: 在 Negotiation Room 中实现实时消息通信

**技术方案**: WebSocket (推荐) 或 Server-Sent Events (SSE)

**需要实现**:
1. WebSocket 服务器（基于 Express + ws 或 Socket.io）
2. 消息持久化（存储到数据库）
3. 消息历史记录加载
4. 在线状态同步
5. 输入状态提示（"XXX is typing..."）
6. 文件分享功能

**WebSocket 服务器示例**:

```typescript
// server/websocket.ts
import { WebSocketServer } from 'ws';
import { Server } from 'http';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  const rooms = new Map<string, Set<any>>();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room');
    const userId = url.searchParams.get('userId');

    if (!roomId || !userId) {
      ws.close();
      return;
    }

    // Join room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(ws);

    // Broadcast to room
    const broadcast = (data: any) => {
      const room = rooms.get(roomId);
      if (room) {
        room.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      }
    };

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      // Save to database
      saveMessage({
        roomId,
        userId,
        content: message.content,
        timestamp: new Date(),
      });

      // Broadcast to all clients in room
      broadcast({
        type: 'message',
        userId,
        content: message.content,
        timestamp: new Date(),
      });
    });

    ws.on('close', () => {
      rooms.get(roomId)?.delete(ws);
    });
  });
}
```

---

#### AI 功能集成

**目标**: 实现 AI 供应商匹配、对比报告、辅助报价

**需要实现**:

1. **AI 供应商匹配**:
   - 输入：产品名称、数量、目标价格、需求描述
   - 输出：推荐的工厂列表（按匹配度排序）
   - 技术：OpenAI Embeddings + 向量相似度计算

```typescript
ai: router({
  matchSuppliers: protectedProcedure
    .input(z.object({
      productName: z.string(),
      quantity: z.number(),
      targetPrice: z.number().optional(),
      requirements: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Generate embedding for the inquiry
      const inquiryEmbedding = await generateEmbedding(
        `${input.productName} ${input.requirements || ''}`
      );

      // Get all factories with embeddings
      const factories = await getFactoriesWithEmbeddings();

      // Calculate similarity scores
      const matches = factories.map(factory => ({
        ...factory,
        matchScore: cosineSimilarity(inquiryEmbedding, factory.embedding),
      }));

      // Sort by match score and return top 5
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    }),
});
```

2. **AI 供应商对比报告**:
   - 输入：工厂 ID 列表
   - 输出：雷达图数据 + 文字分析 + 风险提示
   - 技术：GPT-4 生成分析报告

```typescript
compareSuppliers: protectedProcedure
  .input(z.object({
    factoryIds: z.array(z.number()),
  }))
  .mutation(async ({ input }) => {
    // Get factory details
    const factories = await Promise.all(
      input.factoryIds.map(id => getFactoryById(id))
    );

    // Prepare data for GPT-4
    const prompt = `Compare the following suppliers and provide insights:
    
${factories.map(f => `
Factory: ${f.name}
Location: ${f.location}
Scores: Quality ${f.qualityScore}, Delivery ${f.deliveryScore}, Communication ${f.communicationScore}
Certifications: ${f.certifications.join(', ')}
`).join('\n')}

Provide:
1. Strengths and weaknesses of each supplier
2. Which supplier is best for different scenarios
3. Risk factors to consider
4. Overall recommendation`;

    const analysis = await callGPT4(prompt);

    return {
      radarData: factories.map(f => ({
        name: f.name,
        quality: f.qualityScore,
        delivery: f.deliveryScore,
        communication: f.communicationScore,
        pricing: f.pricingScore,
        compliance: f.complianceScore,
      })),
      analysis,
    };
  }),
```

3. **AI 辅助报价**:
   - 输入：询价 ID
   - 输出：建议报价 + 市场价格区间 + 置信度
   - 技术：历史数据分析 + GPT-4

```typescript
suggestQuote: protectedProcedure
  .input(z.object({
    inquiryId: z.number(),
  }))
  .mutation(async ({ input }) => {
    const inquiry = await getInquiryById(input.inquiryId);
    
    // Get historical quotes for similar products
    const historicalQuotes = await getHistoricalQuotes({
      productName: inquiry.productName,
      quantity: inquiry.quantity,
    });

    // Calculate average and range
    const prices = historicalQuotes.map(q => q.unitPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Use GPT-4 for additional insights
    const prompt = `Based on the following data, suggest a competitive quote:
    
Product: ${inquiry.productName}
Quantity: ${inquiry.quantity}
Target Price: ${inquiry.targetPrice || 'Not specified'}
Historical Average: $${avgPrice.toFixed(2)}
Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}

Provide:
1. Suggested unit price
2. Reasoning
3. Confidence level (0-1)`;

    const aiSuggestion = await callGPT4(prompt);

    return {
      suggestedPrice: avgPrice * 0.95, // 5% below average for competitiveness
      priceRange: { min: minPrice, max: maxPrice },
      confidence: 0.85,
      aiInsights: aiSuggestion,
    };
  }),
```

---

### 4.2 中优先级功能

#### Webinar 创建流程优化

**当前问题**: 创建流程较简单，缺少引导和验证

**优化方案**:
1. 多步骤创建向导（Step 1: 基本信息，Step 2: 参与者设置，Step 3: 预览确认）
2. 表单验证和错误提示
3. 自动生成 Agora Channel Name
4. 分享链接生成（公开 Webinar）
5. 邮件邀请功能（私密 Webinar）

---

#### 用户角色权限系统

**目标**: 实现细粒度的权限控制

**需要实现**:
1. 角色定义（6 种角色）
2. 权限矩阵（哪些角色可以访问哪些功能）
3. 中间件验证（protectedProcedure 增强）
4. 前端路由守卫

**权限矩阵示例**:

| 功能 | Super Admin | Premium Member | Regular User | Guest | Premium Buyer | Regular Buyer |
|------|-------------|----------------|--------------|-------|---------------|---------------|
| 创建 Webinar | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| 加入 Webinar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 添加工厂 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 发送询价 | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 提交报价 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 查看报告 | ✅ | ✅ (付费) | ❌ | ❌ | ✅ (付费) | ❌ |

---

#### 屏幕共享功能

**目标**: 在 Negotiation Room 中支持屏幕共享

**Agora SDK 实现**:

```typescript
// client/src/lib/agora.ts
export class AgoraService {
  private screenTrack?: ILocalVideoTrack;

  async startScreenShare(): Promise<void> {
    try {
      this.screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
      });

      if (this.client && this.localTracks.videoTrack) {
        // Unpublish camera video
        await this.client.unpublish([this.localTracks.videoTrack]);
        
        // Publish screen video
        await this.client.publish([this.screenTrack]);
        
        console.log('✅ Started screen sharing');
      }
    } catch (error) {
      console.error('❌ Failed to start screen sharing:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.screenTrack && this.client && this.localTracks.videoTrack) {
      // Unpublish screen video
      await this.client.unpublish([this.screenTrack]);
      this.screenTrack.close();
      
      // Publish camera video again
      await this.client.publish([this.localTracks.videoTrack]);
      
      console.log('✅ Stopped screen sharing');
    }
  }
}
```

---

## 五、数据流架构

### 5.1 前后端通信流程

```
Client (React)
    ↓ tRPC Query/Mutation
Server (Express + tRPC)
    ↓ Drizzle ORM
Database (MySQL)
```

### 5.2 实时视频流程

```
Client A                    Agora Cloud                    Client B
    ↓                            ↑                            ↑
1. Request Token        ←  2. Generate Token  →        1. Request Token
    ↓                                                        ↓
3. Join Channel         →  4. Relay Media     ←        3. Join Channel
    ↓                                                        ↓
5. Publish Tracks       →  6. Subscribe       ←        5. Publish Tracks
```

### 5.3 认证流程

```
1. User clicks "Login"
    ↓
2. Redirect to Manus OAuth Portal
    ↓
3. User authorizes
    ↓
4. Redirect back with code
    ↓
5. Server exchanges code for token
    ↓
6. Server creates session cookie
    ↓
7. Client receives user info
```

---

## 六、环境变量配置

项目需要以下环境变量（在 `.env` 文件中配置）:

```bash
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# OAuth
OAUTH_SERVER_URL="https://oauth.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"
VITE_APP_ID="your-app-id"

# Agora
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-certificate"
VITE_AGORA_APP_ID="your-agora-app-id"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-..."

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="realsourcing-uploads"
```

---

## 七、项目文件结构

```
RealSourcing/
├── client/                          # 前端代码
│   ├── public/                      # 静态资源
│   │   ├── avatars/                 # 用户头像
│   │   ├── covers/                  # Webinar 封面图
│   │   ├── logos/                   # 公司 Logo
│   │   └── highlights/              # 高光时刻截图
│   └── src/
│       ├── components/              # React 组件
│       │   ├── ui/                  # shadcn/ui 组件
│       │   ├── tactical/            # 战术组件（DecisionMatrix 等）
│       │   ├── AIChatBox.tsx        # AI 聊天框
│       │   ├── ChatWindow.tsx       # 聊天窗口
│       │   ├── DashboardLayout.tsx  # Dashboard 布局
│       │   └── VideoTimeline.tsx    # 视频时间轴
│       ├── pages/                   # 页面组件
│       │   ├── Home.tsx             # Dashboard 页面
│       │   ├── Webinars.tsx         # Webinar 列表
│       │   ├── WebinarDetail.tsx    # Webinar 详情
│       │   ├── WebinarCreate.tsx    # 创建 Webinar
│       │   ├── NegotiationRoom.tsx  # 会议室
│       │   ├── Factories.tsx        # 工厂列表
│       │   ├── FactoryDetail.tsx    # 工厂详情
│       │   ├── Reports.tsx          # 报告列表
│       │   └── Settings.tsx         # 设置页面
│       ├── lib/                     # 工具库
│       │   ├── agora.ts             # Agora 服务封装
│       │   ├── mock-data.ts         # Mock 数据
│       │   └── utils.ts             # 工具函数
│       ├── hooks/                   # React Hooks
│       ├── contexts/                # React Contexts
│       ├── App.tsx                  # 应用入口
│       └── main.tsx                 # Vite 入口
├── server/                          # 后端代码
│   ├── _core/                       # 核心功能
│   │   ├── index.ts                 # 服务器入口
│   │   ├── trpc.ts                  # tRPC 配置
│   │   ├── oauth.ts                 # OAuth 认证
│   │   ├── cookies.ts               # Cookie 管理
│   │   ├── llm.ts                   # LLM 集成
│   │   └── systemRouter.ts          # 系统路由
│   ├── lib/
│   │   └── agora-token.ts           # Agora Token 生成
│   ├── routers.ts                   # API 路由定义
│   ├── db.ts                        # 数据库操作（Mock）
│   └── storage.ts                   # 文件存储
├── drizzle/                         # 数据库 Schema
│   ├── schema.ts                    # 表定义
│   ├── relations.ts                 # 关系定义
│   └── migrations/                  # 迁移文件
├── package.json                     # 依赖配置
├── drizzle.config.ts                # Drizzle 配置
├── vite.config.ts                   # Vite 配置
├── tailwind.config.ts               # TailwindCSS 配置
└── tsconfig.json                    # TypeScript 配置
```

---

## 八、核心功能代码片段总结

### 8.1 tRPC 路由定义

```typescript
// server/routers.ts
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME);
      return { success: true };
    }),
  }),
  agora: router({
    getToken: publicProcedure
      .input(z.object({ channelName: z.string(), uid: z.union([z.number(), z.string()]) }))
      .query(async ({ input }) => {
        const token = generateRtcToken(input.channelName, input.uid);
        return { token };
      }),
  }),
  webinar: router({ /* ... */ }),
  factory: router({ /* ... */ }),
  report: router({ /* ... */ }),
});
```

### 8.2 Agora 视频集成

```typescript
// client/src/lib/agora.ts
export class AgoraService {
  async init(config: AgoraConfig): Promise<void> {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.registerEventHandlers();
    await this.client.join(config.appId, config.channel, config.token, config.uid);
  }

  async createLocalTracks(): Promise<AgoraTrack> {
    const [audioTrack, videoTrack] = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);
    this.localTracks = { audioTrack, videoTrack };
    await this.client.publish([audioTrack, videoTrack]);
    return this.localTracks;
  }
}
```

### 8.3 数据库 Schema

```typescript
// drizzle/schema.ts
export const webinars = sqliteTable("webinars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  status: text("status", { enum: ["draft", "scheduled", "live", "completed"] }),
  scheduledAt: integer("scheduledAt", { mode: "timestamp" }),
  createdById: integer("createdById").notNull(),
});

export const factories = sqliteTable("factories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  overallScore: integer("overallScore").default(0),
  qualityScore: integer("qualityScore").default(0),
  deliveryScore: integer("deliveryScore").default(0),
});
```

---

## 九、开发建议和最佳实践

### 9.1 代码规范

1. **TypeScript 严格模式**: 启用 `strict: true`，确保类型安全
2. **组件命名**: 使用 PascalCase（如 `NegotiationRoom.tsx`）
3. **函数命名**: 使用 camelCase（如 `handleJoinChannel`）
4. **文件组织**: 按功能模块组织，避免过深的目录嵌套
5. **注释**: 关键逻辑添加注释，API 函数添加 JSDoc

### 9.2 性能优化

1. **React.memo**: 对频繁渲染的组件使用 memo
2. **useMemo/useCallback**: 避免不必要的重新计算和函数创建
3. **虚拟滚动**: 长列表使用 react-window 或 react-virtualized
4. **图片懒加载**: 使用 Intersection Observer API
5. **代码分割**: 使用 React.lazy 和 Suspense

### 9.3 安全建议

1. **输入验证**: 所有 API 输入使用 Zod 验证
2. **SQL 注入防护**: 使用 Drizzle ORM 的参数化查询
3. **XSS 防护**: React 默认转义，但注意 dangerouslySetInnerHTML
4. **CSRF 防护**: 使用 SameSite Cookie
5. **敏感信息**: 不在前端代码中硬编码 API Key

### 9.4 测试策略

1. **单元测试**: 使用 Vitest 测试工具函数和 Hooks
2. **集成测试**: 测试 API 路由和数据库操作
3. **E2E 测试**: 使用 Playwright 测试关键用户流程
4. **Mock 数据**: 开发阶段使用 Mock 数据，避免依赖真实数据库

---

## 十、下一步开发计划

### Phase 1: 完善核心功能（1-2 周）

1. ✅ 完成 Agora 视频集成测试（需要配置 AGORA_APP_ID）
2. 🚧 实现实时聊天功能（WebSocket）
3. 🚧 实现询价与报价系统
4. 🚧 完善 AI 功能（供应商匹配、对比报告）

### Phase 2: 优化用户体验（1 周）

1. 优化 Webinar 创建流程
2. 添加用户角色权限系统
3. 实现屏幕共享功能
4. 添加会议录制功能

### Phase 3: 测试和部署（1 周）

1. 端到端测试
2. 性能优化
3. 安全审计
4. 部署到生产环境

---

## 十一、常见问题和解决方案

### Q1: Agora 视频无法显示？

**可能原因**:
- AGORA_APP_ID 未配置或配置错误
- 浏览器未授权摄像头/麦克风权限
- Token 生成失败（需要 AGORA_APP_CERTIFICATE）

**解决方案**:
1. 检查 `.env` 文件中的 Agora 配置
2. 在浏览器中手动授权摄像头/麦克风
3. 查看浏览器控制台的错误信息
4. 使用 Agora 官方的 Token 生成工具测试

### Q2: OAuth 登录失败？

**可能原因**:
- OAUTH_SERVER_URL 未配置
- Redirect URI 不匹配
- App ID 配置错误

**解决方案**:
1. 配置 `OAUTH_SERVER_URL` 环境变量
2. 确保 Redirect URI 与 OAuth 服务器配置一致
3. 检查 `VITE_APP_ID` 是否正确

### Q3: 数据库连接失败？

**可能原因**:
- DATABASE_URL 配置错误
- MySQL 服务未启动
- 网络连接问题

**解决方案**:
1. 检查 `DATABASE_URL` 格式是否正确
2. 确保 MySQL 服务正在运行
3. 测试数据库连接：`mysql -u user -p -h host database`

---

## 十二、参考资源

### 官方文档

- **Agora SDK**: https://docs.agora.io/en/video-calling/get-started/get-started-sdk
- **tRPC**: https://trpc.io/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview
- **shadcn/ui**: https://ui.shadcn.com/docs
- **TailwindCSS**: https://tailwindcss.com/docs

### 社区资源

- **Agora Community**: https://www.agora.io/en/community/
- **tRPC Discord**: https://trpc.io/discord
- **React Discord**: https://discord.gg/react

---

## 附录：Mock 数据示例

当前项目使用 Mock 数据进行开发，数据存储在 `server/db.ts` 和 `client/src/lib/mock-data.ts` 中。

### Webinar Mock 数据

```typescript
{
  id: 1,
  title: "Smart Home Products Showcase 2026",
  description: "Explore the latest smart home innovations...",
  status: "live",
  category: "Smart Home",
  scheduledAt: new Date("2026-02-13T01:23:00Z"),
  duration: 90,
  max_participants: 50,
  current_participants: 4,
  factories_count: 2,
  buyers_count: 2,
  agora_channel_name: "smart-home-showcase-2026",
  agora_token: null,
}
```

### Factory Mock 数据

```typescript
{
  id: 1,
  name: "Shenzhen Electronics Co.",
  location: "Shenzhen, Guangdong, China",
  category: "Electronics & Smart Home",
  status: "verified",
  overallScore: 92,
  qualityScore: 95,
  deliveryScore: 90,
  communicationScore: 88,
  pricingScore: 93,
  complianceScore: 91,
  employees: "200-500",
  annualRevenue: "$5M - $10M",
  established: "2015",
  certifications: ["ISO 9001", "ISO 14001", "CE", "FCC", "RoHS"],
  specialties: ["LED Controllers", "Smart Switches", "IoT Sensors"],
}
```

---

**文档结束**

此文档将随项目开发进度持续更新。如有疑问或建议，请联系开发团队。
