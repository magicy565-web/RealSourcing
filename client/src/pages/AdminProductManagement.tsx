import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  TrendingUp,
  DollarSign,
  Package,
  Filter
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category?: string;
  moq?: number;
  images?: string[];
  tiktok_views?: number;
  tiktok_likes?: number;
  daily_sales?: number;
  total_sales?: number;
  trending_score?: number;
  commission_rate?: number;
  supplier_id?: any;
}

export default function AdminProductManagement() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://admin.cnsubscribe.xyz/items/products?fields=*,supplier_id.name&sort=-id&limit=100');
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`https://admin.cnsubscribe.xyz/items/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Product Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage products and TikTok metrics</p>
        </div>
                <button
                  onClick={() => setLocation('/admin/products/new/edit')}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-violet-400" />
            <p className="text-sm text-gray-400">Total Products</p>
          </div>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <p className="text-sm text-gray-400">Avg. Trending Score</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {products.length > 0 
              ? Math.round(products.reduce((sum, p) => sum + (p.trending_score || 0), 0) / products.length)
              : 0}
          </p>
        </div>
        <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-blue-400" />
            <p className="text-sm text-gray-400">Total TikTok Views</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {formatNumber(products.reduce((sum, p) => sum + (p.tiktok_views || 0), 0))}
          </p>
        </div>
        <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-orange-400" />
            <p className="text-sm text-gray-400">Total Sales</p>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {formatNumber(products.reduce((sum, p) => sum + (p.total_sales || 0), 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E] mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No products found</p>
            <p className="text-sm mt-2">Add your first product to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F0F1E] border-b border-[#2A2A3E]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    TikTok Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Trending
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A3E]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#2A2A3E] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover bg-[#0F0F1E]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-[#0F0F1E] flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-gray-400 truncate">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category ? (
                        <span className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded text-xs">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-violet-400">${product.price}</p>
                        {product.original_price && (
                          <p className="text-xs text-gray-500 line-through">${product.original_price}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatNumber(product.tiktok_views)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatNumber(product.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.trending_score ? (
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-[#0F0F1E] rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                product.trending_score >= 90 ? 'bg-red-500' :
                                product.trending_score >= 75 ? 'bg-orange-500' :
                                product.trending_score >= 60 ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${product.trending_score}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{product.trending_score}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(`/products/${product.id}`, '_blank')}
                          className="p-2 hover:bg-[#3A3A4E] rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setLocation(`/admin/products/${product.id}/edit`)}
                          className="p-2 hover:bg-[#3A3A4E] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
