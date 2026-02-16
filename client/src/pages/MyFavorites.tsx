import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Trash2, MessageCircle, Download } from 'lucide-react';
import { Product } from '../lib/directus';
import { colors, borderRadius } from '../lib/design-system';
import InquiryModal, { InquiryData } from '../components/InquiryModal';

// Mock 收藏的产品数据
const MOCK_FAVORITES: Product[] = [
  {
    id: 1,
    webinar_id: 1,
    name: 'LED Desk Lamp - Modern Design',
    price: 2.50,
    currency: 'USD',
    moq: 100,
    lead_time: '7 days',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
    favorite_count: 5,
    inquiry_count: 2,
    view_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    webinar_id: 1,
    name: 'Smart RGB Bulb (WiFi)',
    price: 3.80,
    currency: 'USD',
    moq: 50,
    lead_time: '10 days',
    images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?w=400'],
    favorite_count: 8,
    inquiry_count: 4,
    view_count: 25,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    webinar_id: 1,
    name: 'Wireless Earbuds',
    price: 8.90,
    currency: 'USD',
    moq: 100,
    lead_time: '12 days',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
    favorite_count: 12,
    inquiry_count: 6,
    view_count: 45,
    created_at: new Date().toISOString(),
  },
];

export default function MyFavorites() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const [favorites, setFavorites] = useState<Product[]>(MOCK_FAVORITES);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.size === favorites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map(p => p.id)));
    }
  };

  const handleToggleSelect = (productId: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleRemove = (productId: number) => {
    setFavorites(favorites.filter(p => p.id !== productId));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleBatchInquiry = () => {
    if (selectedIds.size === 0) return;
    // TODO: 打开批量询价弹窗
    console.log('Batch inquiry for:', Array.from(selectedIds));
  };

  const handleExport = () => {
    // TODO: 导出收藏清单为 Excel/PDF
    console.log('Export favorites');
  };

  const handleInquiry = (product: Product) => {
    setSelectedProduct(product);
    setIsInquiryModalOpen(true);
  };

  const handleSubmitInquiry = async (data: InquiryData) => {
    console.log('Inquiry submitted:', data);
    // TODO: 发送询价到后端
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* 顶部导航栏 */}
      <div
        className="border-b px-4 md:px-6 py-4"
        style={{
          backgroundColor: colors.background.secondary,
          borderColor: colors.purple[700],
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation(`/webinars/${id}/showcase`)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: colors.text.primary }} />
            </button>
            <div>
              <h1
                className="text-xl md:text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                My Favorites
              </h1>
              <p style={{ color: colors.text.secondary }} className="text-sm mt-1">
                {favorites.length} products saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div
        className="border-b px-4 md:px-6 py-3"
        style={{
          backgroundColor: colors.background.secondary,
          borderColor: colors.purple[700],
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.size === favorites.length && favorites.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded cursor-pointer"
              style={{
                accentColor: colors.purple[600],
              }}
            />
            <span style={{ color: colors.text.secondary }} className="text-sm">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchInquiry}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
              style={{
                backgroundColor: colors.purple[600],
                color: '#FFFFFF',
              }}
            >
              Batch Inquiry
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${colors.purple[500]}`,
                color: colors.purple[500],
              }}
            >
              <div className="flex items-center gap-2">
                <Download size={16} />
                <span>Export</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 收藏列表 */}
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: colors.text.secondary }} className="text-lg">
                No favorites yet
              </p>
              <button
                onClick={() => setLocation(`/webinars/${id}/showcase`)}
                className="mt-4 px-6 py-3 rounded-full font-medium transition-all"
                style={{
                  backgroundColor: colors.purple[600],
                  color: '#FFFFFF',
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            favorites.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 rounded-lg transition-all"
                style={{
                  backgroundColor: colors.background.card,
                  border: `2px solid ${selectedIds.has(product.id) ? colors.purple[500] : colors.purple[700]}`,
                }}
              >
                {/* 选择框 */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(product.id)}
                  onChange={() => handleToggleSelect(product.id)}
                  className="w-5 h-5 rounded cursor-pointer flex-shrink-0"
                  style={{
                    accentColor: colors.purple[600],
                  }}
                />

                {/* 产品图片 */}
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>

                {/* 产品信息 */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-lg mb-1 truncate"
                    style={{ color: colors.text.primary }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-2">
                    <span
                      className="text-xl font-bold"
                      style={{ color: colors.purple[500] }}
                    >
                      ${product.price.toFixed(2)}
                    </span>
                    <span style={{ color: colors.text.secondary }} className="text-sm">
                      MOQ: {product.moq} units
                    </span>
                    <span style={{ color: colors.text.secondary }} className="text-sm">
                      {product.lead_time}
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleInquiry(product)}
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                    style={{
                      backgroundColor: colors.purple[600],
                      color: '#FFFFFF',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} />
                      <span>Inquiry</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={18} style={{ color: colors.accent.red }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 询价弹窗 */}
      {selectedProduct && (
        <InquiryModal
          product={selectedProduct}
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          onSubmit={handleSubmitInquiry}
        />
      )}
    </div>
  );
}
