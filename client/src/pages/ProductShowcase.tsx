import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  X, 
  MessageSquare, 
  Heart, 
  BarChart3, 
  Video,
  Maximize2,
  Minimize2,
  Grid3x3,
  MonitorPlay,
  Columns,
  Expand,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import InquiryModal, { InquiryData } from '../components/InquiryModal';
import { Product } from '../lib/directus';
import { colors, borderRadius } from '../lib/design-system';

type ViewMode = 'product-focus' | 'video-focus' | 'split' | 'product-only' | 'video-only';

export default function ProductShowcase() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'favorites' | 'stats'>('chat');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('product-focus');
  const [isTabExpanded, setIsTabExpanded] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: 20, y: 20 });
  const [videoSize, setVideoSize] = useState({ width: 320, height: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVideoFloating, setIsVideoFloating] = useState(false);

  // 从 Directus 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://47.99.205.136:8055/items/webinar_products?filter[webinar_id][_eq]=${id}&fields=*,product_id.*`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        const productList = data.data.map((item: any) => item.product_id);
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProducts();
    }
  }, [id]);

  const handleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleInquiry = (data: InquiryData) => {
    console.log('Inquiry submitted:', data);
    setInquiryProduct(null);
  };

  const favoriteProducts = products.filter((p) => favorites.has(p.id));

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isVideoFloating) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - videoPosition.x,
      y: e.clientY - videoPosition.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setVideoPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // 切换浮动模式
  const toggleFloatingVideo = () => {
    setIsVideoFloating(!isVideoFloating);
    if (!isVideoFloating) {
      setVideoPosition({ x: window.innerWidth - 360, y: 80 });
      setVideoSize({ width: 320, height: 180 });
    }
  };

  // 视角切换按钮
  const ViewModeButton = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: any; label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        viewMode === mode
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
          : 'bg-[#2A2A3E] text-gray-400 hover:text-white hover:bg-[#3A3A4E]'
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium hidden lg:inline">{label}</span>
    </button>
  );

  // 渲染视频区域
  const renderVideoArea = () => {
    if (viewMode === 'product-only') return null;

    const isMinimized = viewMode === 'product-focus';
    const isMaximized = viewMode === 'video-only';

    // 浮动视频窗口
    if (isVideoFloating) {
      return (
        <div
          className="fixed z-50 bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg shadow-2xl overflow-hidden"
          style={{
            left: `${videoPosition.x}px`,
            top: `${videoPosition.y}px`,
            width: `${videoSize.width}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="aspect-video bg-[#0F0F1E] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-12 w-12 text-violet-500/30" />
            </div>
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                🔴 LIVE
              </span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFloatingVideo();
                }}
                className="p-1 bg-black/60 hover:bg-black/80 rounded transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('product-only');
                  setIsVideoFloating(false);
                }}
                className="p-1 bg-black/60 hover:bg-black/80 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-[#1A1A2E] border-r border-[#2A2A3E] transition-all duration-300 ${
          isMaximized
            ? 'flex-1'
            : isMinimized
            ? 'w-80'
            : viewMode === 'split'
            ? 'w-1/2'
            : 'w-96'
        } flex flex-col p-4`}
      >
        {/* Video Feed */}
        <div className="aspect-video bg-[#0F0F1E] rounded-lg overflow-hidden mb-4 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="h-16 w-16 text-violet-500/30" />
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              🔴 LIVE
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={toggleFloatingVideo}
              className="p-2 bg-black/60 hover:bg-black/80 rounded transition-colors"
              title="Float video"
            >
              <Expand className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded">
              <p className="text-sm font-medium">Presenter Feed</p>
              <p className="text-xs text-gray-400">Factory Showcase</p>
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        {!isMaximized && (
          <div className="bg-[#0F0F1E] rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Meeting Info</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Participants:</span>
                <span className="text-white">8/20</span>
              </div>
              <div className="flex justify-between">
                <span>Products:</span>
                <span className="text-white">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white">25 min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染产品区域
  const renderProductArea = () => {
    if (viewMode === 'video-only') return null;

    return (
      <div className="flex-1 flex flex-col">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Products ({products.length})</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-400 mb-2">No products available</p>
                <p className="text-sm text-gray-500">The host hasn't added any products yet</p>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'product-only'
                  ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
                  : viewMode === 'split'
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorited={favorites.has(product.id)}
                  onFavorite={() => handleFavorite(product.id)}
                  onInquiry={() => setInquiryProduct(product)}
                  onViewDetails={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A2E] border-b border-[#2A2A3E] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation('/webinars')}
            className="p-2 hover:bg-[#2A2A3E] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">TikTok Hot Products Sourcing</h1>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <ViewModeButton mode="product-focus" icon={Grid3x3} label="Product Focus" />
          <ViewModeButton mode="video-focus" icon={MonitorPlay} label="Video Focus" />
          <ViewModeButton mode="split" icon={Columns} label="Split View" />
          <ViewModeButton mode="product-only" icon={Grid3x3} label="Products Only" />
          <ViewModeButton mode="video-only" icon={Video} label="Video Only" />
          
          <div className="w-px h-6 bg-[#2A2A3E] mx-2"></div>
          
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            onClick={() => setLocation('/webinars')}
          >
            End Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {renderVideoArea()}
        {renderProductArea()}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-[#1A1A2E] border-t border-[#2A2A3E]">
        {/* Tab Content (Expandable) */}
        {isTabExpanded && (
          <div className="px-6 py-4 border-b border-[#2A2A3E] max-h-64 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Chat feature coming soon...</p>
              </div>
            )}
            {activeTab === 'favorites' && (
              <div className="space-y-2">
                {favoriteProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">No favorites yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {favoriteProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-[#2A2A3E] rounded-lg p-3 cursor-pointer hover:bg-[#3A3A4E] transition-colors"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <img
                          src={product.images?.[0] || ''}
                          alt={product.name}
                          className="w-full aspect-square object-cover rounded mb-2"
                        />
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">${product.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'stats' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Live stats coming soon...</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Buttons */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setActiveTab('chat');
                setIsTabExpanded(!isTabExpanded || activeTab !== 'chat');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'chat' && isTabExpanded
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('favorites');
                setIsTabExpanded(!isTabExpanded || activeTab !== 'favorites');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'favorites' && isTabExpanded
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <Heart className="h-5 w-5" />
              <span>My Favorites ({favorites.size})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('stats');
                setIsTabExpanded(!isTabExpanded || activeTab !== 'stats');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'stats' && isTabExpanded
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Live Stats</span>
            </button>
          </div>

          <button
            onClick={() => setIsTabExpanded(!isTabExpanded)}
            className="p-2 hover:bg-[#2A2A3E] rounded-lg transition-colors"
          >
            {isTabExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onFavorite={() => handleFavorite(selectedProduct.id)}
          onInquiry={() => {
            setInquiryProduct(selectedProduct);
            setSelectedProduct(null);
          }}
          isFavorited={favorites.has(selectedProduct.id)}
        />
      )}

      {inquiryProduct && (
        <InquiryModal
          product={inquiryProduct}
          onClose={() => setInquiryProduct(null)}
          onSubmit={handleInquiry}
        />
      )}
    </div>
  );
}
