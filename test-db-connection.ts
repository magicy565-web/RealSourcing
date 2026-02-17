import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    console.log("🔌 测试数据库连接...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    console.log("✅ 数据库连接成功！");
    
    const [rows] = await connection.execute("SELECT DATABASE() as db, VERSION() as version");
    console.log("📊 数据库信息:", rows);
    
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ 数据库连接失败:", error.message);
    process.exit(1);
  }
}

testConnection();
