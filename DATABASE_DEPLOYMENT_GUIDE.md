# RealSourcing 数据库部署指南

**版本**: v1.0  
**日期**: 2026-02-13  
**适用环境**: 开发/测试/生产

---

## 📋 目录

1. [环境要求](#环境要求)
2. [快速开始](#快速开始)
3. [生产环境部署](#生产环境部署)
4. [数据库迁移](#数据库迁移)
5. [性能优化](#性能优化)
6. [备份与恢复](#备份与恢复)
7. [监控与维护](#监控与维护)
8. [故障排查](#故障排查)

---

## 环境要求

### 数据库服务器

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| MySQL 版本 | 8.0+ | 8.0.32+ |
| CPU | 2 核 | 4 核+ |
| 内存 | 4 GB | 8 GB+ |
| 存储 | 50 GB SSD | 200 GB+ SSD |
| 网络 | 100 Mbps | 1 Gbps |

### 操作系统

- **推荐**: Ubuntu 22.04 LTS / CentOS 8+
- **支持**: macOS (开发环境) / Windows (开发环境)

### 依赖工具

```bash
- mysql-client >= 8.0
- drizzle-kit >= 0.20.0
- Node.js >= 18.0
- pnpm >= 8.0
```

---

## 快速开始

### 1. 安装 MySQL 8.0

#### Ubuntu/Debian

```bash
# 更新软件源
sudo apt update

# 安装 MySQL Server
sudo apt install mysql-server -y

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

#### macOS

```bash
# 使用 Homebrew 安装
brew install mysql@8.0

# 启动服务
brew services start mysql@8.0
```

### 2. 创建数据库和用户

```bash
# 登录 MySQL
sudo mysql -u root -p
```

```sql
-- 创建数据库
CREATE DATABASE realsourcing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建应用用户
CREATE USER 'realsourcing_app'@'localhost' IDENTIFIED BY 'your_strong_password';

-- 授予权限
GRANT SELECT, INSERT, UPDATE, DELETE ON realsourcing.* TO 'realsourcing_app'@'localhost';

-- 创建管理员用户
CREATE USER 'realsourcing_admin'@'localhost' IDENTIFIED BY 'your_admin_password';
GRANT ALL PRIVILEGES ON realsourcing.* TO 'realsourcing_admin'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL=mysql://realsourcing_app:your_strong_password@localhost:3306/realsourcing

# 管理员连接（用于迁移）
DATABASE_ADMIN_URL=mysql://realsourcing_admin:your_admin_password@localhost:3306/realsourcing
```

### 4. 运行数据库迁移

#### 方式 1: 使用 Drizzle Kit（推荐）

```bash
# 安装依赖
pnpm install

# 生成迁移文件（如果需要）
pnpm db:generate

# 执行迁移
pnpm db:push
```

#### 方式 2: 手动执行 SQL

```bash
# 执行完整数据库架构
mysql -u realsourcing_admin -p realsourcing < drizzle/migrations/001_complete_database_schema.sql

# 初始化订阅计划数据
mysql -u realsourcing_admin -p realsourcing < drizzle/migrations/002_seed_subscription_plans.sql
```

### 5. 验证安装

```bash
# 连接数据库
mysql -u realsourcing_app -p realsourcing

# 查看所有表
SHOW TABLES;

# 查看订阅计划
SELECT * FROM subscription_plans;

# 退出
EXIT;
```

---

## 生产环境部署

### 1. 云数据库选择

#### AWS RDS

```bash
# 创建 RDS MySQL 实例
aws rds create-db-instance \
  --db-instance-identifier realsourcing-prod \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --engine-version 8.0.32 \
  --master-username admin \
  --master-user-password YourStrongPassword \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible false
```

#### Alibaba Cloud RDS

```bash
# 通过阿里云控制台创建 RDS MySQL 实例
# 推荐配置:
# - 实例规格: rds.mysql.s3.large (2核4GB)
# - 存储空间: 100GB SSD
# - 数据库版本: MySQL 8.0
# - 可用区: 多可用区部署
# - 备份策略: 每日自动备份，保留7天
```

### 2. 网络安全配置

#### 防火墙规则

```bash
# 仅允许应用服务器访问数据库
# AWS Security Group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 3306 \
  --source-group sg-app-servers

# 阿里云安全组
# 在控制台配置入方向规则:
# - 协议: TCP
# - 端口: 3306
# - 授权对象: 应用服务器安全组ID
```

#### SSL/TLS 加密

```sql
-- 启用 SSL 连接
ALTER USER 'realsourcing_app'@'%' REQUIRE SSL;
FLUSH PRIVILEGES;
```

### 3. 性能参数优化

创建 `/etc/mysql/conf.d/realsourcing.cnf`:

```ini
[mysqld]
# 基础配置
max_connections = 500
max_allowed_packet = 64M
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# InnoDB 配置
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# 查询缓存
query_cache_type = 0
query_cache_size = 0

# 慢查询日志
slow_query_log = 1
long_query_time = 1
slow_query_log_file = /var/log/mysql/slow-query.log

# 二进制日志（用于主从复制）
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7

# 时区
default_time_zone = '+08:00'
```

重启 MySQL:

```bash
sudo systemctl restart mysql
```

### 4. 读写分离配置

#### 主库配置

```sql
-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'replication_password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

-- 查看主库状态
SHOW MASTER STATUS;
```

#### 从库配置

```sql
-- 配置主从复制
CHANGE MASTER TO
  MASTER_HOST='master-host',
  MASTER_USER='repl',
  MASTER_PASSWORD='replication_password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=12345;

-- 启动复制
START SLAVE;

-- 查看从库状态
SHOW SLAVE STATUS\G
```

---

## 数据库迁移

### 版本管理策略

```
drizzle/migrations/
├── 001_complete_database_schema.sql      # 完整数据库架构
├── 002_seed_subscription_plans.sql       # 订阅计划初始化
├── 003_add_user_preferences.sql          # 用户偏好设置（未来）
└── ...
```

### 迁移流程

1. **开发环境测试**

```bash
# 在开发环境执行新迁移
mysql -u root -p realsourcing_dev < drizzle/migrations/003_xxx.sql

# 验证迁移结果
mysql -u root -p realsourcing_dev -e "DESCRIBE new_table;"
```

2. **测试环境验证**

```bash
# 备份测试数据库
mysqldump -u root -p realsourcing_test > backup_before_migration.sql

# 执行迁移
mysql -u root -p realsourcing_test < drizzle/migrations/003_xxx.sql

# 运行自动化测试
pnpm test
```

3. **生产环境部署**

```bash
# 1. 创建数据库备份
mysqldump -u admin -p realsourcing > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 开启维护模式（可选）
# 在应用层设置维护模式，阻止写操作

# 3. 执行迁移
mysql -u admin -p realsourcing < drizzle/migrations/003_xxx.sql

# 4. 验证迁移
mysql -u admin -p realsourcing -e "SELECT COUNT(*) FROM new_table;"

# 5. 关闭维护模式
# 恢复应用正常访问
```

### 回滚策略

```bash
# 如果迁移失败，恢复备份
mysql -u admin -p realsourcing < backup_20260213_120000.sql

# 或者执行回滚脚本
mysql -u admin -p realsourcing < drizzle/migrations/003_xxx_rollback.sql
```

---

## 性能优化

### 1. 索引优化

#### 查看索引使用情况

```sql
-- 查看未使用的索引
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema = 'realsourcing';

-- 查看重复索引
SELECT * FROM sys.schema_redundant_indexes
WHERE table_schema = 'realsourcing';
```

#### 添加复合索引

```sql
-- 工厂表：按城市和评分查询
CREATE INDEX idx_city_score ON factories(city, overallScore DESC);

-- 会议表：按状态和时间查询
CREATE INDEX idx_status_scheduled ON webinars(status, scheduledAt);

-- 订单表：按买家和状态查询
CREATE INDEX idx_buyer_status ON orders(buyerId, status, createdAt DESC);
```

### 2. 查询优化

#### 使用 EXPLAIN 分析查询

```sql
-- 分析慢查询
EXPLAIN SELECT * FROM factories
WHERE city = 'Shenzhen'
  AND status = 'verified'
  AND overallScore >= 4.0
ORDER BY overallScore DESC
LIMIT 20;

-- 优化建议：确保有复合索引 (city, status, overallScore)
```

#### 避免 SELECT *

```sql
-- ❌ 不推荐
SELECT * FROM factories WHERE id = 1;

-- ✅ 推荐
SELECT id, name, logo, overallScore FROM factories WHERE id = 1;
```

### 3. 分区表

对大表进行分区以提升查询性能：

```sql
-- 按月分区审计日志表
ALTER TABLE audit_logs PARTITION BY RANGE (YEAR(createdAt) * 100 + MONTH(createdAt)) (
  PARTITION p202601 VALUES LESS THAN (202602),
  PARTITION p202602 VALUES LESS THAN (202603),
  PARTITION p202603 VALUES LESS THAN (202604),
  PARTITION p202604 VALUES LESS THAN (202605),
  PARTITION p202605 VALUES LESS THAN (202606),
  PARTITION p202606 VALUES LESS THAN (202607),
  PARTITION p202607 VALUES LESS THAN (202608),
  PARTITION p202608 VALUES LESS THAN (202609),
  PARTITION p202609 VALUES LESS THAN (202610),
  PARTITION p202610 VALUES LESS THAN (202611),
  PARTITION p202611 VALUES LESS THAN (202612),
  PARTITION p202612 VALUES LESS THAN (202701),
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

### 4. 缓存策略

使用 Redis 缓存热点数据：

```javascript
// 缓存工厂详情（TTL: 1小时）
const factory = await redis.get(`factory:${id}`);
if (!factory) {
  const data = await db.query.factories.findFirst({ where: eq(factories.id, id) });
  await redis.setex(`factory:${id}`, 3600, JSON.stringify(data));
  return data;
}
return JSON.parse(factory);
```

---

## 备份与恢复

### 1. 自动备份脚本

创建 `/opt/realsourcing/backup.sh`:

```bash
#!/bin/bash

# 配置
DB_NAME="realsourcing"
DB_USER="realsourcing_admin"
DB_PASS="your_password"
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mysqldump -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  $DB_NAME | gzip > $BACKUP_DIR/realsourcing_$DATE.sql.gz

# 删除旧备份
find $BACKUP_DIR -name "realsourcing_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 上传到 S3（可选）
# aws s3 cp $BACKUP_DIR/realsourcing_$DATE.sql.gz s3://your-bucket/backups/

echo "Backup completed: realsourcing_$DATE.sql.gz"
```

设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /opt/realsourcing/backup.sh >> /var/log/mysql_backup.log 2>&1
```

### 2. 恢复数据库

```bash
# 解压备份文件
gunzip realsourcing_20260213_020000.sql.gz

# 恢复数据库
mysql -u realsourcing_admin -p realsourcing < realsourcing_20260213_020000.sql

# 验证恢复
mysql -u realsourcing_admin -p realsourcing -e "SELECT COUNT(*) FROM users;"
```

---

## 监控与维护

### 1. 性能监控

#### 查看数据库状态

```sql
-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- 查看查询统计
SHOW STATUS LIKE 'Questions';
SHOW STATUS LIKE 'Slow_queries';

-- 查看 InnoDB 状态
SHOW ENGINE INNODB STATUS\G
```

#### 使用 Prometheus + Grafana

```bash
# 安装 MySQL Exporter
docker run -d \
  --name mysql-exporter \
  -p 9104:9104 \
  -e DATA_SOURCE_NAME="realsourcing_app:password@(localhost:3306)/realsourcing" \
  prom/mysqld-exporter
```

### 2. 慢查询分析

```bash
# 查看慢查询日志
sudo tail -f /var/log/mysql/slow-query.log

# 使用 pt-query-digest 分析
pt-query-digest /var/log/mysql/slow-query.log > slow_query_report.txt
```

### 3. 定期维护任务

```sql
-- 优化表（每周执行）
OPTIMIZE TABLE factories, webinars, orders;

-- 分析表（每月执行）
ANALYZE TABLE factories, webinars, orders;

-- 检查表（每月执行）
CHECK TABLE factories, webinars, orders;
```

---

## 故障排查

### 1. 连接问题

#### 错误: "Too many connections"

```sql
-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 增加最大连接数
SET GLOBAL max_connections = 500;

-- 永久修改：编辑 my.cnf
[mysqld]
max_connections = 500
```

#### 错误: "Access denied"

```sql
-- 检查用户权限
SHOW GRANTS FOR 'realsourcing_app'@'localhost';

-- 重新授权
GRANT SELECT, INSERT, UPDATE, DELETE ON realsourcing.* TO 'realsourcing_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 性能问题

#### 查询慢

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 分析慢查询
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;
```

#### 锁等待

```sql
-- 查看锁等待
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- 查看正在执行的事务
SELECT * FROM information_schema.INNODB_TRX;

-- 杀死阻塞的进程
KILL <thread_id>;
```

### 3. 磁盘空间不足

```bash
# 查看数据库大小
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
GROUP BY table_schema;

# 清理二进制日志
PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);

# 优化表
OPTIMIZE TABLE large_table;
```

---

## 总结

本部署指南涵盖了 RealSourcing 数据库的完整部署流程，包括：

✅ **环境搭建**: 从零开始安装和配置 MySQL  
✅ **生产部署**: 云数据库选择和安全配置  
✅ **迁移管理**: 版本化迁移和回滚策略  
✅ **性能优化**: 索引、查询、分区、缓存  
✅ **备份恢复**: 自动备份和灾难恢复  
✅ **监控维护**: 性能监控和定期维护  
✅ **故障排查**: 常见问题解决方案

**下一步**: 部署应用服务器并连接数据库。
