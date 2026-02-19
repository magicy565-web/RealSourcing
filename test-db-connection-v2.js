import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('Testing database connection with explicit parameters...');
  
  const config = {
    host: 'rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
    port: 3306,
    user: 'magicyang',
    password: 'Wysk1214',
    database: 'realsourcing',
    ssl: false,
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
  
  console.log('Connection config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
  });
  
  try {
    console.log('Creating connection pool...');
    const pool = mysql.createPool(config);
    
    console.log('Testing query...');
    const [rows] = await pool.query('SELECT 1 as test, NOW() as current_time, DATABASE() as db_name, USER() as user');
    console.log('✅ Connection successful!');
    console.log('Result:', rows);
    
    // Test webinars table
    console.log('\nTesting webinars table...');
    const [webinars] = await pool.query('SELECT COUNT(*) as count FROM webinars');
    console.log('Webinars count:', webinars);
    
    await pool.end();
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
