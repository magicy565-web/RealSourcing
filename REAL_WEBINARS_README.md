# RealSourcing 真实 B2B Webinar 数据集成指南

**版本**: 1.0  
**创建日期**: 2026-02-16  
**作者**: Manus AI

---

## 1. 概述

本文档旨在详细说明如何将新收集的 **8 个真实 B2B Webinar 活动** 数据集成到 RealSourcing 平台。该过程涉及将视觉素材上传到阿里云 OSS，并将结构化数据导入阿里云 RDS 数据库。

本次数据注入旨在丰富平台内容，为用户提供真实、有价值的行业活动信息，从而提升平台的专业性和用户粘性。

## 2. 数据统计

本次共收集并处理了 **8** 个即将举办的真实 B2B Webinar 活动。数据导入后，数据库中 `webinars` 表的状态如下：

| 指标 | 数量 |
| :--- | :--- |
| 本次新增 Webinar 数量 | 8 |
| 数据库中已计划的 Webinar 总数 | 23 |
| 关联的视觉素材（封面图） | 9 |

### 新增 Webinar 列表

| 活动标题 | 行业分类 | 活动日期 |
| :--- | :--- | :--- |
| Leading the way for systems change | Apparel & Textiles | 2026-02-17 |
| Powering the digital age: data centres, AI... | Energy | 2026-02-25 |
| Advancing climate-smart crops | Agriculture | 2026-02-26 |
| Unlocking Supply Chain Excellence with Agentic AI | Supply Chain | 2026-02-25 |
| 2026 Global Trade Turning Point | Global Trade | 2026-03-15 |
| Advance: Women in Manufacturing | Manufacturing | 2026-03-05 |
| Fireside Chat with Gartner Expert Suzie Petrusic | Supply Chain Management | 2026-03-17 |
| Cascale Industry Report 2026 | Apparel & Textiles | 2026-03-04 |


## 3. 数据来源与处理

所有活动信息均来自公开渠道，如主办方官网、活动注册平台（Eventbrite）和专业社交网络（LinkedIn）。

### 数据来源 (`webinar_sources.md`)

| # | 活动标题 | 主要来源 | 收集时间 |
| :- | :--- | :--- | :--- |
| 1 | Leading the way for systems change | [Innovation Forum](https://innovationforum.co.uk/) | 2026-02-16 |
| 2 | Powering the digital age | [Innovation Forum](https://innovationforum.co.uk/) | 2026-02-16 |
| 3 | Advancing climate-smart crops | [Innovation Forum](https://innovationforum.co.uk/) | 2026-02-16 |
| 4 | Unlocking Supply Chain Excellence | [Eventbrite](https://www.eventbrite.com/) | 2026-02-16 |
| 5 | 2026 Global Trade Turning Point | [LinkedIn](https://www.linkedin.com/) | 2026-02-16 |
| 6 | Advance: Women in Manufacturing | [Plant.ca](https://www.plant.ca/) | 2026-02-16 |
| 7 | Gartner Supply Chain Webinar | [SupplyChainBrain](https://www.supplychainbrain.com/) | 2026-02-16 |
| 8 | Cascale Industry Report 2026 | [Cascale.org](https://cascale.org/) | 2026-02-16 |

### 数据映射规则

为了将丰富的活动信息适配到现有的 `webinars` 表结构，我们采用了以下映射规则：

- **讲师信息**: 整合到 `description` 字段的开头，使用 Markdown 格式化。
- **主办方与注册链接**: 同样添加到 `description` 字段中，方便前端展示。
- **行业与主题**: `industry` 字段直接映射为 `category`，而详细的 `topics` 则存储在 `tags` JSON 数组中。
- **封面图**: 上传到 OSS 后，URL 存储在 `coverImage` 字段。
- **预告视频**: `recordingUrl` 字段被预留用于存储预告视频的 URL，本次集成暂未包含视频。

## 4. 阿里云 OSS 与 RDS 集成

### 阿里云 OSS 素材上传

所有相关的视觉素材（封面图、讲师照片）已上传至指定的阿里云 OSS Bucket。

- **Bucket**: `demand-os-discord`
- **Endpoint**: `oss-cn-hangzhou.aliyuncs.com`
- **存储路径**: `webinar_assets/`

上传的图片 URL 已在数据库导入脚本中正确引用。详细上传报告请参见 `oss_upload_report.txt`。

![OSS 文件](https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/sustainable_fashion.webp "Sustainable Fashion Webinar Cover")
*图1: 上传到 OSS 的封面图示例*

### 阿里云 RDS 数据导入

结构化的 Webinar 数据已通过 SQL 脚本成功导入到阿里云 RDS 数据库中。

- **数据库**: `realsourcing`
- **目标表**: `webinars`
- **导入脚本**: `insert_webinars.sql`

导入操作已完成，并通过查询验证了数据的完整性。

## 5. 验证与后续步骤

### 如何验证

1.  **Directus 后台**: 登录到 `admin.cnsubcribe.xyz`，导航到 `webinars` 集合，检查是否可以看到新增的 8 个活动记录。
2.  **前端应用**: 启动 RealSourcing 前端应用，检查“行业活动”或相关页面是否正确展示了新的 Webinar，包括标题、描述、封面图和时间。
3.  **API 接口**: 调用获取 Webinar 列表的 API 端点，确认返回的数据中包含了新记录。

### 平台集成建议 (`webinar_integration_guide.md`)

为了在 RealSourcing 平台中最大化这些真实活动数据的价值，建议前端进行如下集成：

1.  **活动卡片展示**: 在活动列表页面，每个 Webinar 应以卡片形式展示，包含 `coverImage`、`title`、`scheduledAt` 和 `category`。
2.  **详情页**: 点击卡片进入详情页，完整展示 `description` 字段内容。由于描述中包含了 Markdown 格式，前端需要进行相应渲染，以清晰展示讲师信息、活动详情和注册链接。
3.  **注册功能**: 将 `description` 中的注册链接渲染为可点击的“立即注册”按钮，引导用户到外部主办方页面完成注册。
4.  **标签过滤**: 利用 `tags` 字段为用户提供按主题筛选活动的功能。
5.  **状态更新**: 后续可开发一个机制，根据 `scheduledAt` 自动将活动状态从 `scheduled` 更新为 `live`，活动结束后更新为 `completed`。

## 6. 交付文件清单

以下是本次任务交付的最终文件，已添加到您的 GitHub 仓库中：

- `/REAL_WEBINARS_README.md`: 本指南。
- `/insert_webinars.sql`: 用于导入数据的 SQL 脚本。
- `/collect_webinar_info.json`: 原始收集的结构化 JSON 数据。
- `/oss_upload_report.txt`: 阿里云 OSS 文件上传报告。
- `/webinar_assets/`: 包含所有下载的视觉素材的目录。

---
