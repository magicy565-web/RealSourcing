import mysql from 'mysql2/promise';

const config = {
  host: 'rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
  port: 3306,
  user: 'magicyang',
  password: 'Wysk1214',
  database: 'realsourcing',
  connectTimeout: 20000,
};

async function tryConnect(name, extraConfig) {
  console.log(`\n--- 尝试策略: ${name} ---`);
  try {
    const conn = await mysql.createConnection({ ...config, ...extraConfig });
    console.log(`✅ [${name}] 连接成功!`);
    const [rows] = await conn.execute('SELECT 1 as success');
    console.log(`📊 [${name}] 查询结果:`, rows);
    await conn.end();
    return true;
  } catch (err) {
    console.error(`❌ [${name}] 失败:`, err.message);
    if (err.code) console.error(`   错误代码: ${err.code}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 开始多策略数据库连接测试...');
  
  // 策略 1: 基础连接
  await tryConnect('基础连接 (No SSL)', { ssl: false });

  // 策略 2: 强制 SSL (不验证证书)
  await tryConnect('强制 SSL (rejectUnauthorized: false)', { 
    ssl: { rejectUnauthorized: false } 
  });

  // 策略 3: 兼容模式协议
  await tryConnect('旧版协议兼容', { 
    authSwitchHandler: ({ pluginName, data }, cb) => {
      console.log(`   正在切换认证插件: ${pluginName}`);
      cb(null, Buffer.alloc(0));
    }
  });

  // 策略 4: 禁用 KeepAlive 和设置较大数据包
  await tryConnect('优化参数连接', { 
    enableKeepAlive: false,
    maxAllowedPacket: 67108864 
  });
}

runAllTests();
