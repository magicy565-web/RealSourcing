/**
 * 初始化真实业务数据脚本
 * 用于将Mock数据替换为真实的业务数据
 */

import { getDb } from "../db.js";
import { users, factories, factoryCertifications, webinars, webinarParticipants } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 开始初始化真实业务数据...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("数据库连接失败");
  }

  // ============================================================================
  // 1. 创建管理员用户
  // ============================================================================
  console.log("📝 Step 1: 创建管理员用户...");
  
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.openId, "admin_realsourcing"))
    .limit(1);

  let adminUserId: number;

  if (existingAdmin.length === 0) {
    const adminResult = await db.insert(users).values({
      openId: "admin_realsourcing",
      email: "admin@realsourcing.com",
      name: "RealSourcing Admin",
      role: "admin",
      status: "active",
      emailVerified: 1,
      language: "zh",
    });
    adminUserId = adminResult[0].insertId;
    console.log(`✅ 管理员用户创建成功 (ID: ${adminUserId})`);
  } else {
    adminUserId = existingAdmin[0].id;
    console.log(`✅ 管理员用户已存在 (ID: ${adminUserId})`);
  }

  // ============================================================================
  // 2. 创建真实工厂数据
  // ============================================================================
  console.log("\n📝 Step 2: 创建真实工厂数据...");

  const factoriesData = [
    {
      name: "深圳市精密模具制造有限公司",
      legalName: "Shenzhen Precision Mold Manufacturing Co., Ltd.",
      category: "Injection Molding",
      city: "深圳",
      province: "广东",
      country: "China",
      description: "专业从事高精度注塑模具设计与制造，拥有20年行业经验，服务汽车、电子、医疗等多个行业。",
      phone: "+86-755-8888-0001",
      email: "contact@szprecision.com",
      established: 2004,
      employees: "200-500",
      overallScore: "4.8",
      qualityScore: "4.9",
      deliveryScore: "4.7",
      communicationScore: "4.8",
      certifications: [
        { type: "ISO", name: "ISO 9001:2015", issuedBy: "SGS" },
        { type: "ISO", name: "ISO 14001:2015", issuedBy: "TUV" },
        { type: "IATF", name: "IATF 16949:2016", issuedBy: "BSI" },
      ],
    },
    {
      name: "东莞市华强塑胶制品厂",
      legalName: "Dongguan Huaqiang Plastic Products Factory",
      category: "Plastic Manufacturing",
      city: "东莞",
      province: "广东",
      country: "China",
      description: "专注于高品质塑料制品生产，提供注塑、吹塑、挤出等全方位服务，年产能超过5000吨。",
      phone: "+86-769-8888-0002",
      email: "sales@huaqiang-plastic.com",
      established: 1998,
      employees: "500-1000",
      overallScore: "4.6",
      qualityScore: "4.7",
      deliveryScore: "4.5",
      communicationScore: "4.6",
      certifications: [
        { type: "ISO", name: "ISO 9001:2015", issuedBy: "SGS" },
        { type: "FDA", name: "FDA Food Contact", issuedBy: "FDA" },
      ],
    },
    {
      name: "宁波市精工机械有限公司",
      legalName: "Ningbo Seiko Machinery Co., Ltd.",
      category: "Machinery Manufacturing",
      city: "宁波",
      province: "浙江",
      country: "China",
      description: "专业生产注塑机、吹塑机等塑料加工设备，技术领先，产品远销欧美市场。",
      phone: "+86-574-8888-0003",
      email: "info@nbseiko.com",
      established: 2001,
      employees: "100-200",
      overallScore: "4.7",
      qualityScore: "4.8",
      deliveryScore: "4.6",
      communicationScore: "4.7",
      certifications: [
        { type: "ISO", name: "ISO 9001:2015", issuedBy: "TUV" },
        { type: "CE", name: "CE Certification", issuedBy: "TUV Rheinland" },
      ],
    },
    {
      name: "苏州工业园区新材料科技公司",
      legalName: "Suzhou Industrial Park New Materials Technology Co., Ltd.",
      category: "Materials R&D",
      city: "苏州",
      province: "江苏",
      country: "China",
      description: "专注于高性能工程塑料研发与生产，提供定制化材料解决方案，服务于航空航天、汽车等高端领域。",
      phone: "+86-512-8888-0004",
      email: "rd@sip-materials.com",
      established: 2010,
      employees: "50-100",
      overallScore: "4.9",
      qualityScore: "5.0",
      deliveryScore: "4.8",
      communicationScore: "4.9",
      certifications: [
        { type: "ISO", name: "ISO 9001:2015", issuedBy: "BSI" },
        { type: "ISO", name: "ISO 14001:2015", issuedBy: "BSI" },
        { type: "RoHS", name: "RoHS Compliance", issuedBy: "SGS" },
      ],
    },
    {
      name: "广州市智能制造装备有限公司",
      legalName: "Guangzhou Smart Manufacturing Equipment Co., Ltd.",
      category: "Automation Equipment",
      city: "广州",
      province: "广东",
      country: "China",
      description: "提供工业4.0智能制造解决方案，包括自动化生产线、机器人集成、MES系统等。",
      phone: "+86-20-8888-0005",
      email: "contact@gzsmart-mfg.com",
      established: 2015,
      employees: "100-200",
      overallScore: "4.5",
      qualityScore: "4.6",
      deliveryScore: "4.4",
      communicationScore: "4.5",
      certifications: [
        { type: "ISO", name: "ISO 9001:2015", issuedBy: "SGS" },
        { type: "CE", name: "CE Certification", issuedBy: "TUV SUD" },
      ],
    },
  ];

  const factoryIds: number[] = [];

  for (const factoryData of factoriesData) {
    const { certifications, ...factoryInfo } = factoryData;

    // 检查工厂是否已存在
    const existingFactory = await db
      .select()
      .from(factories)
      .where(eq(factories.name, factoryInfo.name))
      .limit(1);

    let factoryId: number;

    if (existingFactory.length === 0) {
      const factoryResult = await db.insert(factories).values({
        userId: adminUserId,
        ...factoryInfo,
        status: "verified",
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
      });
      factoryId = factoryResult[0].insertId;
      console.log(`  ✅ 创建工厂: ${factoryInfo.name} (ID: ${factoryId})`);

      // 添加认证信息
      for (const cert of certifications) {
        await db.insert(factoryCertifications).values({
          factoryId,
          type: cert.type,
          name: cert.name,
          issuedBy: cert.issuedBy,
          status: "verified",
          verifiedAt: new Date(),
          verifiedBy: adminUserId,
        });
      }
      console.log(`    ✅ 添加了 ${certifications.length} 个认证`);
    } else {
      factoryId = existingFactory[0].id;
      console.log(`  ✅ 工厂已存在: ${factoryInfo.name} (ID: ${factoryId})`);
    }

    factoryIds.push(factoryId);
  }

  // ============================================================================
  // 3. 导入 Webinar 数据
  // ============================================================================
  console.log("\n📝 Step 3: 导入 Webinar 数据...");

  // 读取并执行 SQL 文件
  const sqlFiles = [
    "../../insert_webinars.sql",
    "../../insert_injection_molding_webinars.sql",
    "../../insert_procurement_webinars.sql",
  ];

  let totalWebinars = 0;

  for (const sqlFile of sqlFiles) {
    const sqlPath = path.join(__dirname, sqlFile);
    
    if (fs.existsSync(sqlPath)) {
      console.log(`  📄 处理文件: ${path.basename(sqlPath)}`);
      const sqlContent = fs.readFileSync(sqlPath, "utf-8");
      
      // 分割 SQL 语句（简单处理，按 INSERT 分割）
      const statements = sqlContent
        .split(/INSERT INTO webinars/i)
        .filter((s) => s.trim().length > 0)
        .slice(1); // 跳过第一个空元素

      for (const statement of statements) {
        try {
          // 重新添加 INSERT INTO webinars
          const fullStatement = `INSERT INTO webinars ${statement}`;
          await db.execute(fullStatement as any);
          totalWebinars++;
        } catch (error: any) {
          // 如果是重复键错误，忽略
          if (!error.message.includes("Duplicate entry")) {
            console.error(`    ⚠️  执行 SQL 失败:`, error.message);
          }
        }
      }
      console.log(`    ✅ 导入完成`);
    } else {
      console.log(`    ⚠️  文件不存在: ${sqlPath}`);
    }
  }

  console.log(`  ✅ 总共导入了 ${totalWebinars} 个 Webinar`);

  // ============================================================================
  // 4. 关联工厂到 Webinar（作为参展商）
  // ============================================================================
  console.log("\n📝 Step 4: 关联工厂到 Webinar...");

  // 获取所有已导入的 webinar
  const allWebinars = await db
    .select()
    .from(webinars)
    .where(eq(webinars.createdById, adminUserId));

  let participantCount = 0;

  for (const webinar of allWebinars) {
    // 为每个 webinar 随机分配 2-4 个工厂作为参展商
    const numFactories = Math.floor(Math.random() * 3) + 2; // 2-4
    const selectedFactories = factoryIds
      .sort(() => Math.random() - 0.5)
      .slice(0, numFactories);

    for (const factoryId of selectedFactories) {
      try {
        await db.insert(webinarParticipants).values({
          webinarId: webinar.id,
          userId: adminUserId,
          factoryId,
          role: "presenter",
          status: "accepted",
          invitedAt: new Date(),
          joinedAt: new Date(),
        });
        participantCount++;
      } catch (error: any) {
        // 忽略重复键错误
        if (!error.message.includes("Duplicate entry")) {
          console.error(`    ⚠️  关联失败:`, error.message);
        }
      }
    }
  }

  console.log(`  ✅ 创建了 ${participantCount} 个工厂-Webinar 关联`);

  // ============================================================================
  // 完成
  // ============================================================================
  console.log("\n✨ 数据初始化完成！\n");
  console.log("📊 统计信息:");
  console.log(`  - 管理员用户: 1`);
  console.log(`  - 工厂数量: ${factoryIds.length}`);
  console.log(`  - Webinar 数量: ${allWebinars.length}`);
  console.log(`  - 工厂-Webinar 关联: ${participantCount}`);
  console.log("\n🎉 现在可以访问应用查看真实数据了！");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ 初始化失败:", error);
  process.exit(1);
});
