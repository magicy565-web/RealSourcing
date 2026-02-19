import mysql from 'mysql2/promise';

async function testExternalConnection() {
  console.log('🌐 正在尝试从外网直连阿里云 RDS...');
  
  const config = {
    host: 'rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
    port: 3306,
    user: 'magicyang',
    password: 'Wysk1214',
    database: 'realsourcing',
    // 关键配置：强制启用 SSL 并忽略证书验证（针对外网连接）
    ssl: {
      rejectUnauthorized: false
    },
    // 增加连接和握手超时，适应外网延迟
    connectTimeout: 60000,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  };

  console.log('📡 目标地址:', config.host);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 外网连接成功！');
    
    const [rows] = await connection.execute('SELECT 1 as connection_test, NOW() as server_time');
    console.log('📊 查询结果:', rows);
    
    await connection.end();
    console.log('🚀 数据库访问正常，可以继续开发。');
  } catch (error) {
    console.error('❌ 连接失败详情:');
    console.error('消息:', error.message);
    console.error('代码:', error.code);
    console.error('致命错误:', error.fatal);
    process.exit(1);
  }
}

testExternalConnection();
