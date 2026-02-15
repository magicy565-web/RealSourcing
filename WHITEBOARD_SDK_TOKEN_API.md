# 声网互动白板 SDK Token 生成 API

## API 端点
```
POST https://api.netless.link/v5/tokens/teams
```

## 请求头
- `region`: 指定数据中心（必需）
  - `cn-hz`: 中国杭州（覆盖中国大陆）
  - `us-sv`: 美国硅谷（覆盖北美、南美）
  - `sg`: 新加坡（覆盖东亚、东南亚）
  - `in-mum`: 印度孟买
  - `eu`: 欧洲（法兰克福）

## 请求体 (application/json)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `accessKey` | string | ✓ | Access Key (AK)，从声网控制台获取 |
| `secretAccessKey` | string | ✓ | Secret Access Key (SK)，从声网控制台获取 |
| `lifespan` | integer | ✓ | Token 有效时间（毫秒），设为 0 表示永久有效 |
| `role` | string | ✓ | 权限角色：`admin`、`writer`、`reader` |

## 响应

### 成功响应 (201)
```json
{
  "token": "生成的SDK Token字符串"
}
```

### 错误响应
- 返回非 201 状态码表示失败
- 参考响应状态码文档了解具体原因

## 权限角色说明

| 角色 | 权限 |
|------|------|
| `admin` | 管理员权限，可以创建和管理房间 |
| `writer` | 写入权限，可以编辑白板内容 |
| `reader` | 读取权限，只能查看白板内容 |

## cURL 示例

```bash
curl --request POST \
  --url https://api.netless.link/v5/tokens/teams \
  --header 'region: cn-hz' \
  --data '{
    "accessKey": "BUxxxxxxrc",
    "secretAccessKey": "CxxxxxxxauY3",
    "lifespan": 3600000,
    "role": "admin"
  }'
```

## 后端实现要点

1. **安全性**: AK 和 SK 必须存储在后端环境变量中，不能暴露给前端
2. **Token 有效期**: 建议设置合理的有效期（如 1 小时 = 3600000 毫秒）
3. **区域选择**: 根据用户位置选择合适的数据中心
4. **错误处理**: 需要处理 API 调用失败的情况

## 与其他 Token 的区别

- **SDK Token**: 用于初始化 SDK，权限范围较广
- **Room Token**: 用于加入特定房间，权限范围受限
- **Task Token**: 用于文档转换等特定任务

## 后端 API 设计

应该在后端创建一个 tRPC 过程来生成 SDK Token：

```typescript
export const agoraRouter = router({
  whiteboard: router({
    generateSdkToken: protectedProcedure
      .input(z.object({
        role: z.enum(['admin', 'writer', 'reader']),
        lifespan: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // 调用声网 API 生成 SDK Token
        // 返回 token 给前端
      }),
  }),
});
```
