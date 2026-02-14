# RealSourcing 数据库部署完整指南

> **版本**: v2.0  
> **更新日期**: 2026年2月14日  
> **适用环境**: 开发环境、测试环境、生产环境

---

## 📋 目录

1. [快速开始](#快速开始)
2. [部署工具说明](#部署工具说明)
3. [开发环境部署](#开发环境部署)
4. [生产环境部署](#生产环境部署)
5. [数据库维护](#数据库维护)
6. [故障排查](#故障排查)
7. [最佳实践](#最佳实践)

---

## 快速开始

### 一键部署（推荐）

```bash
# 1. 克隆代码
git clone https://github.com/magicy565-web/RealSourcing.git
cd RealSourcing

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息

# 3. 执行一键部署
./scripts/deploy-db.sh development
```

### 手动部署

```bash
# 1. 安装依赖
pnpm install

# 2. 初始化数据库
npx tsx scripts/db-init.ts

# 3. 验证部署
npx tsx scripts/db-verify.ts
```

---

## 部署工具说明

### 工具列表

| 工具 | 说明 | 使用场景 |
|------|------|----------|
| `deploy-db.sh` | 一键部署脚本 | 完整的数据库部署流程 |
| `db-init.ts` | 数据库初始化 | 创建数据库并执行迁移 |
| `db-migrate.ts` | 数据库迁移 | 执行 SQL 迁移脚本 |
| `db-verify.ts` | 部署验证 | 验证数据库部署是否成功 |
| `db-backup.ts` | 数据库备份 | 备份数据库到本地文件 |
| `db-rollback.ts` | 数据库回滚 | 从备份恢复数据库 |

### 工具依赖

```json
{
  "mysql2": "^3.x",
  "dotenv": "^16.x",
  "tsx": "^4.x"
}
```

---

## 开发环境部署

### 前提条件

1. **MySQL 服务器** (5.7+ 或 8.0+)
2. **Node.js** (18+ 或 20+)
3. **pnpm** (推荐) 或 npm

### 步骤 1: 安装 MySQL

#### macOS (使用 Homebrew)

```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

#### Windows

下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

### 步骤 2: 创建数据库用户

```bash
mysql -u root -p
```

```sql
-- 创建数据库用户
CREATE USER 'realsourcing'@'localhost' IDENTIFIED BY 'your_password';

-- 授予权限
GRANT ALL PRIVILEGES ON realsourcing.* TO 'realsourcing'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 步骤 3: 配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件
nano .env
```

修改数据库连接字符串：

```env
DATABASE_URL=mysql://realsourcing:your_password@localhost:3306/realsourcing
```

### 步骤 4: 执行部署

```bash
# 方式 1: 使用一键部署脚本（推荐）
./scripts/deploy-db.sh development

# 方式 2: 手动执行
npx tsx scripts/db-init.ts
npx tsx scripts/db-verify.ts
```

### 步骤 5: 验证部署

```bash
# 检查数据库表
mysql -u realsourcing -p realsourcing -e "SHOW TABLES;"

# 检查订阅计划
mysql -u realsourcing -p realsourcing -e "SELECT * FROM subscription_plans;"

# 运行验证脚本
npx tsx scripts/db-verify.ts
```

---

## 生产环境部署

### 前提条件

1. **生产级 MySQL 服务器** (推荐 MySQL 8.0+)
2. **备份策略** (自动备份)
3. **监控系统** (可选但推荐)

### 步骤 1: 准备生产环境配置

```bash
# 复制生产环境配置模板
cp .env.production.example .env.production

# 编辑配置文件
nano .env.production
```

**重要配置项**:

```env
# 数据库配置
DATABASE_URL=mysql://username:password@production-db-host:3306/realsourcing

# 应用配置
NODE_ENV=production
APP_URL=https://www.realsourcing.com

# 安全配置（务必修改）
JWT_SECRET=production_jwt_secret_key_change_this
SESSION_SECRET=production_session_secret_key_change_this

# 日志配置
LOG_LEVEL=warn
LOG_FILE=/var/log/realsourcing/app.log
```

### 步骤 2: 数据库服务器配置

#### MySQL 配置优化 (`/etc/mysql/my.cnf`)

```ini
[mysqld]
# 基础配置
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-time-zone='+08:00'

# 性能优化
max_connections=500
innodb_buffer_pool_size=2G
innodb_log_file_size=512M
innodb_flush_log_at_trx_commit=2

# 慢查询日志
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2

# 二进制日志（用于备份和恢复）
log_bin=/var/log/mysql/mysql-bin.log
binlog_format=ROW
expire_logs_days=7
```

重启 MySQL:

```bash
sudo systemctl restart mysql
```

### 步骤 3: 执行生产环境部署

```bash
# 1. 备份现有数据库（如果有）
npx tsx scripts/db-backup.ts

# 2. 执行部署
./scripts/deploy-db.sh production

# 3. 验证部署
npx tsx scripts/db-verify.ts
```

### 步骤 4: 设置自动备份

#### 创建备份脚本 (`/usr/local/bin/backup-realsourcing-db.sh`)

```bash
#!/bin/bash
cd /path/to/realsourcing
npx tsx scripts/db-backup.ts
```

#### 设置 Cron 任务

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /usr/local/bin/backup-realsourcing-db.sh >> /var/log/realsourcing/backup.log 2>&1
```

### 步骤 5: 设置监控

#### 使用 Prometheus + Grafana（可选）

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
```

#### 使用 MySQL Exporter

```bash
# 安装 MySQL Exporter
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.14.0/mysqld_exporter-0.14.0.linux-amd64.tar.gz
tar xvf mysqld_exporter-0.14.0.linux-amd64.tar.gz
cd mysqld_exporter-0.14.0.linux-amd64

# 创建配置文件
cat > .my.cnf << EOF
[client]
user=exporter
password=exporter_password
EOF

# 启动 Exporter
./mysqld_exporter --config.my-cnf=.my.cnf &
```

---

## 数据库维护

### 日常备份

```bash
# 手动备份
npx tsx scripts/db-backup.ts

# 查看备份列表
ls -lh backups/
```

### 数据库回滚

```bash
# 交互式回滚（会列出所有备份）
npx tsx scripts/db-rollback.ts

# 按提示选择要回滚的备份
```

### 数据库迁移

```bash
# 执行新的迁移
npx tsx scripts/db-migrate.ts

# 查看迁移历史
mysql -u root -p realsourcing -e "SELECT * FROM _migrations;"
```

### 数据库优化

```bash
# 分析表
mysql -u root -p realsourcing -e "ANALYZE TABLE users, factories, orders;"

# 优化表
mysql -u root -p realsourcing -e "OPTIMIZE TABLE users, factories, orders;"

# 检查表
mysql -u root -p realsourcing -e "CHECK TABLE users, factories, orders;"
```

### 清理旧数据

```sql
-- 删除 90 天前的审计日志
DELETE FROM audit_logs WHERE createdAt < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 删除已取消的过期订阅
DELETE FROM subscriptions 
WHERE status = 'cancelled' 
AND updatedAt < DATE_SUB(NOW(), INTERVAL 180 DAY);
```

---

## 故障排查

### 问题 1: 数据库连接失败

**错误信息**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**:

1. 检查 MySQL 服务是否运行:
   ```bash
   sudo systemctl status mysql
   ```

2. 检查数据库连接字符串:
   ```bash
   echo $DATABASE_URL
   ```

3. 测试连接:
   ```bash
   mysql -h localhost -u realsourcing -p
   ```

### 问题 2: 迁移失败

**错误信息**:
```
Error: Table 'users' already exists
```

**解决方案**:

1. 检查迁移记录:
   ```bash
   mysql -u root -p realsourcing -e "SELECT * FROM _migrations;"
   ```

2. 手动标记迁移为已执行:
   ```sql
   INSERT INTO _migrations (filename) VALUES ('001_complete_database_schema.sql');
   ```

### 问题 3: 权限不足

**错误信息**:
```
Error: Access denied for user 'realsourcing'@'localhost'
```

**解决方案**:

```sql
-- 重新授予权限
GRANT ALL PRIVILEGES ON realsourcing.* TO 'realsourcing'@'localhost';
FLUSH PRIVILEGES;
```

### 问题 4: 字符集问题

**错误信息**:
```
Error: Incorrect string value
```

**解决方案**:

```sql
-- 修改数据库字符集
ALTER DATABASE realsourcing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题 5: 磁盘空间不足

**检查磁盘空间**:

```bash
df -h
du -sh /var/lib/mysql
```

**清理方案**:

1. 清理旧的二进制日志:
   ```sql
   PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);
   ```

2. 清理旧备份:
   ```bash
   find backups/ -name "*.sql" -mtime +30 -delete
   ```

---

## 最佳实践

### 1. 安全性

- ✅ 使用强密码
- ✅ 限制数据库用户权限
- ✅ 启用 SSL 连接（生产环境）
- ✅ 定期更新 MySQL 版本
- ✅ 使用环境变量存储敏感信息

### 2. 性能优化

- ✅ 合理设置 `innodb_buffer_pool_size`
- ✅ 使用索引优化查询
- ✅ 定期分析和优化表
- ✅ 使用连接池
- ✅ 监控慢查询

### 3. 备份策略

- ✅ 每天自动备份
- ✅ 保留至少 30 天的备份
- ✅ 定期测试备份恢复
- ✅ 异地备份（生产环境）
- ✅ 备份前验证数据完整性

### 4. 监控

- ✅ 监控数据库连接数
- ✅ 监控慢查询
- ✅ 监控磁盘空间
- ✅ 监控复制延迟（如果使用主从复制）
- ✅ 设置告警阈值

### 5. 文档化

- ✅ 记录所有数据库变更
- ✅ 维护迁移脚本版本
- ✅ 记录故障处理过程
- ✅ 更新部署文档

---

## 附录

### A. 数据库表列表

```
users                    # 用户表
user_profiles            # 用户资料表
factories                # 工厂表
factory_certifications   # 工厂认证表
factory_products         # 工厂产品表
webinars                 # 会议表
webinar_participants     # 会议参与者表
rfqs                     # 询价单表
quotations               # 报价单表
orders                   # 订单表
order_items              # 订单项表
subscription_plans       # 订阅计划表
subscriptions            # 用户订阅表
payment_orders           # 支付订单表
invoices                 # 发票表
usage_records            # 使用量记录表
notifications            # 通知表
factory_reviews          # 工厂评价表
audit_logs               # 审计日志表
system_settings          # 系统设置表
rtm_conversations        # RTM 会话表
rtm_messages             # RTM 消息表
_migrations              # 迁移记录表
```

### B. 常用命令

```bash
# 查看数据库大小
mysql -u root -p -e "
  SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
  FROM information_schema.tables
  WHERE table_schema = 'realsourcing'
  GROUP BY table_schema;
"

# 查看表大小
mysql -u root -p realsourcing -e "
  SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
  FROM information_schema.tables
  WHERE table_schema = 'realsourcing'
  ORDER BY (data_length + index_length) DESC;
"

# 查看活动连接
mysql -u root -p -e "SHOW PROCESSLIST;"

# 查看数据库状态
mysql -u root -p -e "SHOW STATUS;"
```

### C. 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `mysql://user:pass@host:3306/db` |
| `NODE_ENV` | 应用环境 | `development` / `production` |
| `LOG_LEVEL` | 日志级别 | `debug` / `info` / `warn` / `error` |

---

## 联系支持

如有问题，请通过以下方式联系：

- **GitHub Issues**: https://github.com/magicy565-web/RealSourcing/issues
- **文档**: 查看项目根目录下的其他文档

---

**文档版本**: v2.0  
**最后更新**: 2026年2月14日  
**维护者**: RealSourcing 开发团队
