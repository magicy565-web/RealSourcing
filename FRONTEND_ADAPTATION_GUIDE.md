# RealSourcing 前端适配指南

**日期**: 2026-02-17  
**版本**: 1.0  
**目标**: 适配数据库增强后的新字段和功能

---

## 📋 概览

数据库增强后,前端需要进行以下适配工作:

1. **更新 TypeScript 类型定义**
2. **扩展 tRPC Router API**
3. **更新前端组件**
4. **新增 AI 功能组件**
5. **优化数据展示**

---

## 🔧 第 1 步: 更新 TypeScript 类型定义

### 1.1 更新 Webinar 类型

**文件**: `client/src/types/webinar.ts`

```typescript
export interface Webinar {
  // ===== 现有字段 =====
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  duration: number;
  coverImage?: string;
  
  // ===== 新增字段 - 讲师信息 =====
  speaker?: string;
  speakerTitle?: string;
  speakerCompany?: string;
  speakerBio?: string;
  speakerAvatar?: string;
  speakerLinkedin?: string;
  
  // ===== 新增字段 - 组织信息 =====
  organizer?: string;
  organizerLogo?: string;
  coOrganizers?: string[];
  registrationUrl?: string;
  externalEventId?: string;
  eventSource?: string;
  
  // ===== 新增字段 - 分类标签 =====
  industry?: string;
  topics?: string[];
  targetAudience?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  
  // ===== 新增字段 - 营销展示 =====
  subtitle?: string;
  highlights?: string[];
  agenda?: Array<{time: string, title: string, description?: string}>;
  learningOutcomes?: string[];
  promoVideoUrl?: string;
  thumbnailUrl?: string;
  bannerImage?: string;
  
  // ===== 新增字段 - 统计数据 =====
  registrationCount: number;
  attendanceCount: number;
  completionRate: number;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  shareCount: number;
  clickCount: number;
  
  // ===== 新增字段 - 互动数据 =====
  questionCount: number;
  pollCount: number;
  chatMessageCount: number;
  productFavoriteCount: number;
  inquiryCount: number;
  
  // ===== 新增字段 - SEO =====
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  
  // ===== 新增字段 - 设置 =====
  requiresApproval: boolean;
  isPublic: boolean;
  allowRecording: boolean;
  allowChat: boolean;
  allowQA: boolean;
  allowProductDisplay: boolean;
  
  // ===== 新增字段 - 商业数据 =====
  estimatedRevenue?: number;
  actualRevenue?: number;
  conversionRate?: number;
  roi?: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2 更新 WebinarProduct 类型

**文件**: `client/src/types/product.ts`

```typescript
export interface WebinarProduct {
  // ===== 现有字段 =====
  id: number;
  webinarId: number;
  productId?: number;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  
  // ===== 新增字段 - 展示 =====
  displayOrder: number;
  highlightText?: string;
  isHighlighted: boolean;
  isPinned: boolean;
  
  // ===== 新增字段 - 详情 =====
  sku?: string;
  specifications?: Record<string, string>;
  features?: string[];
  images?: string[];
  videos?: string[];
  thumbnailUrl?: string;
  
  // ===== 新增字段 - 采购信息 =====
  moq?: number;
  priceRange?: string;
  leadTime?: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  stockQuantity?: number;
  customizable: boolean;
  customizationOptions?: string[];
  
  // ===== 新增字段 - 统计 =====
  favoriteCount: number;
  inquiryCount: number;
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  conversionRate: number;
  
  // ===== 新增字段 - 营销 =====
  originalPrice?: number;
  discountPercent?: number;
  promotionText?: string;
  badges?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 新增 BuyerProfile 类型

**文件**: `client/src/types/buyer.ts`

```typescript
export interface BuyerProfile {
  id: number;
  userId: number;
  
  // 店铺信息
  shopType?: string;
  shopName?: string;
  shopUrl?: string;
  shopCountry?: string;
  
  // 经营特征
  mainCategories?: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
  monthlySalesVolume?: number;
  averageOrderValue?: number;
  
  // 采购偏好
  preferredMoqMin?: number;
  preferredMoqMax?: number;
  preferredLeadTime?: string;
  targetMarkets?: string[];
  purchaseFrequency?: string;
  
  // 采购历史
  totalOrders: number;
  totalSpent: number;
  totalProducts: number;
  favoriteSuppliers?: number[];
  lastPurchaseAt?: Date;
  
  // 产品偏好
  productPreferences?: {
    categories: string[];
    priceRange: {min: number, max: number};
    features: string[];
    styles: string[];
  };
  searchKeywords?: string[];
  favoriteColors?: string[];
  favoriteMaterials?: string[];
  
  // 行为特征
  webinarsAttended: number;
  productsViewed: number;
  productsFavorited: number;
  inquiriesSent: number;
  inquiryResponseRate: number;
  averageDecisionTime?: number;
  
  // 信用评级
  creditScore: number;
  reliabilityScore: number;
  paymentOnTimeRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.4 新增 AIRecommendation 类型

**文件**: `client/src/types/ai.ts`

```typescript
export interface AIRecommendation {
  id: number;
  userId: number;
  webinarId: number;
  productId: number;
  recommendationType: 'high_match' | 'medium_match' | 'similar' | 'trending' | 'complementary';
  matchScore: number;
  matchReasons: string[];
  
