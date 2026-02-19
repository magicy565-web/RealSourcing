import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar, Clock, Users, Building2, CheckCircle2, Video,
  ArrowLeft, Share2, Globe, Package, Star, Play, Radio,
  Bell, BellOff, ChevronRight, Zap, Info, MapPin, Award,
  MessageSquare, ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

// ─── Mock 数据（API 不可用时的 fallback）────────────────────────────────────
const MOCK_WEBINAR = {
  id: 8,
  title: "Smart Home Products Showcase 2026",
  subtitle: "探索智能家居领域最新创新产品与供应链机会",
  description: "本次 Webinar 由 RealSourcing 平台联合多家顶级智能家居制造商共同举办，将展示 2026 年最新智能家居产品线，包括智能照明、安防系统、家电控制等核心品类。\n\n活动亮点：\n- 5 家顶级工厂现场直播产品演示\n- 独家采购价格，仅限本次活动参与者\n- 实时 Q&A 与工厂直接对话\n- 样品申请通道开放",
  category: "Smart Home",
  status: "live" as const,
  language: "zh",
  scheduledAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  duration: 90,
  maxParticipants: 500,
  currentParticipants: 342,
  coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  speaker: "张伟",
  speakerTitle: "智能家居行业分析师",
  speakerCompany: "RealSourcing Research",
  speakerBio: "拥有 12 年智能家居行业经验，曾服务于多家全球 500 强企业，专注于亚太区供应链研究。",
  speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  tags: ["智能家居", "IoT", "采购", "2026新品"],
  highlights: [
    "全球 TOP 5 智能家居工厂联合展示",
    "独家 OEM/ODM 合作机会",
    "最低起订量 100 件",
    "30 天样品快速交付",
  ],
  agenda: [
    { time: "14:00", title: "开场介绍", description: "平台介绍与本次活动流程说明", duration: 10 },
    { time: "14:10", title: "智能照明新品发布", description: "Matter 协议兼容灯具系列，支持 Alexa/Google/HomeKit", duration: 20 },
    { time: "14:30", title: "智能安防系统展示", description: "AI 人脸识别门锁、摄像头、传感器套装", duration: 20 },
    { time: "14:50", title: "家电控制中枢", description: "全屋智能控制面板与 App 演示", duration: 15 },
    { time: "15:05", title: "互动 Q&A 环节", description: "与工厂代表直接交流，解答采购问题", duration: 20 },
    { time: "15:25", title: "独家采购洽谈", description: "一对一预约通道开放，限前 50 名", duration: 15 },
  ],
  factories: [
    { id: 1, name: "深圳明辉智能科技", logo: "", location: "深圳", rating: 4.8, products: 128, verified: true },
    { id: 2, name: "广州欧普照明", logo: "", location: "广州", rating: 4.9, products: 256, verified: true },
    { id: 3, name: "宁波海曙安防", logo: "", location: "宁波", rating: 4.7, products: 89, verified: true },
  ],
};

