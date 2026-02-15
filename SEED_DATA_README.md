# 种子数据脚本说明

## 概述

`scripts/seed-db.mjs` 是为开发和测试环境创建样本数据的脚本。

## 创建的数据

### 1. 测试用户 (3个)
- **工厂用户 1**: factory1@example.com (Advanced Electronics Manufacturing)
- **工厂用户 2**: factory2@example.com (Precision Metal Works)
- **买家用户 1**: buyer1@example.com

### 2. 工厂信息 (2个)
- **Advanced Electronics Manufacturing**
  - 类别: Electronics
  - 员工: 500人
  - 背景评分: 85
  - 认证: ISO9001, ISO14001, IATF16949

- **Precision Metal Works**
  - 类别: Machinery
  - 员工: 300人
  - 背景评分: 78
  - 认证: ISO9001, ISO45001

### 3. Webinar 活动 (3个)
- **New PCB Assembly Solutions 2026** (已安排)
  - 时长: 60分钟
  - 状态: scheduled
  - 最大参会人数: 500

- **Precision Metal Machining Capabilities** (已安排)
  - 时长: 45分钟
  - 状态: scheduled
  - 最大参会人数: 300
  - 需要审核

- **Advanced Electronics - Product Showcase** (已完成)
  - 时长: 60分钟
  - 状态: completed
  - 最大参会人数: 500

### 4. 参会者记录 (3条)
- 买家用户已注册参加前两个 Webinar
- 买家用户已参加第三个 Webinar

### 5. 聊天记录 (2条)
- 买家和工厂之间的对话示例

## 使用方法

### 前置条件
- 数据库已创建并迁移完成
- `.env` 文件已配置数据库连接信息

### 运行脚本

```bash
# 方法1: 使用 node
node scripts/seed-db.mjs

# 方法2: 使用 npm
npm run seed

# 方法3: 使用 pnpm
pnpm seed
```

### 配置环境变量

确保 `.env` 文件中包含以下配置：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=realsourcing
```

## 注意事项

1. **幂等性**: 脚本使用 `INSERT IGNORE` 避免重复插入
2. **时间戳**: 使用相对时间（相对于当前时间）创建数据
3. **JSON 字段**: 某些字段（如 `tags`, `certifications`）存储为 JSON 字符串
4. **关系完整性**: 所有外键关系都已正确配置

## 数据清理

如果需要清理所有种子数据，可以运行：

```bash
# 删除所有数据（谨慎使用！）
mysql -u root -p realsourcing < scripts/clean-db.sql
```

## 扩展脚本

如需添加更多测试数据，可以：

1. 修改 `seed-db.mjs` 中的数据数组
2. 添加新的数据类型（如报告、评价等）
3. 运行脚本重新生成数据

## 常见问题

### Q: 脚本运行失败，显示"连接被拒绝"
A: 检查数据库是否运行，以及 `.env` 中的连接信息是否正确

### Q: 某些数据没有被插入
A: 检查数据库表是否存在，运行 `pnpm db:push` 进行迁移

### Q: 如何修改测试数据
A: 编辑 `seed-db.mjs` 中的数据数组，然后重新运行脚本

## 相关文件

- `drizzle/schema.ts` - 数据库 schema 定义
- `.env` - 环境变量配置
- `package.json` - npm 脚本配置
