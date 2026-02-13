# RealSourcing API 使用示例

> 本文档提供了 RealSourcing SaaS 平台所有 API 的实际使用示例

---

## 目录

1. [工厂管理 API](#工厂管理-api)
2. [订单管理 API](#订单管理-api)
3. [订阅管理 API](#订阅管理-api)
4. [配额管理 API](#配额管理-api)

---

## 工厂管理 API

### 1. 创建工厂

```typescript
const { data } = await trpc.factoryEnhanced.create.mutate({
  name: "深圳华强电子厂",
  legalName: "深圳华强电子有限公司",
  category: "Electronics",
  country: "China",
  province: "广东省",
  city: "深圳市",
  address: "南山区科技园",
  phone: "+86-755-12345678",
  email: "contact@huaqiang.com",
  website: "https://www.huaqiang.com",
  description: "专业生产电子元器件20年",
});

console.log("工厂ID:", data.id);
```

### 2. 添加工厂认证

```typescript
await trpc.factoryEnhanced.addCertification.mutate({
  factoryId: 1,
  type: "ISO",
  name: "ISO 9001:2015",
  issuedBy: "SGS",
  certificateNumber: "ISO-2024-001",
  issuedAt: "2024-01-15",
  expiresAt: "2027-01-15",
  fileUrl: "https://cdn.example.com/cert.pdf",
});
```

### 3. 创建产品（自动检查配额）

```typescript
try {
  const { data } = await trpc.factoryEnhanced.createProduct.mutate({
    factoryId: 1,
    name: "智能手机屏幕",
    sku: "LCD-2024-001",
    category: "Electronics",
    description: "6.5寸OLED屏幕，支持120Hz刷新率",
    specifications: {
      size: "6.5 inch",
      resolution: "2400x1080",
      refreshRate: "120Hz",
      material: "OLED",
    },
    features: ["高刷新率", "低功耗", "护眼模式"],
    images: [
      "https://cdn.example.com/product1.jpg",
      "https://cdn.example.com/product2.jpg",
    ],
    minOrderQuantity: 1000,
    priceRange: "$50-$80",
    leadTime: "15-20 days",
    customizable: 1,
  });
  
  console.log("产品创建成功，ID:", data.id);
} catch (error) {
  console.error("创建失败:", error.message);
  // 可能的错误: "已达到产品数量上限"
}
```

### 4. 提交工厂评价

```typescript
await trpc.factoryEnhanced.createReview.mutate({
  factoryId: 1,
  orderId: 123,
  overallScore: 4.5,
  qualityScore: 5.0,
  deliveryScore: 4.0,
  communicationScore: 4.5,
  pricingScore: 4.0,
  complianceScore: 5.0,
  title: "优质供应商",
  content: "产品质量很好，交付及时，推荐合作！",
  pros: "质量稳定，响应快速",
  cons: "价格略高",
  images: ["https://cdn.example.com/review1.jpg"],
  isAnonymous: 0,
});
```

---

## 订单管理 API

### 1. 创建询价单（自动检查配额）

```typescript
try {
  const { data } = await trpc.order.createRFQ.mutate({
    title: "采购1000个手机屏幕",
    category: "Electronics",
    description: "需要6.5寸OLED屏幕，120Hz刷新率",
    specifications: {
      size: "6.5 inch",
      refreshRate: "120Hz",
      material: "OLED",
    },
    targetPrice: 60,
    currency: "USD",
    quantity: 1000,
    unit: "pieces",
    targetDeliveryDate: "2024-03-15",
    deliveryTerms: "FOB Shenzhen",
    paymentTerms: "30% deposit, 70% before shipment",
    attachments: ["https://cdn.example.com/spec.pdf"],
  });
  
  console.log("询价单创建成功，ID:", data.id);
} catch (error) {
  console.error("创建失败:", error.message);
  // 可能的错误: "已达到本月询价数量上限"
}
```

### 2. 提交报价

```typescript
await trpc.order.createQuotation.mutate({
  rfqId: 1,
  factoryId: 1,
  unitPrice: 55,
  totalPrice: 55000,
  currency: "USD",
  quantity: 1000,
  unit: "pieces",
  leadTime: "20 days",
  deliveryTerms: "FOB Shenzhen",
  paymentTerms: "30% deposit, 70% before shipment",
  validUntil: "2024-02-28",
  notes: "价格包含包装，不含运费",
  attachments: ["https://cdn.example.com/quotation.pdf"],
});
```

### 3. 接受报价并创建订单

```typescript
// 1. 接受报价
await trpc.order.acceptQuotation.mutate({ id: 1 });

// 2. 创建订单
const { data } = await trpc.order.createOrder.mutate({
  factoryId: 1,
  rfqId: 1,
  quotationId: 1,
  type: "formal",
  totalAmount: 55000,
  currency: "USD",
  paymentTerms: "30% deposit, 70% before shipment",
  deliveryTerms: "FOB Shenzhen",
  deliveryAddress: "广州市天河区科技园",
  targetDeliveryDate: "2024-03-15",
  notes: "请确保包装完好",
});

console.log("订单创建成功，ID:", data.id);
```

### 4. 添加订单项

```typescript
await trpc.order.addOrderItem.mutate({
  orderId: 1,
  productId: 1,
  productName: "智能手机屏幕",
  sku: "LCD-2024-001",
  specifications: {
    size: "6.5 inch",
    refreshRate: "120Hz",
  },
  quantity: 1000,
  unit: "pieces",
  unitPrice: 55,
  totalPrice: 55000,
  currency: "USD",
  notes: "需要原厂包装",
});
```

### 5. 更新订单状态

```typescript
// 确认订单
await trpc.order.updateOrderStatus.mutate({
  id: 1,
  status: "confirmed",
});

// 标记为生产中
await trpc.order.updateOrderStatus.mutate({
  id: 1,
  status: "production",
});

// 标记为已发货
await trpc.order.updateOrderStatus.mutate({
  id: 1,
  status: "shipped",
});

// 标记为已交付
await trpc.order.updateOrderStatus.mutate({
  id: 1,
  status: "delivered",
});
```

---

## 订阅管理 API

### 1. 获取所有订阅计划

```typescript
const { data: plans } = await trpc.subscriptionEnhanced.getPlans.query();

plans.forEach(plan => {
  console.log(`${plan.name}: ¥${plan.priceMonthly}/月`);
  console.log("配额:", plan.limits);
});
```

### 2. 获取当前订阅

```typescript
const { data: subscription } = await trpc.subscriptionEnhanced.getCurrent.query();

console.log("当前套餐:", subscription.planId);
console.log("状态:", subscription.status);
console.log("到期时间:", subscription.currentPeriodEnd);
```

### 3. 升级订阅

```typescript
// 升级到 Pro 套餐（按年付费）
await trpc.subscriptionEnhanced.upgrade.mutate({
  planId: "pro",
  billingCycle: "yearly",
});

console.log("升级成功！");
```

### 4. 降级订阅

```typescript
// 降级到 Basic 套餐（在当前周期结束后生效）
await trpc.subscriptionEnhanced.downgrade.mutate({
  planId: "basic",
});

console.log("降级已安排，将在当前周期结束后生效");
```

### 5. 取消订阅

```typescript
await trpc.subscriptionEnhanced.cancel.mutate({
  reason: "暂时不需要使用",
});

console.log("订阅已取消，将在当前周期结束后失效");
```

---

## 配额管理 API

### 1. 获取配额限制

```typescript
const { data: limits } = await trpc.subscriptionEnhanced.getQuotaLimits.query();

console.log("每月可创建会议:", limits.webinarCreatedMonthly);
console.log("最大产品数:", limits.productsMax);
console.log("每月询价数:", limits.inquiriesMonthly);
console.log("存储空间:", limits.storageGB, "GB");
console.log("视频录制时长:", limits.videoRecordingHours, "小时/月");
console.log("AI报告数:", limits.aiReportsMonthly, "份/月");
```

### 2. 获取配额使用情况

```typescript
const { data: usage } = await trpc.subscriptionEnhanced.getQuotaUsage.query();

console.log("已创建会议:", usage.webinarCreated);
console.log("已上传产品:", usage.products);
console.log("已发送询价:", usage.inquiries);
console.log("已使用存储:", usage.storage, "GB");
console.log("已录制视频:", usage.videoRecording, "小时");
console.log("已生成AI报告:", usage.aiReports, "份");
```

### 3. 检查特定资源配额

```typescript
const { data: check } = await trpc.subscriptionEnhanced.checkQuota.query({
  resourceType: "product",
});

if (check.allowed) {
  console.log("可以创建产品");
} else {
  console.log("配额不足:", check.reason);
  console.log("当前使用:", check.current);
  console.log("配额限制:", check.limit);
}
```

### 4. 获取完整的配额仪表板数据

```typescript
const { data: dashboard } = await trpc.subscriptionEnhanced.getDashboard.query();

console.log("订阅信息:", dashboard.subscription);
console.log("套餐信息:", dashboard.plan);

dashboard.quotas.forEach(quota => {
  console.log(`${quota.name}: ${quota.current}/${quota.limit} ${quota.unit}`);
  console.log(`使用率: ${quota.percentage.toFixed(1)}%`);
  
  if (quota.unlimited) {
    console.log("✅ 无限制");
  }
});
```

---

## 完整业务流程示例

### 场景：工厂注册 → 上传产品 → 接收询价 → 提交报价 → 成交订单

```typescript
// 1. 工厂注册
const { data: factory } = await trpc.factoryEnhanced.create.mutate({
  name: "深圳华强电子厂",
  category: "Electronics",
  // ...其他信息
});

// 2. 添加认证
await trpc.factoryEnhanced.addCertification.mutate({
  factoryId: factory.id,
  type: "ISO",
  name: "ISO 9001:2015",
  // ...
});

// 3. 上传产品（自动检查配额）
const { data: product } = await trpc.factoryEnhanced.createProduct.mutate({
  factoryId: factory.id,
  name: "智能手机屏幕",
  // ...
});

// 4. 买家创建询价单（自动检查配额）
const { data: rfq } = await trpc.order.createRFQ.mutate({
  title: "采购1000个手机屏幕",
  // ...
});

// 5. 工厂提交报价
const { data: quotation } = await trpc.order.createQuotation.mutate({
  rfqId: rfq.id,
  factoryId: factory.id,
  unitPrice: 55,
  totalPrice: 55000,
  // ...
});

// 6. 买家接受报价
await trpc.order.acceptQuotation.mutate({ id: quotation.id });

// 7. 创建正式订单
const { data: order } = await trpc.order.createOrder.mutate({
  factoryId: factory.id,
  rfqId: rfq.id,
  quotationId: quotation.id,
  type: "formal",
  totalAmount: 55000,
  // ...
});

// 8. 添加订单项
await trpc.order.addOrderItem.mutate({
  orderId: order.id,
  productId: product.id,
  productName: "智能手机屏幕",
  quantity: 1000,
  unitPrice: 55,
  totalPrice: 55000,
  // ...
});

// 9. 更新订单状态（确认 → 生产 → 发货 → 交付）
await trpc.order.updateOrderStatus.mutate({ id: order.id, status: "confirmed" });
await trpc.order.updateOrderStatus.mutate({ id: order.id, status: "production" });
await trpc.order.updateOrderStatus.mutate({ id: order.id, status: "shipped" });
await trpc.order.updateOrderStatus.mutate({ id: order.id, status: "delivered" });

// 10. 买家提交评价
await trpc.factoryEnhanced.createReview.mutate({
  factoryId: factory.id,
  orderId: order.id,
  overallScore: 4.5,
  title: "优质供应商",
  content: "产品质量很好，交付及时！",
  // ...
});

console.log("完整业务流程执行成功！");
```

---

## 错误处理示例

### 1. 配额不足错误

```typescript
try {
  await trpc.factoryEnhanced.createProduct.mutate({ ... });
} catch (error) {
  if (error.message.includes("配额")) {
    // 提示用户升级订阅
    alert("产品数量已达上限，请升级订阅计划");
    window.location.href = "/subscription-plans";
  } else {
    alert(`创建失败：${error.message}`);
  }
}
```

### 2. 订阅过期错误

```typescript
const { data: subscription } = await trpc.subscriptionEnhanced.getCurrent.query();

if (subscription.status === "expired") {
  alert("您的订阅已过期，请续费");
  window.location.href = "/subscription-plans";
}
```

### 3. 权限错误

```typescript
try {
  await trpc.factoryEnhanced.update.mutate({ id: 1, name: "新名称" });
} catch (error) {
  if (error.message.includes("权限")) {
    alert("您没有权限修改此工厂信息");
  }
}
```

---

## React Hooks 使用示例

### 1. 使用 useQuery 获取数据

```typescript
import { trpc } from "@/lib/trpc";

function FactoryList() {
  const { data: factories, isLoading, error } = trpc.factoryEnhanced.list.useQuery({
    search: "电子",
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      {factories.map(factory => (
        <div key={factory.id}>{factory.name}</div>
      ))}
    </div>
  );
}
```

### 2. 使用 useMutation 修改数据

```typescript
function CreateProductForm() {
  const createMutation = trpc.factoryEnhanced.createProduct.useMutation({
    onSuccess: (data) => {
      alert(`产品创建成功，ID: ${data.id}`);
    },
    onError: (error) => {
      alert(`创建失败：${error.message}`);
    },
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={createMutation.isLoading}>
        {createMutation.isLoading ? "创建中..." : "创建产品"}
      </button>
    </form>
  );
}
```

### 3. 自动刷新数据

```typescript
function QuotaDashboard() {
  const { data: dashboard, refetch } = trpc.subscriptionEnhanced.getDashboard.useQuery();
  
  const upgradeMutation = trpc.subscriptionEnhanced.upgrade.useMutation({
    onSuccess: () => {
      // 升级成功后自动刷新配额数据
      refetch();
    },
  });

  return (
    <div>
      {/* 显示配额数据 */}
      <button onClick={() => upgradeMutation.mutate({ planId: "pro", billingCycle: "monthly" })}>
        升级到 Pro
      </button>
    </div>
  );
}
```

---

## 总结

本文档提供了 RealSourcing SaaS 平台所有主要 API 的使用示例，包括：

- ✅ 工厂管理（创建、认证、产品、评价）
- ✅ 订单管理（询价、报价、订单）
- ✅ 订阅管理（升级、降级、取消）
- ✅ 配额管理（检查、追踪、仪表板）
- ✅ 完整业务流程
- ✅ 错误处理
- ✅ React Hooks 集成

所有 API 都已集成配额检查和使用量追踪，确保 SaaS 商业化的顺利运行！
