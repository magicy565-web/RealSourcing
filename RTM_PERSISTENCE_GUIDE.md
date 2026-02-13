# RTM 消息持久化实现指南

## 概述

本文档详细说明了 RealSourcing 项目中 RTM（实时消息）持久化功能的实现细节，包括数据库设计、API 接口、前端集成和使用方法。

## 功能特性

### 已实现功能

1. **消息持久化**
   - 私聊消息自动保存到数据库
   - 频道消息自动保存到数据库
   - 支持文本、图片、文件三种消息类型

2. **会话管理**
   - 自动创建和更新会话列表
   - 会话置顶功能
   - 会话免打扰功能
   - 未读消息计数

3. **消息历史**
   - 加载历史消息记录
   - 消息已读状态追踪
   - 消息时间戳显示

4. **UI 集成**
   - 独立的消息中心页面 (`/messages`)
   - 会话列表组件
   - 私聊组件增强
   - 快捷私聊按钮
   - 未读消息徽章

## 数据库设计

### rtm_messages 表

存储所有 RTM 消息的详细信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| senderId | INT | 发送者用户 ID |
| receiverId | INT | 接收者用户 ID（私聊） |
| channelName | VARCHAR(255) | 频道名称（频道消息） |
| messageType | ENUM | 消息类型：private/channel |
| contentType | ENUM | 内容类型：text/image/file |
| content | TEXT | 消息内容 |
| metadata | JSON | 附加元数据 |
| isRead | INT | 是否已读（0/1） |
| readAt | TIMESTAMP | 已读时间 |
| createdAt | TIMESTAMP | 创建时间 |

### rtm_conversations 表

存储用户的会话列表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户 ID |
| targetUserId | INT | 对方用户 ID（私聊） |
| channelName | VARCHAR(255) | 频道名称（频道会话） |
| conversationType | ENUM | 会话类型：private/channel |
| lastMessageId | INT | 最后一条消息 ID |
| lastMessageContent | TEXT | 最后一条消息内容 |
| lastMessageAt | TIMESTAMP | 最后消息时间 |
| unreadCount | INT | 未读消息数 |
| isPinned | INT | 是否置顶（0/1） |
| isMuted | INT | 是否免打扰（0/1） |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

## API 接口

### tRPC 路由：`rtm`

所有 RTM 相关的 API 都在 `server/routers/rtm.router.ts` 中定义。

#### 1. 保存消息

```typescript
trpc.rtm.saveMessage.useMutation()
```

**输入参数：**
```typescript
{
  senderId: number;
  receiverId?: number;
  channelName?: string;
  messageType: "private" | "channel";
  contentType: "text" | "image" | "file";
  content: string;
  metadata?: Record<string, unknown>;
}
```

**返回：**
```typescript
{ messageId: number }
```

#### 2. 获取私聊消息历史

```typescript
trpc.rtm.getPrivateMessages.useQuery()
```

**输入参数：**
```typescript
{
  userId1: number;
  userId2: number;
  limit?: number; // 默认 50
}
```

**返回：** 消息数组（时间正序）

#### 3. 获取频道消息历史

```typescript
trpc.rtm.getChannelMessages.useQuery()
```

**输入参数：**
```typescript
{
  channelName: string;
  limit?: number; // 默认 50
}
```

#### 4. 标记消息为已读

```typescript
trpc.rtm.markAsRead.useMutation()
```

**输入参数：**
```typescript
{
  userId: number;
  senderId: number;
}
```

#### 5. 获取未读消息数

```typescript
trpc.rtm.getUnreadCount.useQuery()
```

**输入参数：**
```typescript
{
  userId: number;
  senderId?: number; // 可选，指定发送者
}
```

**返回：**
```typescript
{ count: number }
```

#### 6. 获取会话列表

```typescript
trpc.rtm.getConversations.useQuery()
```

**输入参数：**
```typescript
{
  userId: number;
}
```

**返回：** 会话数组（按置顶和时间排序）

#### 7. 置顶/取消置顶会话

```typescript
trpc.rtm.togglePin.useMutation()
```

**输入参数：**
```typescript
{
  conversationId: number;
}
```

#### 8. 免打扰/取消免打扰

```typescript
trpc.rtm.toggleMute.useMutation()
```

**输入参数：**
```typescript
{
  conversationId: number;
}
```

## 前端组件

### 1. ConversationList

会话列表组件，显示所有会话并支持搜索、置顶、免打扰。

**使用示例：**
```tsx
import ConversationList from "@/components/ConversationList";

<ConversationList
  userId={user.id}
  onSelectConversation={setSelectedConversation}
  selectedConversationId={selectedConversation?.id}
/>
```

