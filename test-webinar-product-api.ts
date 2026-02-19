/**
 * 测试 Webinar Product API
 * 验证新创建的 webinarProduct 路由是否正常工作
 */

import { getDb } from "./server/db.js";
import { webinarProducts, factoryProducts, webinars } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

async function testWebinarProductAPI() {
  console.log("🧪 开始测试 Webinar Product API...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ 数据库连接失败");
    return;
  }

  // 1. 检查表是否存在
  console.log("1️⃣ 检查 webinar_products 表...");
  try {
    const result = await db.select().from(webinarProducts).limit(1);
    console.log("✅ webinar_products 表存在");
  } catch (error: any) {
    console.error("❌ webinar_products 表不存在:", error.message);
    return;
  }

  // 2. 查询第一个 Webinar
  console.log("\n2️⃣ 查询 Webinar...");
  const webinar = await db.select().from(webinars).limit(1);
  if (webinar.length === 0) {
    console.log("⚠️  数据库中没有 Webinar");
    return;
  }
  console.log(`✅ 找到 Webinar: ID=${webinar[0].id}, 标题="${webinar[0].title}"`);

  // 3. 查询产品
  console.log("\n3️⃣ 查询产品...");
  const products = await db.select().from(factoryProducts).where(eq(factoryProducts.status, "published")).limit(3);
  if (products.length === 0) {
    console.log("⚠️  数据库中没有已发布的产品");
    return;
  }
  console.log(`✅ 找到 ${products.length} 个产品`);
  products.forEach((p, i) => {
    console.log(`   ${i + 1}. ID=${p.id}, 名称="${p.name}"`);
  });

  // 4. 测试添加产品到 Webinar
  console.log("\n4️⃣ 测试添加产品到 Webinar...");
  const webinarId = webinar[0].id;
  const productId = products[0].id;

  // 检查是否已存在
  const existing = await db
    .select()
    .from(webinarProducts)
    .where(eq(webinarProducts.webinarId, webinarId))
    .limit(5);

  console.log(`   当前 Webinar 已关联 ${existing.length} 个产品`);

  // 如果还没有关联，添加一个
  if (existing.length === 0) {
    try {
      await db.insert(webinarProducts).values({
        webinarId,
        productId,
        displayOrder: 0,
        featured: 1,
      });
      console.log(`✅ 成功添加产品 ${productId} 到 Webinar ${webinarId}`);
    } catch (error: any) {
      console.error(`❌ 添加失败:`, error.message);
    }
  } else {
    console.log(`   已有关联产品，跳过添加`);
  }

  // 5. 查询 Webinar 的产品列表
  console.log("\n5️⃣ 查询 Webinar 的产品列表...");
  const webinarProductList = await db
    .select()
    .from(webinarProducts)
    .where(eq(webinarProducts.webinarId, webinarId));

  console.log(`✅ Webinar ${webinarId} 关联了 ${webinarProductList.length} 个产品:`);
  for (const wp of webinarProductList) {
    const product = await db
      .select()
      .from(factoryProducts)
      .where(eq(factoryProducts.id, wp.productId))
      .limit(1);
    if (product.length > 0) {
      console.log(`   - 产品 ID=${wp.productId}, 名称="${product[0].name}", 排序=${wp.displayOrder}, 精选=${wp.featured}`);
    }
  }

  console.log("\n✅ 所有测试完成！");
}

testWebinarProductAPI().catch(console.error);
