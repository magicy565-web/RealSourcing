import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  // 查看表结构
  const [tables] = await connection.execute("SHOW TABLES LIKE '%webinar%'");
  console.log("Webinar相关的表:");
  console.log(tables);
  
  await connection.end();
}

check().catch(console.error);
