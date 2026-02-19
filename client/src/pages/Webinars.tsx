import { useState, useMemo, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Search,
  Video,
  TrendingUp,
  Clock,
  Zap,
  Globe,
  Package,
  Sparkles,
  Radio,
  Calendar,
  Eye,
  MapPin,
  Play,
  SlidersHorizontal,
  Users,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "wouter";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { cn } from "../lib/utils";
import {
  MOCK_WEBINARS,
  getCategoryLabel,
  getCategoryColor,
  type MockWebinar,
} from "../lib/webinar-mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// ─── 分类配置 ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "all", label: "全部", icon: Globe },
  { value: "electronics", label: "消费电子", icon: Zap },
  { value: "home", label: "家居日用", icon: Package },
  { value: "fashion", label: "服装服饰", icon: Sparkles },
  { value: "sports", label: "运动户外", icon: TrendingUp },
  { value: "beauty", label: "美妆护肤", icon: Sparkles },
  { value: "toys", label: "玩具礼品", icon: Package },
  { value: "ecommerce", label: "电商选品", icon: TrendingUp },
];

const STATUS_TABS = [
  { value: "all", label: "全部" },
  { value: "live", label: "直播中" },
  { value: "scheduled", label: "即将开始" },
  { value: "completed", label: "已结束" },
  { value: "draft", label: "草稿" },
];

const SORT_OPTIONS = [
  { value: "scheduledAt_desc", label: "最近安排" },
  { value: "scheduledAt_asc", label: "最早安排" },
  { value: "viewCount_desc", label: "浏览最多" },
  { value: "registered_desc", label: "报名最多" },
];

// ─── 工具函数 ──────────────────────────────────────────────────────────────
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  if (absDiff < 60 * 60 * 1000) {
    const mins = Math.floor(absDiff / (60 * 1000));
    return diff > 0 ? `${mins}分钟后` : `${mins}分钟前开始`;
  }
  if (absDiff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(absDiff / (60 * 60 * 1000));
    return diff > 0 ? `${hours}小时后` : `${hours}小时前`;
  }
  const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
  if (days < 7) return diff > 0 ? `${days}天后` : `${days}天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}小时`;
}

