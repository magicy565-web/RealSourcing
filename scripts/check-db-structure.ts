import { getDb } from '../server/db.js';
import * as schema from '../drizzle/schema.js';
import { sql } from 'drizzle-orm';

async function checkDatabaseStructure() {
  console.log('🔍 检查数据库连接和结构...\n');
  
  try {
    const db = await getDb();
    
    if (!db) {
      console.error('❌ 无法连接到数据库');
      process.exit(1);
    }
    
    console.log('✅ 数据库连接成功!\n');
    
    // 2. 检查关键表的数据
    const keyTables = [
      { name: 'users', schema: schema.users },
      { name: 'factories', schema: schema.factories },
      { name: 'webinars', schema: schema.webinars },
      { name: 'ai_recommendations', schema: schema.aiRecommendations },
      { name: 'ai_analysis_results', schema: schema.aiAnalysisResults },
      { name: 'user_behavior_events', schema: schema.userBehaviorEvents },
    ];
    
    console.log('📈 关键表数据统计:');
    console.log('='.repeat(80));
    
    for (const table of keyTables) {
      try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(table.schema);
        const count = result[0]?.count || 0;
        console.log(`  ${table.name.padEnd(30)} | ${count} 条记录`);
      } catch (error: any) {
        console.log(`  ${table.name.padEnd(30)} | ⚠️  表不存在或无法访问: ${error.message}`);
      }
    }
    console.log('='.repeat(80));
    
    // 3. 检查 webinars 示例数据
    try {
      const webinars = await db.select().from(schema.webinars).limit(3);
      console.log(`\n📺 Webinar 示例数据 (前3条):`);
      for (const webinar of webinars) {
        console.log(`  - [${webinar.id}] ${webinar.title} | ${webinar.status} | ${webinar.category}`);
      }
    } catch (error: any) {
      console.log(`\n⚠️  无法读取 webinars 数据: ${error.message}`);
    }
    
    // 4. 检查 factories 示例数据
    try {
      const factories = await db.select().from(schema.factories).limit(3);
      console.log(`\n🏭 Factory 示例数据 (前3条):`);
      for (const factory of factories) {
        console.log(`  - [${factory.id}] ${factory.name} | ${factory.category} | 评分: ${factory.overallScore}`);
      }
    } catch (error: any) {
      console.log(`\n⚠️  无法读取 factories 数据: ${error.message}`);
    }
    
    // 5. 检查 users 数量
    try {
      const usersCount = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
      console.log(`\n👥 用户总数: ${usersCount[0]?.count || 0}`);
    } catch (error: any) {
      console.log(`\n⚠️  无法读取 users 数据: ${error.message}`);
    }
    
    // 6. 检查 AI 推荐数据
    try {
      const aiRecsCount = await db.select({ count: sql<number>`count(*)` }).from(schema.aiRecommendations);
      console.log(`\n🤖 AI 推荐记录: ${aiRecsCount[0]?.count || 0}`);
      
      if ((aiRecsCount[0]?.count || 0) > 0) {
        const sampleRecs = await db.select().from(schema.aiRecommendations).limit(3);
        console.log(`\n  示例推荐:`);
        for (const rec of sampleRecs) {
          console.log(`    - 用户 ${rec.userId} | Webinar ${rec.webinarId} | 产品 ${rec.productId} | 匹配度: ${rec.matchScore}`);
        }
      }
    } catch (error: any) {
      console.log(`\n⚠️  无法读取 AI 推荐数据: ${error.message}`);
    }
    
    console.log('\n✅ 数据库检查完成!\n');
    
  } catch (error: any) {
    console.error('❌ 数据库检查失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

checkDatabaseStructure();
