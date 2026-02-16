import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, X, MessageSquare, Heart, BarChart3, Minimize2, Maximize2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import InquiryModal, { InquiryData } from '../components/InquiryModal';
import { Product } from '../lib/directus';
import { colors, borderRadius } from '../lib/design-system';

// Mock 数据（等待 Directus 集成）
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    webinar_id: 1,
    name: 'LED Desk Lamp - Modern Design',
    price: 2.50,
    currency: 'USD',
    moq: 100,
    lead_time: '7 days',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
    description: 'Modern LED desk lamp with adjustable brightness',
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
    description: 'WiFi-enabled smart RGB bulb',
    favorite_count: 8,
    inquiry_count: 4,
    view_count: 25,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    webinar_id: 1,
    name: 'Portable Power Bank',
    price: 4.20,
    currency: 'USD',
    moq: 200,
    lead_time: '5 days',
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'],
    description: '10000mAh portable power bank',
    favorite_count: 3,
    inquiry_count: 1,
    view_count: 8,
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
    description: 'Bluetooth 5.0 wireless earbuds',
    favorite_count: 12,
    inquiry_count: 6,
    view_count: 45,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    webinar_id: 1,
    name: 'Mini USB Desk Fan',
    price: 1.90,
    currency: 'USD',
    moq: 500,
    lead_time: '7 days',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    description: 'Portable USB desk fan',
    favorite_count: 6,
    inquiry_count: 3,
    view_count: 18,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    webinar_id: 1,
    name: 'Reusable Eco Straw Set',
    price: 0.85,
    currency: 'USD',
    moq: 1000,
    lead_time: '5 days',
    images: ['https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400'],
    description: 'Stainless steel reusable straws',
    favorite_count: 4,
    inquiry_count: 2,
    view_count: 15,
    created_at: new Date().toISOString(),
  },
];

