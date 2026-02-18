import 'dotenv/config';
import mysql from 'mysql2/promise';

async function checkTables() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // 检查 factories 表是否存在
    const [tables] = await connection.query("SHOW TABLES LIKE 'factories'");
    console.log('factories 表存在:', tables.length > 0);
    
    if (tables.length > 0) {
      // 查看表结构
      const [columns] = await connection.query("DESCRIBE factories");
      console.log('\nfactories 表结构:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
      
      // 查询数据数量
      const [count] = await connection.query("SELECT COUNT(*) as count FROM factories");
      console.log(`\n工厂数据数量: ${count[0].count}`);
      
      if (count[0].count > 0) {
        // 查询前5条数据
        const [rows] = await connection.query("SELECT id, name, city, overallScore FROM factories LIMIT 5");
        console.log('\n前5个工厂:');
        rows.forEach((row, i) => {
          console.log(`${i + 1}. ${row.name} (ID: ${row.id}, 城市: ${row.city || 'N/A'}, 评分: ${row.overallScore || 'N/A'})`);
        });
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('错误:', error.message);
  }
  process.exit(0);
}

checkTables();
