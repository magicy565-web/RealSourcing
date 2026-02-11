# RealSourcing v0.5 本地调试指南

为了方便您在 VSCode 中进行本地化调试，我已经对项目进行了针对性优化，解决了 CORS 拦截和视频通话 Token 校验的问题。

## 🚀 快速启动

1.  **安装依赖**：
    ```bash
    pnpm install
    ```

2.  **配置环境变量**：
    确保根目录下存在 `.env` 文件（我已经为您创建并配置好了 Agora 和 Nova AI 的 Key）。

3.  **启动开发服务器**：
    ```bash
    pnpm dev
    ```

## 🛠 核心优化说明

### 1. 解决 CORS 问题 (Mock Fallback)
由于 `admin.cnsubscribe.xyz` 默认开启了跨域保护，如果您在本地运行前端时遇到 `Failed to fetch` 报错，系统会**自动切换到本地 Mock 数据模式**。
- **涉及文件**：`client/src/lib/directus.ts`
- **效果**：即使不配置 Directus CORS，您也能看到完整的 Dashboard、工厂列表和 Webinar 数据，确保 UI 调试不中断。

### 2. 解决 Agora 视频通话问题 (Token Server)
由于您的声网项目开启了安全模式，加入频道必须使用 Token。我已经在后端集成了 Token 生成器。
- **涉及文件**：`server/lib/agora-token.ts` 和 `server/routers.ts`
- **原理**：前端在加入会议室前，会请求本地后端生成的动态 Token。
- **注意**：请确保 `.env` 中的 `AGORA_APP_ID` 和 `AGORA_APP_CERTIFICATE` 正确无误。

### 3. 视觉风格 (WorkTrial Style)
项目已深度还原了 WorkTrial 的冷淡科技感：
- 背景色：`#0A0A0A`
- 边框色：`#262626`
- 字体：`font-light` 排版

## 📂 关键路径参考
- **Webinar 创建**：`client/src/pages/CreateWebinar.tsx` (已恢复并优化了原始的三步流程设计)
- **实时会议室**：`client/src/pages/NegotiationRoom.tsx` (集成了视频、雷达图和 AI 洞察)
- **AI 服务集成**：`client/src/lib/ai.ts` (已集成 Nova AI)

如果您在调试过程中遇到任何问题，请随时告知！
