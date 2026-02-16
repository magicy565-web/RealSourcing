import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  X, 
  MessageSquare, 
  Heart, 
  BarChart3, 
  Video,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Send,
  Sparkles
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import InquiryModal, { InquiryData } from '../components/InquiryModal';
import { Product } from '../lib/directus';

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: Date;
  isAI?: boolean;
}

export default function ProductShowcase() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'favorites' | 'stats'>('chat');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isTabExpanded, setIsTabExpanded] = useState(false);
  
  // 展开/收放状态
  const [isVideoCollapsed, setIsVideoCollapsed] = useState(false);
  const [isProductCollapsed, setIsProductCollapsed] = useState(false);
  
  // 聊天相关状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, user: 'System', message: 'Welcome to the sourcing meeting!', timestamp: new Date(), isAI: false },
    { id: 2, user: 'John', message: 'Hi everyone! Excited to see these products.', timestamp: new Date(), isAI: false },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatInput, setAIChatInput] = useState('');
  const [aiMessages, setAIMessages] = useState<ChatMessage[]>([
    { id: 1, user: 'AI Assistant', message: 'Hello! I can help you with product information, pricing, and sourcing questions. How can I assist you today?', timestamp: new Date(), isAI: true },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

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

  // 自动滚动到最新消息
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

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

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        user: 'You',
        message: chatInput,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
    }
  };

  const handleSendAIMessage = async () => {
    if (aiChatInput.trim()) {
      const userMessage: ChatMessage = {
        id: aiMessages.length + 1,
        user: 'You',
        message: aiChatInput,
        timestamp: new Date(),
      };
      setAIMessages([...aiMessages, userMessage]);
      setAIChatInput('');

      // 模拟 AI 回复
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: aiMessages.length + 2,
          user: 'AI Assistant',
          message: `I understand you're asking about "${aiChatInput}". Let me help you with that. Based on the products in this meeting, I can provide detailed information about specifications, pricing, and MOQ requirements.`,
          timestamp: new Date(),
          isAI: true,
        };
        setAIMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const favoriteProducts = products.filter((p) => favorites.has(p.id));

  // 计算视频和产品区域的宽度
  const getVideoWidth = () => {
    if (isVideoCollapsed) return 'w-0';
    if (isProductCollapsed) return 'flex-1';
    return 'w-1/2';
  };

  const getProductWidth = () => {
    if (isProductCollapsed) return 'w-0';
    if (isVideoCollapsed) return 'flex-1';
    return 'w-1/2';
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

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isAIChatOpen
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                : 'bg-[#2A2A3E] text-gray-400 hover:text-white hover:bg-[#3A3A4E]'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>
          
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            onClick={() => setLocation('/webinars')}
          >
            End Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Video Area */}
        <div
          className={`${getVideoWidth()} bg-[#1A1A2E] border-r border-[#2A2A3E] transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {!isVideoCollapsed && (
            <>
              <div className="flex-1 p-4 flex flex-col">
                {/* Video Feed */}
                <div className="aspect-video bg-[#0F0F1E] rounded-lg overflow-hidden mb-4 relative flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-16 w-16 text-violet-500/30" />
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
                <div className="bg-[#0F0F1E] rounded-lg p-4 flex-shrink-0">
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
            </>
          )}
          
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsVideoCollapsed(!isVideoCollapsed)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-[#2A2A3E] hover:bg-[#3A3A4E] p-2 rounded-full border border-[#3A3A4E] transition-colors shadow-lg"
            title={isVideoCollapsed ? 'Expand video' : 'Collapse video'}
          >
            {isVideoCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Product Area */}
        <div
          className={`${getProductWidth()} bg-[#0F0F1E] transition-all duration-300 flex flex-col overflow-hidden relative`}
        >
          {!isProductCollapsed && (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          )}
          
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsProductCollapsed(!isProductCollapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-[#2A2A3E] hover:bg-[#3A3A4E] p-2 rounded-full border border-[#3A3A4E] transition-colors shadow-lg"
            title={isProductCollapsed ? 'Expand products' : 'Collapse products'}
          >
            {isProductCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* AI Chat Sidebar */}
        {isAIChatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[#1A1A2E] border-l border-[#2A2A3E] shadow-2xl z-20 flex flex-col">
            {/* AI Chat Header */}
            <div className="px-4 py-3 border-b border-[#2A2A3E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsAIChatOpen(false)}
                className="p-1 hover:bg-[#2A2A3E] rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AI Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.user === 'You'
                        ? 'bg-violet-600 text-white'
                        : 'bg-[#2A2A3E] text-gray-200'
                    }`}
                  >
                    {msg.isAI && (
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3 text-violet-400" />
                        <span className="text-xs text-violet-400 font-medium">AI</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={aiChatEndRef} />
            </div>

            {/* AI Chat Input */}
            <div className="p-4 border-t border-[#2A2A3E]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAIChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendAIMessage()}
                  placeholder="Ask AI about products..."
                  className="flex-1 bg-[#2A2A3E] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleSendAIMessage}
                  className="p-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-[#1A1A2E] border-t border-[#2A2A3E]">
        {/* Tab Content (Expandable) */}
        {isTabExpanded && (
          <div className="px-6 py-4 border-b border-[#2A2A3E] max-h-64 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="space-y-3">
                {/* Chat Messages */}
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-[#2A2A3E] rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-violet-400">{msg.user}</span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200">{msg.message}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#2A2A3E] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#2A2A3E] rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-violet-400">1,234</p>
                  </div>
                  <div className="bg-[#2A2A3E] rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Inquiries</p>
                    <p className="text-2xl font-bold text-violet-400">56</p>
                  </div>
                  <div className="bg-[#2A2A3E] rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Favorites</p>
                    <p className="text-2xl font-bold text-violet-400">{favorites.size}</p>
                  </div>
                </div>
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