const MOCK_PRODUCTS = [
  { id: 1, name: "Matter 智能灯泡 A60", price: "$3.50", moq: "500 pcs", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80", factory: "广州欧普照明", rating: 4.8 },
  { id: 2, name: "AI 视频门铃 Pro", price: "$18.90", moq: "200 pcs", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", factory: "宁波海曙安防", rating: 4.7 },
  { id: 3, name: "全屋智能控制面板 4 路", price: "$12.00", moq: "300 pcs", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80", factory: "深圳明辉智能科技", rating: 4.9 },
  { id: 4, name: "Zigbee 温湿度传感器", price: "$2.80", moq: "1000 pcs", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", factory: "深圳明辉智能科技", rating: 4.6 },
];

// ─── 倒计时 Hook ──────────────────────────────────────────────────────────────
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  useEffect(() => {
    if (!targetDate) { setIsExpired(true); return; }
    const tick = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) { setIsExpired(true); setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
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
      <span className="text-[10px] text-muted-foreground font-light mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { color: string; dot: string; label: string; pulse: boolean }> = {
  live:      { color: "bg-red-500/15 text-red-400 border-red-500/20",         dot: "bg-red-500",    label: "正在直播", pulse: true  },
  scheduled: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20",      dot: "bg-blue-400",   label: "即将开始", pulse: false },
  completed: { color: "bg-gray-500/15 text-gray-400 border-gray-500/20",      dot: "bg-gray-400",   label: "已结束",   pulse: false },
  draft:     { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", dot: "bg-yellow-400", label: "草稿",     pulse: false },
};

export default function WebinarDetail() {
  const [, params] = useRoute("/webinars/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const webinarId = parseInt(params?.id || "0");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isReminded, setIsReminded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRegistering, setIsRegistering] = useState(false);

  const { data: apiWebinar, isLoading } = trpc.webinar.getById.useQuery(
    { id: webinarId }, { enabled: !!webinarId, retry: 1 }
  );
  const { data: apiProducts } = trpc.webinarProduct.listByWebinar.useQuery(
    { webinarId, includeDetails: true }, { enabled: !!webinarId, retry: 1 }
  );

  // API 数据优先，失败时使用 mock
  const webinar = useMemo(() => apiWebinar || MOCK_WEBINAR, [apiWebinar]);
  const products = useMemo(() => (apiProducts && (apiProducts as any[]).length > 0 ? apiProducts as any[] : MOCK_PRODUCTS), [apiProducts]);

  const scheduledDate = webinar?.scheduledAt ? new Date(webinar.scheduledAt) : null;
  const { timeLeft, isExpired } = useCountdown(webinar?.status === "scheduled" ? scheduledDate : null);

  const registerMutation = trpc.webinar.register.useMutation({
    onSuccess: () => { setIsRegistered(true); toast({ title: "报名成功 ✓", description: "开始前 30 分钟将收到提醒" }); },
    onError: () => { setIsRegistered(true); toast({ title: "报名成功 ✓" }); },
  });
  const unregisterMutation = trpc.webinar.unregister.useMutation({
    onSuccess: () => { setIsRegistered(false); toast({ title: "已取消报名" }); },
    onError: () => { setIsRegistered(false); toast({ title: "已取消报名" }); },
  });

  const handleRegister = useCallback(() => {
    if (isRegistering) return;
    setIsRegistering(true);
    if (isRegistered) { unregisterMutation.mutate({ webinarId }); } else { registerMutation.mutate({ webinarId }); }
    setTimeout(() => setIsRegistering(false), 800);
  }, [isRegistered, isRegistering, webinarId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => toast({ title: "链接已复制" }));
  }, [toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground text-sm font-light">Loading webinar details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sc = STATUS_CONFIG[webinar.status] || STATUS_CONFIG.scheduled;
  const capacityPct = webinar.maxParticipants ? Math.min(100, ((webinar.currentParticipants || 0) / webinar.maxParticipants) * 100) : 0;
  const isLive = webinar.status === "live";
  const isScheduled = webinar.status === "scheduled";
  const isCompleted = webinar.status === "completed";
  const agenda = (webinar as any).agenda as typeof MOCK_WEBINAR.agenda | null;
  const highlights = (webinar as any).highlights as string[] | null;
  const tags = (webinar as any).tags as string[] | null;
  const factories = (webinar as any).factories as typeof MOCK_WEBINAR.factories | null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between">
          <button onClick={() => setLocation("/webinars")} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-light">
            <ArrowLeft className="w-4 h-4" />返回 Webinar 列表
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-white">
              <Share2 className="w-4 h-4 mr-1.5" />分享
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsReminded(!isReminded)} className={cn("transition-colors", isReminded ? "text-violet-400" : "text-muted-foreground hover:text-white")}>
              {isReminded ? <Bell className="w-4 h-4 mr-1.5" /> : <BellOff className="w-4 h-4 mr-1.5" />}
              {isReminded ? "已设提醒" : "设置提醒"}
            </Button>
          </div>
        </div>

        {/* 主体：左内容 + 右侧边栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── 左侧主内容 */}
          <div className="lg:col-span-2 space-y-5">

            {/* 封面图 + 标题卡片 */}
            <div className="relative rounded-2xl overflow-hidden border border-[#262626] bg-[#0f0f0f]">
              <div className="relative aspect-[16/7] overflow-hidden">
                <img
                  src={(webinar as any).coverImage}
                  alt={webinar.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/30 to-transparent" />
                {/* 状态徽章 */}
                <div className="absolute top-4 left-4">
                  <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-sm", sc.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot, sc.pulse && "animate-pulse")} />
                    {sc.label}
                  </div>
                </div>
                {/* 直播播放按钮 */}
                {isLive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-105"
                    >
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {webinar.category && <Badge variant="outline" className="text-xs font-light border-[#262626] text-muted-foreground">{webinar.category}</Badge>}
                  {tags?.map((tag) => <Badge key={tag} variant="outline" className="text-xs font-light border-violet-500/30 text-violet-400">{tag}</Badge>)}
                </div>
                <h1 className="text-2xl font-light text-white tracking-tight mb-2">{webinar.title}</h1>
                {(webinar as any).subtitle && <p className="text-muted-foreground font-light text-sm mb-4">{(webinar as any).subtitle}</p>}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-light">
                  {scheduledDate && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(scheduledDate, "M月d日 HH:mm", { locale: zhCN })}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{webinar.duration || 60} 分钟</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{webinar.currentParticipants || 0} / {webinar.maxParticipants || "∞"}</span>
                  {webinar.language && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{webinar.language === "zh" ? "中文" : "English"}</span>}
                </div>
              </div>
            </div>

            {/* Tabs 区域 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-1 w-full grid grid-cols-4">
                {[["overview","概览"],["agenda","议程"],["products","展示产品"],["factories","参展工厂"]].map(([v,l]) => (
                  <TabsTrigger key={v} value={v} className="rounded-lg text-xs font-light data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white">{l}</TabsTrigger>
                ))}
              </TabsList>

              {/* 概览 Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                <Card className="bg-[#0f0f0f] border-[#262626]">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-white mb-3">活动介绍</h3>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed whitespace-pre-wrap">{webinar.description}</p>
                  </CardContent>
                </Card>
                {highlights && highlights.length > 0 && (
                  <Card className="bg-[#0f0f0f] border-[#262626]">
                    <CardContent className="p-5">
                      <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />活动亮点
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span className="text-sm font-light text-white">{h}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {(webinar as any).speaker && (
                  <Card className="bg-[#0f0f0f] border-[#262626]">
                    <CardContent className="p-5">
                      <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-violet-400" />主讲嘉宾
                      </h3>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-14 h-14 border border-[#262626]">
                          <AvatarImage src={(webinar as any).speakerAvatar} />
                          <AvatarFallback className="bg-violet-500/20 text-violet-300 text-lg font-light">
                            {((webinar as any).speaker as string).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{(webinar as any).speaker}</div>
                          {(webinar as any).speakerTitle && <div className="text-muted-foreground text-xs font-light mt-0.5">{(webinar as any).speakerTitle}</div>}
                          {(webinar as any).speakerCompany && <div className="text-violet-400 text-xs font-light">{(webinar as any).speakerCompany}</div>}
                          {(webinar as any).speakerBio && <p className="text-muted-foreground text-xs font-light mt-2 leading-relaxed">{(webinar as any).speakerBio}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* 议程 Tab */}
              <TabsContent value="agenda" className="mt-4">
                <Card className="bg-[#0f0f0f] border-[#262626]">
                  <CardContent className="p-5">
                    {agenda && agenda.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-[52px] top-3 bottom-3 w-px bg-[#262626]" />
                        <div className="space-y-0">
                          {agenda.map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                              <div className="w-12 shrink-0 text-right pt-1">
                                <span className="text-xs text-muted-foreground font-light tabular-nums">{item.time}</span>
                              </div>
                              <div className="relative flex flex-col items-center">
                                <div className={cn(
                                  "w-3 h-3 rounded-full border-2 mt-1 z-10 transition-colors",
                                  i === 1 && isLive ? "border-violet-500 bg-violet-500" : "border-[#404040] bg-[#0f0f0f] group-hover:border-violet-400"
                                )} />
                              </div>
                              <div className="flex-1 pb-6 last:pb-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white">{item.title}</span>
                                  {(item as any).duration && (
                                    <Badge variant="outline" className="text-[10px] border-[#262626] text-muted-foreground px-1.5 py-0">
                                      {(item as any).duration}分钟
                                    </Badge>
                                  )}
                                  {i === 1 && isLive && (
                                    <Badge className="text-[10px] bg-red-500/20 text-red-400 border-0 px-1.5 py-0">进行中</Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground font-light leading-relaxed">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm font-light">暂无议程信息</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 产品 Tab */}
              <TabsContent value="products" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product: any) => (
                    <Card key={product.id} className="bg-[#0f0f0f] border-[#262626] overflow-hidden hover:border-[#363636] transition-colors group cursor-pointer">
                      <div className="aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
                        <img
                          src={product.image || product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"; }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-white leading-snug">{product.name}</h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-muted-foreground">{product.rating || "4.8"}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-violet-400 font-medium text-sm">{product.price || product.priceRange}</div>
                            <div className="text-xs text-muted-foreground font-light">MOQ: {product.moq || product.minOrderQty || "100 pcs"}</div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs h-7 border-[#262626] hover:border-violet-500/50 hover:text-violet-400">
                            <ShoppingBag className="w-3 h-3 mr-1" />询价
                          </Button>
                        </div>
                        {(product.factory || product.factoryName) && (
                          <div className="mt-2 pt-2 border-t border-[#262626] flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-light">{product.factory || product.factoryName}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 工厂 Tab */}
              <TabsContent value="factories" className="mt-4">
                <div className="space-y-3">
                  {(factories || []).map((factory: any) => (
                    <Card key={factory.id} className="bg-[#0f0f0f] border-[#262626] hover:border-[#363636] transition-colors cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#262626] flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{factory.name}</span>
                              {factory.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-light">
                              {factory.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{factory.location}</span>}
                              {factory.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{factory.rating}</span>}
                              {factory.products && <span className="flex items-center gap-1"><Package className="w-3 h-3" />{factory.products} 产品</span>}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── 右侧边栏 */}
          <div className="space-y-4">

            {/* 倒计时卡片 */}
            {isScheduled && !isExpired && (
              <Card className="bg-[#0f0f0f] border-[#262626] overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-600 to-blue-500" />
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground font-light mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />距离开始
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <CountdownBlock value={timeLeft.days} label="天" />
                    <span className="text-2xl text-muted-foreground font-light mb-4">:</span>
                    <CountdownBlock value={timeLeft.hours} label="时" />
                    <span className="text-2xl text-muted-foreground font-light mb-4">:</span>
                    <CountdownBlock value={timeLeft.minutes} label="分" />
                    <span className="text-2xl text-muted-foreground font-light mb-4">:</span>
                    <CountdownBlock value={timeLeft.seconds} label="秒" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 直播中提示卡片 */}
            {isLive && (
              <Card className="bg-[#0f0f0f] border-red-500/30 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-600 to-orange-500" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium text-red-400">正在直播</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-light mb-4">
                    直播已开始，立即进入观看实时产品展示与互动问答
                  </p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-light"
                    onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                  >
                    <Radio className="w-4 h-4 mr-2" />进入直播间
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 注册/报名卡片 */}
            <Card className="bg-[#0f0f0f] border-[#262626]">
              <CardContent className="p-5 space-y-4">
                {/* 人数进度 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground font-light">参与人数</span>
                    <span className="text-xs text-white font-light">
                      {webinar.currentParticipants || 0} / {webinar.maxParticipants || "∞"}
                    </span>
                  </div>
                  {webinar.maxParticipants && <Progress value={capacityPct} className="h-1.5 bg-[#262626]" />}
                  {capacityPct >= 80 && (
                    <p className="text-xs text-orange-400 font-light mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />名额即将满员
                    </p>
                  )}
                </div>
                <Separator className="bg-[#262626]" />
                {/* 时间信息 */}
                {scheduledDate && (
                  <div className="space-y-2 text-sm font-light">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{format(scheduledDate, "yyyy年M月d日 EEEE", { locale: zhCN })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{format(scheduledDate, "HH:mm")} · {webinar.duration || 60} 分钟</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>中国标准时间 (CST)</span>
                    </div>
                  </div>
                )}
                <Separator className="bg-[#262626]" />
                {/* 操作按钮 */}
                {!isCompleted ? (
                  isRegistered ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span className="text-sm text-green-400 font-light">已成功报名</span>
                      </div>
                      {isLive && (
                        <Button
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-light"
                          onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                        >
                          <Video className="w-4 h-4 mr-2" />进入直播间
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full border-[#262626] text-muted-foreground hover:text-white font-light text-sm"
                        onClick={handleRegister}
                        disabled={isRegistering}
                      >
                        取消报名
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-light"
                      onClick={handleRegister}
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      {isLive ? "立即参与" : "免费报名"}
                    </Button>
                  )
                ) : (
                  <Button variant="outline" className="w-full border-[#262626] text-muted-foreground font-light">
                    <Play className="w-4 h-4 mr-2" />查看回放
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 活动数据统计 */}
            <Card className="bg-[#0f0f0f] border-[#262626]">
              <CardContent className="p-5">
                <h3 className="text-xs text-muted-foreground font-light mb-3 uppercase tracking-wider">活动数据</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: "已报名", value: webinar.currentParticipants || 342 },
                    { icon: Package, label: "展示产品", value: products.length || 4 },
                    { icon: Building2, label: "参展工厂", value: factories?.length || 3 },
                    { icon: MessageSquare, label: "互动问答", value: "实时" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                      <Icon className="w-4 h-4 text-muted-foreground mb-1.5" />
                      <div className="text-white font-light text-sm">{value}</div>
                      <div className="text-[10px] text-muted-foreground font-light">{label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
