import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, MessageSquare, TrendingUp, Sparkles } from "lucide-react";

interface ViralScore {
  totalScore: number;
  level: "extreme" | "high" | "medium" | "low";
  breakdown: {
    marketDemand: number;
    competition: number;
    profitMargin: number;
    supplyStability: number;
    marketingEase: number;
  };
  insights: string[];
  recommendations: string[];
}

interface Product {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  priceRange: string | null;
  minOrderQuantity: number | null;
  leadTime: string | null;
  viewCount: number | null;
  inquiryCount: number | null;
  images: string[] | null;
  viralScore?: ViralScore;
}

interface FactoryProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function FactoryProductCard({ product, onClick }: FactoryProductCardProps) {
  const getScoreLevelColor = (level: string) => {
    switch (level) {
      case "extreme":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "high":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getScoreLevelText = (level: string) => {
    switch (level) {
      case "extreme":
        return "🏆 超级爆款";
      case "high":
        return "🔥 高潜力";
      case "medium":
        return "💡 中等潜力";
      case "low":
        return "⚠️ 低潜力";
      default:
        return "未评分";
    }
  };

  const firstImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : null;

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-border/50 hover:border-primary/50"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Sparkles className="w-12 h-12" />
          </div>
        )}
        
        {/* AI 爆款评分徽章 */}
        {product.viralScore && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge 
              className={`${getScoreLevelColor(product.viralScore.level)} backdrop-blur-sm border font-semibold`}
            >
              {getScoreLevelText(product.viralScore.level)}
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-black/60 backdrop-blur-sm text-white border-0 font-bold text-base"
            >
              {product.viralScore.totalScore}分
            </Badge>
          </div>
        )}
        
        {/* 类别标签 */}
        {product.category && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-0"
          >
            {product.category}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* 产品名称 */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* 产品描述 */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 价格和 MOQ */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">价格区间</p>
            <p className="font-semibold text-primary">
              {product.priceRange || "联系询价"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">起订量</p>
            <p className="font-semibold">
              {product.minOrderQuantity ? `${product.minOrderQuantity} 件` : "面议"}
            </p>
          </div>
        </div>

        {/* 交货时间 */}
        {product.leadTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>交货时间: {product.leadTime} 天</span>
          </div>
        )}

        {/* 浏览量和询盘量 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{product.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{product.inquiryCount || 0} 询盘</span>
          </div>
        </div>

        {/* AI 评分详情（悬浮显示） */}
        {product.viralScore && (
          <div className="hidden group-hover:block pt-3 border-t border-border/50 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">AI 评分详情</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">市场需求:</span>
                <span className="font-semibold">{product.viralScore.breakdown.marketDemand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">竞争优势:</span>
                <span className="font-semibold">{product.viralScore.breakdown.competition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">利润空间:</span>
                <span className="font-semibold">{product.viralScore.breakdown.profitMargin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">供应稳定:</span>
                <span className="font-semibold">{product.viralScore.breakdown.supplyStability}</span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <Button 
          className="w-full mt-2" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          查看详情
        </Button>
      </CardContent>
    </Card>
  );
}
