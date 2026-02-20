import { useState, useEffect, useMemo, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft, Calendar, Clock, Users, Globe, Play, Video,
  Package, MapPin, Star, CheckCircle2, ChevronRight, Zap,
  Radio, Share2, Bell, BellOff, Building2, Award, MessageSquare,
  Info, ShoppingBag, ExternalLink, Tag,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";
// import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  MOCK_WEBINARS,
  MOCK_PRODUCTS,
  getCategoryLabel,
  getCategoryColor,
  getAgendaTypeIcon,
  type MockWebinar,
  type MockProduct,
  type MockFactory,
  type MockAgendaItem,
} from "@/lib/webinar-mock-data";

// ─── 倒计时组件 ────────────────────────────────────────────────────────────
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  useEffect(() => {
    if (!targetDate) { setIsExpired(true); return; }
    const tick = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) { setIsExpired(true); return; }
      setTimeLeft({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return { timeLeft, isExpired };
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] border border-[#262626] flex items-center justify-center">
        <span className="text-xl font-light text-white tabular-nums">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-[10px] text-gray-500 font-light mt-1.5">{label}</span>
    </div>
  );
}

// ─── 产品卡片 ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: MockProduct }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl overflow-hidden hover:border-violet-500/30 transition-all group cursor-pointer">
      <div className="relative h-40 overflow-hidden bg-[#1a1a1a]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/60 to-transparent" />
      </div>
      <div className="p-3.5">
        <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 leading-snug">{product.name}</h4>
        <p className="text-sm text-violet-400 font-medium mb-2">{product.price}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
          <span>MOQ: {product.moq}</span>
          <span>·</span>
          <span>{product.leadTime}</span>
        </div>
        <p className="text-xs text-gray-400 font-light line-clamp-2 mb-2.5 leading-relaxed">{product.highlight}</p>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {product.certification.slice(0, 3).map((cert) => (
            <span key={cert} className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-md">
              {cert}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs text-amber-400 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-600">({product.reviewCount} 评价)</span>
        </div>
        <div className="mt-2 text-[10px] text-gray-500 font-light flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          {product.factoryName}
        </div>
      </div>
    </div>
  );
}

// ─── 工厂卡片 ──────────────────────────────────────────────────────────────
function FactoryCard({ factory }: { factory: MockFactory }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-4 hover:border-blue-500/30 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={factory.logo}
            alt={factory.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.innerHTML = `<span class="text-lg font-light text-gray-400">${factory.name[0]}</span>`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-0.5 line-clamp-1">{factory.name}</h4>
          <p className="text-xs text-gray-500 font-light line-clamp-1">{factory.nameEn}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{factory.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-medium text-amber-400">{factory.rating}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "成立年份", value: `${factory.established}年` },
          { label: "员工规模", value: factory.employees },
          { label: "出口国家", value: `${factory.exportCountries}个` },
          { label: "响应率", value: factory.responseRate },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#1a1a1a] rounded-lg p-2">
            <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
            <div className="text-xs text-white font-medium">{value}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 font-light line-clamp-2 mb-3 leading-relaxed">{factory.description}</p>

      <div className="flex flex-wrap gap-1">
        {factory.certifications.slice(0, 4).map((cert) => (
          <span key={cert} className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">
            {cert}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── 议程条目 ──────────────────────────────────────────────────────────────
function AgendaItem({ item, index, total }: { item: MockAgendaItem; index: number; total: number }) {
  return (
    <div className="flex gap-4">
      {/* 时间 */}
      <div className="flex-shrink-0 w-14 text-right pt-1">
        <div className="text-sm font-medium text-white">{item.time}</div>
        <div className="text-[10px] text-gray-600 font-light">{item.duration}min</div>
      </div>

      {/* 连接线 + 图标 */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-base z-10">
          {getAgendaTypeIcon(item.type)}
        </div>
        {index < total - 1 && <div className="w-px flex-1 bg-[#1e1e1e] mt-1" style={{ minHeight: "24px" }} />}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="p-3.5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl hover:border-violet-500/20 transition-colors">
          <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
          <p className="text-xs text-gray-400 font-light mb-2 leading-relaxed">{item.description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-violet-400 font-medium">{item.speaker}</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 font-light">{item.speakerTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────────────────
export default function WebinarDetail() {
  const [, params] = useRoute("/webinars/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const webinarId = params?.id ? parseInt(params.id) : null;

  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isReminded, setIsReminded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // 从 API 获取（兼容旧版服务器）
  const { data: listData, isLoading } = trpc.webinar.listAll.useQuery(
    { limit: 200 },
    { enabled: !!webinarId, retry: 1, staleTime: 30000, onError: () => {} } as any
  );

  // 优先使用 mock 数据（保证完整的议程/产品/工厂信息），API 数据补充基础字段
  const webinar = useMemo((): MockWebinar | null => {
    if (!webinarId) return null;
    // 先从 mock 数据找（保证有完整的议程/产品/工厂）
    const mockItem = MOCK_WEBINARS.find((w) => w.id === webinarId);
    if (mockItem) return mockItem;
    // 如果 mock 没有，从 API 数据找
    const apiItems = (listData?.items || []) as any[];
    const apiItem = apiItems.find((w: any) => w.id === webinarId);
    if (apiItem) {
      return {
        id: apiItem.id,
        title: apiItem.title || "未命名 Webinar",
        titleEn: apiItem.title || "",
        description: apiItem.description || "",
        status: apiItem.status || "scheduled",
        category: apiItem.category || "other",
        coverImage: apiItem.coverImage || apiItem.cover_image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        scheduledAt: apiItem.scheduledAt || apiItem.scheduled_at || new Date().toISOString(),
        duration: apiItem.duration || 60,
        maxParticipants: apiItem.maxParticipants || 200,
        currentParticipants: 0,
        registeredCount: apiItem.registeredCount || 0,
        viewCount: apiItem.viewCount || 0,
        language: apiItem.language || "中文",
        meetingType: apiItem.meetingType || "webinar",
        tags: Array.isArray(apiItem.tags) ? apiItem.tags : [],
        hostId: apiItem.hostId || "host",
        hostName: apiItem.hostName || "主持人",
        hostAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiItem.hostId || "host"}`,
        hostTitle: "主持人",
        hostCompany: "RealSourcing",
        coHosts: [],
        agenda: [],
        products: MOCK_PRODUCTS.slice(0, 3),
        factories: [],
        highlights: [],
        targetAudience: [],
        requirements: [],
      };
    }
    // 终极 fallback：演示模式，始终显示第一个 mock webinar
    return MOCK_WEBINARS[0];
  }, [webinarId, listData]);

  const isLive = webinar?.status === "live";
  const isScheduled = webinar?.status === "scheduled";
  const isCompleted = webinar?.status === "completed";

  const scheduledDate = webinar?.scheduledAt ? new Date(webinar.scheduledAt) : null;
  const { timeLeft, isExpired } = useCountdown(isScheduled ? scheduledDate : null);

  const fillRate = webinar
    ? Math.min(100, Math.round((webinar.registeredCount / webinar.maxParticipants) * 100))
    : 0;

  const handleRegister = useCallback(async () => {
    if (isRegistering) return;
    setIsRegistering(true);
    await new Promise((r) => setTimeout(r, 900));
    if (isRegistered) {
      setIsRegistered(false);
      toast({ title: "已取消报名" });
    } else {
      setIsRegistered(true);
      toast({ title: "报名成功 ✓", description: "直播开始前 30 分钟将收到提醒" });
    }
    setIsRegistering(false);
  }, [isRegistered, isRegistering, toast]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => toast({ title: "链接已复制" }));
  }, [toast]);

  // Loading state
  if (isLoading && !webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-sm font-light">加载中...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Not found
  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-light text-white mb-2">Webinar 未找到</h3>
          <p className="text-sm text-gray-500 font-light mb-6">该 Webinar 不存在或已被删除</p>
          <Button
            onClick={() => setLocation("/webinars")}
            variant="outline"
            className="border-[#2a2a2a] text-gray-400 hover:text-white font-light gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080808]">

        {/* ─── Hero Cover ─────────────────────────────────────────── */}
        <div className="relative">
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={webinar.coverImage}
              alt={webinar.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/30 to-transparent" />

            {/* Back */}
            <div className="absolute top-4 left-6">
              <button
                onClick={() => setLocation("/webinars")}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-light transition-colors bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回
              </button>
            </div>

            {/* Top right actions */}
            <div className="absolute top-4 right-6 flex items-center gap-2">
              {isLive && (
                <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/40">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
              <button
                onClick={() => setIsReminded(!isReminded)}
                className={cn(
                  "p-2 rounded-full border backdrop-blur-sm transition-all",
                  isReminded
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                    : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                )}
              >
                {isReminded ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 text-white/60 hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Live play button */}
            {isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-105 shadow-xl"
                >
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Title area */}
          <div className="px-6 py-5 max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={cn("text-xs font-light border", getCategoryColor(webinar.category))}>
                {getCategoryLabel(webinar.category)}
              </Badge>
              {webinar.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-light border-[#2a2a2a] text-gray-400">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2 leading-snug">
              {webinar.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-light">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={webinar.hostAvatar} />
                  <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs">{webinar.hostName[0]}</AvatarFallback>
                </Avatar>
                <span>{webinar.hostName}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500">{webinar.hostTitle}</span>
              </div>
              <span className="text-gray-700">|</span>
              <span className="text-gray-500">{webinar.hostCompany}</span>
            </div>
          </div>
        </div>

        {/* ─── Main Content ──────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left: Tabs ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Quick meta bar */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl">
                {scheduledDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span className="font-light">
                      {format(scheduledDate, "M月d日 EEEE HH:mm", { locale: zhCN })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="font-light">{webinar.duration} 分钟</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="font-light">{webinar.registeredCount} / {webinar.maxParticipants} 已报名</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span className="font-light">{webinar.language}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-2 text-sm text-red-400 ml-auto">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span className="font-light">{webinar.currentParticipants} 人正在观看</span>
                  </div>
                )}
              </div>

              {/* Countdown */}
              {isScheduled && !isExpired && (
                <div className="mb-6 p-5 bg-gradient-to-r from-violet-600/8 to-blue-600/8 border border-violet-500/15 rounded-xl">
                  <p className="text-xs text-gray-400 font-light mb-3 uppercase tracking-wider">距直播开始</p>
                  <div className="flex items-center gap-3">
                    <CountdownBlock value={timeLeft.days} label="天" />
                    <span className="text-2xl text-gray-600 font-light mb-4">:</span>
                    <CountdownBlock value={timeLeft.hours} label="时" />
                    <span className="text-2xl text-gray-600 font-light mb-4">:</span>
                    <CountdownBlock value={timeLeft.minutes} label="分" />
                    <span className="text-2xl text-gray-600 font-light mb-4">:</span>
                    <CountdownBlock value={timeLeft.seconds} label="秒" />
                  </div>
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-[#0f0f0f] border border-[#1e1e1e] p-1 rounded-xl mb-6 grid grid-cols-4 w-full">
                  {[
                    ["overview", "概览"],
                    ["agenda", `议程 (${webinar.agenda.length})`],
                    ["products", `产品 (${webinar.products.length})`],
                    ["factories", `工厂 (${webinar.factories.length})`],
                  ].map(([v, l]) => (
                    <TabsTrigger
                      key={v}
                      value={v}
                      className="rounded-lg text-xs font-light data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white text-gray-500"
                    >
                      {l}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── Overview ── */}
                <TabsContent value="overview" className="space-y-5">
                  <div className="p-5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl">
                    <h3 className="text-sm font-medium text-white mb-3">关于本场 Webinar</h3>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">{webinar.description}</p>
                  </div>

                  {webinar.highlights.length > 0 && (
                    <div className="p-5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl">
                      <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        活动亮点
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {webinar.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1a1a1a] border border-[#1e1e1e]">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-light text-gray-200">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {webinar.targetAudience.length > 0 && (
                    <div className="p-5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl">
                      <h3 className="text-sm font-medium text-white mb-3">适合人群</h3>
                      <div className="flex flex-wrap gap-2">
                        {webinar.targetAudience.map((a, i) => (
                          <span key={i} className="text-xs text-gray-300 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-full font-light">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {webinar.coHosts.length > 0 && (
                    <div className="p-5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl">
                      <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-violet-400" />
                        联合主持
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {webinar.coHosts.map((host, i) => (
                          <div key={i} className="flex items-center gap-2.5 p-3 bg-[#1a1a1a] border border-[#1e1e1e] rounded-xl">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={host.avatar} />
                              <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs">{host.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-xs font-medium text-white">{host.name}</div>
                              <div className="text-[10px] text-gray-500 font-light">{host.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ── Agenda ── */}
                <TabsContent value="agenda">
                  {webinar.agenda.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 font-light text-sm">
                      <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      议程暂未公布
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {webinar.agenda.map((item, index) => (
                        <AgendaItem key={item.id} item={item} index={index} total={webinar.agenda.length} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── Products ── */}
                <TabsContent value="products">
                  {webinar.products.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 font-light text-sm">
                      <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      产品信息暂未公布
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {webinar.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── Factories ── */}
                <TabsContent value="factories">
                  {webinar.factories.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 font-light text-sm">
                      <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      工厂信息暂未公布
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {webinar.factories.map((factory) => (
                        <FactoryCard key={factory.id} factory={factory} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Right: Registration Sidebar ─────────────────────── */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-6 space-y-4">

                {/* Main CTA Card */}
                <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                  {/* Status header */}
                  <div className={cn(
                    "px-5 py-3 text-center text-sm font-light border-b",
                    isLive ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    isScheduled ? "bg-violet-500/10 border-violet-500/20 text-violet-400" :
                    "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400"
                  )}>
                    {isLive ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        直播进行中
                      </span>
                    ) : isScheduled ? "即将开始" : isCompleted ? "已结束，回放可看" : "草稿"}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Registration progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-400 font-light">
                          <span className="text-white font-medium text-lg">{webinar.registeredCount}</span>
                          <span className="text-gray-600"> / {webinar.maxParticipants} 已报名</span>
                        </span>
                        <span className={cn(
                          "font-medium text-sm",
                          fillRate >= 80 ? "text-red-400" : fillRate >= 50 ? "text-amber-400" : "text-gray-400"
                        )}>
                          {fillRate}%
                        </span>
                      </div>
                      <Progress
                        value={fillRate}
                        className={cn(
                          "h-1.5",
                          fillRate >= 80 ? "[&>div]:bg-red-500" : fillRate >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-violet-500"
                        )}
                      />
                      {fillRate >= 80 && (
                        <p className="text-[10px] text-red-400 font-medium mt-1.5 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          名额即将满员，请尽快报名
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    {isLive ? (
                      <Button
                        onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                        className="w-full bg-red-500 hover:bg-red-400 text-white font-light gap-2 shadow-lg shadow-red-500/20"
                        size="lg"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        立即进入直播间
                      </Button>
                    ) : isCompleted ? (
                      <Button
                        onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                        variant="outline"
                        className="w-full border-[#2a2a2a] text-gray-300 hover:text-white font-light gap-2"
                        size="lg"
                      >
                        <Play className="w-4 h-4" />
                        观看回放
                      </Button>
                    ) : isRegistered ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-green-400 font-light">已成功报名</span>
                        </div>
                        <Button
                          onClick={handleRegister}
                          disabled={isRegistering}
                          variant="outline"
                          className="w-full border-[#2a2a2a] text-gray-400 hover:text-white font-light text-xs"
                        >
                          {isRegistering ? "处理中..." : "取消报名"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        disabled={isRegistering || fillRate >= 100}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-light gap-2 shadow-lg shadow-violet-500/20"
                        size="lg"
                      >
                        {isRegistering ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : fillRate >= 100 ? (
                          "名额已满"
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            免费报名
                          </>
                        )}
                      </Button>
                    )}

                    {/* Meta */}
                    <div className="space-y-2.5 pt-2 border-t border-[#1e1e1e]">
                      {scheduledDate && (
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                          <span className="text-gray-500 font-light w-10">时间</span>
                          <span className="text-gray-300 font-light">
                            {format(scheduledDate, "M月d日 HH:mm", { locale: zhCN })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-500 font-light w-10">时长</span>
                        <span className="text-gray-300 font-light">{webinar.duration} 分钟</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-gray-500 font-light w-10">语言</span>
                        <span className="text-gray-300 font-light">{webinar.language}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Video className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-500 font-light w-10">形式</span>
                        <span className="text-gray-300 font-light">在线直播</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host card */}
                <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">主持人</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={webinar.hostAvatar} />
                      <AvatarFallback className="bg-violet-500/20 text-violet-300">{webinar.hostName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-white">{webinar.hostName}</div>
                      <div className="text-xs text-gray-500 font-light">{webinar.hostTitle}</div>
                      <div className="text-xs text-gray-600 font-light">{webinar.hostCompany}</div>
                    </div>
                  </div>
                </div>

                {/* Content stats */}
                {(webinar.products.length > 0 || webinar.factories.length > 0 || webinar.agenda.length > 0) && (
                  <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-4">
                    <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">展示内容</h3>
                    <div className="space-y-2.5">
                      {webinar.products.length > 0 && (
                        <button
                          onClick={() => setActiveTab("products")}
                          className="w-full flex items-center justify-between hover:bg-[#1a1a1a] rounded-lg p-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Package className="w-3.5 h-3.5 text-violet-400" />
                            <span className="font-light">展示产品</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-white font-medium">{webinar.products.length} 款</span>
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
                          </div>
                        </button>
                      )}
                      {webinar.factories.length > 0 && (
                        <button
                          onClick={() => setActiveTab("factories")}
                          className="w-full flex items-center justify-between hover:bg-[#1a1a1a] rounded-lg p-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-light">参与工厂</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-white font-medium">{webinar.factories.length} 家</span>
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
                          </div>
                        </button>
                      )}
                      {webinar.agenda.length > 0 && (
                        <button
                          onClick={() => setActiveTab("agenda")}
                          className="w-full flex items-center justify-between hover:bg-[#1a1a1a] rounded-lg p-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                            <span className="font-light">议程环节</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-white font-medium">{webinar.agenda.length} 个</span>
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
