# RealSourcing Webinar 功能分类和场景设计

**核心策略**：区分大型 Webinar 和小型 Webinar，满足不同采购场景的需求

---

## 📋 目录

1. [Webinar 分类策略](#webinar-分类策略)
2. [大型 Webinar 设计](#大型-webinar-设计)
3. [小型 Webinar 设计](#小型-webinar-设计)
4. [新增场景：TikTok/Dropshipper/网红达人](#新增场景)
5. [产品功能优化](#产品功能优化)
6. [定价策略调整](#定价策略调整)
7. [技术实现方案](#技术实现方案)

---

## Webinar 分类策略

### 为什么要区分大型和小型 Webinar？

**不同的采购场景有不同的需求**：

**大型 Webinar（30+ 人）**：
- 类似展会/发布会，公开性质
- 工厂展示新品、能力介绍、行业趋势分享
- 多个买家同时参与，提高效率
- 适合：新品发布、工厂开放日、行业峰会

**小型 Webinar（10 人以内）**：
- 私密、精准的对接
- 深度沟通，保护商业机密
- 快速决策，高转化率
- 适合：TikTok/Dropshipper 产品对接、网红达人选品、一对一商务谈判

### Webinar 类型定义

| 类型 | 参与人数 | 时长 | 公开性 | 主要场景 |
|-----|---------|------|--------|---------|
| **1对1 会议** | 2 人 | 15-60 分钟 | 私密 | 深度商务谈判、定制化需求讨论 |
| **小组会议** | 3-10 人 | 30-90 分钟 | 半私密 | TikTok/Dropshipper 对接、网红选品、小批量采购 |
| **中型 Webinar** | 11-30 人 | 60-120 分钟 | 半公开 | 产品培训、供应商对比、行业交流 |
| **大型 Webinar** | 31-100 人 | 90-180 分钟 | 公开 | 新品发布、工厂开放日、行业峰会 |
| **超大型 Webinar** | 100+ 人 | 120-240 分钟 | 公开 | 行业大会、品牌发布会（未来功能） |

---

## 大型 Webinar 设计

### 使用场景

**新品发布会**：
- 工厂发布新产品线
- 邀请多个潜在买家同时参与
- 统一介绍产品特性、价格、MOQ
- 现场 Q&A，提高效率

**工厂开放日**：
- 工厂展示生产线、质量控制流程
- 虚拟工厂参观（通过视频直播）
- 建立买家信任，提升品牌形象

**行业趋势分享**：
- 工厂分享行业趋势、技术创新
- 吸引潜在买家，建立专家形象
- 内容营销，提升品牌知名度

### 功能特性

**参与人数**：30-100 人

**互动方式**：
- 主讲人（工厂）：视频 + 音频 + 屏幕共享
- 参与者（买家）：默认静音，可举手发言
- 文字聊天：所有人可见
- Q&A 环节：买家提问，工厂回答

**录制和回放**：
- 自动录制整个 Webinar
- 会后提供回放链接
- 未参与的买家可以观看回放

**数据分析**：
- 参与者列表（姓名、公司、停留时长）
- 互动数据（提问次数、聊天活跃度）
- 转化追踪（会后询价数量）

**营销工具**：
- 自动发送邀请邮件
- 会前提醒（邮件 + 短信）
- 会后跟进邮件（包含回放链接和询价入口）

### 定价策略

**工厂端**：
- Basic Plan：每月 1 场大型 Webinar
- Professional Plan：每月 3 场大型 Webinar
- Enterprise Plan：无限大型 Webinar

**采购商端**：
- 完全免费参与
- 可以查看所有公开的大型 Webinar
- 可以报名参加感兴趣的 Webinar

---

## 小型 Webinar 设计

### 使用场景

#### 1. TikTok/Dropshipper 产品对接 ⭐ 核心场景

**背景**：
- TikTok Shop、Dropshipping 市场爆发式增长
- 卖家需要快速找到 OEM/ODM 工厂
- 低 MOQ、快速打样、灵活定制

**典型流程**：
1. TikTok 卖家发布产品需求（如：智能手表、美妆工具）
2. 平台 AI 匹配 3-5 家合适工厂
3. 创建小型 Webinar（卖家 + 3-5 家工厂）
4. 工厂轮流展示产品、报价、打样周期
5. 卖家现场对比，快速决策
6. 会后直接下单或要求打样

**价值**：
- **对卖家**：快速找到供应商，节省时间，降低风险
- **对工厂**：接触新兴市场，小单快返，提高订单量

#### 2. 网红达人选品对接 ⭐ 核心场景

**背景**：
- 网红/达人需要选品进行直播带货
- 需要独家货源、有竞争力的价格
- 快速上架，灵活合作

**典型流程**：
1. 网红/达人发布选品需求（如：家居用品、美妆产品）
2. 平台推荐 5-10 家工厂
3. 创建小型 Webinar（网红 + 5-10 家工厂）
4. 工厂展示产品、价格、佣金政策
5. 网红现场选品，谈判佣金
6. 达成合作，工厂提供独家货源

**价值**：
- **对网红**：快速找到优质货源，提高直播转化率
- **对工厂**：接触 C 端市场，提高品牌知名度

#### 3. 一对一商务谈判

**背景**：
- 大额订单、定制化需求
- 需要保护商业机密
- 深度沟通，建立信任

**典型流程**：
1. 买家发送询价（定制化产品、大额订单）
2. 工厂回复报价
3. 创建 1 对 1 Webinar（买家 + 工厂）
4. 深度讨论产品细节、价格、交期、付款方式
5. 达成初步协议
6. 签订合同

**价值**：
- **对买家**：私密沟通，保护商业机密
- **对工厂**：建立信任，提高成交率

#### 4. 小批量采购

**背景**：
- 中小企业、创业公司
- 订单量小（MOQ 100-1000 件）
- 需要快速决策

**典型流程**：
1. 买家发布小批量采购需求
2. 平台匹配接受小单的工厂
3. 创建小型 Webinar（买家 + 2-3 家工厂）
4. 工厂展示产品、报价、MOQ
5. 买家对比选择
6. 下单

**价值**：
- **对买家**：找到愿意接小单的工厂
- **对工厂**：积累客户，小单变大单

### 功能特性

**参与人数**：2-10 人

**互动方式**：
- 所有人：视频 + 音频 + 屏幕共享
- 平等对话，无主讲人/参与者区分
- 私密聊天：支持一对一私聊

**隐私保护**：
- 邀请制：只有受邀者可以加入
- 不公开：不在平台上展示
- 会后自动删除录制（可选）

**快速创建**：
- 买家可以即时创建小型 Webinar
- 邀请工厂加入（通过邮件/平台通知）
- 无需提前预约，随时开始

**AI 辅助**：
- AI 自动匹配合适的工厂
- AI 生成会议摘要（讨论要点、待办事项）
- AI 推荐后续行动（打样、下单）

### 定价策略

**工厂端**：
- Basic Plan：每月 10 场小型 Webinar
- Professional Plan：无限小型 Webinar
- Enterprise Plan：无限小型 Webinar + AI 优先推荐

**采购商端**：
- 完全免费创建和参与
- 无限制使用

---

## 新增场景

### TikTok/Dropshipper 专区

**产品定位**：
- 为 TikTok Shop 卖家、Dropshipper 提供专属采购通道
- 快速匹配低 MOQ、快速打样的工厂
- 一站式服务（选品、打样、下单、物流）

**功能特性**：

**1. TikTok 卖家认证**
- 提交 TikTok Shop 店铺链接
- 平台验证店铺真实性
- 认证后获得"TikTok Seller"徽章

**2. 低 MOQ 工厂筛选**
- 筛选条件：MOQ < 500 件
- 支持小批量定制
- 快速打样（7-14 天）

**3. 爆品推荐**
- AI 分析 TikTok 热销产品
- 推荐相关工厂和产品
- 提供市场趋势报告

**4. 快速对接流程**
- 卖家发布需求 → AI 匹配工厂 → 创建小型 Webinar → 工厂展示 → 卖家下单
- 全流程 < 48 小时

**5. 一件代发服务**
- 工厂支持一件代发
- 集成物流追踪
- 自动同步库存

**定价策略**：
- **TikTok 卖家**：完全免费
- **工厂**：需要订阅 Professional Plan 或以上（¥999/月起）
- **增值服务**：工厂可以购买"TikTok 专区推荐位"（¥2000-¥5000/月）

---

### 网红达人选品专区

**产品定位**：
- 为网红、达人、直播带货主播提供选品服务
- 连接工厂和网红，建立长期合作
- 提供独家货源、佣金分成

**功能特性**：

**1. 网红认证**
- 提交抖音/快手/TikTok 账号
- 平台验证粉丝数、带货能力
- 认证后获得"Verified Influencer"徽章

**2. 选品会**
- 定期举办线上选品会（每周 1-2 场）
- 邀请 10-20 家工厂展示新品
- 网红现场选品，谈判佣金

**3. 独家货源**
- 工厂提供独家货源（不在其他平台销售）
- 网红获得价格优势
- 提高直播转化率

**4. 佣金管理**
- 平台记录销售数据
- 自动计算佣金
- 定期结算（月结或季结）

**5. 数据分析**
- 网红带货数据（销量、转化率）
- 产品热度排行
- 帮助工厂优化产品

**定价策略**：
- **网红达人**：完全免费
- **工厂**：需要订阅 Professional Plan 或以上（¥999/月起）
- **佣金分成**：平台抽取 5-10% 佣金（从工厂佣金中扣除）

---

## 产品功能优化

### Webinar 创建流程优化

**大型 Webinar 创建**：
1. 选择"大型 Webinar"类型
2. 填写基本信息（标题、描述、时间、预计人数）
3. 设置公开性（公开/半公开/私密）
4. 上传封面图和宣传资料
5. 设置报名表单（收集参与者信息）
6. 发布并邀请买家

**小型 Webinar 创建**：
1. 选择"小型 Webinar"类型
2. 选择场景（TikTok 对接/网红选品/一对一谈判/小批量采购）
3. 填写基本信息（标题、描述、时间）
4. 邀请参与者（手动选择或 AI 推荐）
5. 立即开始或预约时间

### AI 智能匹配优化

**针对不同场景的匹配算法**：

**TikTok/Dropshipper 场景**：
- 优先匹配低 MOQ 工厂
- 优先匹配快速打样工厂
- 优先匹配支持一件代发的工厂

**网红达人场景**：
- 优先匹配有网红合作经验的工厂
- 优先匹配提供独家货源的工厂
- 优先匹配佣金政策灵活的工厂

**一对一谈判场景**：
- 优先匹配高评分工厂
- 优先匹配有大额订单经验的工厂
- 优先匹配响应速度快的工厂

### 数据分析优化

**工厂端数据**：
- 大型 Webinar：参与人数、停留时长、会后询价数
- 小型 Webinar：参与次数、成交率、平均订单金额
- 场景分析：哪种场景带来的订单最多

**采购商端数据**：
- 参与的 Webinar 数量和类型
- 发送的询价数量
- 成交订单数量和金额

---

## 定价策略调整

### 工厂端套餐（修订版）

#### 免费试用套餐（Free Trial）

**价格**：¥0（14 天试用）

**功能**：
- 创建工厂主页
- 上传产品（最多 5 个）
- 接收买家询价（最多 3 个）
- 参与买家发起的小型 Webinar（被动参与，最多 5 场）
- ❌ 主动创建 Webinar
- ❌ 参与 TikTok/网红专区

---

#### 基础套餐（Basic Plan）

**价格**：¥299/月 或 ¥2,990/年

**功能**：
- 上传产品（最多 30 个）
- 接收买家询价（每月 20 个）
- **大型 Webinar**：每月 1 场
- **小型 Webinar**：每月 10 场
- 参与 TikTok/网红专区（被动接收邀请）
- 基础数据分析
- 邮件客服支持（48 小时响应）

---

#### 专业套餐（Professional Plan）⭐ 推荐

**价格**：¥999/月 或 ¥9,990/年

**功能**：
- 上传产品（最多 100 个）
- 接收买家询价（无限）
- **大型 Webinar**：每月 3 场
- **小型 Webinar**：无限
- **TikTok/网红专区**：主动参与 + AI 优先推荐
- 高级展示位
- AI 推荐优先级提升
- 认证徽章
- 高级数据分析
- 视频录制和回放
- 在线客服支持（24 小时响应）

---

#### 企业套餐（Enterprise Plan）

**价格**：¥2,999/月 或 ¥29,990/年

**功能**：
- 上传产品（无限）
- 接收买家询价（无限）
- **大型 Webinar**：无限
- **小型 Webinar**：无限
- **TikTok/网红专区**：顶级推荐位
- 顶级展示位
- AI 推荐最高优先级
- 多工厂管理
- 专属客户经理
- 定制化营销支持
- 白标定制
- API 访问
- 优先客服支持（2 小时响应）

---

### 采购商端（完全免费）

**所有买家类型**：
- 传统采购商
- TikTok/Dropshipper
- 网红达人
- 跨境电商卖家

**功能**：
- 浏览工厂目录（无限）
- 发送询价（无限）
- 创建大型 Webinar（无限）
- 创建小型 Webinar（无限）
- 参与所有 Webinar（无限）
- AI 供应商匹配（每月 20 次）
- 工厂对比（最多 5 家）

---

## 技术实现方案

### 数据库设计更新

#### Webinars 表（更新）

```sql
CREATE TABLE webinars (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  host_id UUID NOT NULL, -- 主办方（工厂或采购商）
  host_type ENUM('factory', 'buyer') NOT NULL,
  
  -- 新增字段
  type ENUM('one_on_one', 'small_group', 'medium', 'large', 'extra_large') NOT NULL,
  max_participants INT NOT NULL, -- 最大参与人数
  scenario ENUM('general', 'tiktok_dropshipper', 'influencer_selection', 'negotiation', 'small_batch') DEFAULT 'general',
  
  status ENUM('scheduled', 'live', 'ended', 'cancelled') DEFAULT 'scheduled',
  visibility ENUM('public', 'semi_public', 'private') DEFAULT 'public',
  
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration INT, -- 预计时长（分钟）
  
  recording_url VARCHAR(500),
  cover_image VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Webinar Participants 表（更新）

```sql
CREATE TABLE webinar_participants (
  id UUID PRIMARY KEY,
  webinar_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_type ENUM('factory', 'buyer') NOT NULL,
  
  -- 新增字段
  role ENUM('host', 'co_host', 'participant') DEFAULT 'participant',
  invited_by UUID, -- 邀请人
  invitation_status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  duration INT, -- 停留时长（秒）
  
  -- 互动数据
  messages_sent INT DEFAULT 0,
  questions_asked INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### TikTok Sellers 表（新增）

```sql
CREATE TABLE tiktok_sellers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_url VARCHAR(500) NOT NULL,
  shop_name VARCHAR(255),
  follower_count INT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Influencers 表（新增）

```sql
CREATE TABLE influencers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  platform ENUM('douyin', 'kuaishou', 'tiktok', 'xiaohongshu') NOT NULL,
  account_url VARCHAR(500) NOT NULL,
  account_name VARCHAR(255),
  follower_count INT,
  avg_views INT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API 路由更新

```typescript
// server/routers/webinars.ts

// 创建 Webinar（更新）
router.post('/webinars', async (req, res) => {
  const { title, description, type, scenario, max_participants, visibility, scheduled_at } = req.body;
  const userId = req.user.id;
  const userType = req.user.role; // 'factory' or 'buyer'
  
  // 检查权限
  if (userType === 'factory') {
    const subscription = await getSubscription(userId);
    const usage = await getMonthlyUsage(userId, `webinar_${type}`);
    const limit = getWebinarLimit(subscription.plan_id, type);
    
    if (usage >= limit) {
      return res.status(403).json({ error: 'Webinar limit reached' });
    }
  }
  
  // 创建 Webinar
  const webinar = await db.webinars.create({
    title,
    description,
    host_id: userId,
    host_type: userType,
    type,
    scenario,
    max_participants,
    visibility,
    scheduled_at,
    status: 'scheduled',
  });
  
  // 记录使用量
  if (userType === 'factory') {
    await recordUsage(userId, `webinar_${type}`, 1);
  }
  
  res.json(webinar);
});

// AI 匹配工厂（新增）
router.post('/webinars/:id/match-factories', async (req, res) => {
  const { id } = req.params;
  const { scenario, requirements } = req.body;
  
  const webinar = await db.webinars.findUnique({ where: { id } });
  
  // 根据场景匹配工厂
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
  }
  
  res.json(factories);
});

// 获取 Webinar 限制
function getWebinarLimit(planId: string, type: string): number {
  const limits = {
    free_trial: { large: 0, small_group: 5 },
    basic: { large: 1, small_group: 10 },
    professional: { large: 3, small_group: Infinity },
    enterprise: { large: Infinity, small_group: Infinity },
  };
  
  const plan = limits[planId] || limits.free_trial;
  
  if (type === 'large' || type === 'extra_large') {
    return plan.large;
  } else {
    return plan.small_group;
  }
}
```

### 前端组件更新

```typescript
// client/src/components/CreateWebinarModal.tsx

export function CreateWebinarModal() {
  const [type, setType] = useState<'large' | 'small_group'>('small_group');
  const [scenario, setScenario] = useState<string>('general');
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建 Webinar</DialogTitle>
        </DialogHeader>
        
        {/* 选择类型 */}
        <div className="space-y-4">
          <Label>Webinar 类型</Label>
          <RadioGroup value={type} onValueChange={setType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small_group" id="small" />
              <Label htmlFor="small">
                小型 Webinar（2-10 人）
                <p className="text-sm text-gray-400">适合私密对接、快速沟通</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large">
                大型 Webinar（30+ 人）
                <p className="text-sm text-gray-400">适合新品发布、工厂开放日</p>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* 选择场景（仅小型 Webinar） */}
        {type === 'small_group' && (
          <div className="space-y-4">
            <Label>应用场景</Label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">常规商务会议</SelectItem>
                <SelectItem value="tiktok_dropshipper">
                  🎵 TikTok/Dropshipper 产品对接
                </SelectItem>
                <SelectItem value="influencer_selection">
                  ⭐ 网红达人选品对接
                </SelectItem>
                <SelectItem value="negotiation">一对一商务谈判</SelectItem>
                <SelectItem value="small_batch">小批量采购</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* AI 推荐工厂（TikTok/网红场景） */}
        {(scenario === 'tiktok_dropshipper' || scenario === 'influencer_selection') && (
          <div className="space-y-4">
            <Label>AI 推荐工厂</Label>
            <Button variant="outline" onClick={handleMatchFactories}>
              <Sparkles className="w-4 h-4 mr-2" />
              智能匹配工厂
            </Button>
            {matchedFactories.length > 0 && (
              <div className="space-y-2">
                {matchedFactories.map(factory => (
                  <div key={factory.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <img src={factory.logo} className="w-8 h-8 rounded" />
                      <span>{factory.name}</span>
                      <Badge>{factory.score}</Badge>
                    </div>
                    <Checkbox />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 其他字段... */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 总结

通过区分大型和小型 Webinar，RealSourcing 可以满足不同采购场景的需求：

**大型 Webinar**：
- 适合新品发布、工厂开放日、行业峰会
- 公开性质，提高效率
- 录制回放，扩大影响力

**小型 Webinar**：
- 适合 TikTok/Dropshipper 对接、网红选品、一对一谈判
- 私密性质，保护商业机密
- 快速决策，高转化率

**新增场景**（TikTok/网红达人）：
- 抓住新兴市场机会
- 为工厂带来新的订单来源
- 为平台带来差异化竞争优势

**定价策略**：
- 根据 Webinar 类型和数量分级定价
- 鼓励工厂升级到 Professional Plan（¥999/月）
- 采购商完全免费，降低获客成本

---

**文档版本**：1.0  
**最后更新**：2026-02-13  
**维护者**：RealSourcing Team
