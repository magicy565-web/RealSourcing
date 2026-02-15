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
  Loader2,
  Globe,
  ArrowRight,
  Circle
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "../lib/utils";
import type { Webinar } from "../lib/directus";
import DashboardLayout from "../components/DashboardLayout";

export default function Webinars() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取 Webinar 列表（带重试机制）
  useEffect(() => {
    const fetchWebinars = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        // 使用 Vercel Proxy 避免混合内容错误，Proxy 内部使用 HTTP 访问服务器以绕过 HTTP/2 问题
        const url = "/api/directus-proxy?path=/items/webinars&limit=100";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // 如果失败且还有重试次数，则重试
          if (retryCount < 2) {
            console.log(`API request failed (${response.status}), retrying... (${retryCount + 1}/2)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
            return fetchWebinars(retryCount + 1);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // 过滤掉软删除的数据
        const validWebinars = (data.data || []).filter((w: any) => !w.deletedAt);
        console.log("Webinars loaded:", validWebinars.length);
        setWebinars(validWebinars as Webinar[]);
      } catch (error: any) {
        console.error("Failed to fetch webinars after retries:", error);
        setWebinars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  // 过滤 Webinars
  const filteredWebinars = webinars.filter((w) => {
    // 状态筛选
    if (statusFilter !== "all" && w.status !== statusFilter) {
      return false;
    }
    
    // 搜索筛选
    if (searchQuery) {
      const matchesSearch =
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; dot?: boolean }> = {
      live: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "🔴 Live", dot: true },
      scheduled: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Scheduled" },
      completed: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
      draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Draft" },
      cancelled: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Cancelled" },
    };
    const c = config[status] || { color: "bg-gray-500/10 text-gray-400", label: status };
    return (
      <Badge className={cn("text-[10px] font-light", c.color)}>
        {c.dot && <Circle className="h-1.5 w-1.5 fill-current mr-1 animate-pulse" />}
        {c.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white">Webinars</h1>
              <p className="text-muted-foreground mt-1 font-light text-sm">
                Create and manage your product showcase sessions.
              </p>
            </div>
            <Button
              onClick={() => setLocation("/webinars/create")}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-light shadow-lg shadow-violet-500/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              创建 Webinar
            </Button>
          </div>

          {/* Stats Summary */}
          {!isLoading && webinars.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-5">
                  <div className="text-2xl font-light text-white mb-1">{webinars.length}</div>
                  <div className="text-xs text-muted-foreground font-light">Total Webinars</div>
                </CardContent>
              </Card>
              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-5">
                  <div className="text-2xl font-light text-white mb-1">
                    {webinars.filter(w => w.status === "scheduled").length}
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Scheduled</div>
                </CardContent>
              </Card>
              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-5">
                  <div className="text-2xl font-light text-red-400 mb-1">
                    {webinars.filter(w => w.status === "live").length}
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Live Now</div>
                </CardContent>
              </Card>
              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-5">
                  <div className="text-2xl font-light text-white mb-1">
                    {webinars.filter(w => w.status === "completed").length}
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Completed</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#141414] border-[#262626] text-white font-light focus:border-violet-500/50"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList className="bg-[#141414] border border-[#262626]">
                <TabsTrigger value="all" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">全部</TabsTrigger>
                <TabsTrigger value="scheduled" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">已安排</TabsTrigger>
                <TabsTrigger value="live" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">直播中</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">已结束</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredWebinars.length === 0 && (
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="flex flex-col items-center justify-center py-24">
                <Video className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-light text-white mb-2">
                  {searchQuery ? "No matching webinars found" : "No webinars yet"}
                </h3>
                <p className="text-muted-foreground text-center mb-6 font-light text-sm max-w-xs">
                  {searchQuery 
                    ? "Try searching with different keywords." 
                    : "Create your first product showcase session to start engaging with global buyers."}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setLocation("/webinars/create")}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-light"
                  >
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
                  className="bg-[#141414] border-[#262626] overflow-hidden hover:border-violet-500/50 transition-all duration-300 group cursor-pointer"
                  onClick={() => setLocation(`/webinars/${webinar.id}`)}
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
                    {(webinar.coverImage || webinar.cover_image) ? (
                      <img
                        src={`https://admin.cnsubscribe.xyz/assets/${webinar.coverImage || webinar.cover_image}`}
                        alt={webinar.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-violet-500/20" />
                      </div>
                    )}
                    
                    {/* Status Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(webinar.status)}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="text-lg font-light text-white mb-2 truncate group-hover:text-violet-400 transition-colors">
                      {webinar.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-light">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(webinar.scheduledAt || webinar.scheduled_at)}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-light">
                            <Users className="h-3 w-3" />
                            {webinar.currentParticipants || webinar.participants_count || 0}
                          </div>
                          {webinar.category && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-light">
                              <Globe className="h-3 w-3" />
                              {webinar.category}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
