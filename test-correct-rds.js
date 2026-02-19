import mysql from 'mysql2/promise';

async function testCorrectConnection() {
  console.log('🚀 正在尝试连接正确的 RDS 外网地址...');
  
  const config = {
    host: 'rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
    port: 3306,
    user: 'magicyang',
    password: 'Wysk1214',
    database: 'realsourcing',
    connectTimeout: 30000,
    // 针对外网连接，建议开启 SSL 兼容
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('📡 目标地址:', config.host);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 连接成功！(终于连上了正确地址)');
    
    const [rows] = await connection.execute('SELECT 1 as success, NOW() as time');
    console.log('📊 测试查询结果:', rows);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📂 数据库表列表:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('✨ 数据库验证完成，可以开始后续开发！');
  } catch (error) {
    console.error('❌ 连接依然失败:');
    console.error('错误消息:', error.message);
    console.error('错误代码:', error.code);
    process.exit(1);
  }
}

testCorrectConnection();