export default function ProductShowcase() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'chat' | 'favorites' | 'stats'>('chat');
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        // 更新产品收藏数
        setProducts(products.map(p => 
          p.id === productId ? { ...p, favorite_count: p.favorite_count - 1 } : p
        ));
      } else {
        newFavorites.add(productId);
        setProducts(products.map(p => 
          p.id === productId ? { ...p, favorite_count: p.favorite_count + 1 } : p
        ));
      }
      return newFavorites;
    });
  };

  const handleInquiry = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsInquiryModalOpen(true);
    }
  };

  const handleViewDetails = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDetailModalOpen(true);
    }
  };

  const handleSubmitInquiry = async (data: InquiryData) => {
    console.log('Inquiry submitted:', data);
    // TODO: 发送询价到后端
    // 更新产品询价数
    setProducts(products.map(p => 
      p.id === data.productId ? { ...p, inquiry_count: p.inquiry_count + 1 } : p
    ));
  };

  const favoriteProducts = products.filter(p => favorites.has(p.id));

  const handleModalFavorite = () => {
    if (selectedProduct) {
      handleFavorite(selectedProduct.id);
    }
  };

  const handleModalInquiry = () => {
    setIsDetailModalOpen(false);
    setIsInquiryModalOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
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
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation(`/webinars/${id}`)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: colors.text.primary }} />
            </button>
            <div>
              <h1
                className="text-xl md:text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                TikTok Hot Products Sourcing
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: colors.accent.red,
                    color: '#FFFFFF',
                  }}
                >
                  LIVE
                </span>
                <span style={{ color: colors.text.secondary }} className="text-sm">
                  {products.length} Products
                </span>
              </div>
            </div>
          </div>

          <button
            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{
              backgroundColor: colors.accent.red,
              color: '#FFFFFF',
            }}
          >
            End Meeting
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 左侧：视频区域（桌面端）或顶部（移动端） */}
        {!isMobile && (
          <div
            className="w-80 border-r flex flex-col"
            style={{
              backgroundColor: colors.background.secondary,
              borderColor: colors.purple[700],
            }}
          >
            {/* 视频区 */}
            <div className="p-4">
              <div
                className="relative aspect-video rounded-lg overflow-hidden"
                style={{
                  backgroundColor: '#000',
                  border: `2px solid ${colors.purple[600]}`,
                }}
              >
                <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold"
                  style={{
                    backgroundColor: colors.accent.red,
                    color: '#FFFFFF',
                  }}
                >
                  LIVE
                </div>
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span className="text-4xl">🎥</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white text-sm">
                  <p className="font-medium">Presenter Feed</p>
                </div>
              </div>
            </div>

            {/* 参会者列表 */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3
                className="font-medium mb-3"
                style={{ color: colors.text.primary }}
              >
                Participants (8)
              </h3>
              <div className="space-y-2">
                {['Sarah Chen', 'John Smith', 'Wang Lei', 'Emily Davis', 'Michael Brown', 'Lisa Zhang', 'David Wilson', 'Amy Liu'].map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ backgroundColor: colors.background.card }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: colors.purple[600],
                        color: '#FFFFFF',
                      }}
                    >
                      {name[0]}
                    </div>
                    <span style={{ color: colors.text.primary }} className="text-sm">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 移动端视频区（可最小化） */}
        {isMobile && !isVideoMinimized && (
          <div className="relative">
            <div
              className="relative aspect-video"
              style={{
                backgroundColor: '#000',
                borderBottom: `2px solid ${colors.purple[600]}`,
              }}
            >
              <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold"
                style={{
                  backgroundColor: colors.accent.red,
                  color: '#FFFFFF',
                }}
              >
                LIVE
              </div>
              <button
                onClick={() => setIsVideoMinimized(true)}
                className="absolute top-2 right-2 p-1.5 rounded bg-black/50"
              >
                <Minimize2 size={16} color="#FFFFFF" />
              </button>
              <div className="w-full h-full flex items-center justify-center text-white">
                <span className="text-4xl">🎥</span>
              </div>
            </div>
          </div>
        )}

        {/* 移动端最小化视频按钮 */}
        {isMobile && isVideoMinimized && (
          <button
            onClick={() => setIsVideoMinimized(false)}
            className="fixed top-20 right-4 z-50 p-3 rounded-full shadow-lg"
            style={{
              backgroundColor: colors.purple[600],
            }}
          >
            <Maximize2 size={20} color="#FFFFFF" />
          </button>
        )}

        {/* 右侧：产品展示区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 产品网格 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onFavorite={handleFavorite}
                    onInquiry={handleInquiry}
                    onViewDetails={handleViewDetails}
                    isFavorited={favorites.has(product.id)}
                    variant="dark"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 底部 Tab 栏 */}
          <div
            className="border-t"
            style={{
              backgroundColor: colors.background.secondary,
              borderColor: colors.purple[700],
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                  style={{
                    backgroundColor: activeTab === 'chat' ? colors.purple[600] : 'transparent',
                    color: activeTab === 'chat' ? '#FFFFFF' : colors.text.secondary,
                  }}
                >
                  <MessageSquare size={18} />
                  <span className="font-medium">Chat</span>
                </button>

                <button
                  onClick={() => setLocation(`/webinars/${id}/favorites`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                  style={{
                    backgroundColor: colors.purple[600],
                    color: '#FFFFFF',
                  }}
                >
                  <Heart size={18} fill="#FFFFFF" />
                  <span className="font-medium">My Favorites ({favorites.size})</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                  style={{
                    backgroundColor: activeTab === 'stats' ? colors.purple[600] : 'transparent',
                    color: activeTab === 'stats' ? '#FFFFFF' : colors.text.secondary,
                  }}
                >
                  <BarChart3 size={18} />
                  <span className="font-medium">Live Stats</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 产品详情弹窗 */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onFavorite={handleModalFavorite}
          onInquiry={handleModalInquiry}
          isFavorited={favorites.has(selectedProduct.id)}
        />
      )}

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
