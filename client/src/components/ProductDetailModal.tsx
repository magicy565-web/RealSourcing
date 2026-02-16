import { useState } from 'react';
import { X, Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../lib/directus';
import { colors, borderRadius } from '../lib/design-system';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: () => void;
  onInquiry?: () => void;
  isFavorited?: boolean;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onFavorite,
  onInquiry,
  isFavorited = false,
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.xl,
          border: `2px solid ${colors.purple[600]}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部操作栏 */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
          style={{
            backgroundColor: colors.background.secondary,
            borderColor: colors.purple[700],
          }}
        >
          <button
            onClick={onFavorite}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isFavorited ? colors.purple[600] : 'transparent',
              border: `2px solid ${colors.purple[500]}`,
            }}
          >
            <Heart
              size={20}
              fill={isFavorited ? '#FFFFFF' : 'none'}
              color={isFavorited ? '#FFFFFF' : colors.purple[500]}
            />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} style={{ color: colors.text.primary }} />
          </button>
        </div>

        {/* 图片轮播 */}
        <div className="relative aspect-[4/3] bg-gray-900">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <ChevronLeft size={24} color="#FFFFFF" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <ChevronRight size={24} color="#FFFFFF" />
                  </button>

                  {/* 图片指示器 */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: index === currentImageIndex ? colors.purple[500] : 'rgba(255, 255, 255, 0.5)',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}
        </div>

        {/* 产品信息 */}
        <div className="p-6 space-y-6">
          {/* 标题和价格 */}
          <div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: colors.text.primary }}
            >
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold"
                style={{ color: colors.purple[500] }}
              >
                ${product.price.toFixed(2)}
              </span>
              <span style={{ color: colors.text.secondary }}>
                per unit
              </span>
            </div>
          </div>

          {/* 关键信息卡片 */}
          <div
            className="grid grid-cols-3 gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.purple[700]}`,
            }}
          >
            <div>
              <p style={{ color: colors.text.secondary }} className="text-sm mb-1">
                MOQ
              </p>
              <p style={{ color: colors.text.primary }} className="font-semibold">
                {product.moq} units
              </p>
            </div>
            <div>
              <p style={{ color: colors.text.secondary }} className="text-sm mb-1">
                Lead Time
              </p>
              <p style={{ color: colors.text.primary }} className="font-semibold">
                {product.lead_time}
              </p>
            </div>
            <div>
              <p style={{ color: colors.text.secondary }} className="text-sm mb-1">
                Stock
              </p>
              <p style={{ color: colors.text.primary }} className="font-semibold">
                {product.stock ? `${product.stock}+` : 'Available'}
              </p>
            </div>
          </div>

          {/* 产品描述 */}
          {product.description && (
            <div>
              <h3
                className="font-semibold mb-2"
                style={{ color: colors.text.primary }}
              >
                Product Description
              </h3>
              <p style={{ color: colors.text.secondary }} className="leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* 产品规格 */}
          {product.specs && (
            <div>
              <h3
                className="font-semibold mb-2"
                style={{ color: colors.text.primary }}
              >
                Specifications
              </h3>
              <ul className="space-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li
                    key={key}
                    className="flex items-start gap-2"
                    style={{ color: colors.text.secondary }}
                  >
                    <span className="text-purple-400">•</span>
                    <span>
                      <strong className="text-white">{key}:</strong> {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onInquiry}
              className="flex-1 py-3 px-6 rounded-full font-semibold transition-all"
              style={{
                backgroundColor: colors.purple[600],
                color: '#FFFFFF',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                <span>Send Inquiry</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
