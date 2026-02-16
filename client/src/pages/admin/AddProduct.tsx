import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Upload, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { colors } from '../../lib/design-system';

export default function AddProduct() {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    factory_id: '',
    name: '',
    price: '',
    currency: 'USD',
    moq: '',
    lead_time: '',
    category: '',
    stock: '',
    description: '',
    specs: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: 实际上传到服务器
      // 这里模拟添加图片 URL
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: 提交到 Directus API
      console.log('Product data:', {
        ...formData,
        images,
        price: parseFloat(formData.price),
        moq: parseInt(formData.moq),
        stock: parseInt(formData.stock),
        factory_id: parseInt(formData.factory_id),
        specs: formData.specs ? JSON.parse(formData.specs) : undefined,
      });

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 成功后跳转回产品列表
      setLocation('/admin/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setLocation('/admin/products')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} style={{ color: colors.text.primary }} />
            </button>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Add New Product
              </h1>
              <p style={{ color: colors.text.secondary }} className="mt-1">
                Create a new product for a factory
              </p>
            </div>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit}>
            <div
              className="p-6 rounded-lg space-y-6"
              style={{
                backgroundColor: colors.background.card,
                border: `1px solid ${colors.purple[700]}`,
              }}
            >
              {/* 归属工厂 */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Factory *
                </label>
                <select
                  value={formData.factory_id}
                  onChange={(e) => setFormData({ ...formData, factory_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `2px solid ${colors.purple[700]}`,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">Select a factory</option>
                  <option value="1">Shenzhen Electronics Co.</option>
                  <option value="2">Guangzhou Smart Home Ltd.</option>
                </select>
              </div>

              {/* 产品名称 */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., LED Desk Lamp - Modern Design"
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `2px solid ${colors.purple[700]}`,
                    color: colors.text.primary,
                  }}
                />
              </div>

              {/* 产品图片 */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Product Images *
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} color="#FFFFFF" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 6 && (
                    <label
                      className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderColor: colors.purple[500] }}
                    >
                      <Upload size={32} style={{ color: colors.purple[500] }} />
                      <span className="text-sm mt-2" style={{ color: colors.text.secondary }}>
                        Upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: colors.text.secondary }}>
                  Upload up to 6 images. First image will be the main product image.
                </p>
              </div>

              {/* 价格、MOQ、交期 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="2.50"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: `2px solid ${colors.purple[700]}`,
                      color: colors.text.primary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    MOQ (units) *
                  </label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    required
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: `2px solid ${colors.purple[700]}`,
                      color: colors.text.primary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Lead Time *
                  </label>
                  <input
                    type="text"
                    value={formData.lead_time}
                    onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                    required
                    placeholder="7-10 days"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: `2px solid ${colors.purple[700]}`,
                      color: colors.text.primary,
                    }}
                  />
                </div>
              </div>

              {/* 分类和库存 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Lighting, Electronics"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: `2px solid ${colors.purple[700]}`,
                      color: colors.text.primary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Stock (units)
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: `2px solid ${colors.purple[700]}`,
                      color: colors.text.primary,
                    }}
                  />
                </div>
              </div>

              {/* 产品描述 */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the product features, materials, and benefits..."
                  className="w-full px-4 py-3 rounded-lg outline-none resize-none"
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `2px solid ${colors.purple[700]}`,
                    color: colors.text.primary,
                  }}
                />
              </div>

              {/* 产品规格 (JSON) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Product Specifications (JSON)
                </label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  rows={6}
                  placeholder='{"Material": "Aluminum", "Power": "12W", "Color": "White"}'
                  className="w-full px-4 py-3 rounded-lg outline-none resize-none font-mono text-sm"
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `2px solid ${colors.purple[700]}`,
                    color: colors.text.primary,
                  }}
                />
                <p className="text-xs mt-2" style={{ color: colors.text.secondary }}>
                  Optional. Enter product specifications in JSON format.
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setLocation('/admin/products')}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    border: `2px solid ${colors.purple[500]}`,
                    color: colors.purple[500],
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: colors.purple[600],
                    color: '#FFFFFF',
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
