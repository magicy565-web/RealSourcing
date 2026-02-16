import { useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Product } from '../../lib/directus';
import { colors, borderRadius } from '../../lib/design-system';

// Mock 产品数据
const MOCK_PRODUCTS: (Product & { factory_name: string })[] = [
  {
    id: 1,
    factory_id: 1,
    factory_name: 'Shenzhen Electronics Co.',
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
    factory_name: 'Guangzhou Smart Home Ltd.',
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
    factory_name: 'Shenzhen Electronics Co.',
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
];

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleDelete = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFactory = selectedFactory === 'all' || product.factory_id.toString() === selectedFactory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesFactory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题和操作按钮 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Product Management
              </h1>
              <p style={{ color: colors.text.secondary }} className="mt-1">
                Manage products across all factories
              </p>
            </div>

            <button
              onClick={() => setLocation('/admin/products/new')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: colors.purple[600],
                color: '#FFFFFF',
              }}
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>

          {/* 筛选栏 */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.purple[700]}`,
            }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
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

              {/* 工厂筛选 */}
              <select
                value={selectedFactory}
                onChange={(e) => setSelectedFactory(e.target.value)}
                className="px-4 py-2 rounded-lg outline-none"
                style={{
                  backgroundColor: colors.background.secondary,
                  border: `2px solid ${colors.purple[700]}`,
                  color: colors.text.primary,
                }}
              >
                <option value="all">All Factories</option>
                <option value="1">Shenzhen Electronics Co.</option>
                <option value="2">Guangzhou Smart Home Ltd.</option>
              </select>

              {/* 状态筛选 */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 rounded-lg outline-none"
                style={{
                  backgroundColor: colors.background.secondary,
                  border: `2px solid ${colors.purple[700]}`,
                  color: colors.text.primary,
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* 产品列表 */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.purple[700]}`,
            }}
          >
            {/* 表头 */}
            <div
              className="grid grid-cols-12 gap-4 p-4 border-b font-semibold"
              style={{
                backgroundColor: colors.background.secondary,
                borderColor: colors.purple[700],
                color: colors.text.primary,
              }}
            >
              <div className="col-span-1">Image</div>
              <div className="col-span-3">Product Name</div>
              <div className="col-span-2">Factory</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">MOQ</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* 产品行 */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <p style={{ color: colors.text.secondary }}>
                  No products found
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b items-center hover:bg-white/5 transition-colors"
                  style={{ borderColor: colors.purple[700] }}
                >
                  {/* 图片 */}
                  <div className="col-span-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl">📦</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 产品名称 */}
                  <div className="col-span-3">
                    <p
                      className="font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {product.name}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: colors.text.secondary }}
                    >
                      {product.category}
                    </p>
                  </div>

                  {/* 工厂 */}
                  <div className="col-span-2">
                    <p style={{ color: colors.text.primary }}>
                      {product.factory_name}
                    </p>
                  </div>

                  {/* 价格 */}
                  <div className="col-span-1">
                    <p
                      className="font-semibold"
                      style={{ color: colors.purple[500] }}
                    >
                      ${product.price}
                    </p>
                  </div>

                  {/* MOQ */}
                  <div className="col-span-1">
                    <p style={{ color: colors.text.primary }}>
                      {product.moq}
                    </p>
                  </div>

                  {/* 库存 */}
                  <div className="col-span-1">
                    <p style={{ color: colors.text.primary }}>
                      {product.stock}
                    </p>
                  </div>

                  {/* 状态 */}
                  <div className="col-span-1">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: product.status === 'active' ? colors.accent.green : colors.accent.red,
                        color: '#FFFFFF',
                      }}
                    >
                      {product.status}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => setLocation(`/admin/products/${product.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="View"
                    >
                      <Eye size={18} style={{ color: colors.text.secondary }} />
                    </button>
                    <button
                      onClick={() => setLocation(`/admin/products/${product.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} style={{ color: colors.purple[500] }} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} style={{ color: colors.accent.red }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 统计信息 */}
          <div className="mt-6 flex items-center justify-between">
            <p style={{ color: colors.text.secondary }} className="text-sm">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