function getCountdownText(dateString: string) {
  const now = new Date().getTime();
  const target = new Date(dateString).getTime();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}天${hours}小时后`;
  if (hours > 0) return `${hours}小时${minutes}分钟后`;
  return `${minutes}分钟后`;
}

// ─── WebinarCard 组件 ──────────────────────────────────────────────────────
function WebinarCard({ webinar, onClick }: { webinar: MockWebinar; onClick: () => void }) {
  const isLive = webinar.status === "live";
  const isScheduled = webinar.status === "scheduled";
  const isCompleted = webinar.status === "completed";
  const countdown = isScheduled ? getCountdownText(webinar.scheduledAt) : null;
  const fillRate = Math.min(100, Math.round((webinar.registeredCount / webinar.maxParticipants) * 100));

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-[#0f0f0f] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-0.5",
        isLive
          ? "border-red-500/30 hover:border-red-500/60 shadow-red-500/5"
          : "border-[#1e1e1e] hover:border-violet-500/40"
      )}
    >
      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden bg-[#1a1a1a]">
        <img
          src={webinar.coverImage}
          alt={webinar.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/40">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          {isScheduled && countdown && (
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-500/20">
              <Clock className="w-3 h-3" />
              {countdown}
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
              <Play className="w-3 h-3" />
              回放
            </div>
          )}
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3">
          <Badge className={cn("text-[10px] font-medium border", getCategoryColor(webinar.category))}>
            {getCategoryLabel(webinar.category)}
          </Badge>
        </div>

        {/* Live viewer count */}
        {isLive && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <Eye className="w-3 h-3 text-red-400" />
            <span>{webinar.currentParticipants.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Host */}
        <div className="flex items-center gap-2 mb-2.5">
          <img src={webinar.hostAvatar} alt={webinar.hostName} className="w-5 h-5 rounded-full" />
          <span className="text-xs text-gray-400 font-light truncate">{webinar.hostName}</span>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-500 font-light truncate">{webinar.hostCompany}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors leading-snug">
          {webinar.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 font-light line-clamp-2 mb-3 leading-relaxed">
          {webinar.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {webinar.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#252525] px-1.5 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(webinar.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(webinar.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>{webinar.language}</span>
          </div>
        </div>

        {/* Registration progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-light">
              <span className="text-white font-medium">{webinar.registeredCount}</span>
              <span className="text-gray-600"> / {webinar.maxParticipants} 已报名</span>
            </span>
            <span className={cn(
              "font-medium",
              fillRate >= 80 ? "text-red-400" : fillRate >= 50 ? "text-amber-400" : "text-gray-400"
            )}>
              {fillRate}%
            </span>
          </div>
          <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fillRate >= 80 ? "bg-red-500" : fillRate >= 50 ? "bg-amber-500" : "bg-violet-500"
              )}
              style={{ width: `${fillRate}%` }}
            />
          </div>
          {fillRate >= 80 && (
            <p className="text-[10px] text-red-400 font-medium">⚡ 名额即将满员</p>
          )}
        </div>

        {/* Bottom meta */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1a1a1a]">
          {webinar.products.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3 h-3 text-violet-400" />
              <span>{webinar.products.length} 款产品</span>
            </div>
          )}
          {webinar.factories.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>{webinar.factories.length} 家工厂</span>
            </div>
          )}
          {webinar.viewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
              <Eye className="w-3 h-3" />
              <span>{webinar.viewCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────────────────
export default function Webinars() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("scheduledAt_desc");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 尝试从 API 获取数据，失败时使用 mock 数据
  const { data: apiData, isLoading } = trpc.webinar.listAll.useQuery(
    { limit: 100 },
    { retry: false, onError: () => {} } as any
  );

  // 合并 API 数据和 mock 数据
  const allWebinars = useMemo((): MockWebinar[] => {
    const apiItems = (apiData?.items || []) as any[];
    if (apiItems.length > 0) {
      const apiConverted: MockWebinar[] = apiItems
        .filter((w: any) => !w.deletedAt)
        .map((w: any) => ({
          id: w.id,
          title: w.title || "未命名 Webinar",
          titleEn: w.title || "",
          description: w.description || "",
          status: (w.status || "draft") as any,
          category: w.category || "other",
          coverImage: w.coverImage || w.cover_image || "",
          scheduledAt: w.scheduledAt || w.scheduled_at || new Date().toISOString(),
          duration: w.duration || 60,
          maxParticipants: w.maxParticipants || w.max_participants || 100,
          currentParticipants: 0,
          registeredCount: w.registeredCount || 0,
          viewCount: w.viewCount || w.view_count || 0,
          language: w.language || "中文",
          meetingType: w.meetingType || w.meeting_type || "webinar",
          tags: Array.isArray(w.tags) ? w.tags : [],
          hostId: w.hostId || "host",
          hostName: w.hostName || "主持人",
          hostAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${w.hostId || "host"}`,
          hostTitle: "主持人",
          hostCompany: "RealSourcing",
          coHosts: [],
          agenda: [],
          products: [],
          factories: [],
          highlights: [],
          targetAudience: [],
          requirements: [],
        }));
      // 合并：API 数据 + mock 数据（去重）
      const apiIds = new Set(apiConverted.map((w) => w.id));
      const mockOnly = MOCK_WEBINARS.filter((w) => !apiIds.has(w.id));
      return [...apiConverted, ...mockOnly];
    }
    return MOCK_WEBINARS;
  }, [apiData]);

  // 统计
  const stats = useMemo(() => ({
    total: allWebinars.length,
    live: allWebinars.filter((w) => w.status === "live").length,
    scheduled: allWebinars.filter((w) => w.status === "scheduled").length,
    completed: allWebinars.filter((w) => w.status === "completed").length,
    totalRegistered: allWebinars.reduce((sum, w) => sum + w.registeredCount, 0),
  }), [allWebinars]);

  // 分类计数
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allWebinars.forEach((w) => {
      counts[w.category] = (counts[w.category] || 0) + 1;
    });
    return counts;
  }, [allWebinars]);

  // 过滤 + 排序
  const filteredWebinars = useMemo(() => {
    let result = allWebinars.filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (categoryFilter !== "all" && w.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "scheduledAt_asc":
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        case "viewCount_desc":
          return b.viewCount - a.viewCount;
        case "registered_desc":
          return b.registeredCount - a.registeredCount;
        default:
          return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      }
    });

    return result;
  }, [allWebinars, statusFilter, categoryFilter, searchQuery, sortBy]);

  // 分组
  const liveWebinars = filteredWebinars.filter((w) => w.status === "live");
  const scheduledWebinars = filteredWebinars.filter((w) => w.status === "scheduled");
  const completedWebinars = filteredWebinars.filter((w) => w.status === "completed");
  const draftWebinars = filteredWebinars.filter((w) => w.status === "draft");

  const handleWebinarClick = (webinar: MockWebinar) => {
    setLocation(`/webinars/${webinar.id}`);
  };

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "排序";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080808]">

        {/* ─── Hero Banner ─────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#0f0a1a] to-[#0d0d0d] border-b border-[#1a1a1a]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                {/* Live indicator */}
                {stats.live > 0 && (
                  <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                    <Radio className="w-3 h-3 animate-pulse" />
                    {stats.live} 场直播正在进行
                  </div>
                )}

                <h1 className="text-3xl font-light text-white mb-2 tracking-tight">
                  Webinar 采购直播
                </h1>
                <p className="text-gray-400 font-light text-sm max-w-xl leading-relaxed">
                  连接全球顶级制造商，实时展示产品、工厂与供应链。加入直播，与采购专家一对一深度对接。
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-light text-white">{stats.total}</div>
                    <div className="text-xs text-gray-500 mt-0.5">总 Webinar</div>
                  </div>
                  <div className="w-px h-8 bg-[#2a2a2a]" />
                  <div className="text-center">
                    <div className="text-2xl font-light text-amber-400">{stats.scheduled}</div>
                    <div className="text-xs text-gray-500 mt-0.5">即将开始</div>
                  </div>
                  <div className="w-px h-8 bg-[#2a2a2a]" />
                  <div className="text-center">
                    <div className="text-2xl font-light text-red-400">{stats.live}</div>
                    <div className="text-xs text-gray-500 mt-0.5">直播中</div>
                  </div>
                  <div className="w-px h-8 bg-[#2a2a2a]" />
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-300">{stats.totalRegistered.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-0.5">累计报名</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => setLocation("/webinars/create")}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-light gap-2 px-5"
                >
                  <Plus className="w-4 h-4" />
                  创建 Webinar
                </Button>
                <Button
                  variant="outline"
                  className="border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] font-light gap-2 px-5"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  管理我的
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sticky Filters ──────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-[#080808]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-6">
            {/* Row 1: Search + Status + Sort */}
            <div className="flex items-center gap-3 py-3">
              <div className="relative flex-shrink-0 w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <Input
                  placeholder="搜索 Webinar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-[#111] border-[#2a2a2a] text-sm text-gray-300 placeholder:text-gray-600 focus:border-violet-500/50 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-1">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-light rounded-lg transition-all",
                      statusFilter === tab.value
                        ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                        : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
                    )}
                  >
                    {tab.value === "live" && stats.live > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {tab.label}
                      </span>
                    ) : tab.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-[#111] border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] font-light gap-1.5 text-xs"
                    >
                      <Filter className="w-3 h-3" />
                      {currentSortLabel}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#111] border-[#2a2a2a] text-white min-w-[120px]">
                    {SORT_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={cn(
                          "text-xs font-light cursor-pointer focus:bg-white/5",
                          sortBy === opt.value ? "text-violet-400" : "text-gray-300"
                        )}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Row 2: Category filter */}
            <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => {
                const count = cat.value === "all" ? allWebinars.length : (categoryCounts[cat.value] || 0);
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-light rounded-lg border transition-all whitespace-nowrap flex-shrink-0",
                      categoryFilter === cat.value
                        ? "bg-violet-600/15 text-violet-300 border-violet-500/30"
                        : "text-gray-500 border-[#1e1e1e] hover:text-gray-300 hover:border-[#2a2a2a] bg-[#0f0f0f]"
                    )}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.label}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px]",
                        categoryFilter === cat.value ? "text-violet-400" : "text-gray-600"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Content ──────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

          {/* Results summary */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-light">
                共 <span className="text-white">{filteredWebinars.length}</span> 场 Webinar
                {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                    className="ml-3 text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    清除筛选
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Live Section */}
          {liveWebinars.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <h2 className="text-base font-medium text-white">正在直播</h2>
                </div>
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-light">
                  {liveWebinars.length} 场
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {liveWebinars.map((w) => (
                  <WebinarCard key={w.id} webinar={w} onClick={() => handleWebinarClick(w)} />
                ))}
              </div>
            </section>
          )}

          {/* Scheduled Section */}
          {scheduledWebinars.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-medium text-white">即将开始</h2>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-light">
                  {scheduledWebinars.length} 场
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scheduledWebinars.map((w) => (
                  <WebinarCard key={w.id} webinar={w} onClick={() => handleWebinarClick(w)} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Section */}
          {completedWebinars.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-medium text-white">往期回放</h2>
                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-[10px] font-light">
                  {completedWebinars.length} 场
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {completedWebinars.map((w) => (
                  <WebinarCard key={w.id} webinar={w} onClick={() => handleWebinarClick(w)} />
                ))}
              </div>
            </section>
          )}

          {/* Draft Section */}
          {draftWebinars.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-medium text-white">草稿</h2>
                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-[10px] font-light">
                  {draftWebinars.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {draftWebinars.map((w) => (
                  <WebinarCard key={w.id} webinar={w} onClick={() => handleWebinarClick(w)} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {filteredWebinars.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">暂无 Webinar</h3>
              <p className="text-sm text-gray-500 font-light mb-6 max-w-xs">
                {searchQuery ? `没有找到与"${searchQuery}"相关的 Webinar` : "当前筛选条件下没有 Webinar"}
              </p>
              <Button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                variant="outline"
                className="border-[#2a2a2a] text-gray-400 hover:text-white font-light"
              >
                清除筛选
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