### 2. PrivateChat（增强版）

私聊组件，已集成消息持久化和历史记录加载。

**使用示例：**
```tsx
import PrivateChat from "@/components/PrivateChat";

<PrivateChat
  currentUserId={user.id.toString()}
  targetUserId={targetUser.id.toString()}
  targetUserName={targetUser.name}
  appId={AGORA_APP_ID}
  onClose={() => setOpen(false)}
/>
```

### 3. QuickChatButton

快捷私聊按钮，可在任何页面快速打开私聊对话框。

**使用示例：**
```tsx
import QuickChatButton from "@/components/QuickChatButton";

<QuickChatButton
  currentUserId={user.id.toString()}
  targetUserId={factory.id.toString()}
  targetUserName={factory.name}
  appId={AGORA_APP_ID}
  variant="outline"
  size="sm"
/>
```

### 4. UnreadBadge

未读消息徽章，自动显示未读数量。

**使用示例：**
```tsx
import UnreadBadge from "@/components/UnreadBadge";

<div className="relative">
  <MessageSquareIcon />
  <UnreadBadge userId={user.id} />
</div>
```

## 页面路由

### /messages

独立的消息中心页面，包含会话列表和聊天窗口。

**访问方式：**
- 侧边栏导航：Dashboard → Messages
- 直接访问：`http://localhost:5000/messages`

## 数据库迁移

在首次部署或更新时，需要运行数据库迁移脚本：

```bash
# 方式 1: 使用 Drizzle Kit
pnpm db:push

# 方式 2: 手动执行 SQL
mysql -u username -p database_name < drizzle/migrations/add_rtm_tables.sql
```

## 环境变量

确保 `.env` 文件中配置了以下变量：

```env
# Agora RTM
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# Database
DATABASE_URL=mysql://user:password@localhost:3306/realsourcing
```

## 使用流程

### 1. 发送私聊消息

当用户在 `PrivateChat` 组件中发送消息时：

1. 消息通过 Agora RTM SDK 实时发送
2. 同时调用 `trpc.rtm.saveMessage` 保存到数据库
3. 自动更新发送者和接收者的会话列表
4. 接收者的未读计数 +1

### 2. 查看消息历史

当用户打开私聊窗口时：

1. 组件自动调用 `trpc.rtm.getPrivateMessages` 加载历史消息
2. 历史消息显示在聊天窗口中
3. 自动调用 `trpc.rtm.markAsRead` 标记消息为已读
4. 未读计数清零

### 3. 管理会话

在会话列表中：

1. 点击会话打开聊天窗口
2. 点击置顶图标置顶/取消置顶会话
3. 点击免打扰图标开启/关闭免打扰
4. 使用搜索框快速查找会话

## 性能优化建议

1. **消息分页加载**
   - 当前默认加载最近 50 条消息
   - 可实现滚动加载更多历史消息

2. **实时更新优化**
   - 会话列表每 5 秒自动刷新
   - 未读徽章每 5 秒自动刷新
   - 可考虑使用 WebSocket 推送实现真正的实时更新

3. **数据库索引**
   - 已在关键字段上创建索引
   - 定期清理过期消息以保持性能

## 后续开发建议

1. **消息撤回功能**
   - 添加 `isDeleted` 字段
   - 实现撤回 API 和 UI

2. **消息搜索**
   - 全文搜索消息内容
   - 按时间范围筛选

3. **群聊支持**
   - 扩展 `channelName` 支持群聊
   - 群成员管理

4. **富文本消息**
   - 支持 Markdown 格式
   - 支持 @ 提及

5. **消息推送**
   - 集成浏览器通知 API
   - 邮件/短信通知

## 故障排查

### 问题：消息发送成功但未保存到数据库

**可能原因：**
- 数据库连接失败
- `saveMessage` mutation 调用失败

**解决方案：**
1. 检查浏览器控制台错误
2. 检查服务器日志
3. 验证数据库连接字符串

### 问题：历史消息加载失败

**可能原因：**
- `userId` 参数类型错误（应为 number）
- 数据库查询权限问题

**解决方案：**
1. 确保 `parseInt()` 正确转换 userId
2. 检查数据库用户权限

### 问题：未读计数不准确

**可能原因：**
- 会话更新逻辑错误
- 已读标记未正确执行

**解决方案：**
1. 检查 `upsertConversation` 函数逻辑
2. 验证 `markAsRead` 是否被正确调用

## 总结

RTM 消息持久化功能已完整集成到 RealSourcing 项目中，提供了完善的消息存储、历史记录、会话管理和 UI 组件。开发者可以基于此功能继续扩展更多高级特性。
