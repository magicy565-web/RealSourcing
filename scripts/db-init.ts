/**
 * 数据库初始化工具
 * 用于创建数据库和执行初始化
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/realsourcing";

async function main() {
  console.log("🚀 开始数据库初始化...\n");

  // 解析数据库连接字符串
  const url = new URL(DATABASE_URL);
  const dbName = url.pathname.slice(1);

  // 连接到 MySQL（不指定数据库）
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
  });

  try {
    // 1. 创建数据库（如果不存在）
    console.log(`📦 创建数据库: ${dbName}`);
    await connection.execute(`
      CREATE DATABASE IF NOT EXISTS \`${dbName}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci;
    `);
    console.log(`✅ 数据库 ${dbName} 已就绪\n`);

    // 2. 切换到目标数据库
    await connection.changeUser({ database: dbName });

    // 3. 检查数据库是否为空
    const [tables] = await connection.execute<mysql.RowDataPacket[]>(
      "SHOW TABLES"
    );

    if (tables.length > 0) {
      console.log(`⚠️  数据库已存在 ${tables.length} 张表`);
      console.log("   如需重新初始化，请先手动删除数据库\n");
    } else {
      console.log("✅ 数据库为空，可以执行迁移\n");
    }

    await connection.end();

    // 4. 执行迁移
    console.log("🔄 执行数据库迁移...\n");
    try {
      execSync("npx tsx scripts/db-migrate.ts", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      console.error("❌ 迁移执行失败");
      process.exit(1);
    }

    console.log("\n🎉 数据库初始化完成！");
  } catch (error: any) {
    console.error("\n❌ 初始化失败:");
    console.error(error.message);
    await connection.end();
    process.exit(1);
  }
}

main();
