import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Globe,
  Video,
  Play,
  MapPin,
  Tag,
  Eye,
  Loader2,
  Share2,
  Edit,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { directus } from "../lib/directus";
import { readItem } from "@directus/sdk";
import type { Webinar } from "../lib/directus";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface WebinarDetailProps {
  params: {
    id?: string;
  };
}

export default function WebinarDetailNew({ params }: WebinarDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const webinarId = params?.id || "0";
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebinar = async () => {
      setLoading(true);
      try {
        const result = await directus.request(
          readItem("webinars", parseInt(webinarId))
        );
        setWebinar(result as Webinar);
      } catch (error: any) {
        console.error("Failed to fetch webinar:", error);
        toast({
          title: "加载失败",
          description: error.message || "无法获取 Webinar 详情",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [webinarId, toast]);

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日 HH:mm", { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const getCoverImageUrl = (coverImage: string | null) => {
    if (!coverImage) return null;
    if (coverImage.startsWith("http")) return coverImage;
    const assetsUrl = `${import.meta.env.VITE_DIRECTUS_URL || ''}/assets`;
    if (coverImage.startsWith("/")) {
      return `${assetsUrl}${coverImage}`;
    }
    return `${assetsUrl}/${coverImage}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "草稿", variant: "secondary" as const, color: "bg-gray-500/10 text-gray-600" },
      scheduled: { label: "已安排", variant: "default" as const, color: "bg-blue-500/10 text-blue-600" },
      live: { label: "直播中", variant: "destructive" as const, color: "bg-red-500/10 text-red-600" },
      ended: { label: "已结束", variant: "outline" as const, color: "bg-green-500/10 text-green-600" },
      cancelled: { label: "已取消", variant: "outline" as const, color: "bg-gray-500/10 text-gray-600" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "链接已复制",
      description: "Webinar 链接已复制到剪贴板",
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Video className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Webinar 不存在</h3>
          <p className="text-muted-foreground mb-4">该 Webinar 可能已被删除或不存在</p>
          <Button onClick={() => setLocation("/webinars")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/webinars")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          {webinar.status === "draft" && (
            <Button variant="outline" onClick={() => setLocation(`/webinars/${webinar.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          )}
        </div>
      </div>

      {/* Cover Image */}
      {getCoverImageUrl(webinar.coverImage) && (
        <div className="aspect-video rounded-lg overflow-hidden mb-6 relative">
          <img
            src={getCoverImageUrl(webinar.coverImage)!}
            alt={webinar.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            {getStatusBadge(webinar.status)}
          </div>
          {webinar.status === "live" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
              >
                <Play className="h-5 w-5 mr-2" />
                加入直播
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Title and Description */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold">{webinar.title}</h1>
          {!getCoverImageUrl(webinar.coverImage) && getStatusBadge(webinar.status)}
        </div>
        {webinar.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {webinar.description}
          </p>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardDescription>日期时间</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{formatDateTime(webinar.scheduledAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardDescription>时长</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{formatDuration(webinar.duration)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardDescription>参与人数</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {webinar.currentParticipants} / {webinar.maxParticipants}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <CardDescription>浏览量</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{webinar.viewCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>详细信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {webinar.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">分类：</span>
              <Badge variant="outline">{webinar.category}</Badge>
            </div>
          )}

          {webinar.language && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">语言：</span>
              <Badge variant="outline">
                {webinar.language === 'en' ? '🇬🇧 English' : '🇨🇳 中文'}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">类型：</span>
            <Badge variant="outline">
              {webinar.type === 'webinar' ? '群组 Webinar' : '一对一会议'}
            </Badge>
          </div>

          {webinar.recordingEnabled === 1 && (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">录制：</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                已启用
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {webinar.status === "scheduled" && (
          <>
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
            >
              <Play className="h-5 w-5 mr-2" />
              开始直播
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation(`/webinars/${webinar.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          </>
        )}

        {webinar.status === "live" && (
          <Button
            size="lg"
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
          >
            <Play className="h-5 w-5 mr-2" />
            加入直播
          </Button>
        )}

        {webinar.status === "ended" && webinar.recordingUrl && (
          <Button
            size="lg"
            className="flex-1"
            onClick={() => window.open(webinar.recordingUrl!, '_blank')}
          >
            <Video className="h-5 w-5 mr-2" />
            查看回放
          </Button>
        )}
      </div>
    </div>
  );
}
