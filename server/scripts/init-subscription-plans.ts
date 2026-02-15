/**
 * Initialize subscription plans in the database
 * Run this script once to populate the subscription_plans table
 */

import { createSubscriptionPlan } from "../db.js";

const plans = [
  {
    id: "free_trial",
    name: "免费试用",
    description: "14 天免费试用，体验平台核心功能",
    priceMonthly: "0",
    priceYearly: "0",
    features: [
      "创建工厂主页",
      "上传产品（最多 5 个）",
      "接收买家询价（最多 3 个）",
      "参与买家发起的 Webinar",
    ],
    limits: {
      webinarCreatedMonthly: 0,
      productsMax: 5,
      inquiriesMonthly: 3,
    },
    isActive: 1,
    displayOrder: 1,
  },
  {
    id: "basic",
    name: "基础套餐",
    description: "适合年营收 ¥5M-¥20M 的外贸型中小工厂",
    priceMonthly: "299",
    priceYearly: "2990",
    features: [
      "创建工厂主页（完整信息展示）",
      "上传产品（最多 30 个）",
      "接收买家询价（每月 20 个）",
      "参与 Webinar（每月 10 场）",
      "主动创建 Webinar（每月 2 场）",
      "基础数据分析（访问量、询价量）",
      "邮件客服支持（48 小时响应）",
    ],
    limits: {
      webinarCreatedMonthly: 2,
      productsMax: 30,
      inquiriesMonthly: 20,
    },
    isActive: 1,
    displayOrder: 2,
  },
  {
    id: "professional",
    name: "专业套餐",
    description: "适合年营收 ¥20M-¥100M 的成长型工厂",
    priceMonthly: "999",
    priceYearly: "9990",
    features: [
      "基础套餐所有功能",
      "上传产品（最多 100 个）",
      "接收买家询价（无限）",
      "参与 Webinar（无限）",
      "主动创建 Webinar（每月 10 场）",
      "高级展示位（搜索结果前 20）",
      "AI 推荐优先级提升",
      "认证徽章（Verified Factory）",
      "高级数据分析（买家来源、转化率、ROI）",
      "视频录制（Webinar 自动录制，可回放）",
      "在线客服支持（24 小时响应）",
    ],
    limits: {
      webinarCreatedMonthly: 10,
      productsMax: 100,
      inquiriesMonthly: -1, // -1 means unlimited
    },
    isActive: 1,
    displayOrder: 3,
  },
  {
    id: "enterprise",
    name: "企业套餐",
    description: "适合年营收 ¥100M+ 的大型工厂或工厂集团",
    priceMonthly: "2999",
    priceYearly: "29990",
    features: [
      "专业套餐所有功能",
      "上传产品（无限）",
      "主动创建 Webinar（无限）",
      "顶级展示位（搜索结果前 3）",
      "AI 推荐最高优先级",
      "多工厂管理（管理多个工厂账号）",
      "专属客户经理（一对一服务）",
      "定制化营销支持（平台推广、买家推荐）",
      "白标定制（定制化工厂主页）",
      "API 访问（集成 ERP/CRM 系统）",
      "优先客服支持（2 小时响应，微信/电话）",
      "专属培训（如何使用平台，如何提升转化率）",
    ],
    limits: {
      webinarCreatedMonthly: -1, // unlimited
      productsMax: -1, // unlimited
      inquiriesMonthly: -1, // unlimited
    },
    isActive: 1,
    displayOrder: 4,
  },
];

async function initPlans() {
  console.log("Initializing subscription plans...");

  for (const plan of plans) {
    try {
      await createSubscriptionPlan(plan);
      console.log(`✓ Created plan: ${plan.name} (${plan.id})`);
    } catch (error) {
      console.error(`✗ Failed to create plan ${plan.id}:`, error);
    }
  }

  console.log("Done!");
}

// Run the initialization
initPlans().catch(console.error);
