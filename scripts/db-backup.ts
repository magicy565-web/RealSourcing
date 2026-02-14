/**
 * 数据库备份工具
 * 用于备份数据库到本地文件
 */

import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";

dotenv.config();

const execAsync = promisify(exec);
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/realsourcing";

async function main() {
  console.log("💾 开始数据库备份...\n");

  // 解析数据库连接字符串
  const url = new URL(DATABASE_URL);
  const dbName = url.pathname.slice(1);
  const host = url.hostname;
  const port = parseInt(url.port) || 3306;
  const user = url.username;
  const password = url.password;

  // 创建备份目录
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 生成备份文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const backupFile = path.join(backupDir, `db_backup_${timestamp}.sql`);

  try {
    // 检查是否安装了 mysqldump
    let useMysqldump = true;
    try {
      await execAsync("which mysqldump");
    } catch {
      console.log("⚠️  未找到 mysqldump，使用 Node.js 备份方法\n");
      useMysqldump = false;
    }

    if (useMysqldump) {
      // 使用 mysqldump 备份（推荐）
      console.log("🔄 使用 mysqldump 备份...");
      const command = `mysqldump -h ${host} -P ${port} -u ${user} -p'${password}' ${dbName} > ${backupFile}`;
      
      await execAsync(command);
      console.log(`✅ 备份完成: ${backupFile}`);
    } else {
      // 使用 Node.js 备份（备用方案）
      console.log("🔄 使用 Node.js 备份...");
      const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database: dbName,
      });

      const stream = fs.createWriteStream(backupFile);

      // 写入备份头
      stream.write(`-- RealSourcing Database Backup\n`);
      stream.write(`-- Database: ${dbName}\n`);
      stream.write(`-- Date: ${new Date().toISOString()}\n`);
      stream.write(`-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
      stream.write(`SET NAMES utf8mb4;\n`);
      stream.write(`SET FOREIGN_KEY_CHECKS = 0;\n\n`);

      // 获取所有表
      const [tables] = await connection.execute<mysql.RowDataPacket[]>("SHOW TABLES");
      const tableNames = tables.map((row) => Object.values(row)[0] as string);

      console.log(`   发现 ${tableNames.length} 张表\n`);

      // 备份每张表
      for (const tableName of tableNames) {
        console.log(`   备份表: ${tableName}`);

        // 获取建表语句
        const [createTable] = await connection.execute<mysql.RowDataPacket[]>(
          `SHOW CREATE TABLE \`${tableName}\``
        );
        const createTableSQL = createTable[0]["Create Table"];

        stream.write(`-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        stream.write(`-- Table: ${tableName}\n`);
        stream.write(`-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
        stream.write(`DROP TABLE IF EXISTS \`${tableName}\`;\n`);
        stream.write(`${createTableSQL};\n\n`);

        // 获取表数据
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT * FROM \`${tableName}\``
        );

        if (rows.length > 0) {
          stream.write(`-- Data for table: ${tableName}\n`);
          stream.write(`LOCK TABLES \`${tableName}\` WRITE;\n`);

          // 分批插入数据
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const values = batch.map((row) => {
              const vals = Object.values(row).map((val) => {
                if (val === null) return "NULL";
                if (typeof val === "string") {
                  return `'${val.replace(/'/g, "\\'")}'`;
                }
                if (val instanceof Date) {
                  return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
                }
                return val;
              });
              return `(${vals.join(", ")})`;
            });

            const columns = Object.keys(batch[0])
              .map((col) => `\`${col}\``)
              .join(", ");
            stream.write(`INSERT INTO \`${tableName}\` (${columns}) VALUES\n`);
            stream.write(values.join(",\n"));
            stream.write(";\n");
          }

          stream.write(`UNLOCK TABLES;\n`);
        }

        stream.write("\n");
      }

      stream.write(`SET FOREIGN_KEY_CHECKS = 1;\n`);
      stream.end();

      await connection.end();

      console.log(`\n✅ 备份完成: ${backupFile}`);
    }

    // 显示备份文件信息
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   文件大小: ${fileSizeMB} MB`);
    console.log(`   保存位置: ${backupFile}\n`);

    // 清理旧备份（保留最近 10 个）
    console.log("🧹 清理旧备份...");
    const backupFiles = fs
      .readdirSync(backupDir)
      .filter((file) => file.startsWith("db_backup_") && file.endsWith(".sql"))
      .map((file) => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (backupFiles.length > 10) {
      const toDelete = backupFiles.slice(10);
      toDelete.forEach((file) => {
        fs.unlinkSync(file.path);
        console.log(`   删除旧备份: ${file.name}`);
      });
      console.log(`✅ 已删除 ${toDelete.length} 个旧备份\n`);
    } else {
      console.log(`✅ 当前备份数量: ${backupFiles.length}\n`);
    }

    console.log("🎉 备份完成！");
  } catch (error: any) {
    console.error("\n❌ 备份失败:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
