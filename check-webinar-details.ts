import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  console.log("📊 检查 Webinar 详细信息...\n");
  
  // 查询最新的webinar及其参与者
  const [webinars] = await connection.execute(`
    SELECT 
      w.id,
      w.title,
      w.description,
      w.status,
      w.scheduledAt,
      w.duration,
      w.maxParticipants,
      w.coverImage,
      w.category,
      w.agoraChannelName
    FROM webinars w
    ORDER BY w.createdAt DESC
    LIMIT 5
  `);
  
  console.log("📋 最新的 5 个 Webinar:\n");
  for (const w of webinars as any[]) {
    console.log(`\n🎯 [${w.id}] ${w.title}`);
    console.log(`   状态: ${w.status}`);
    console.log(`   时间: ${w.scheduledAt}`);
    console.log(`   时长: ${w.duration} 分钟`);
    console.log(`   类别: ${w.category || 'N/A'}`);
    console.log(`   封面: ${w.coverImage ? '✅' : '❌'}`);
    console.log(`   频道: ${w.agoraChannelName ? '✅' : '❌'}`);
    
    // 查询参与的工厂
    const [participants] = await connection.execute(`
      SELECT 
        f.id,
        f.name,
        f.city,
        f.overallScore,
        wp.role
      FROM webinar_participants wp
      JOIN factories f ON wp.factoryId = f.id
      WHERE wp.webinarId = ?
    `, [w.id]);
    
    if ((participants as any[]).length > 0) {
      console.log(`   参展工厂 (${(participants as any[]).length}):`);
      for (const p of participants as any[]) {
        console.log(`     - ${p.name} (${p.city}, 评分: ${p.overallScore})`);
      }
    } else {
      console.log(`   参展工厂: 无`);
    }
  }
  
  await connection.end();
}

check().catch(console.error);
