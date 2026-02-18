import { getDb } from './server/db.js';
import { factories } from './drizzle/schema.js';

async function checkFactories() {
  try {
    const db = await getDb();
    if (!db) {
      console.log('❌ 数据库连接失败');
      return;
    }
    
    const result = await db.select().from(factories).limit(10);
    console.log(`✅ 数据库连接成功`);
    console.log(`📊 工厂数据数量: ${result.length}`);
    
    if (result.length > 0) {
      console.log('\n前3个工厂:');
      result.slice(0, 3).forEach((f, i) => {
        console.log(`${i + 1}. ${f.name} (ID: ${f.id}, 评分: ${f.overallScore})`);
      });
    } else {
      console.log('⚠️  数据库中没有工厂数据');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
  process.exit(0);
}

checkFactories();
