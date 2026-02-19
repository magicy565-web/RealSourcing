import mysql from 'mysql2/promise';

async function testTunnelConnection() {
  console.log('Testing database connection through SSH tunnel...');
  
  const config = {
    host: 'localhost',
    port: 3307,  // SSH tunnel port
    user: 'magicyang',
    password: 'Wysk1214',
    database: 'realsourcing',
    connectTimeout: 30000,
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
    const [rows] = await pool.query('SELECT 1 as test, NOW() as time_now, DATABASE() as db_name');
    console.log('✅ Connection successful!');
    console.log('Result:', rows);
    
    // Test webinars table
    console.log('\nTesting webinars table...');
    const [webinars] = await pool.query('SELECT COUNT(*) as count FROM webinars');
    console.log('Webinars count:', webinars);
    
    // Get a sample webinar
    console.log('\nFetching sample webinar...');
    const [sampleWebinars] = await pool.query('SELECT id, title, status, scheduledAt FROM webinars LIMIT 3');
    console.log('Sample webinars:', sampleWebinars);
    
    await pool.end();
    console.log('\n✅ All tests passed! SSH tunnel is working perfectly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testTunnelConnection();
