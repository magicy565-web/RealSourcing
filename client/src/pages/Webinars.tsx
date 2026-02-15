import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  Video,
  Eye,
  Play,
  Loader2,
  MapPin,
  Tag,
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { directus } from "../lib/directus";
import { readItems } from "@directus/sdk";
import type { Webinar } from "../lib/directus";

export default function Webinars() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取 Webinar 列表
  useEffect(() => {
    const fetchWebinars = async () => {
      setIsLoading(true);
      try {
        const filter: any = {};
        
        // 状态筛选
        if (statusFilter !== "all") {
          filter.status = { _eq: statusFilter };
        }

        const result = await directus.request(
          readItems("webinars", {
            filter,
            sort: ["-scheduledAt"],
            limit: 100,
          })
        );

        setWebinars(result as Webinar[]);
      } catch (error: any) {
        console.error("Failed to fetch webinars:", error);
        setWebinars([]); // 设置为空数组确保停止加载
        toast({
          title: "加载失败",
          description: error.message || "无法连接到服务器，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebinars();
  }, [statusFilter]); // 移除 toast 避免无限循环

  // 过滤 Webinars
  const filteredWebinars = webinars.filter((w) => {
    if (searchQuery) {
      const matchesSearch =
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
    }
    return true;
  });

  // 获取状态Badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "草稿", variant: "secondary" as const },
      scheduled: { label: "已安排", variant: "default" as const },
      live: { label: "直播中", variant: "destructive" as const },
      ended: { label: "已结束", variant: "outline" as const },
      cancelled: { label: "已取消", variant: "outline" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日 HH:mm", { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  // 计算时长显示
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // 获取封面图 URL
  const getCoverImageUrl = (coverImage: string | null) => {
    if (!coverImage) return null;
    if (coverImage.startsWith("http")) return coverImage;
    if (coverImage.startsWith("/")) {
      // 相对路径，使用 Directus assets endpoint
      return `https://admin.cnsubscribe.xyz/assets${coverImage}`;
    }
    return `https://admin.cnsubscribe.xyz/assets/${coverImage}`;
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Webinar 管理
          </h1>
          <p className="text-muted-foreground mt-1">
            创建和管理您的产品展示会议
          </p>
        </div>
        <Button 
          onClick={() => setLocation("/webinars/create")} 
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建 Webinar
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索 Webinar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="scheduled">已安排</TabsTrigger>
            <TabsTrigger value="live">直播中</TabsTrigger>
            <TabsTrigger value="ended">已结束</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Summary */}
      {!isLoading && webinars.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>总计</CardDescription>
              <CardTitle className="text-2xl">{webinars.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>已安排</CardDescription>
              <CardTitle className="text-2xl">
                {webinars.filter(w => w.status === "scheduled").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>直播中</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {webinars.filter(w => w.status === "live").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>已结束</CardDescription>
              <CardTitle className="text-2xl">
                {webinars.filter(w => w.status === "ended").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredWebinars.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "没有找到匹配的 Webinar" : "还没有 Webinar"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? "尝试使用不同的关键词搜索" 
                : "创建您的第一场产品展示会议，开始与全球买家互动"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setLocation("/webinars/create")}>
                <Plus className="h-4 w-4 mr-2" />
                创建 Webinar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Webinar List */}
      {!isLoading && filteredWebinars.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWebinars.map((webinar) => (
            <Card 
              key={webinar.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              onClick={() => setLocation(`/webinars/${webinar.id}`)}
            >
              {/* Cover Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                {getCoverImageUrl(webinar.coverImage) ? (
                  <img
                    src={getCoverImageUrl(webinar.coverImage)!}
                    alt={webinar.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to gradient background if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-16 w-16 text-blue-400 opacity-50" />
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-4 left-4">
                  {webinar.status === "live" ? (
                    <Badge variant="destructive" className="animate-pulse shadow-lg">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      直播中
                    </Badge>
                  ) : (
                    getStatusBadge(webinar.status)
                  )}
                </div>

                {/* View Count */}
                {webinar.viewCount > 0 && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {webinar.viewCount}
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {webinar.title}
                  </CardTitle>
                </div>
                {webinar.description && (
                  <CardDescription className="line-clamp-2">
                    {webinar.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Category & Language */}
                {(webinar.category || webinar.language) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {webinar.category && (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {webinar.category}
                      </Badge>
                    )}
                    {webinar.language && (
                      <Badge variant="outline" className="text-xs">
                        {webinar.language === 'en' ? '🇬🇧 English' : '🇨🇳 中文'}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formatDateTime(webinar.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDuration(webinar.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {webinar.currentParticipants} / {webinar.maxParticipants} 人
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {webinar.status === "live" && (
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/webinars/${webinar.id}/room`);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      加入直播
                    </Button>
                  )}

                  {webinar.status === "scheduled" && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/webinars/${webinar.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/webinars/${webinar.id}/room`);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        开始直播
                      </Button>
                    </>
                  )}

                  {webinar.status === "ended" && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (webinar.recordingUrl) {
                          window.open(webinar.recordingUrl, '_blank');
                        } else {
                          toast({
                            title: "暂无回放",
                            description: "该 Webinar 没有录制回放",
                          });
                        }
                      }}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {webinar.recordingUrl ? "查看回放" : "无回放"}
                    </Button>
                  )}

                  {webinar.status === "draft" && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/webinars/${webinar.id}/edit`);
                      }}
                    >
                      编辑
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
