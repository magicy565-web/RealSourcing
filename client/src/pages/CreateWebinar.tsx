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
import { ArrowLeft, Check, Calendar, Clock, Globe, Users, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { directus } from "../lib/directus";
import { createItem, uploadFiles } from "@directus/sdk";

export default function CreateWebinar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "120",
    category: "",
    language: "en",
    type: "webinar" as "webinar" | "one_to_one",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      // 1. 上传封面图（如果有）
      let coverImageId: string | null = null;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("file", coverImageFile);
        
        const uploadResult = await directus.request(
          uploadFiles(formData)
        );
        
        if (uploadResult && typeof uploadResult === 'object' && 'id' in uploadResult) {
          coverImageId = (uploadResult as any).id;
        }
      }

      // 2. 创建 Webinar
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const newWebinar = await directus.request(
        createItem("webinars", {
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          type: formData.type,
          status: "scheduled",
          language: formData.language,
          scheduledAt: scheduledAt,
          duration: parseInt(formData.duration),
          maxParticipants: parseInt(formData.maxParticipants),
          currentParticipants: 0,
          coverImage: coverImageId ? `/assets/${coverImageId}` : null,
          recordingEnabled: 1,
          viewCount: 0,
          createdById: 1, // TODO: 使用实际登录用户ID
        })
      );

      toast({
        title: "创建成功",
        description: "Webinar 已成功创建",
      });

      setLocation(`/webinars/${(newWebinar as any).id}`);
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

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>
            填写 Webinar 的基本信息和设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="例如：TikTok 热门产品采购会"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
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

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover">封面图</Label>
            <div className="flex items-center gap-4">
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("cover")?.click()}
                type="button"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传封面
              </Button>
              {coverImagePreview && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
                  <img
                    src={coverImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                日期 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`pl-10 ${errors.date ? "border-red-500" : ""}`}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                时间 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={`pl-10 ${errors.time ? "border-red-500" : ""}`}
                />
              </div>
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Duration and Max Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">时长（分钟）</Label>
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
                  <SelectItem value="180">180 分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">最大参与人数</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              分类 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">电子产品</SelectItem>
                <SelectItem value="E-commerce">电商产品</SelectItem>
                <SelectItem value="Fashion">时尚服饰</SelectItem>
                <SelectItem value="Home & Garden">家居园艺</SelectItem>
                <SelectItem value="Beauty">美妆护肤</SelectItem>
                <SelectItem value="Sports">运动户外</SelectItem>
                <SelectItem value="Toys">玩具礼品</SelectItem>
                <SelectItem value="Other">其他</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">语言</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger>
                <Globe className="h-4 w-4 mr-2" />
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

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">类型</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "webinar" | "one_to_one" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webinar">群组 Webinar</SelectItem>
                <SelectItem value="one_to_one">一对一会议</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/webinars")}
              disabled={loading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
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
