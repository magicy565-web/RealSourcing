import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function verify() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  console.log("📊 验证数据库数据...\n");
  
  // 查询工厂数量
  const [factories] = await connection.execute("SELECT COUNT(*) as count FROM factories");
  console.log("✅ 工厂数量:", (factories as any)[0].count);
  
  // 查询webinar数量
  const [webinars] = await connection.execute("SELECT COUNT(*) as count FROM webinars");
  console.log("✅ Webinar数量:", (webinars as any)[0].count);
  
  // 查询最新的5个webinar
  const [latestWebinars] = await connection.execute(
    "SELECT id, title, status, scheduledAt FROM webinars ORDER BY createdAt DESC LIMIT 5"
  );
  console.log("\n📋 最新的Webinar:");
  (latestWebinars as any[]).forEach(w => {
    console.log(`  - [${w.id}] ${w.title} (${w.status})`);
  });
  
  // 查询最新的5个工厂
  const [latestFactories] = await connection.execute(
    "SELECT id, name, city, overallScore FROM factories ORDER BY createdAt DESC LIMIT 5"
  );
  console.log("\n🏭 最新的工厂:");
  (latestFactories as any[]).forEach(f => {
    console.log(`  - [${f.id}] ${f.name} (${f.city}, 评分: ${f.overallScore})`);
  });
  
  await connection.end();
}

verify().catch(console.error);
