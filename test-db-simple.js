import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('🔌 测试数据库连接...\n');
  
  const config = {
    host: 'rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
    port: 3306,
    user: 'magicyang',
    password: 'Wysk1214',
    database: 'realsourcing',
    connectTimeout: 30000,
    // Try with SSL disabled first, then will try with SSL
    ssl: { rejectUnauthorized: false },
  };
  
  console.log('连接配置:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
  });
  
  try {
    console.log('\n正在连接...');
    const connection = await mysql.createConnection(config);
    console.log('✅ 连接成功！\n');
    
    console.log('执行测试查询...');
    const [rows] = await connection.execute('SELECT 1 AS test, NOW() AS current_time');
    console.log('✅ 查询成功:', rows);
    
    console.log('\n检查数据库表...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ 数据库中的表:', tables);
    
    await connection.end();
    console.log('\n✅ 数据库连接测试完成！');
  } catch (error) {
    console.error('\n❌ 连接失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

testConnection();
