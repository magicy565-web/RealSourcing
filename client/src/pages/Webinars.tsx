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
        // 直接使用 Nginx 反向代理的 HTTPS 域名，绕过 Vercel Proxy 的网络问题
        const url = "https://admin.cnsubscribe.xyz/items/webinars?limit=100";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
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
      live: { color: "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border-red-500/30", label: "Live", dot: true },
      scheduled: { color: "bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30", label: "Scheduled" },
      completed: { color: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30", label: "Completed" },
      draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Draft" },
      cancelled: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Cancelled" },
    };
    const c = config[status] || { color: "bg-gray-500/10 text-gray-400", label: status };
    return (
      <Badge className={cn("text-xs font-medium px-3 py-1", c.color)}>
        {c.dot && <Circle className="h-2 w-2 fill-current mr-1.5 animate-pulse" />}
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
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-violet-500/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              创建 Webinar
            </Button>
          </div>

          {/* Stats Summary */}
          {!isLoading && webinars.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] border-[#262626] hover:border-violet-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Video className="h-5 w-5 text-violet-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-white mb-1">{webinars.length}</div>
                  <div className="text-xs text-muted-foreground font-light">Total Webinars</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] border-[#262626] hover:border-purple-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-white mb-1">
                    {webinars.filter(w => w.status === "scheduled").length}
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Scheduled</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] border-[#262626] hover:border-red-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Circle className="h-5 w-5 text-red-400 fill-current animate-pulse" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-red-400 mb-1">
                    {webinars.filter(w => w.status === "live").length}
                  </div>
                  <div className="text-xs text-muted-foreground font-light">Live Now</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] border-[#262626] hover:border-green-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-white mb-1">
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
                  className="bg-[#141414] border-[#262626] overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                  onClick={() => setLocation(`/webinars/${webinar.id}`)}
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-gradient-to-br from-violet-900/20 via-[#1a1a1a] to-indigo-900/20 relative overflow-hidden">
                    {(webinar.coverImage || webinar.cover_image) ? (
                      <img
                        src={`https://admin.cnsubscribe.xyz/assets/${webinar.coverImage || webinar.cover_image}`}
                        alt={webinar.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-60" />
                  </div>

                  <CardContent className="p-5">
                    <h3 className="text-lg font-medium text-white mb-3 truncate group-hover:text-violet-400 transition-colors">
                      {webinar.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-light">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(webinar.scheduledAt || webinar.scheduled_at)}
                      </div>
                      {webinar.category && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
                          <Globe className="h-3.5 w-3.5" />
                          {webinar.category}
                        </div>
                      )}

                      {/* Business Metrics */}
                      <div className="pt-3 mt-3 border-t border-[#262626]">
                        <div className="grid grid-cols-3 gap-2">
                          {/* Participants */}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-violet-400 mb-1">
                              <Users className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">
                                {webinar.registeredCount || webinar.currentParticipants || webinar.participants_count || 0}
                                {webinar.maxParticipants && `/${webinar.maxParticipants}`}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">参与人数</span>
                          </div>

                          {/* Attendance Rate */}
                          {(webinar.attendanceRate || webinar.attendedCount) && (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-green-400 mb-1">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                  {webinar.attendanceRate || Math.round(((webinar.attendedCount || 0) / (webinar.registeredCount || 1)) * 100)}%
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">出席率</span>
                            </div>
                          )}

                          {/* Opportunities */}
                          {(webinar.mqlGenerated || webinar.opportunitiesCreated) && (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-amber-400 mb-1">
                                <Target className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                  {webinar.mqlGenerated || webinar.opportunitiesCreated || 0}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">商机数</span>
                            </div>
                          )}
                        </div>

                        {/* Revenue (if available) */}
                        {(webinar.estimatedRevenue || webinar.actualRevenue) && (
                          <div className="mt-3 pt-3 border-t border-[#262626]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">预计成交</span>
                              <div className="flex items-center gap-1 text-emerald-400">
                                <DollarSign className="h-3 w-3" />
                                <span className="text-xs font-medium">
                                  {((webinar.estimatedRevenue || webinar.actualRevenue || 0) / 1000).toFixed(1)}K
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow Icon */}
                      <div className="mt-4 flex justify-end">
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
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
