import { useState } from 'react';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { Product } from '../lib/directus';
import { colors, borderRadius, shadows } from '../lib/design-system';

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: number) => void;
  onInquiry?: (productId: number) => void;
  onViewDetails?: (productId: number) => void;
  isFavorited?: boolean;
  variant?: 'light' | 'dark';
}

export default function ProductCard({
  product,
  onFavorite,
  onInquiry,
  onViewDetails,
  isFavorited = false,
  variant = 'dark',
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorited(!favorited);
    onFavorite?.(product.id);
  };

  const handleInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInquiry?.(product.id);
  };

  const handleClick = () => {
    onViewDetails?.(product.id);
  };

  const isDark = variant === 'dark';
  const bgColor = isDark ? colors.background.card : '#FFFFFF';
  const textColor = isDark ? colors.text.primary : '#1F2937';
  const secondaryTextColor = isDark ? colors.text.secondary : '#6B7280';

  return (
    <div
      className="relative cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        borderRadius: borderRadius.xl,
        border: `2px solid ${isDark ? colors.purple[600] : '#E5E7EB'}`,
        boxShadow: isHovered ? shadows.cardHover : shadows.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* 产品图片 */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden"
        style={{
          borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
          backgroundColor: isDark ? '#2D2D3F' : '#F3F4F6',
        }}
      >
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Hover 遮罩 */}
        {isHovered && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(139, 92, 246, 0.8)',
            }}
          >
            <span className="text-white text-sm font-medium">
              Click to view details
            </span>
          </div>
        )}
      </div>

      {/* 产品信息 */}
      <div className="p-4 space-y-3">
        {/* 产品名称 */}
        <h3
          className="font-semibold text-lg line-clamp-2"
          style={{ color: textColor }}
        >
          {product.name}
        </h3>

        {/* 价格 */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-bold"
            style={{ color: colors.purple[500] }}
          >
            ${product.price.toFixed(2)}
          </span>
          <span style={{ color: secondaryTextColor }} className="text-sm">
            {product.currency || 'USD'}
          </span>
        </div>

        {/* MOQ 和交期 */}
        <div className="flex items-center gap-4 text-sm" style={{ color: secondaryTextColor }}>
          <span>MOQ: {product.moq} units</span>
          <span>•</span>
          <span>{product.lead_time}</span>
        </div>

        {/* 互动指标 */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1" style={{ color: colors.purple[400] }}>
            <Heart size={16} fill={favorited ? colors.purple[500] : 'none'} />
            <span className="text-sm font-medium">{product.favorite_count}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: colors.purple[400] }}>
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{product.inquiry_count}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: colors.purple[400] }}>
            <Eye size={16} />
            <span className="text-sm font-medium">{product.view_count}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleFavorite}
            className="flex-1 py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200"
            style={{
              backgroundColor: favorited ? colors.purple[600] : 'transparent',
              color: favorited ? '#FFFFFF' : colors.purple[500],
              border: `2px solid ${colors.purple[500]}`,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Heart size={16} fill={favorited ? '#FFFFFF' : 'none'} />
              <span>{favorited ? 'Favorited' : 'Favorite'}</span>
            </div>
          </button>

          <button
            onClick={handleInquiry}
            className="flex-1 py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200"
            style={{
              backgroundColor: colors.purple[600],
              color: '#FFFFFF',
              border: `2px solid ${colors.purple[600]}`,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle size={16} />
              <span>Inquiry</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
