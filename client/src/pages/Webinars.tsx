import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Search, Video, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { Webinar } from "../lib/directus";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { WebinarCard } from "../components/WebinarCard";

export default function Webinars() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 使用 tRPC 获取 Webinar 列表
  const { data: webinarsData, isLoading, error } = trpc.webinarEnhanced.listAll.useQuery({
    limit: 100,
  });

  // 提取 webinars 数组
  const webinars = (webinarsData?.items || []).filter((w: any) => !w.deletedAt) as Webinar[];

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
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.category && w.category.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
    }
    return true;
  });

  const handleWebinarClick = (webinar: Webinar) => {
    // Route based on meeting type
    const meetingType = (webinar as any).meetingType || (webinar as any).meeting_type;
    if (meetingType === 'sourcing') {
      setLocation(`/webinars/${webinar.id}/sourcing`);
    } else {
      setLocation(`/webinars/${webinar.id}`);
    }
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#141414] border-[#262626] text-white font-light focus:border-violet-500/50"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList className="bg-[#141414] border border-[#262626] w-full sm:w-auto grid grid-cols-4">
                <TabsTrigger value="all" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">全部</TabsTrigger>
                <TabsTrigger value="scheduled" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">已安排</TabsTrigger>
                <TabsTrigger value="live" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">直播中</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">已结束</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Error State */}
          {error && (
            <Card className="bg-[#141414] border-[#262626] border-red-500/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 mb-2">⚠️ 加载失败</div>
                <p className="text-muted-foreground text-center text-sm">
                  {error.message || "无法加载 Webinar 列表,请稍后重试"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredWebinars.length === 0 && (
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

          {/* Webinar Grid */}
          {!isLoading && !error && filteredWebinars.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWebinars.map((webinar) => (
                <WebinarCard
                  key={webinar.id}
                  webinar={webinar}
                  onClick={() => handleWebinarClick(webinar)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
