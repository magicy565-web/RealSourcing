/**
 * 数据库回滚工具
 * 用于回滚到之前的备份
 */

import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/realsourcing";

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function main() {
  console.log("🔄 数据库回滚工具\n");

  // 1. 列出可用的备份
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    console.error("❌ 错误: 备份目录不存在");
    process.exit(1);
  }

  const backupFiles = fs
    .readdirSync(backupDir)
    .filter((file) => file.startsWith("db_backup_") && file.endsWith(".sql"))
    .map((file) => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime,
      size: fs.statSync(path.join(backupDir, file)).size,
    }))
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  if (backupFiles.length === 0) {
    console.error("❌ 错误: 未找到备份文件");
    process.exit(1);
  }

  console.log("📋 可用的备份:\n");
  backupFiles.forEach((file, index) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const timeStr = file.time.toLocaleString("zh-CN");
    console.log(`  ${index + 1}. ${file.name}`);
    console.log(`     时间: ${timeStr}`);
    console.log(`     大小: ${sizeMB} MB\n`);
  });

  // 2. 选择备份
  const answer = await askQuestion("请选择要回滚的备份编号 (1-" + backupFiles.length + "): ");
  const selectedIndex = parseInt(answer) - 1;

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= backupFiles.length) {
    console.error("❌ 错误: 无效的选择");
    process.exit(1);
  }

  const selectedBackup = backupFiles[selectedIndex];
  console.log(`\n✅ 已选择: ${selectedBackup.name}\n`);

  // 3. 确认回滚
  console.log("⚠️  警告: 回滚将删除当前数据库的所有数据！");
  const confirm = await askQuestion("确认回滚？(yes/no): ");

  if (confirm.toLowerCase() !== "yes") {
    console.log("❌ 已取消回滚");
    process.exit(0);
  }

  // 4. 执行回滚
  console.log("\n🔄 开始回滚...\n");

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
    // 读取备份文件
    console.log("📖 读取备份文件...");
    const sql = fs.readFileSync(selectedBackup.path, "utf-8");
    console.log("✅ 备份文件读取完成\n");

    // 执行 SQL
    console.log("🔄 执行 SQL...");
    await connection.query(sql);
    console.log("✅ SQL 执行完成\n");

    // 验证
    console.log("🔍 验证数据库...");
    const [tables] = await connection.execute<mysql.RowDataPacket[]>("SHOW TABLES");
    console.log(`✅ 数据库包含 ${tables.length} 张表\n`);

    console.log("🎉 回滚完成！");
  } catch (error: any) {
    console.error("\n❌ 回滚失败:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
