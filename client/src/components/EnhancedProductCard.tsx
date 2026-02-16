import { Heart, MessageSquare, ShoppingCart, TrendingUp, Eye, Users, DollarSign, Package } from 'lucide-react';

export interface EnhancedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  supplier: {
    name: string;
    logo: string;
    country: string;
    rating: number;
  };
  tiktokMetrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    salesVolume: number;
    conversionRate: number;
    trendingScore: number;
  };
  salesData: {
    dailySales: number;
    totalSales: number;
    gmv: number;
    totalGmv: number;
    growthRate: number;
  };
  moq: number;
  commission: number;
  launchDate: string;
  tags: string[];
}

interface EnhancedProductCardProps {
  product: EnhancedProduct;
  isFavorited: boolean;
  onFavorite: () => void;
  onInquiry: () => void;
  onViewDetails: () => void;
}

export default function EnhancedProductCard({ product, isFavorited, onFavorite, onInquiry, onViewDetails }: EnhancedProductCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTrendingBadge = (score: number) => {
    if (score >= 90) return { text: '🔥 Hot', color: 'bg-red-500' };
    if (score >= 75) return { text: '⭐ Trending', color: 'bg-orange-500' };
    if (score >= 60) return { text: '📈 Rising', color: 'bg-yellow-500' };
    return null;
  };

  const trendingBadge = getTrendingBadge(product.tiktokMetrics.trendingScore);
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="bg-[#1A1A2E] rounded-lg overflow-hidden border border-[#2A2A3E] hover:border-violet-500/50 transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#0F0F1E] cursor-pointer" onClick={onViewDetails}>
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Trending Badge */}
        {trendingBadge && (
          <div className={`absolute top-2 left-2 ${trendingBadge.color} text-white text-xs font-bold px-2 py-1 rounded`}>
            {trendingBadge.text}
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          style={{ marginTop: discount > 0 ? '32px' : '0' }}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(product.tiktokMetrics.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(product.tiktokMetrics.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{formatNumber(product.tiktokMetrics.comments)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Tags */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-1 rounded">
            {product.category}
          </span>
          {product.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="text-xs text-gray-400 bg-gray-700/30 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>

        {/* Product Name */}
        <h3 
          className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-violet-400 transition-colors"
          onClick={onViewDetails}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-violet-400">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>

        {/* Supplier Info */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#2A2A3E]">
          <img 
            src={product.supplier.logo} 
            alt={product.supplier.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{product.supplier.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-yellow-500">⭐</span>
            <span className="text-xs text-gray-400">{product.supplier.rating}</span>
          </div>
        </div>

        {/* TikTok Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-[#2A2A3E]">
          <div className="bg-[#0F0F1E] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Package className="h-3 w-3 text-violet-400" />
              <span className="text-xs text-gray-400">Daily Sales</span>
            </div>
            <p className="text-sm font-semibold">{formatNumber(product.salesData.dailySales)}</p>
          </div>
          <div className="bg-[#0F0F1E] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-400" />
              <span className="text-xs text-gray-400">Daily GMV</span>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(product.salesData.gmv)}</p>
          </div>
          <div className="bg-[#0F0F1E] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-gray-400">Growth</span>
            </div>
            <p className={`text-sm font-semibold ${product.salesData.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.salesData.growthRate >= 0 ? '+' : ''}{product.salesData.growthRate}%
            </p>
          </div>
          <div className="bg-[#0F0F1E] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-gray-400">Conv. Rate</span>
            </div>
            <p className="text-sm font-semibold">{product.tiktokMetrics.conversionRate}%</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>MOQ: {product.moq} units</span>
          <span className="text-violet-400 font-semibold">Commission: {product.commission}%</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onInquiry}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <ShoppingCart className="h-4 w-4" />
            Inquire
          </button>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg transition-colors text-sm font-medium"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
