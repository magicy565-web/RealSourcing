import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, X, MessageSquare, Heart, BarChart3, Video } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import InquiryModal, { InquiryData } from '../components/InquiryModal';
import { Product } from '../lib/directus';
import { colors, borderRadius } from '../lib/design-system';

export default function ProductShowcase() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'favorites' | 'stats'>('chat');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 从 Directus 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // 从 webinar_products 表获取关联的产品
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
        // 使用 Mock 数据作为后备
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
    // TODO: 发送询价到后端
    setInquiryProduct(null);
  };

  const favoriteProducts = products.filter((p) => favorites.has(p.id));

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white">
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
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          onClick={() => setLocation('/webinars')}
        >
          End Meeting
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Side: Video Area (Minimized) */}
        <div className="w-80 bg-[#1A1A2E] border-r border-[#2A2A3E] p-4 flex flex-col">
          {/* Video Feed */}
          <div className="aspect-video bg-[#0F0F1E] rounded-lg overflow-hidden mb-4 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-12 w-12 text-violet-500/30" />
            </div>
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                🔴 LIVE
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded">
                <p className="text-sm font-medium">Presenter Feed</p>
                <p className="text-xs text-gray-400">Factory Showcase</p>
              </div>
            </div>
          </div>

          {/* Meeting Info */}
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
        </div>

        {/* Right Side: Product Grid */}
        <div className="flex-1 flex flex-col">
          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Products ({products.length})
              </h2>
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
                  <p className="text-sm text-gray-500">
                    The host hasn't added any products yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Bottom Tab Bar */}
          <div className="bg-[#1A1A2E] border-t border-[#2A2A3E] px-6 py-4">
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
                }`}
              >
                <Heart className="h-5 w-5" />
                <span>My Favorites ({favorites.size})</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Live Stats</span>
              </button>
            </div>
          </div>
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
