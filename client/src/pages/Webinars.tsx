import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Search,
  Video,
  Loader2,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Filter,
  ChevronDown,
  Globe,
  Package,
  Sparkles,
  Radio,
} from "lucide-react";
import { useLocation } from "wouter";
import type { Webinar } from "../lib/directus";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { WebinarCard } from "../components/WebinarCard";
import { cn } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// ─── 分类配置 ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "all", label: "全部分类", icon: Globe },
  { value: "electronics", label: "电子产品", icon: Zap },
  { value: "ecommerce", label: "电商选品", icon: Package },
  { value: "fashion", label: "时尚服饰", icon: Sparkles },
  { value: "home", label: "家居园艺", icon: Globe },
  { value: "beauty", label: "美妆护肤", icon: Sparkles },
  { value: "sports", label: "运动户外", icon: TrendingUp },
  { value: "toys", label: "玩具礼品", icon: Package },
  { value: "other", label: "其他", icon: Globe },
];

const STATUS_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "scheduled", label: "已安排" },
  { value: "live", label: "直播中" },
  { value: "completed", label: "已结束" },
  { value: "draft", label: "草稿" },
];

const SORT_OPTIONS = [
  { value: "scheduledAt_desc", label: "最近安排" },
  { value: "scheduledAt_asc", label: "最早安排" },
  { value: "viewCount_desc", label: "浏览最多" },
];

