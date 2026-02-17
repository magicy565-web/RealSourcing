import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowLeft, Check, Calendar, Clock, Globe, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { trpc } from "../lib/trpc";

export default function CreateWebinar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "120",
    category: "",
    language: "en",
    type: "webinar" as "webinar" | "one_to_one" | "group",
    maxParticipants: "100",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "标题不能为空";
    if (!formData.date) newErrors.date = "日期不能为空";
    if (!formData.time) newErrors.time = "时间不能为空";
    if (!formData.category) newErrors.category = "分类不能为空";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 组合日期和时间
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      // 调用 tRPC API 创建 Webinar
      const result = await trpc.webinar.create.mutate({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        type: formData.type,
        language: formData.language,
        scheduledAt: scheduledAt,
        duration: parseInt(formData.duration),
        maxParticipants: parseInt(formData.maxParticipants),
        recordingEnabled: true,
      });

      toast({
        title: "创建成功",
        description: "Webinar 已成功创建",
      });

      // 跳转到 Webinar 详情页
      setLocation(`/webinars/${result.id}`);
    } catch (error: any) {
      console.error("Failed to create webinar:", error);
      toast({
        title: "创建失败",
        description: error.message || "无法创建 Webinar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/webinars")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            创建 Webinar
          </h1>
          <p className="text-muted-foreground mt-1">
            设置一场新的在线产品展示会议
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>填写 Webinar 的基本信息和设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              placeholder="例如：TikTok 热门产品采购会"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="详细描述这场 Webinar 的内容和亮点..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日期 *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setErrors({ ...errors, date: "" });
                  }}
                />
              </div>
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">时间 *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  className="pl-10"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData({ ...formData, time: e.target.value });
                    setErrors({ ...errors, time: "" });
                  }}
                />
              </div>
              {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
            </div>
          </div>

          {/* 时长和最大参与人数 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>时长（分钟）</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 分钟</SelectItem>
                  <SelectItem value="60">60 分钟</SelectItem>
                  <SelectItem value="90">90 分钟</SelectItem>
                  <SelectItem value="120">120 分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">最大参与人数</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="maxParticipants"
                  type="number"
                  className="pl-10"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label>分类 *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value });
                setErrors({ ...errors, category: "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">电子产品</SelectItem>
                <SelectItem value="ecommerce">电商产品</SelectItem>
                <SelectItem value="fashion">时尚服饰</SelectItem>
                <SelectItem value="home">家居园艺</SelectItem>
                <SelectItem value="beauty">美妆护肤</SelectItem>
                <SelectItem value="sports">运动户外</SelectItem>
                <SelectItem value="toys">玩具礼品</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* 语言 */}
          <div className="space-y-2">
            <Label>语言</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="zh">🇨🇳 中文</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 类型 */}
          <div className="space-y-2">
            <Label>类型</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webinar">群组 Webinar</SelectItem>
                <SelectItem value="group">小组会议</SelectItem>
                <SelectItem value="one_to_one">一对一会议</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/webinars")}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  创建 Webinar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
