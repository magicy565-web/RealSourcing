import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { Product } from '../lib/directus';
import { colors } from '../lib/design-system';

interface ProductSelectorProps {
  factoryId: number;
  selectedProductIds: number[];
  onSelectionChange: (productIds: number[]) => void;
}

// Mock 产品数据（根据工厂 ID 过滤）
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    factory_id: 1,
    name: 'LED Desk Lamp - Modern Design',
    price: 2.50,
    currency: 'USD',
    moq: 100,
    lead_time: '7 days',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
    category: 'Lighting',
    stock: 5000,
    favorite_count: 5,
    inquiry_count: 2,
    view_count: 12,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    factory_id: 2,
    name: 'Smart RGB Bulb (WiFi)',
    price: 3.80,
    currency: 'USD',
    moq: 50,
    lead_time: '10 days',
    images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?w=400'],
    category: 'Smart Home',
    stock: 3000,
    favorite_count: 8,
    inquiry_count: 4,
    view_count: 25,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    factory_id: 1,
    name: 'Portable Power Bank 10000mAh',
    price: 4.20,
    currency: 'USD',
    moq: 200,
    lead_time: '5 days',
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'],
    category: 'Electronics',
    stock: 8000,
    favorite_count: 3,
    inquiry_count: 1,
    view_count: 8,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    factory_id: 1,
    name: 'Wireless Earbuds Pro',
    price: 8.90,
    currency: 'USD',
    moq: 100,
    lead_time: '7 days',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
    category: 'Audio',
    stock: 2000,
    favorite_count: 12,
    inquiry_count: 6,
    view_count: 45,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    factory_id: 1,
    name: 'Mini USB Desk Fan',
    price: 1.90,
    currency: 'USD',
    moq: 500,
    lead_time: '3 days',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    category: 'Home Appliances',
    stock: 10000,
    favorite_count: 7,
    inquiry_count: 3,
    view_count: 18,
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

export default function ProductSelector({ factoryId, selectedProductIds, onSelectionChange }: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 根据工厂 ID 过滤产品
  const factoryProducts = MOCK_PRODUCTS.filter(p => p.factory_id === factoryId && p.status === 'active');

  // 根据搜索关键词过滤
  const filteredProducts = factoryProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProduct = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      onSelectionChange(selectedProductIds.filter(id => id !== productId));
    } else {
      onSelectionChange([...selectedProductIds, productId]);
    }
  };

  const isSelected = (productId: number) => selectedProductIds.includes(productId);

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: colors.text.secondary }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
          style={{
            backgroundColor: colors.background.secondary,
            border: `2px solid ${colors.purple[700]}`,
            color: colors.text.primary,
          }}
        />
      </div>

      {/* 产品列表 */}
      <div
        className="max-h-96 overflow-y-auto rounded-lg"
        style={{
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.purple[700]}`,
        }}
      >
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p style={{ color: colors.text.secondary }}>
              {factoryProducts.length === 0
                ? 'No products available for this factory'
                : 'No products match your search'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: colors.purple[700] }}>
            {filteredProducts.map((product) => {
              const selected = isSelected(product.id);
              
              return (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  {/* Checkbox */}
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: selected ? colors.purple[600] : 'transparent',
                      border: `2px solid ${selected ? colors.purple[600] : colors.purple[500]}`,
                    }}
                  >
                    {selected && <Check size={14} color="#FFFFFF" />}
                  </div>

                  {/* 产品图片 */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
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
                    <p
                      className="font-medium truncate"
                      style={{ color: colors.text.primary }}
                    >
                      {product.name}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.purple[500] }}
                      >
                        ${product.price}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        MOQ: {product.moq}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {product.lead_time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 已选择统计 */}
      <div className="flex items-center justify-between">
        <p style={{ color: colors.text.secondary }} className="text-sm">
          {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
        </p>
        {selectedProductIds.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="text-sm font-medium hover:underline"
            style={{ color: colors.purple[500] }}
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
}
