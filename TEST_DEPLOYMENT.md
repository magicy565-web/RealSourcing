# 自动化部署测试

本文件用于测试 GitHub webhook 自动部署功能。

## 测试时间
2026-02-17 17:48 CST

## 测试目的
验证当代码推送到 GitHub main 分支时，webhook 服务器能够自动触发部署脚本。

## 预期行为
1. 代码推送到 GitHub
2. GitHub 发送 webhook 到 http://api.cnsubscribe.xyz/webhook
3. Webhook 服务器接收请求并验证签名
4. 触发 /var/www/realsourcing/deploy.sh 脚本
5. 脚本自动拉取最新代码、安装依赖、重启服务
6. API 服务正常运行

## 测试编号
TEST-003

## 测试状态
Webhook 已配置，正在测试自动部署...
