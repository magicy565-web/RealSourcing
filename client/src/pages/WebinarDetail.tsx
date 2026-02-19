import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  CheckCircle2,
  Video,
  ArrowLeft,
  Share2,
  Globe,
  Tag,
  Package,
  Star,
  Play,
  Radio,
  Bell,
  BellOff,
  ChevronRight,
  Zap,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { EnhancedImage } from "@/components/EnhancedImage";
import { cn } from "@/lib/utils";

// ─── 倒计时 Hook ────────────────────────────────────────────────────────────
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
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
        <span className="text-xl font-light text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground font-light mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function WebinarDetail() {
  const [, params] = useRoute("/webinars/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const webinarId = parseInt(params?.id || "0");

  const [isRegistered, setIsRegistered] = useState(false);
  const [isReminded, setIsReminded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { data: webinar, isLoading, refetch } = trpc.webinar.getById.useQuery(
    { id: webinarId },
    { enabled: !!webinarId }
  );

  const { data: webinarProducts } = trpc.webinarProduct.listByWebinar.useQuery(
    { webinarId, includeDetails: true },
    { enabled: !!webinarId }
  );

  const scheduledDate = webinar?.scheduledAt ? new Date(webinar.scheduledAt) : null;
  const { timeLeft, isExpired } = useCountdown(
    webinar?.status === "scheduled" ? scheduledDate : null
  );

  // register / unregister mutations
  const registerMutation = trpc.webinar.register.useMutation({
    onSuccess: () => {
      setIsRegistered(true);
      toast({ title: "报名成功", description: "开始前 30 分钟将收到提醒" });
      refetch();
    },
    onError: (err) => toast({ title: "报名失败", description: err.message, variant: "destructive" }),
  });

  const unregisterMutation = trpc.webinar.unregister.useMutation({
    onSuccess: () => {
      setIsRegistered(false);
      toast({ title: "已取消报名" });
      refetch();
    },
    onError: (err) => toast({ title: "取消失败", description: err.message, variant: "destructive" }),
  });

  const handleRegister = useCallback(async () => {
    if (isRegistering) return;
    setIsRegistering(true);
    try {
      if (isRegistered) {
        await unregisterMutation.mutateAsync({ webinarId });
      } else {
        await registerMutation.mutateAsync({ webinarId });
      }
    } finally {
      setIsRegistering(false);
    }
  }, [isRegistered, isRegistering, webinarId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() =>
      toast({ title: "链接已复制" })
    );
  }, [toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-light text-sm">加载中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Video className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-light text-white mb-2">Webinar 不存在</h2>
            <p className="text-muted-foreground mb-6 font-light text-sm">该 Webinar 可能已被删除。</p>
            <Button onClick={() => setLocation("/webinars")} variant="outline" className="font-light">
              <ArrowLeft className="mr-2 h-4 w-4" />返回列表
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusCfg: Record<string, { color: string; label: string; dot?: boolean }> = {
    live: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "直播中", dot: true },
    scheduled: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "已安排" },
    completed: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "已结束" },
    draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "草稿" },
    cancelled: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "已取消" },
  };
  const sc = statusCfg[webinar.status] || { color: "bg-gray-500/10 text-gray-400", label: webinar.status };
  const capacityPct = webinar.maxParticipants
    ? Math.min(100, ((webinar.currentParticipants || 0) / webinar.maxParticipants) * 100)
    : 0;
  const isLive = webinar.status === "live";
  const isScheduled = webinar.status === "scheduled";
  const isCompleted = webinar.status === "completed";

  const agenda = (webinar as any).agenda as Array<{ time: string; title: string; description?: string }> | null;
  const highlights = (webinar as any).highlights as string[] | null;
  const tags = (webinar as any).tags as string[] | null;
  const exhibitingFactories = (webinar as any).exhibitingFactories as any[] | null;

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto bg-[#0A0A0A]">
        {/* ═══ HERO ═══ */}
        <div className="relative">
          <div className="relative h-56 overflow-hidden">
            <EnhancedImage
              src={(webinar as any).coverImage || (webinar as any).bannerImage}
              alt={webinar.title}
              aspectRatio="video"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
            <button
              onClick={() => setLocation("/webinars")}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm font-light hover:bg-black/70 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />返回
            </button>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={handleShare} className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsReminded(!isReminded)}
                className={cn("p-2 rounded-lg backdrop-blur-sm transition-colors", isReminded ? "bg-violet-600/80 text-white" : "bg-black/50 text-white hover:bg-black/70")}
              >
                {isReminded ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="px-8 pb-6 -mt-12 relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={cn("text-xs font-light border", sc.color)}>
                {sc.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mr-1.5 animate-pulse" />}
                {sc.label}
              </Badge>
              {webinar.category && (
                <Badge variant="outline" className="text-xs font-light border-[#262626] text-muted-foreground">{webinar.category}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-light text-white tracking-tight mb-2">{webinar.title}</h1>
            {(webinar as any).subtitle && (
              <p className="text-muted-foreground font-light text-sm mb-3">{(webinar as any).subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-light">
              {scheduledDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{format(scheduledDate, "yyyy年MM月dd日 HH:mm", { locale: zhCN })}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{webinar.duration || 60} 分钟</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{webinar.currentParticipants || 0} / {webinar.maxParticipants || "∞"}</span>
              </div>
              {webinar.language && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>{webinar.language === "zh" ? "中文" : webinar.language === "en" ? "English" : webinar.language}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─ LEFT ─ */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-[#141414] border border-[#262626] w-full grid grid-cols-4">
                  {[
                    { value: "overview", label: "概览" },
                    { value: "agenda", label: "议程" },
                    { value: "products", label: `产品${webinarProducts && webinarProducts.length > 0 ? ` (${webinarProducts.length})` : ""}` },
                    { value: "factories", label: "工厂" },
                  ].map((t) => (
                    <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-light text-xs">
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="mt-6 space-y-5">
                  {webinar.description && (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-light text-white flex items-center gap-2">
                          <Info className="h-4 w-4 text-violet-400" />关于此 Webinar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground font-light text-sm leading-relaxed whitespace-pre-wrap">{webinar.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {highlights && highlights.length > 0 && (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-light text-white flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />亮点
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm font-light text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />{h}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {(webinar as any).speaker && (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-light text-white flex items-center gap-2">
                          <Star className="h-4 w-4 text-violet-400" />主讲嘉宾
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-violet-600/20 text-violet-400 font-light">
                              {((webinar as any).speaker as string).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-white font-light">{(webinar as any).speaker}</div>
                            {(webinar as any).speakerTitle && <div className="text-muted-foreground text-xs font-light">{(webinar as any).speakerTitle}</div>}
                            {(webinar as any).speakerCompany && <div className="text-violet-400 text-xs font-light">{(webinar as any).speakerCompany}</div>}
                            {(webinar as any).speakerBio && <p className="text-muted-foreground text-xs font-light mt-2 leading-relaxed">{(webinar as any).speakerBio}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tags && tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-light border-[#262626] text-muted-foreground">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Agenda */}
                <TabsContent value="agenda" className="mt-6">
                  {agenda && agenda.length > 0 ? (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-light text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-violet-400" />会议议程
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-0">
                          {agenda.map((item, i) => (
                            <div key={i} className="flex gap-4 relative">
                              {i < agenda.length - 1 && (
                                <div className="absolute left-[20px] top-10 bottom-0 w-px bg-[#262626]" />
                              )}
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-[10px] text-violet-400 font-light">
                                {item.time}
                              </div>
                              <div className="pb-6 flex-1">
                                <div className="text-white font-light text-sm">{item.title}</div>
                                {item.description && <div className="text-muted-foreground text-xs font-light mt-1 leading-relaxed">{item.description}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                        <p className="text-muted-foreground font-light text-sm">暂无议程信息</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Products */}
                <TabsContent value="products" className="mt-6">
                  {webinarProducts && webinarProducts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(webinarProducts as any[]).map((wp) => {
                        const product = wp.product;
                        if (!product) return null;
                        return (
                          <Card key={wp.id} className="bg-[#141414] border-[#262626] hover:border-violet-500/30 transition-colors group">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-14 h-14 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                                  {product.mainImage ? (
                                    <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground opacity-30" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-light text-sm truncate group-hover:text-violet-400 transition-colors">{product.name}</div>
                                  {product.category && <div className="text-muted-foreground text-xs font-light mt-0.5">{product.category}</div>}
                                  {product.minOrderQuantity && <div className="text-xs text-muted-foreground font-light mt-1">MOQ: {product.minOrderQuantity}</div>}
                                  {wp.featured === 1 && (
                                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] font-light mt-1.5">精选</Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                        <p className="text-muted-foreground font-light text-sm">暂无展示产品</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Factories */}
                <TabsContent value="factories" className="mt-6">
                  {exhibitingFactories && exhibitingFactories.length > 0 ? (
                    <div className="space-y-3">
                      {exhibitingFactories.map((factory: any) => (
                        <Card
                          key={factory.id}
                          className="bg-[#141414] border-[#262626] hover:border-violet-500/30 transition-colors cursor-pointer group"
                          onClick={() => setLocation(`/factories/${factory.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-violet-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-light text-sm group-hover:text-violet-400 transition-colors">{factory.name}</div>
                                {factory.location && <div className="text-muted-foreground text-xs font-light">{factory.location}</div>}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                        <p className="text-muted-foreground font-light text-sm">暂无参展工厂</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* ─ RIGHT SIDEBAR ─ */}
            <div className="space-y-4">
              <Card className="bg-[#141414] border-[#262626] sticky top-4">
                <CardContent className="p-6 space-y-5">
                  {/* Countdown */}
                  {isScheduled && scheduledDate && !isExpired && (
                    <div>
                      <p className="text-[10px] text-muted-foreground font-light mb-3 text-center uppercase tracking-widest">距离开始</p>
                      <div className="flex items-center justify-center gap-2">
                        <CountdownBlock value={timeLeft.days} label="天" />
                        <span className="text-muted-foreground text-lg font-light mb-4">:</span>
                        <CountdownBlock value={timeLeft.hours} label="时" />
                        <span className="text-muted-foreground text-lg font-light mb-4">:</span>
                        <CountdownBlock value={timeLeft.minutes} label="分" />
                        <span className="text-muted-foreground text-lg font-light mb-4">:</span>
                        <CountdownBlock value={timeLeft.seconds} label="秒" />
                      </div>
                      <Separator className="bg-[#262626] mt-5" />
                    </div>
                  )}

                  {/* Capacity */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-light">
                      <span className="text-muted-foreground">报名人数</span>
                      <span className="text-white">{webinar.currentParticipants || 0}{webinar.maxParticipants ? ` / ${webinar.maxParticipants}` : ""}</span>
                    </div>
                    {webinar.maxParticipants && <Progress value={capacityPct} className="h-1.5 bg-[#262626]" />}
                    {capacityPct >= 80 && <p className="text-xs text-orange-400 font-light">名额即将满员</p>}
                  </div>

                  <Separator className="bg-[#262626]" />

                  {/* Info */}
                  <div className="space-y-2.5">
                    {scheduledDate && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-white font-light">{format(scheduledDate, "yyyy年MM月dd日", { locale: zhCN })}</span>
                      </div>
                    )}
                    {scheduledDate && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-white font-light">{format(scheduledDate, "HH:mm")} · {webinar.duration || 60} 分钟</span>
                      </div>
                    )}
                    {webinar.language && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-white font-light">{webinar.language === "zh" ? "中文" : webinar.language === "en" ? "English" : webinar.language}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-[#262626]" />

                  {/* CTA */}
                  {isLive ? (
                    <Button
                      onClick={() => setLocation(`/webinars/${webinarId}/room`)}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-light shadow-lg shadow-red-500/20"
                      size="lg"
                    >
                      <Radio className="mr-2 h-4 w-4 animate-pulse" />立即加入直播
                    </Button>
                  ) : isScheduled ? (
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className={cn(
                        "w-full font-light",
                        isRegistered
                          ? "bg-[#1a1a1a] border border-[#404040] text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                          : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20"
                      )}
                      size="lg"
                    >
                      {isRegistering ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />处理中...
                        </span>
                      ) : isRegistered ? (
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />已报名 · 点击取消</span>
                      ) : (
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />立即报名</span>
                      )}
                    </Button>
                  ) : isCompleted ? (
                    <Button
                      onClick={() => setLocation(`/webinars/${webinarId}/replay`)}
                      variant="outline"
                      className="w-full border-[#262626] text-muted-foreground hover:text-white hover:border-violet-500/50 font-light"
                      size="lg"
                    >
                      <Play className="mr-2 h-4 w-4" />观看回放
                    </Button>
                  ) : null}

                  {isScheduled && !isRegistered && (
                    <p className="text-xs text-center text-muted-foreground font-light">报名后将在开始前 30 分钟收到提醒</p>
                  )}
                  {isRegistered && (
                    <p className="text-xs text-center text-green-400 font-light">✓ 已成功报名，开始前将提醒您</p>
                  )}
                </CardContent>
              </Card>

              {/* Organizer */}
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-light text-white">主办方信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-white font-light text-sm">{(webinar as any).organizer || "RealSourcing"}</div>
                      <div className="text-muted-foreground text-xs font-light">官方认证主办方</div>
                    </div>
                  </div>
                  <Separator className="bg-[#262626]" />
                  <div className="space-y-2 text-xs font-light text-muted-foreground">
                    <div className="flex justify-between">
                      <span>活动类型</span><span className="text-white">在线 Webinar</span>
                    </div>
                    {webinar.category && (
                      <div className="flex justify-between">
                        <span>行业分类</span><span className="text-white">{webinar.category}</span>
                      </div>
                    )}
                    {(webinar as any).viewCount !== undefined && (
                      <div className="flex justify-between">
                        <span>浏览次数</span><span className="text-white">{(webinar as any).viewCount || 0}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
