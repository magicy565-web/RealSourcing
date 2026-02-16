import { useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '../lib/directus';
import { colors, borderRadius } from '../lib/design-system';

interface InquiryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: InquiryData) => void;
}

export interface InquiryData {
  productId: number;
  quantity: number;
  targetPrice?: number;
  message?: string;
}

export default function InquiryModal({
  product,
  isOpen,
  onClose,
  onSubmit,
}: InquiryModalProps) {
  const [quantity, setQuantity] = useState(product.moq);
  const [targetPrice, setTargetPrice] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data: InquiryData = {
      productId: product.id,
      quantity,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      message: message || undefined,
    };

    try {
      await onSubmit?.(data);
      // 重置表单
      setQuantity(product.moq);
      setTargetPrice('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md"
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.xl,
          border: `2px solid ${colors.purple[600]}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: colors.purple[700] }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Inquiry: {product.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} style={{ color: colors.text.primary }} />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 产品信息预览 */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.purple[700]}`,
            }}
          >
            <div className="flex items-center gap-3">
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p style={{ color: colors.text.primary }} className="font-medium">
                  {product.name}
                </p>
                <p style={{ color: colors.purple[500] }} className="text-lg font-bold">
                  ${product.price.toFixed(2)} / unit
                </p>
              </div>
            </div>
          </div>

          {/* 采购数量 */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Purchase Quantity *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || product.moq)}
              min={product.moq}
              required
              className="w-full px-4 py-3 rounded-lg outline-none transition-all"
              style={{
                backgroundColor: colors.background.card,
                border: `2px solid ${colors.purple[700]}`,
                color: colors.text.primary,
              }}
              placeholder={`Minimum ${product.moq} units`}
            />
            <p style={{ color: colors.text.secondary }} className="text-sm mt-1">
              MOQ: {product.moq} units
            </p>
          </div>

          {/* 目标价格（可选） */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Target Price (Optional)
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: colors.text.secondary }}
              >
                $
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  backgroundColor: colors.background.card,
                  border: `2px solid ${colors.purple[700]}`,
                  color: colors.text.primary,
                }}
                placeholder="Your target price per unit"
              />
            </div>
          </div>

          {/* 补充说明（可选） */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Additional Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all resize-none"
              style={{
                backgroundColor: colors.background.card,
                border: `2px solid ${colors.purple[700]}`,
                color: colors.text.primary,
              }}
              placeholder="Any specific requirements or questions..."
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-full font-semibold transition-all"
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
              className="flex-1 py-3 px-6 rounded-full font-semibold transition-all disabled:opacity-50"
              style={{
                backgroundColor: colors.purple[600],
                color: '#FFFFFF',
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
