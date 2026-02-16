import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Tag,
  Upload,
  X,
  Building2
} from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  country?: string;
  rating?: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price: number;
  currency: string;
  category: string;
  moq: number;
  lead_time: string;
  images: string[];
  
  // TikTok Metrics
  tiktok_views: number;
  tiktok_likes: number;
  tiktok_shares: number;
  tiktok_comments: number;
  conversion_rate: number;
  trending_score: number;
  
  // Sales Data
  daily_sales: number;
  total_sales: number;
  daily_gmv: number;
  total_gmv: number;
  growth_rate: number;
  
  // Business Info
  commission_rate: number;
  tags: string[];
  launch_date: string;
  supplier_id: number | null;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const isEdit = id !== 'new';

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    currency: 'USD',
    category: '',
    moq: 100,
    lead_time: '7-15 days',
    images: [],
    
    tiktok_views: 0,
    tiktok_likes: 0,
    tiktok_shares: 0,
    tiktok_comments: 0,
    conversion_rate: 0,
    trending_score: 0,
    
    daily_sales: 0,
    total_sales: 0,
    daily_gmv: 0,
    total_gmv: 0,
    growth_rate: 0,
    
    commission_rate: 0,
    tags: [],
    launch_date: '',
    supplier_id: null
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://47.99.205.136:8055/items/suppliers?sort=name');
      const data = await response.json();
      setSuppliers(data.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://47.99.205.136:8055/items/products/${id}`);
      const data = await response.json();
      setFormData({
        ...data.data,
        tags: data.data.tags || [],
        images: data.data.images || []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit
        ? `http://47.99.205.136:8055/items/products/${id}`
        : 'http://47.99.205.136:8055/items/products';
      
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setLocation('/admin');
      } else {
        alert('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleAddImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const handleRemoveImage = (image: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img !== image)
    });
  };

  const categories = [
    'Beauty & Personal Care',
    'Health & Wellness',
    'Fashion & Apparel',
    'Home & Living',
    'Electronics',
    'Kitchen & Dining',
    'Sports & Outdoors',
    'Toys & Games',
    'Other'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1E] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white">
      {/* Header */}
      <div className="bg-[#1A1A2E] border-b border-[#2A2A3E] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/admin')}
              className="p-2 hover:bg-[#2A2A3E] rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {isEdit ? `Editing product #${id}` : 'Fill in the product details below'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-400" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    placeholder="DRDENT Purple Teeth Whitening Strips"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    rows={3}
                    placeholder="Safe for Enamel - Non Sensitive"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <select
                    value={formData.supplier_id || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} {supplier.country && `(${supplier.country})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">MOQ (Minimum Order Quantity)</label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lead Time</label>
                  <input
                    type="text"
                    value={formData.lead_time}
                    onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                    placeholder="7-15 days"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-violet-400" />
              Pricing & Commission
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Original Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* TikTok Metrics */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              TikTok Metrics
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">TikTok Views</label>
                <input
                  type="number"
                  value={formData.tiktok_views}
                  onChange={(e) => setFormData({ ...formData, tiktok_views: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="15200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">TikTok Likes</label>
                <input
                  type="number"
                  value={formData.tiktok_likes}
                  onChange={(e) => setFormData({ ...formData, tiktok_likes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="1850000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">TikTok Shares</label>
                <input
                  type="number"
                  value={formData.tiktok_shares}
                  onChange={(e) => setFormData({ ...formData, tiktok_shares: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="125000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">TikTok Comments</label>
                <input
                  type="number"
                  value={formData.tiktok_comments}
                  onChange={(e) => setFormData({ ...formData, tiktok_comments: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="48500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Conversion Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.conversion_rate}
                  onChange={(e) => setFormData({ ...formData, conversion_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="12.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trending Score (0-100)</label>
                <input
                  type="number"
                  value={formData.trending_score}
                  onChange={(e) => setFormData({ ...formData, trending_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  min="0"
                  max="100"
                  placeholder="95"
                />
              </div>
            </div>
          </div>

          {/* Sales Data */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-400" />
              Sales Data
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Daily Sales (units)</label>
                <input
                  type="number"
                  value={formData.daily_sales}
                  onChange={(e) => setFormData({ ...formData, daily_sales: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="7700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total Sales (units)</label>
                <input
                  type="number"
                  value={formData.total_sales}
                  onChange={(e) => setFormData({ ...formData, total_sales: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="330500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Growth Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.growth_rate}
                  onChange={(e) => setFormData({ ...formData, growth_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="-19.22"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Daily GMV (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.daily_gmv}
                  onChange={(e) => setFormData({ ...formData, daily_gmv: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="124600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total GMV (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_gmv}
                  onChange={(e) => setFormData({ ...formData, total_gmv: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="6000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Launch Date</label>
                <input
                  type="date"
                  value={formData.launch_date}
                  onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-violet-400" />
              Product Images
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  className="flex-1 px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  Add Image
                </button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg bg-[#0F0F1E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image)}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-violet-600 text-xs rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-violet-400" />
              Tags
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Add a tag (e.g., Viral, BeautyTok)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#0F0F1E] border border-[#2A2A3E] rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setLocation('/admin')}
              className="px-6 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
