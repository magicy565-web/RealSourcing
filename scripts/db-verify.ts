/**
 * 数据库验证工具
 * 用于验证数据库部署是否成功
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/realsourcing";

// 预期的表列表
const EXPECTED_TABLES = [
  "users",
  "user_profiles",
  "factories",
  "factory_certifications",
  "factory_products",
  "webinars",
  "webinar_participants",
  "rfqs",
  "quotations",
  "orders",
  "order_items",
  "subscription_plans",
  "subscriptions",
  "payment_orders",
  "invoices",
  "usage_records",
  "notifications",
  "factory_reviews",
  "audit_logs",
  "system_settings",
  "rtm_conversations",
  "rtm_messages",
  "_migrations",
];

async function main() {
  console.log("🔍 开始验证数据库...\n");

  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  try {
    let hasErrors = false;

    // 1. 检查数据库连接
    console.log("📡 检查数据库连接...");
    try {
      await connection.ping();
      console.log("✅ 数据库连接正常\n");
    } catch (error: any) {
      console.error("❌ 数据库连接失败:", error.message);
      hasErrors = true;
    }

    // 2. 检查表是否存在
    console.log("📋 检查数据库表...");
    const [tables] = await connection.execute<mysql.RowDataPacket[]>("SHOW TABLES");
    const tableNames = tables.map((row) => Object.values(row)[0] as string);

    console.log(`   发现 ${tableNames.length} 张表\n`);

    const missingTables: string[] = [];
    const extraTables: string[] = [];

    for (const table of EXPECTED_TABLES) {
      if (!tableNames.includes(table)) {
        missingTables.push(table);
      }
    }

    for (const table of tableNames) {
      if (!EXPECTED_TABLES.includes(table)) {
        extraTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.error("❌ 缺少以下表:");
      missingTables.forEach((table) => console.error(`   - ${table}`));
      console.log("");
      hasErrors = true;
    } else {
      console.log("✅ 所有必需的表都存在\n");
    }

    if (extraTables.length > 0) {
      console.log("ℹ️  发现额外的表:");
      extraTables.forEach((table) => console.log(`   - ${table}`));
      console.log("");
    }

    // 3. 检查订阅计划数据
    console.log("💳 检查订阅计划数据...");
    const [plans] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT id, name, priceMonthly FROM subscription_plans"
    );

    if (plans.length === 0) {
      console.error("❌ 订阅计划表为空");
      hasErrors = true;
    } else {
      console.log(`✅ 发现 ${plans.length} 个订阅计划:`);
      plans.forEach((plan) => {
        console.log(`   - ${plan.name} (¥${plan.priceMonthly}/月)`);
      });
    }
    console.log("");

    // 4. 检查迁移记录
    console.log("📝 检查迁移记录...");
    const [migrations] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT filename, executed_at FROM _migrations ORDER BY id"
    );

    if (migrations.length === 0) {
      console.error("❌ 未找到迁移记录");
      hasErrors = true;
    } else {
      console.log(`✅ 已执行 ${migrations.length} 个迁移:`);
      migrations.forEach((migration) => {
        const date = new Date(migration.executed_at).toLocaleString("zh-CN");
        console.log(`   - ${migration.filename} (${date})`);
      });
    }
    console.log("");

    // 5. 检查索引
    console.log("🔍 检查关键索引...");
    const criticalIndexes = [
      { table: "users", index: "idx_role" },
      { table: "users", index: "idx_status" },
      { table: "factories", index: "idx_userId" },
      { table: "factories", index: "idx_category" },
      { table: "subscriptions", index: "idx_userId" },
      { table: "subscriptions", index: "idx_status" },
    ];

    let indexCount = 0;
    for (const { table, index } of criticalIndexes) {
      const [indexes] = await connection.execute<mysql.RowDataPacket[]>(
        `SHOW INDEX FROM ${table} WHERE Key_name = ?`,
        [index]
      );
      if (indexes.length > 0) {
        indexCount++;
      } else {
        console.error(`❌ 缺少索引: ${table}.${index}`);
        hasErrors = true;
      }
    }

    if (indexCount === criticalIndexes.length) {
      console.log(`✅ 所有关键索引都存在 (${indexCount}/${criticalIndexes.length})\n`);
    } else {
      console.log(`⚠️  部分索引缺失 (${indexCount}/${criticalIndexes.length})\n`);
    }

    // 6. 检查字符集
    console.log("🔤 检查字符集...");
    const [charset] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
       FROM information_schema.SCHEMATA 
       WHERE SCHEMA_NAME = ?`,
      [url.pathname.slice(1)]
    );

    if (charset.length > 0) {
      const { DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME } = charset[0];
      if (DEFAULT_CHARACTER_SET_NAME === "utf8mb4") {
        console.log(`✅ 字符集: ${DEFAULT_CHARACTER_SET_NAME}`);
        console.log(`✅ 排序规则: ${DEFAULT_COLLATION_NAME}\n`);
      } else {
        console.error(`⚠️  字符集不是 utf8mb4: ${DEFAULT_CHARACTER_SET_NAME}\n`);
      }
    }

    // 7. 总结
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (hasErrors) {
      console.error("❌ 验证失败：发现错误");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      process.exit(1);
    } else {
      console.log("✅ 验证通过：数据库部署成功！");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
  } catch (error: any) {
    console.error("\n❌ 验证失败:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
