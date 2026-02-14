/**
 * 数据库迁移工具
 * 用于自动执行数据库迁移脚本
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/realsourcing";

interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: Date;
}

async function main() {
  console.log("🚀 开始数据库迁移...\n");

  // 解析数据库连接字符串
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    multipleStatements: true,
  });

  try {
    // 1. 创建迁移记录表（如果不存在）
    console.log("📋 检查迁移记录表...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ 迁移记录表已就绪\n");

    // 2. 获取已执行的迁移
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT filename FROM _migrations ORDER BY id"
    );
    const executedMigrations = new Set(rows.map((row) => row.filename));
    console.log(`📊 已执行的迁移数量: ${executedMigrations.size}\n`);

    // 3. 读取迁移文件
    const migrationsDir = path.join(__dirname, "../drizzle/migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📁 发现 ${files.length} 个迁移文件\n`);

    // 4. 执行未执行的迁移
    let executedCount = 0;
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`⏭️  跳过已执行的迁移: ${file}`);
        continue;
      }

      console.log(`\n🔄 执行迁移: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      try {
        // 执行迁移 SQL
        await connection.query(sql);

        // 记录迁移
        await connection.execute(
          "INSERT INTO _migrations (filename) VALUES (?)",
          [file]
        );

        console.log(`✅ 迁移成功: ${file}`);
        executedCount++;
      } catch (error: any) {
        console.error(`❌ 迁移失败: ${file}`);
        console.error(`错误信息: ${error.message}`);
        throw error;
      }
    }

    console.log(`\n\n🎉 迁移完成！`);
    console.log(`   - 总迁移文件: ${files.length}`);
    console.log(`   - 已执行: ${executedMigrations.size}`);
    console.log(`   - 新执行: ${executedCount}`);
  } catch (error: any) {
    console.error("\n❌ 迁移失败:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
