import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Database URL:', process.env.DATABASE_URL);
  
  try {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: false,
      waitForConnections: true,
      connectionLimit: 1,
      connectTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    
    console.log('Pool created, testing query...');
    const [rows] = await pool.query('SELECT 1 as test, NOW() as current_time, DATABASE() as db_name');
    console.log('✅ Connection successful!');
    console.log('Result:', rows);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    process.exit(1);
  }
}

testConnection();
