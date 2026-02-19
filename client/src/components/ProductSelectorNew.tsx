import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Search, Package, X, Star } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useToast } from "../hooks/use-toast";

interface ProductSelectorNewProps {
  webinarId?: number;
  selectedProductIds?: number[];
  onProductsChange?: (productIds: number[]) => void;
  factoryId?: number;
}

export function ProductSelectorNew({
  webinarId,
  selectedProductIds = [],
  onProductsChange,
  factoryId,
}: ProductSelectorNewProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<number[]>(selectedProductIds);
  
  // 查询产品列表
  const { data: products, isLoading } = trpc.product.list.useQuery({
    search,
    limit: 50,
    includeViralScore: true,
  });

  // 根据工厂ID查询产品
  const { data: factoryProducts } = trpc.product.listByFactory.useQuery(
    { factoryId: factoryId!, includeViralScore: true },
    { enabled: !!factoryId }
  );

  // 合并产品列表
  const displayProducts = factoryId ? factoryProducts : products;

  useEffect(() => {
    setLocalSelected(selectedProductIds);
  }, [selectedProductIds]);

  const toggleProduct = (productId: number) => {
    const newSelected = localSelected.includes(productId)
      ? localSelected.filter((id) => id !== productId)
      : [...localSelected, productId];
    
    setLocalSelected(newSelected);
    onProductsChange?.(newSelected);
  };

  const removeProduct = (productId: number) => {
    const newSelected = localSelected.filter((id) => id !== productId);
    setLocalSelected(newSelected);
    onProductsChange?.(newSelected);
  };

  const getViralScoreColor = (score?: any) => {
    if (!score) return "bg-gray-100 text-gray-600";
    const value = typeof score === 'object' ? score.overall : score;
    if (value >= 80) return "bg-green-100 text-green-700";
    if (value >= 60) return "bg-blue-100 text-blue-700";
    if (value >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const getViralScoreValue = (score?: any) => {
    if (!score) return 0;
    return typeof score === 'object' ? score.overall : score;
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="space-y-2">
        <Label>选择展示产品</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索产品名称或分类..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 已选择的产品 */}
      {localSelected.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            已选择 {localSelected.length} 个产品
          </Label>
          <div className="flex flex-wrap gap-2">
            {localSelected.map((productId) => {
              const product = displayProducts?.find((p: any) => p.id === productId);
              if (!product) return null;
              return (
                <Badge
                  key={productId}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {product.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-transparent"
                    onClick={() => removeProduct(productId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* 产品列表 */}
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : !displayProducts || displayProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>暂无产品</p>
            </div>
          ) : (
            displayProducts.map((product: any) => {
              const isSelected = localSelected.includes(product.id);
              const viralScore = getViralScoreValue(product.viralScore);
              
              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => toggleProduct(product.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {/* 产品图片 */}
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}

                      {/* 产品信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {product.name}
                          </h4>
                          {viralScore > 0 && (
                            <Badge
                              variant="outline"
                              className={`${getViralScoreColor(product.viralScore)} shrink-0`}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {viralScore.toFixed(0)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {product.category && (
                            <span className="truncate">{product.category}</span>
                          )}
                          {product.priceRange && (
                            <>
                              <span>•</span>
                              <span>{product.priceRange}</span>
                            </>
                          )}
                        </div>

                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
