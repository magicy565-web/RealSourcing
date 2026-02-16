import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Package, DollarSign, TrendingUp, BarChart3, Image as ImageIcon, Tag, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { colors } from '../../lib/design-system';

const DIRECTUS_URL = 'http://47.99.205.136:8055';

interface Supplier {
  id: number;
  name: string;
  country: string;
  rating: number;
}

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    supplier_id: '',
    moq: '100',
    lead_time: '7-15 days',
    
    // Pricing
    price: '',
    original_price: '',
    commission_rate: '',
    
    // TikTok Metrics
    tiktok_views: '',
    tiktok_likes: '',
    tiktok_shares: '',
    tiktok_comments: '',
    conversion_rate: '',
    trending_score: '',
    
    // Sales Data
    daily_sales: '',
    total_sales: '',
    growth_rate: '',
    daily_gmv: '',
    total_gmv: '',
    launch_date: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch suppliers from Directus
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${DIRECTUS_URL}/items/suppliers`);
        const data = await response.json();
        setSuppliers(data.data || []);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        moq: formData.moq ? parseInt(formData.moq) : 100,
        lead_time: formData.lead_time || '7-15 days',
        
        price: formData.price ? parseFloat(formData.price) : null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
        
        tiktok_views: formData.tiktok_views ? parseInt(formData.tiktok_views) : 0,
        tiktok_likes: formData.tiktok_likes ? parseInt(formData.tiktok_likes) : 0,
        tiktok_shares: formData.tiktok_shares ? parseInt(formData.tiktok_shares) : 0,
        tiktok_comments: formData.tiktok_comments ? parseInt(formData.tiktok_comments) : 0,
        conversion_rate: formData.conversion_rate ? parseFloat(formData.conversion_rate) : null,
        trending_score: formData.trending_score ? parseInt(formData.trending_score) : 0,
        
        daily_sales: formData.daily_sales ? parseInt(formData.daily_sales) : 0,
        total_sales: formData.total_sales ? parseInt(formData.total_sales) : 0,
        growth_rate: formData.growth_rate ? parseFloat(formData.growth_rate) : null,
        daily_gmv: formData.daily_gmv ? parseFloat(formData.daily_gmv) : 0,
        total_gmv: formData.total_gmv ? parseFloat(formData.total_gmv) : 0,
        launch_date: formData.launch_date || null,
        
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
      };

      const response = await fetch(`${DIRECTUS_URL}/items/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      alert('Product created successfully!');
      setLocation('/admin/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    'Other',
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setLocation('/admin/products')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} style={{ color: colors.text.primary }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                Add New Product
              </h1>
              <p style={{ color: colors.text.secondary }} className="mt-1">
                Fill in the product details below
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.purple[700]}` }}>
              <div className="flex items-center gap-2 mb-4">
                <Package size={20} style={{ color: colors.purple[400] }} />
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  Basic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="DRDENT Purple Teeth Whitening Strips"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Safe for Enamel - Non Sensitive"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Supplier
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                    disabled={isLoading}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.country}) - ⭐ {supplier.rating}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    MOQ (Minimum Order Quantity)
                  </label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Lead Time
                  </label>
                  <input
                    type="text"
                    value={formData.lead_time}
                    onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                    placeholder="7-15 days"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Commission */}
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.purple[700]}` }}>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} style={{ color: colors.purple[400] }} />
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  Pricing & Commission
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15.99"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Original Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="29.99"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    placeholder="15"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>
              </div>
            </div>

            {/* TikTok Metrics */}
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.purple[700]}` }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} style={{ color: colors.purple[400] }} />
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  TikTok Metrics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    TikTok Views
                  </label>
                  <input
                    type="number"
                    value={formData.tiktok_views}
                    onChange={(e) => setFormData({ ...formData, tiktok_views: e.target.value })}
                    placeholder="15200000"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    TikTok Likes
                  </label>
                  <input
                    type="number"
                    value={formData.tiktok_likes}
                    onChange={(e) => setFormData({ ...formData, tiktok_likes: e.target.value })}
                    placeholder="1850000"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    TikTok Shares
                  </label>
                  <input
                    type="number"
                    value={formData.tiktok_shares}
                    onChange={(e) => setFormData({ ...formData, tiktok_shares: e.target.value })}
                    placeholder="125000"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    TikTok Comments
                  </label>
                  <input
                    type="number"
                    value={formData.tiktok_comments}
                    onChange={(e) => setFormData({ ...formData, tiktok_comments: e.target.value })}
                    placeholder="48500"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Conversion Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.conversion_rate}
                    onChange={(e) => setFormData({ ...formData, conversion_rate: e.target.value })}
                    placeholder="12.5"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Trending Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.trending_score}
                    onChange={(e) => setFormData({ ...formData, trending_score: e.target.value })}
                    placeholder="95"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>
              </div>
            </div>

            {/* Sales Data */}
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.purple[700]}` }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={20} style={{ color: colors.purple[400] }} />
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  Sales Data
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Daily Sales (units)
                  </label>
                  <input
                    type="number"
                    value={formData.daily_sales}
                    onChange={(e) => setFormData({ ...formData, daily_sales: e.target.value })}
                    placeholder="7700"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Total Sales (units)
                  </label>
                  <input
                    type="number"
                    value={formData.total_sales}
                    onChange={(e) => setFormData({ ...formData, total_sales: e.target.value })}
                    placeholder="330500"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.growth_rate}
                    onChange={(e) => setFormData({ ...formData, growth_rate: e.target.value })}
                    placeholder="-19.22"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Daily GMV (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.daily_gmv}
                    onChange={(e) => setFormData({ ...formData, daily_gmv: e.target.value })}
                    placeholder="124600"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Total GMV (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_gmv}
                    onChange={(e) => setFormData({ ...formData, total_gmv: e.target.value })}
                    placeholder="6000000"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ color: colors.text.secondary }}>
                    Launch Date
                  </label>
                  <input
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                    style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.purple[700]}` }}>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} style={{ color: colors.purple[400] }} />
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  Product Images
                </h2>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                  style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: colors.purple[600], color: colors.text.primary }}
                >
                  Add Image
                </button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: colors.purple[600], color: colors.text.primary }}>
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                      >
                        <X size={16} style={{ color: colors.text.primary }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.purple[700]}` }}>
              <div className="flex items-center gap-2 mb-4">
                <Tag size={20} style={{ color: colors.purple[400] }} />
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  Tags
                </h2>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag (e.g., Viral, BeautyTok)"
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500"
                  style={{ backgroundColor: colors.background.elevated, borderColor: colors.purple[700], color: colors.text.primary }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: colors.purple[600], color: colors.text.primary }}
                >
                  Add Tag
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.purple[900], color: colors.text.primary }}
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:opacity-70"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => setLocation('/admin/products')}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: colors.background.card, color: colors.text.secondary, border: `1px solid ${colors.purple[700]}` }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: colors.purple[600], color: colors.text.primary }}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
