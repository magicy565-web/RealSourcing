# RealSourcing Webinar 功能实施指南

**版本**: 1.0  
**最后更新**: 2026-02-13  
**状态**: ✅ 数据库和 Mock 数据已完成，前端 UI 待实施

---

## 📋 目录

1. [已完成工作](#已完成工作)
2. [待实施功能](#待实施功能)
3. [前端组件设计](#前端组件设计)
4. [API 路由设计](#api-路由设计)
5. [实施步骤](#实施步骤)
6. [测试清单](#测试清单)

---

## 已完成工作

### ✅ Directus 数据库 Schema

已在 Directus 中为 `webinars` Collection 添加以下字段：

| 字段名 | 类型 | 选项 | 说明 |
|-------|------|------|------|
| `type` | string | one_on_one, small_group, medium, large, extra_large | Webinar 类型 |
| `scenario` | string | general, tiktok_dropshipper, influencer_selection, negotiation, small_batch, product_launch, factory_tour, industry_summit | 应用场景 |
| `visibility` | string | public, semi_public, private | 可见性 |
| `host_type` | string | factory, buyer | 主办方类型 |
| `actual_participants` | integer | - | 实际参与人数 |
| `max_participants` | integer | - | 最大参与人数 |

### ✅ Mock 数据

已更新 `client/src/lib/mock-data.ts`：

1. **更新 MockWebinar 接口**：添加新字段类型定义
2. **更新现有 5 个 Webinar**：添加 type, scenario, visibility, actual_participants, host_type
3. **新增 2 个 Webinar**：
   - TikTok Hot Products Sourcing Session (small_group, tiktok_dropshipper)
   - Influencer Product Selection - Beauty & Personal Care (small_group, influencer_selection)

### ✅ 前端显示

Webinars 列表页已正常显示新数据，包括参与人数和类别标签。

---

## 待实施功能

### 1. Webinar 创建流程（高优先级）

**文件**: `client/src/components/CreateWebinarModal.tsx` (新建)

**功能需求**：
- 用户点击"Create Webinar"按钮打开模态框
- 第一步：选择 Webinar 类型（大型/小型）
- 第二步：选择应用场景（根据类型显示不同选项）
- 第三步：填写基本信息（标题、描述、时间、封面图）
- 第四步：设置参与者限制和可见性
- 第五步：预览并创建

**UI 设计要点**：
- 使用多步骤向导（Stepper）
- 类型选择使用大卡片（带图标和说明）
- 场景选择使用图标网格
- 表单验证和错误提示

### 2. Webinar 列表和详情页优化（中优先级）

**文件**: 
- `client/src/pages/Webinars.tsx` (已存在，需优化)
- `client/src/pages/WebinarDetail.tsx` (已存在，需优化)

**功能需求**：
- 列表页：显示类型和场景标签（带颜色和图标）
- 列表页：按类型和场景筛选
- 详情页：显示类型、场景、可见性、主办方类型
- 详情页：显示实际参与人数 / 最大参与人数

**UI 设计要点**：
- 类型标签：使用不同颜色（大型=紫色，小型=蓝色）
- 场景标签：使用图标（TikTok=🎵，网红=⭐，谈判=💼）
- 筛选器：使用下拉菜单或标签云

### 3. TikTok/网红专区页面（中优先级）

**文件**: 
- `client/src/pages/TikTokZone.tsx` (新建)
- `client/src/pages/InfluencerZone.tsx` (新建)

**功能需求**：
- 展示专门针对 TikTok 卖家/网红的 Webinar
- 显示成功案例和数据统计
- 提供快速创建入口
- AI 推荐工厂功能

**UI 设计要点**：
- 使用专属配色（TikTok=黑红，网红=金色）
- 展示成功案例卡片
- 数据可视化（成交金额、订单数）

### 4. AI 智能匹配功能（低优先级）

**文件**: `server/lib/ai-matching.ts` (新建)

**功能需求**：
- 根据买家需求自动匹配工厂
- 支持不同场景的匹配算法
- 返回匹配度评分和推荐理由

---

## 前端组件设计

### CreateWebinarModal 组件

```typescript
// client/src/components/CreateWebinarModal.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type WebinarType = 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';
type WebinarScenario = 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';

interface CreateWebinarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WebinarFormData) => void;
}

interface WebinarFormData {
  title: string;
  description: string;
  type: WebinarType;
  scenario: WebinarScenario;
  visibility: 'public' | 'semi_public' | 'private';
  max_participants: number;
  scheduled_at: string;
  duration: number;
  category: string;
  language: string;
  cover_image?: string;
}

export function CreateWebinarModal({ open, onClose, onSubmit }: CreateWebinarModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<WebinarFormData>>({
    type: 'small_group',
    scenario: 'general',
    visibility: 'private',
    max_participants: 10,
    duration: 60,
    language: 'en',
  });

  const handleTypeChange = (type: WebinarType) => {
    setFormData({ ...formData, type });
    // 根据类型设置默认参与人数
    if (type === 'one_on_one') {
      setFormData({ ...formData, type, max_participants: 2 });
    } else if (type === 'small_group') {
      setFormData({ ...formData, type, max_participants: 10 });
    } else if (type === 'medium') {
      setFormData({ ...formData, type, max_participants: 30 });
    } else if (type === 'large') {
      setFormData({ ...formData, type, max_participants: 100 });
    } else {
      setFormData({ ...formData, type, max_participants: 200 });
    }
  };

  const handleScenarioChange = (scenario: WebinarScenario) => {
    setFormData({ ...formData, scenario });
  };

  const handleSubmit = () => {
    if (formData.title && formData.description && formData.scheduled_at) {
      onSubmit(formData as WebinarFormData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>创建 Webinar</DialogTitle>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-violet-600' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {/* 步骤 1: 选择类型 */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-lg">选择 Webinar 类型</Label>
            <RadioGroup value={formData.type} onValueChange={handleTypeChange}>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-700 rounded-lg p-4 hover:border-violet-600 cursor-pointer">
                  <RadioGroupItem value="small_group" id="small_group" className="sr-only" />
                  <Label htmlFor="small_group" className="cursor-pointer">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-semibold">小组会议</div>
                    <div className="text-sm text-gray-400">2-10 人，私密对接</div>
                  </Label>
                </div>
                <div className="border border-gray-700 rounded-lg p-4 hover:border-violet-600 cursor-pointer">
                  <RadioGroupItem value="large" id="large" className="sr-only" />
                  <Label htmlFor="large" className="cursor-pointer">
                    <div className="text-2xl mb-2">🎪</div>
                    <div className="font-semibold">大型 Webinar</div>
                    <div className="text-sm text-gray-400">30+ 人，公开展示</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <Button onClick={() => setStep(2)} className="w-full">
              下一步
            </Button>
          </div>
        )}

        {/* 步骤 2: 选择场景 */}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-lg">选择应用场景</Label>
            <Select value={formData.scenario} onValueChange={handleScenarioChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">常规商务会议</SelectItem>
                {formData.type === 'small_group' && (
                  <>
                    <SelectItem value="tiktok_dropshipper">🎵 TikTok/Dropshipper 产品对接</SelectItem>
                    <SelectItem value="influencer_selection">⭐ 网红达人选品对接</SelectItem>
                    <SelectItem value="negotiation">💼 一对一商务谈判</SelectItem>
                    <SelectItem value="small_batch">📦 小批量采购</SelectItem>
                  </>
                )}
                {formData.type === 'large' && (
                  <>
                    <SelectItem value="product_launch">🚀 新品发布会</SelectItem>
                    <SelectItem value="factory_tour">🏭 工厂开放日</SelectItem>
                    <SelectItem value="industry_summit">🎯 行业峰会</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                上一步
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* 步骤 3: 基本信息 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>标题</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入 Webinar 标题"
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述 Webinar 内容"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>开始时间</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>
              <div>
                <Label>时长（分钟）</Label>
                <Input
                  type="number"
                  value={formData.duration || 60}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                上一步
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* 步骤 4: 设置 */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>可见性</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">公开 - 所有人可见</SelectItem>
                  <SelectItem value="semi_public">半公开 - 需要报名</SelectItem>
                  <SelectItem value="private">私密 - 仅受邀者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>最大参与人数</Label>
              <Input
                type="number"
                value={formData.max_participants || 10}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                上一步
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                创建 Webinar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### WebinarTypeLabel 组件

```typescript
// client/src/components/WebinarTypeLabel.tsx

import { Badge } from '@/components/ui/badge';

type WebinarType = 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';

interface WebinarTypeLabelProps {
  type: WebinarType;
}

const typeConfig = {
  one_on_one: { label: '1对1', color: 'bg-blue-600', icon: '💬' },
  small_group: { label: '小组', color: 'bg-violet-600', icon: '👥' },
  medium: { label: '中型', color: 'bg-purple-600', icon: '🎯' },
  large: { label: '大型', color: 'bg-pink-600', icon: '🎪' },
  extra_large: { label: '超大型', color: 'bg-red-600', icon: '🏟️' },
};

export function WebinarTypeLabel({ type }: WebinarTypeLabelProps) {
  const config = typeConfig[type];
  return (
    <Badge className={`${config.color} text-white`}>
      {config.icon} {config.label}
    </Badge>
  );
}
```

### WebinarScenarioLabel 组件

```typescript
// client/src/components/WebinarScenarioLabel.tsx

import { Badge } from '@/components/ui/badge';

type WebinarScenario =
  | 'general'
  | 'tiktok_dropshipper'
  | 'influencer_selection'
  | 'negotiation'
  | 'small_batch'
  | 'product_launch'
  | 'factory_tour'
  | 'industry_summit';

interface WebinarScenarioLabelProps {
  scenario: WebinarScenario;
}

const scenarioConfig = {
  general: { label: '常规', color: 'bg-gray-600', icon: '📋' },
  tiktok_dropshipper: { label: 'TikTok', color: 'bg-red-600', icon: '🎵' },
  influencer_selection: { label: '网红选品', color: 'bg-orange-600', icon: '⭐' },
  negotiation: { label: '商务谈判', color: 'bg-blue-600', icon: '💼' },
  small_batch: { label: '小批量', color: 'bg-green-600', icon: '📦' },
  product_launch: { label: '新品发布', color: 'bg-purple-600', icon: '🚀' },
  factory_tour: { label: '工厂开放日', color: 'bg-indigo-600', icon: '🏭' },
  industry_summit: { label: '行业峰会', color: 'bg-pink-600', icon: '🎯' },
};

export function WebinarScenarioLabel({ scenario }: WebinarScenarioLabelProps) {
  const config = scenarioConfig[scenario];
  return (
    <Badge className={`${config.color} text-white`}>
      {config.icon} {config.label}
    </Badge>
  );
}
```

---

## API 路由设计

### 创建 Webinar

```typescript
// server/routers/webinars.ts

router.post('/webinars', async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // 'factory' or 'buyer'
  
  const {
    title,
    description,
    type,
    scenario,
    visibility,
    max_participants,
    scheduled_at,
    duration,
    category,
    language,
    cover_image,
  } = req.body;

  // 检查权限：工厂是否有足够的配额
  if (userRole === 'factory') {
    const subscription = await getSubscription(userId);
    const usage = await getMonthlyUsage(userId, `webinar_${type}`);
    const limit = getWebinarLimit(subscription.plan_id, type);
    
    if (usage >= limit) {
      return res.status(403).json({
        error: 'Webinar limit reached',
        message: `您的套餐每月最多创建 ${limit} 个${type === 'large' ? '大型' : '小型'} Webinar`,
      });
    }
  }

  // 创建 Webinar
  const webinar = await db.webinars.create({
    title,
    description,
    type,
    scenario,
    visibility,
    max_participants,
    actual_participants: 0,
    host_type: userRole,
    scheduled_at,
    duration,
    category,
    language,
    cover_image,
    status: 'scheduled',
    created_by: userId,
  });

  // 记录使用量
  if (userRole === 'factory') {
    await recordUsage(userId, `webinar_${type}`, 1);
  }

  res.json(webinar);
});
```

### 获取 Webinar 列表（带筛选）

```typescript
// server/routers/webinars.ts

router.get('/webinars', async (req, res) => {
  const { type, scenario, status, visibility } = req.query;

  const filters: any = {};
  if (type) filters.type = type;
  if (scenario) filters.scenario = scenario;
  if (status) filters.status = status;
  if (visibility) filters.visibility = visibility;

  const webinars = await db.webinars.findMany({
    where: filters,
    orderBy: { scheduled_at: 'desc' },
  });

  res.json(webinars);
});
```

### AI 匹配工厂

```typescript
// server/routers/webinars.ts

router.post('/webinars/:id/match-factories', async (req, res) => {
  const { id } = req.params;
  const { scenario, requirements } = req.body;

  const webinar = await db.webinars.findUnique({ where: { id } });

  let factories = [];

  if (scenario === 'tiktok_dropshipper') {
    // 匹配低 MOQ、快速打样的工厂
    factories = await db.factories.findMany({
      where: {
        min_order_quantity: { lte: 500 },
        sample_lead_time: { lte: 14 },
        subscription_plan: { in: ['professional', 'enterprise'] },
      },
      orderBy: { score: 'desc' },
      take: 5,
    });
  } else if (scenario === 'influencer_selection') {
    // 匹配有网红合作经验的工厂
    factories = await db.factories.findMany({
      where: {
        has_influencer_experience: true,
        subscription_plan: { in: ['professional', 'enterprise'] },
      },
      orderBy: { score: 'desc' },
      take: 10,
    });
  } else {
    // 常规匹配
    factories = await db.factories.findMany({
      orderBy: { score: 'desc' },
      take: 10,
    });
  }

  res.json(factories);
});
```

---

## 实施步骤

### Phase 1: 核心功能（1-2 周）

1. **创建 CreateWebinarModal 组件** (2-3 天)
   - 实现多步骤向导
   - 添加表单验证
   - 集成 API 调用

2. **更新 Webinars 列表页** (1-2 天)
   - 添加类型和场景标签
   - 添加筛选功能
   - 优化卡片布局

3. **更新 WebinarDetail 页面** (1-2 天)
   - 显示类型、场景、可见性
   - 显示参与人数进度条
   - 优化信息展示

4. **API 路由实现** (2-3 天)
   - 创建 Webinar API
   - 获取 Webinar 列表（带筛选）
   - 权限检查和配额管理

### Phase 2: 专区页面（1-2 周）

1. **创建 TikTok 专区页面** (2-3 天)
   - 专属 UI 设计
   - 成功案例展示
   - 快速创建入口

2. **创建网红专区页面** (2-3 天)
   - 专属 UI 设计
   - 数据可视化
   - 选品会日历

3. **导航菜单更新** (1 天)
   - 添加专区入口
   - 更新路由配置

### Phase 3: AI 功能（2-3 周）

1. **AI 匹配算法** (1 周)
   - 实现不同场景的匹配逻辑
   - 计算匹配度评分
   - 生成推荐理由

2. **前端集成** (1 周)
   - 添加"AI 推荐工厂"按钮
   - 显示匹配结果
   - 一键邀请功能

---

## 测试清单

### 功能测试

- [ ] 创建小组会议 Webinar（TikTok 场景）
- [ ] 创建大型 Webinar（新品发布场景）
- [ ] 按类型筛选 Webinar 列表
- [ ] 按场景筛选 Webinar 列表
- [ ] 查看 Webinar 详情页（显示类型和场景）
- [ ] 工厂用户创建 Webinar（检查配额限制）
- [ ] 买家用户创建 Webinar（无限制）
- [ ] AI 匹配工厂（TikTok 场景）
- [ ] AI 匹配工厂（网红场景）

### UI/UX 测试

- [ ] 类型标签颜色正确
- [ ] 场景标签图标正确
- [ ] 创建向导流程顺畅
- [ ] 表单验证提示清晰
- [ ] 响应式布局正常
- [ ] 移动端显示正常

### 性能测试

- [ ] 列表页加载速度 < 1s
- [ ] 筛选响应速度 < 500ms
- [ ] 创建 Webinar 响应速度 < 2s
- [ ] AI 匹配响应速度 < 3s

---

## 附录

### 类型和场景映射表

| 类型 | 推荐场景 | 参与人数 | 可见性 |
|-----|---------|---------|--------|
| one_on_one | negotiation | 2 | private |
| small_group | tiktok_dropshipper, influencer_selection, small_batch | 3-10 | private |
| medium | general | 11-30 | semi_public |
| large | product_launch, factory_tour | 31-100 | public |
| extra_large | industry_summit | 100+ | public |

### 配额限制表

| 套餐 | 大型 Webinar | 小型 Webinar |
|-----|-------------|-------------|
| Free Trial | 0 | 5 |
| Basic | 1/月 | 10/月 |
| Professional | 3/月 | 无限 |
| Enterprise | 无限 | 无限 |

---

**文档维护者**: RealSourcing Team  
**反馈和建议**: 请在 GitHub Issues 中提交
