import 'dotenv/config';
import { getDb } from './server/db.js';
import { factories } from './drizzle/schema.js';

async function checkFactories() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
    
    const db = await getDb();
    if (!db) {
      console.log('❌ 数据库连接失败');
      return;
    }
    
    const result = await db.select().from(factories).limit(10);
    console.log(`✅ 数据库连接成功`);
    console.log(`📊 工厂数据数量: ${result.length}`);
    
    if (result.length > 0) {
      console.log('\n前5个工厂:');
      result.slice(0, 5).forEach((f, i) => {
        console.log(`${i + 1}. ${f.name} (ID: ${f.id}, 城市: ${f.city}, 评分: ${f.overallScore})`);
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