export default function Webinars() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("scheduledAt_desc");

  // 使用 tRPC 获取 Webinar 列表
  const { data: webinarsData, isLoading, error } = trpc.webinar.listAll.useQuery({
    limit: 100,
  });

  // 提取 webinars 数组
  const webinars = useMemo(
    () => (webinarsData?.items || []).filter((w: any) => !w.deletedAt) as Webinar[],
    [webinarsData]
  );

  // 统计数据
  const stats = useMemo(() => ({
    total: webinars.length,
    scheduled: webinars.filter((w) => w.status === "scheduled").length,
    live: webinars.filter((w) => w.status === "live").length,
    completed: webinars.filter((w) => w.status === "completed").length,
  }), [webinars]);

  // 过滤 + 排序
  const filteredWebinars = useMemo(() => {
    let result = webinars.filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (categoryFilter !== "all" && w.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          w.title.toLowerCase().includes(q) ||
          (w.description && w.description.toLowerCase().includes(q)) ||
          (w.category && w.category.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "scheduledAt_asc":
          return new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime();
        case "viewCount_desc":
          return ((b as any).viewCount || 0) - ((a as any).viewCount || 0);
        default:
          return new Date(b.scheduledAt || 0).getTime() - new Date(a.scheduledAt || 0).getTime();
      }
    });

    return result;
  }, [webinars, statusFilter, categoryFilter, searchQuery, sortBy]);

  const handleWebinarClick = (webinar: Webinar) => {
    const meetingType = (webinar as any).meetingType || (webinar as any).meeting_type;
    if (meetingType === "sourcing") {
      setLocation(`/webinars/${webinar.id}/sourcing`);
    } else {
      setLocation(`/webinars/${webinar.id}`);
    }
  };

  const liveWebinars = webinars.filter((w) => w.status === "live");
  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "排序";

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        {/* ═══════════════════ HERO BANNER ═══════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F0F0F] via-[#0d0d1a] to-[#0F0F0F] border-b border-[#262626]">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>

          <div className="relative px-8 py-10">
            {/* Live indicator strip */}
            {liveWebinars.length > 0 && (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 w-fit">
                <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                <span className="text-sm font-light text-red-300">
                  {liveWebinars.length} 场直播正在进行
                </span>
                <div className="flex gap-2">
                  {liveWebinars.slice(0, 2).map((w) => (
                    <Badge
                      key={w.id}
                      className="bg-red-500/20 text-red-300 border-red-500/30 text-xs font-light cursor-pointer hover:bg-red-500/30 transition-colors"
                      onClick={() => handleWebinarClick(w)}
                    >
                      {w.title.length > 20 ? w.title.slice(0, 20) + "…" : w.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-4xl font-light tracking-tight text-white mb-3">
                  Webinar 管理中心
                </h1>
                <p className="text-muted-foreground font-light text-base max-w-xl">
                  创建并管理您的产品展示直播，连接全球买家与工厂，实现高效的跨境采购对接。
                </p>

                {/* Quick Stats Row */}
                {!isLoading && webinars.length > 0 && (
                  <div className="flex flex-wrap items-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                        <Video className="h-4 w-4 text-violet-400" />
                      </div>
                      <div>
                        <div className="text-white font-light text-lg leading-none">{stats.total}</div>
                        <div className="text-muted-foreground text-xs font-light">总 Webinar</div>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-[#262626]" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-light text-lg leading-none">{stats.scheduled}</div>
                        <div className="text-muted-foreground text-xs font-light">已安排</div>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-[#262626]" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                        <Radio className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <div className="text-white font-light text-lg leading-none">{stats.live}</div>
                        <div className="text-muted-foreground text-xs font-light">直播中</div>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-[#262626]" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-light text-lg leading-none">{stats.completed}</div>
                        <div className="text-muted-foreground text-xs font-light">已结束</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setLocation("/webinars/create")}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-light shadow-lg shadow-violet-500/20 flex-shrink-0"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                创建 Webinar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* ═══════════════════ CATEGORY TABS ═══════════════════ */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-light whitespace-nowrap transition-all border",
                  categoryFilter === cat.value
                    ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20"
                    : "bg-[#141414] text-muted-foreground border-[#262626] hover:border-violet-500/50 hover:text-white"
                )}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* ═══════════════════ SEARCH & FILTERS ═══════════════════ */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索 Webinar 标题、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#141414] border-[#262626] text-white font-light focus:border-violet-500/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-light transition-all border",
                    statusFilter === opt.value
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                      : "bg-[#141414] text-muted-foreground border-[#262626] hover:border-[#404040] hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#141414] border-[#262626] text-muted-foreground hover:text-white hover:border-[#404040] font-light gap-2"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {currentSortLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#141414] border-[#262626] text-white">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "font-light cursor-pointer focus:bg-white/5 focus:text-violet-400",
                      sortBy === opt.value && "text-violet-400"
                    )}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results Count */}
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-light">
                {filteredWebinars.length > 0
                  ? `共 ${filteredWebinars.length} 场 Webinar`
                  : "暂无符合条件的 Webinar"}
              </p>
              {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 font-light transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="bg-[#141414] border-[#262626] border-red-500/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 mb-2">⚠️ 加载失败</div>
                <p className="text-muted-foreground text-center text-sm font-light">
                  {error.message || "无法加载 Webinar 列表，请稍后重试"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-light">加载 Webinar 列表...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredWebinars.length === 0 && (
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-6">
                  <Video className="h-10 w-10 text-violet-500/50" />
                </div>
                <h3 className="text-lg font-light text-white mb-2">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "未找到匹配的 Webinar"
                    : "还没有 Webinar"}
                </h3>
                <p className="text-muted-foreground text-center mb-6 font-light text-sm max-w-xs">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "尝试调整搜索关键词或筛选条件。"
                    : "创建您的第一场产品展示直播，开始连接全球买家。"}
                </p>
                {!searchQuery && statusFilter === "all" && categoryFilter === "all" && (
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

          {/* Live Webinars (优先展示) */}
          {!isLoading && !error && filteredWebinars.some((w) => w.status === "live") && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                <h2 className="text-sm font-light text-red-300 uppercase tracking-widest">正在直播</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWebinars
                  .filter((w) => w.status === "live")
                  .map((webinar) => (
                    <WebinarCard
                      key={webinar.id}
                      webinar={webinar}
                      onClick={() => handleWebinarClick(webinar)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Webinar Grid */}
          {!isLoading && !error && filteredWebinars.filter((w) => w.status !== "live").length > 0 && (
            <div>
              {filteredWebinars.some((w) => w.status === "live") && (
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-light text-muted-foreground uppercase tracking-widest">其他 Webinar</h2>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWebinars
                  .filter((w) => w.status !== "live")
                  .map((webinar) => (
                    <WebinarCard
                      key={webinar.id}
                      webinar={webinar}
                      onClick={() => handleWebinarClick(webinar)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
