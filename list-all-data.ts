import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function listAll() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  console.log("📊 数据库完整数据清单\n");
  
  // 查询所有webinar
  const [webinars] = await connection.execute(`
    SELECT id, title, status, scheduledAt, category, createdAt
    FROM webinars
    ORDER BY createdAt DESC
  `);
  
  console.log(`📋 所有 Webinar (${(webinars as any[]).length} 个):\n`);
  for (const w of webinars as any[]) {
    const date = new Date(w.createdAt);
    console.log(`[${w.id}] ${w.title}`);
    console.log(`    状态: ${w.status} | 类别: ${w.category || 'N/A'} | 创建: ${date.toISOString().split('T')[0]}`);
  }
  
  // 查询所有工厂
  const [factories] = await connection.execute(`
    SELECT id, name, city, province, overallScore, createdAt
    FROM factories
    ORDER BY createdAt DESC
  `);
  
  console.log(`\n\n🏭 所有工厂 (${(factories as any[]).length} 个):\n`);
  for (const f of factories as any[]) {
    const date = new Date(f.createdAt);
    console.log(`[${f.id}] ${f.name}`);
    console.log(`    位置: ${f.city}, ${f.province} | 评分: ${f.overallScore} | 创建: ${date.toISOString().split('T')[0]}`);
  }
  
  await connection.end();
}

listAll().catch(console.error);
