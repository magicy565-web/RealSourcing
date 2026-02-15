import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function Webinars() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 获取 Webinar 列表
  const { data: webinars, isLoading, refetch } = trpc.webinarEnhanced.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter as any,
  });

  // 删除 Webinar
  const deleteWebinar = trpc.webinarEnhanced.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Webinar 已删除" });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 过滤 Webinars
  const filteredWebinars = webinars?.filter((w) => {
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
      scheduled: { label: "已安排", variant: "secondary" as const },
      live: { label: "直播中", variant: "default" as const },
      ended: { label: "已结束", variant: "outline" as const },
      cancelled: { label: "已取消", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 格式化时间
  const formatDateTime = (date: Date) => {
    return format(new Date(date), "yyyy年MM月dd日 HH:mm", { locale: zhCN });
  };

  // 计算时长显示
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Webinar 管理</h1>
          <p className="text-muted-foreground mt-1">
            创建和管理您的产品展示会议
          </p>
        </div>
        <Button onClick={() => setLocation("/webinars/create")} size="lg">
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredWebinars?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">还没有 Webinar</h3>
            <p className="text-muted-foreground text-center mb-4">
              创建您的第一场产品展示会议，开始与全球买家互动
            </p>
            <Button onClick={() => setLocation("/webinars/create")}>
              <Plus className="h-4 w-4 mr-2" />
              创建 Webinar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Webinar List */}
      {!isLoading && filteredWebinars && filteredWebinars.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWebinars.map((webinar) => (
            <Card key={webinar.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              {webinar.coverImage && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={webinar.coverImage}
                    alt={webinar.title}
                    className="w-full h-full object-cover"
                  />
                  {webinar.status === "live" && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="destructive" className="animate-pulse">
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        直播中
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{webinar.title}</CardTitle>
                  {getStatusBadge(webinar.status)}
                </div>
                {webinar.description && (
                  <CardDescription className="line-clamp-2">
                    {webinar.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(webinar.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(webinar.duration)}</span>
                  </div>
                  {webinar.maxParticipants && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>最多 {webinar.maxParticipants} 人</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {webinar.status === "live" && (
                    <Button
                      className="flex-1"
                      onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
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
                        onClick={() => setLocation(`/webinars/${webinar.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
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
                      onClick={() => setLocation(`/webinars/${webinar.id}/replay`)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      查看回放
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
