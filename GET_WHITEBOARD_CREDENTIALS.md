# 获取声网互动白板安全密钥（AK 和 SK）

## 📋 完整步骤

### 第1步：登录声网控制台
1. 访问 [声网控制台](https://console.agora.io)
2. 如果是第一次使用，点击 **注册账号** 进行注册
3. 如果已有账号，直接 **登录**

### 第2步：创建或选择项目
1. 在控制台左上角下拉框，点击 **创建项目**
2. 选择 **项目类型**：**通用项目**
3. 输入 **项目名称**
4. 选择 **场景标签** 和 **鉴权机制**（推荐选择 **安全模式**）

### 第3步：开启互动白板服务
1. 登录声网控制台
2. 在页面左上角下拉框选择需要开通互动白板服务的项目
3. 在左侧导航栏依次访问：**全部产品** → **拓展能力** → **互动白板**
4. 进入 **功能配置**，点击 **状态** 按钮启用互动白板服务
5. 启用后会看到互动白板已成功开启

### 第4步：获取安全密钥
1. 在声网控制台左侧导航栏依次访问：**全部产品** → **拓展能力** → **互动白板**
2. 在互动白板的 **功能配置** → **基本信息** 中，可以看到以下信息：
   - **AppIdentifier**（App ID）- 项目的唯一标识
   - **AK**（Access Key）- 访问密钥
   - **SK**（Secret Key）- 私有访问密钥
   - **sdkToken** - 声网生成的SDK Token（测试用）

3. 点击右侧按钮分别复制：
   - AppIdentifier
   - AK
   - SK

4. 将这些密钥保存到安全的位置

### 第5步：配置环境变量
将获取到的密钥配置到 `.env` 文件中：

```env
# Agora Interactive Whiteboard
WHITEBOARD_AK=你获取的AK
WHITEBOARD_SK=你获取的SK
VITE_WHITEBOARD_APP_ID=你获取的AppIdentifier
```

## ⚠️ 安全建议

根据声网官方建议：

1. **不要将 AK 和 SK 发送给客户端**
   - 只有后端服务器能从配置文件中读取
   - 不要将其写死在代码里

2. **不要将 sdkToken 下发给客户端**
   - 该 Token 权限级别很高
   - 下发给客户端会有泄露风险

3. **定期轮换密钥**
   - 如果怀疑密钥泄露，立即在控制台重新生成

## 📍 数据中心选择

声网互动白板支持五个数据中心：

| 代码 | 位置 | 覆盖区域 |
|------|------|--------|
| `cn-hz` | 中国杭州 | 中国大陆及其他未覆盖区域 |
| `us-sv` | 美国硅谷 | 北美洲、南美洲 |
| `sg` | 新加坡 | 新加坡、东亚、东南亚 |
| `in-mum` | 印度孟买 | 印度 |
| `eu` | 欧洲（法兰克福） | 欧洲 |

## 🔗 相关文档

- [声网控制台](https://console.agora.io)
- [互动白板文档](https://doc.shengwang.cn/doc/whiteboard)
- [生成 SDK Token API](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-teams)
- [生成 Room Token API](https://doc.shengwang.cn/doc/whiteboard/restful/fastboard-sdk/restful-wb/operations/post-v5-tokens-rooms)
