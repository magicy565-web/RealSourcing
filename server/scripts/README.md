# 数据迁移脚本

## migrate-mock-data.ts

将Mock工厂数据迁移到数据库的脚本。

### 在Vercel环境中运行

由于Manus sandbox环境无法直接访问阿里云RDS，您需要在Vercel环境或阿里云服务器上运行此脚本。

#### 方法1: 在Vercel中运行（推荐）

1. 将代码推送到GitHub
2. 在Vercel项目设置中添加环境变量（DATABASE_URL等）
3. 部署后，在Vercel Dashboard中打开"Functions"标签
4. 创建一个临时的API路由来运行迁移：

```typescript
// app/api/migrate/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  // 添加安全检查
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer YOUR_SECRET_TOKEN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { stdout, stderr } = await execAsync('npx tsx server/scripts/migrate-mock-data.ts');
    return new Response(JSON.stringify({ stdout, stderr }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

5. 访问 `https://your-app.vercel.app/api/migrate?token=YOUR_SECRET_TOKEN`

#### 方法2: 在阿里云服务器上运行

1. SSH登录到阿里云服务器（47.99.205.136）
2. 克隆项目：`git clone https://github.com/magicy565-web/RealSourcing.git`
3. 安装依赖：`cd RealSourcing && npm install`
4. 创建.env文件并配置DATABASE_URL
5. 运行迁移：`npx tsx server/scripts/migrate-mock-data.ts`

### 迁移内容

脚本会迁移以下数据：

- **6个工厂**：Shanghai Medical Tech, Shenzhen Electronics, Guangzhou Smart Home, Dongguan Manufacturing, Foshan Furniture, Ningbo Textile
- **每个工厂包含**：
  - 基本信息（名称、位置、分类、联系方式等）
  - 评分数据（总分、质量、交付、沟通、价格、合规）
  - 统计数据（订单数、评价数、浏览数）
  - 认证信息（ISO、CE、FDA等）
  - 产品/工厂图片（3-4张）

### 注意事项

1. **清空现有数据**：脚本会先清空现有的工厂数据，请谨慎使用
2. **数据库连接**：确保DATABASE_URL正确配置
3. **白名单**：确保运行环境的IP在RDS白名单中
4. **执行时间**：迁移大约需要10-30秒

### 验证迁移结果

迁移完成后，您可以通过以下方式验证：

1. 登录MySQL查看数据：
```bash
mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com -u magicyang -p
use realsourcing;
SELECT COUNT(*) FROM factories;
SELECT COUNT(*) FROM factory_images;
SELECT COUNT(*) FROM factory_certifications;
```

2. 访问前端页面：https://real-sourcing.vercel.app/factories

### 故障排除

**问题1**: Connection lost: The server closed the connection
- 原因：IP不在RDS白名单中
- 解决：在阿里云RDS控制台添加IP到白名单

**问题2**: Database not available
- 原因：DATABASE_URL未配置或格式错误
- 解决：检查.env文件或Vercel环境变量

**问题3**: Table 'factory_images' doesn't exist
- 原因：数据库表未创建
- 解决：运行 `drizzle-kit push:mysql` 或手动执行 `drizzle/0003_add_factory_images.sql`
