#!/bin/bash

# RealSourcing ECS to RDS Connectivity Test
# This script runs on the ECS server to verify database access

echo "🔍 开始在 ECS (47.99.205.136) 上进行 RDS 连接测试..."

# 1. 测试内网地址连接
echo -e "\n--- 测试 1: 内网地址 (VPC) ---"
echo "地址: rm-bp1h4o9up7249uep3.mysql.rds.aliyuncs.com"
# 使用 mysql 客户端尝试连接（不带密码，仅测试握手）
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/rm-bp1h4o9up7249uep3.mysql.rds.aliyuncs.com/3306' 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 端口 3306 开放"
    # 尝试完整登录
    mysql -h rm-bp1h4o9up7249uep3.mysql.rds.aliyuncs.com -u magicyang -pWysk1214 -e "SELECT 'Internal Connection Success' AS status;" 2>&1
else
    echo "❌ 端口 3306 无法访问 (可能是白名单未包含 ECS 内网 IP)"
fi

# 2. 测试外网地址连接
echo -e "\n--- 测试 2: 外网地址 ---"
echo "地址: rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com"
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com/3306' 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 端口 3306 开放"
    mysql -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com -u magicyang -pWysk1214 -e "SELECT 'External Connection Success' AS status;" 2>&1
else
    echo "❌ 端口 3306 无法访问"
fi

echo -e "\n🏁 测试结束"
