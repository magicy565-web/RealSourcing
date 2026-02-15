/**
 * CreateWebinarModal Component
 * 
 * Multi-step wizard for creating webinars with type and scenario selection.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../src/components/ui/dialog';
import { Button } from '../../../src/components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../../src/components/ui/radio-group';
import { Label } from '../../../src/components/ui/label';
import { Input } from '../../../src/components/ui/input';
import { Textarea } from '../../../src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../src/components/ui/select';
import { createWebinar, type CreateWebinarInput } from '../../../src/lib/api/webinars';
import { toast } from 'sonner';

interface CreateWebinarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type WebinarType = 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';
type WebinarScenario = 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';

const typeConfig = {
  one_on_one: { label: '1对1会议', icon: '💬', description: '2人，深度商务谈判', maxParticipants: 2 },
  small_group: { label: '小组会议', icon: '👥', description: '3-10人，私密对接', maxParticipants: 10 },
  medium: { label: '中型Webinar', icon: '🎯', description: '11-30人，半公开', maxParticipants: 30 },
  large: { label: '大型Webinar', icon: '🎪', description: '31-100人，公开展示', maxParticipants: 100 },
  extra_large: { label: '超大型Webinar', icon: '🏟️', description: '100+人，行业峰会', maxParticipants: 200 },
};

const scenarioConfig = {
  general: { label: '常规商务会议', icon: '📋', color: 'bg-gray-600' },
  tiktok_dropshipper: { label: 'TikTok/Dropshipper 产品对接', icon: '🎵', color: 'bg-red-600' },
  influencer_selection: { label: '网红达人选品对接', icon: '⭐', color: 'bg-orange-600' },
  negotiation: { label: '一对一商务谈判', icon: '💼', color: 'bg-blue-600' },
  small_batch: { label: '小批量采购', icon: '📦', color: 'bg-green-600' },
  product_launch: { label: '新品发布会', icon: '🚀', color: 'bg-purple-600' },
  factory_tour: { label: '工厂开放日', icon: '🏭', color: 'bg-indigo-600' },
  industry_summit: { label: '行业峰会', icon: '🎯', color: 'bg-pink-600' },
};

export function CreateWebinarModal({ open, onClose, onSuccess }: CreateWebinarModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateWebinarInput>>({
    type: 'small_group',
    scenario: 'general',
    visibility: 'private',
    max_participants: 10,
    duration: 60,
    language: 'en',
    host_type: 'factory',
  });

  const handleTypeChange = (type: WebinarType) => {
    const config = typeConfig[type];
    setFormData({ 
      ...formData, 
      type,
      max_participants: config.maxParticipants,
    });
  };

  const handleScenarioChange = (scenario: WebinarScenario) => {
    setFormData({ ...formData, scenario });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.scheduled_at) {
      toast.error('请填写所有必填字段');
      return;
    }

    setLoading(true);
    try {
      await createWebinar(formData as CreateWebinarInput);
      toast.success('Webinar 创建成功！');
      onClose();
      setStep(1);
      setFormData({
        type: 'small_group',
        scenario: 'general',
        visibility: 'private',
        max_participants: 10,
        duration: 60,
        language: 'en',
        host_type: 'factory',
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to create webinar:', error);
      toast.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getScenarioOptions = () => {
    if (formData.type === 'one_on_one' || formData.type === 'small_group') {
      return ['general', 'tiktok_dropshipper', 'influencer_selection', 'negotiation', 'small_batch'];
    } else {
      return ['general', 'product_launch', 'factory_tour', 'industry_summit'];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建 Webinar</DialogTitle>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-violet-600' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {/* 步骤 1: 选择类型 */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">选择 Webinar 类型</Label>
            <RadioGroup value={formData.type} onValueChange={(value) => handleTypeChange(value as WebinarType)}>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.type === key
                        ? 'border-violet-600 bg-violet-600/10'
                        : 'border-gray-700 hover:border-violet-600/50'
                    }`}
                    onClick={() => handleTypeChange(key as WebinarType)}
                  >
                    <RadioGroupItem value={key} id={key} className="sr-only" />
                    <Label htmlFor={key} className="cursor-pointer">
                      <div className="text-3xl mb-2">{config.icon}</div>
                      <div className="font-semibold text-base mb-1">{config.label}</div>
                      <div className="text-sm text-gray-400">{config.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <Button onClick={() => setStep(2)} className="w-full">
              下一步
            </Button>
          </div>
        )}

        {/* 步骤 2: 选择场景 */}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">选择应用场景</Label>
            <div className="grid grid-cols-2 gap-3">
              {getScenarioOptions().map((key) => {
                const config = scenarioConfig[key as WebinarScenario];
                return (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.scenario === key
                        ? 'border-violet-600 bg-violet-600/10'
                        : 'border-gray-700 hover:border-violet-600/50'
                    }`}
                    onClick={() => handleScenarioChange(key as WebinarScenario)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{config.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{config.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                上一步
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* 步骤 3: 基本信息 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>标题 *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入 Webinar 标题"
                className="mt-1"
              />
            </div>
            <div>
              <Label>描述 *</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述 Webinar 内容、目标受众和预期成果"
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>开始时间 *</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>时长（分钟）*</Label>
                <Input
                  type="number"
                  value={formData.duration || 60}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>类别 *</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="consumer-goods">Consumer Goods</SelectItem>
                    <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                    <SelectItem value="smart-home">Smart Home</SelectItem>
                    <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                    <SelectItem value="industrial">Industrial Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>语言 *</Label>
                <Select
                  value={formData.language || 'en'}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                上一步
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* 步骤 4: 设置 */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>可见性</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">公开 - 所有人可见和加入</SelectItem>
                  <SelectItem value="semi_public">半公开 - 需要报名审核</SelectItem>
                  <SelectItem value="private">私密 - 仅受邀者可加入</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>最大参与人数</Label>
              <Input
                type="number"
                value={formData.max_participants || 10}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                建议：{typeConfig[formData.type || 'small_group'].maxParticipants} 人
              </p>
            </div>
            <div>
              <Label>封面图 URL（可选）</Label>
              <Input
                value={formData.cover_image || ''}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="/covers/your-image.png"
                className="mt-1"
              />
            </div>
            
            {/* 预览 */}
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
              <h4 className="font-semibold mb-2">预览</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型：</span>
                  <span>{typeConfig[formData.type || 'small_group'].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">场景：</span>
                  <span>{scenarioConfig[formData.scenario || 'general'].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">可见性：</span>
                  <span>
                    {formData.visibility === 'public' ? '公开' : formData.visibility === 'semi_public' ? '半公开' : '私密'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">参与人数：</span>
                  <span>{formData.max_participants} 人</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1" disabled={loading}>
                上一步
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                {loading ? '创建中...' : '创建 Webinar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