  // 行为追踪
  isShown: boolean;
  shownAt?: Date;
  isClicked: boolean;
  clickedAt?: Date;
  isConverted: boolean;
  convertedAt?: Date;
  conversionType?: string;
  
  // 模型信息
  modelVersion?: string;
  confidenceScore?: number;
  
  createdAt: Date;
}

export interface WebinarReport {
  id: number;
  webinarId: number;
  
  // 基础统计
  totalParticipants: number;
  totalProducts: number;
  totalFavorites: number;
  totalInquiries: number;
  totalChatMessages: number;
  totalQuestions: number;
  
  // 参与度
  averageStayTime?: number;
  completionRate?: number;
  engagementScore?: number;
  
  // 热门产品
  hotProducts?: Array<{
    productId: number;
    productName: string;
    favoriteCount: number;
    inquiryCount: number;
    viewCount: number;
  }>;
  
  // 高意向买家
  highIntentBuyers?: Array<{
    userId: number;
    userName: string;
    intentScore: number;
    favoritedProducts: number[];
    inquiredProducts: number[];
    estimatedOrderValue: number;
  }>;
  
  // AI 分析
  aiInsights?: string;
  aiRecommendations?: string;
  aiSummary?: string;
  
  // 商业数据
  estimatedRevenue?: number;
  actualRevenue?: number;
  conversionRate?: number;
  roi?: number;
  
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🚀 第 2 步: 扩展 tRPC Router API

### 2.1 更新 Webinar Router

**文件**: `server/routers/webinar.router.ts`

```typescript
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { webinars, webinarProducts, aiRecommendations, webinarReports } from '../../drizzle/schema';
import { eq, desc, and, like, inArray } from 'drizzle-orm';

export const webinarRouter = router({
  // ===== 现有 API (保留) =====
  listAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(webinars).orderBy(desc(webinars.scheduledAt));
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const webinar = await ctx.db.select().from(webinars).where(eq(webinars.id, input.id)).limit(1);
      return webinar[0];
    }),

  // ===== 新增 API - 获取增强的 Webinar 详情 =====
  getEnhancedById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // 获取 Webinar 基础信息
      const webinar = await ctx.db.select().from(webinars).where(eq(webinars.id, input.id)).limit(1);
      
      if (!webinar[0]) {
        throw new Error('Webinar not found');
      }

      // 获取产品列表
      const products = await ctx.db.select().from(webinarProducts)
        .where(eq(webinarProducts.webinarId, input.id))
        .orderBy(webinarProducts.displayOrder);

      // 获取会议报告
      const report = await ctx.db.select().from(webinarReports)
        .where(eq(webinarReports.webinarId, input.id))
        .limit(1);

      return {
        ...webinar[0],
        products,
        report: report[0] || null
      };
    }),

  // ===== 新增 API - 按行业筛选 =====
  listByIndustry: publicProcedure
    .input(z.object({ 
      industry: z.string(),
      limit: z.number().optional().default(20)
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(webinars)
        .where(eq(webinars.industry, input.industry))
        .orderBy(desc(webinars.scheduledAt))
        .limit(input.limit);
    }),

  // ===== 新增 API - 按主题搜索 =====
  searchByTopics: publicProcedure
    .input(z.object({ 
      topics: z.array(z.string()),
      limit: z.number().optional().default(20)
    }))
    .query(async ({ ctx, input }) => {
      // 注意: JSON 字段搜索需要使用 SQL 函数
      return await ctx.db.select().from(webinars)
        .where(sql`JSON_CONTAINS(${webinars.topics}, ${JSON.stringify(input.topics)})`)
        .orderBy(desc(webinars.scheduledAt))
        .limit(input.limit);
    }),

  // ===== 新增 API - 获取 AI 推荐产品 =====
  getAIRecommendations: publicProcedure
    .input(z.object({ 
      webinarId: z.number(),
      userId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(aiRecommendations)
        .where(and(
          eq(aiRecommendations.webinarId, input.webinarId),
          eq(aiRecommendations.userId, input.userId)
        ))
        .orderBy(desc(aiRecommendations.matchScore));
    }),

  // ===== 新增 API - 记录 AI 推荐展示 =====
  trackAIRecommendationShown: publicProcedure
    .input(z.object({ 
      recommendationId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(aiRecommendations)
        .set({ 
          isShown: 1, 
          shownAt: new Date() 
        })
        .where(eq(aiRecommendations.id, input.recommendationId));
      
      return { success: true };
    }),

  // ===== 新增 API - 记录 AI 推荐点击 =====
  trackAIRecommendationClick: publicProcedure
    .input(z.object({ 
      recommendationId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(aiRecommendations)
        .set({ 
          isClicked: 1, 
          clickedAt: new Date() 
        })
        .where(eq(aiRecommendations.id, input.recommendationId));
      
      return { success: true };
    }),

  // ===== 新增 API - 增加浏览量 =====
  incrementViewCount: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(webinars)
        .set({ viewCount: sql`${webinars.viewCount} + 1` })
        .where(eq(webinars.id, input.id));
      
      return { success: true };
    }),

  // ===== 新增 API - 增加分享次数 =====
  incrementShareCount: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(webinars)
        .set({ shareCount: sql`${webinars.shareCount} + 1` })
        .where(eq(webinars.id, input.id));
      
      return { success: true };
    }),
});
```

### 2.2 新增 Buyer Profile Router

**文件**: `server/routers/buyer.router.ts`

```typescript
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { buyerProfiles } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const buyerRouter = router({
  // 获取买家画像
  getProfile: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.select().from(buyerProfiles)
        .where(eq(buyerProfiles.userId, input.userId))
        .limit(1);
      
      return profile[0] || null;
    }),

  // 更新买家画像
  updateProfile: publicProcedure
    .input(z.object({
      userId: z.number(),
      data: z.object({
        shopType: z.string().optional(),
        shopName: z.string().optional(),
        mainCategories: z.array(z.string()).optional(),
        priceRangeMin: z.number().optional(),
        priceRangeMax: z.number().optional(),
        // ... 其他字段
      })
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(buyerProfiles)
        .set(input.data)
        .where(eq(buyerProfiles.userId, input.userId));
      
      return { success: true };
    }),

  // 增加参会次数
  incrementWebinarsAttended: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(buyerProfiles)
        .set({ webinarsAttended: sql`${buyerProfiles.webinarsAttended} + 1` })
        .where(eq(buyerProfiles.userId, input.userId));
      
      return { success: true };
    }),
});
```

---

## 🎨 第 3 步: 更新前端组件

### 3.1 增强 WebinarCard 组件

**文件**: `client/src/components/WebinarCard.tsx`

```typescript
import { Webinar } from '@/types/webinar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Eye, TrendingUp } from 'lucide-react';

interface WebinarCardProps {
  webinar: Webinar;
}

export function WebinarCard({ webinar }: WebinarCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* 封面图 */}
      <div className="relative h-48">
        <img 
          src={webinar.coverImage || webinar.thumbnailUrl || '/placeholder.jpg'} 
          alt={webinar.title}
          className="w-full h-full object-cover"
        />
        {/* 状态徽章 */}
        <Badge className="absolute top-2 right-2">
          {webinar.status}
        </Badge>
        {/* 行业标签 */}
        {webinar.industry && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            {webinar.industry}
          </Badge>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {webinar.title}
        </h3>

        {/* 副标题 */}
        {webinar.subtitle && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {webinar.subtitle}
          </p>
        )}

        {/* 讲师信息 */}
        {webinar.speaker && (
          <div className="flex items-center gap-2 mb-3">
            {webinar.speakerAvatar && (
              <img 
                src={webinar.speakerAvatar} 
                alt={webinar.speaker}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-sm">
              <div className="font-medium">{webinar.speaker}</div>
              {webinar.speakerTitle && (
                <div className="text-gray-500">{webinar.speakerTitle}</div>
              )}
            </div>
          </div>
        )}

        {/* 主题标签 */}
        {webinar.topics && webinar.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {webinar.topics.slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* 元数据 */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(webinar.scheduledAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {webinar.duration} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {webinar.registrationCount} registered
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {webinar.viewCount} views
          </div>
        </div>

        {/* 评分 */}
        {webinar.averageRating > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <span className="ml-1 font-medium">{webinar.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({webinar.ratingCount} ratings)
            </span>
          </div>
        )}

        {/* 核心亮点 */}
        {webinar.highlights && webinar.highlights.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <div className="text-sm font-medium mb-1">Highlights:</div>
            <ul className="text-sm text-gray-600 space-y-1">
              {webinar.highlights.slice(0, 2).map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="line-clamp-1">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3.2 新增 AI 推荐组件

**文件**: `client/src/components/AIRecommendations.tsx`

```typescript
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { WebinarProduct } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface AIRecommendationsProps {
  webinarId: number;
  userId: number;
}

export function AIRecommendations({ webinarId, userId }: AIRecommendationsProps) {
  const { data: recommendations, isLoading } = trpc.webinar.getAIRecommendations.useQuery({
    webinarId,
    userId
  });

  if (isLoading) {
    return <div>Loading AI recommendations...</div>;
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const highMatchRecommendations = recommendations.filter(
    r => r.recommendationType === 'high_match'
  );

  if (highMatchRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">AI Recommendations for You</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highMatchRecommendations.slice(0, 3).map((recommendation) => (
          <div 
            key={recommendation.id}
            className="bg-white rounded-lg p-4 border border-purple-200"
          >
            {/* 匹配度徽章 */}
            <Badge className="mb-2 bg-purple-600">
              {Math.round(recommendation.matchScore * 100)}% Match
            </Badge>

            {/* 产品信息 (需要从 products 中获取) */}
            <div className="font-medium mb-2">Product #{recommendation.productId}</div>

            {/* 匹配原因 */}
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Why it matches:</div>
              <ul className="space-y-1">
                {recommendation.matchReasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 查看详情按钮 */}
            <button 
              className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => {
                // 记录点击
                trpc.webinar.trackAIRecommendationClick.mutate({
                  recommendationId: recommendation.id
                });
                // 跳转到产品详情
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 第 4 步: 新增会议报告页面

**文件**: `client/src/pages/WebinarReport.tsx`

```typescript
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { BarChart, Users, Heart, MessageSquare, TrendingUp } from 'lucide-react';

export function WebinarReport() {
  const { id } = useParams<{ id: string }>();
  const webinarId = parseInt(id);

  const { data: webinar, isLoading: webinarLoading } = trpc.webinar.getEnhancedById.useQuery({ id: webinarId });

  if (webinarLoading) {
    return <div>Loading...</div>;
  }

  if (!webinar || !webinar.report) {
    return <div>No report available</div>;
  }

  const report = webinar.report;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Webinar Report: {webinar.title}</h1>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold">{report.totalParticipants}</span>
          </div>
          <div className="text-gray-600">Total Participants</div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold">{report.totalFavorites}</span>
          </div>
          <div className="text-gray-600">Total Favorites</div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold">{report.totalInquiries}</span>
          </div>
          <div className="text-gray-600">Total Inquiries</div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold">{report.engagementScore?.toFixed(1)}</span>
          </div>
          <div className="text-gray-600">Engagement Score</div>
        </div>
      </div>

      {/* 热门产品 */}
      {report.hotProducts && report.hotProducts.length > 0 && (
        <div className="bg-white rounded-lg p-6 border mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Hot Products
          </h2>
          <div className="space-y-4">
            {report.hotProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-300">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-sm text-gray-600">
                      {product.favoriteCount} favorites • {product.inquiryCount} inquiries • {product.viewCount} views
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 洞察 */}
      {report.aiInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{report.aiInsights}</p>
          </div>
        </div>
      )}

      {/* AI 建议 */}
      {report.aiRecommendations && (
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{report.aiRecommendations}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ 适配检查清单

### TypeScript 类型
- [ ] 更新 Webinar 类型 (40+ 新字段)
- [ ] 更新 WebinarProduct 类型 (20+ 新字段)
- [ ] 新增 BuyerProfile 类型
- [ ] 新增 AIRecommendation 类型
- [ ] 新增 WebinarReport 类型

### tRPC API
- [ ] 扩展 webinar.router.ts
- [ ] 新增 buyer.router.ts
- [ ] 新增 AI 推荐相关 API
- [ ] 新增统计追踪 API

### 前端组件
- [ ] 增强 WebinarCard 组件
- [ ] 增强 WebinarDetail 页面
- [ ] 新增 AIRecommendations 组件
- [ ] 新增 WebinarReport 页面
- [ ] 新增 BuyerProfileSettings 页面

### 数据展示
- [ ] 显示讲师信息
- [ ] 显示行业和主题标签
- [ ] 显示核心亮点
- [ ] 显示统计数据
- [ ] 显示 AI 推荐

---

## 🚀 下一步行动

1. **执行数据库迁移**
   ```bash
   mysql -u magicyang -p -h rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com magicyang < migrations/001_database_enhancement.sql
   ```

2. **更新 Drizzle Schema**
   ```bash
   cd /home/ubuntu/RealSourcing
   cp drizzle/schema_enhancement.ts drizzle/schema.ts
   pnpm run db:push
   ```

3. **更新前端类型和组件**
   - 按照本指南逐步更新类型定义
   - 更新 tRPC Router
   - 更新前端组件

4. **测试新功能**
   - 测试数据库字段
   - 测试 API 端点
   - 测试前端展示

5. **部署到 Vercel**
   - 推送代码到 GitHub
   - Vercel 自动部署

---

**完成日期**: 待定  
**负责人**: 开发团队  
**优先级**: P0 (最高)
