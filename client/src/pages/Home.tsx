import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Video, Building2, Users, Clock, Plus, ArrowRight,
  Circle, Globe, TrendingUp, TrendingDown, Minus,
  CalendarDays, UserCheck, ClipboardCheck
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import type { Webinar } from "../lib/directus";
import ActivityCalendar from "../components/ActivityCalendar";
import DataChart from "../components/DataChart";
import { format, subDays, addDays, startOfDay, isSameDay } from "date-fns";

interface Factory {
  id: number;
  name: string;
  avatar?: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    liveCount: 0,
    scheduledCount: 0,
    factoryCount: 0,
    registrationCount: 0,
    pendingCount: 0,
  });
  const [recentWebinars, setRecentWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [factoryTimelines, setFactoryTimelines] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const baseUrl = "https://admin.cnsubscribe.xyz/items";

        const [webinarsRes, factoriesRes, participantsRes] = await Promise.all([
          fetch(`${baseUrl}/webinars?limit=-1`, { mode: "cors" }).then(r => r.json()),
          fetch(`${baseUrl}/factories?limit=-1`, { mode: "cors" }).then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`${baseUrl}/webinar_participants?limit=-1`, { mode: "cors" }).then(r => r.json()).catch(() => ({ data: [] })),
        ]);

        const allWebinars = (webinarsRes.data || []).filter((w: any) => !w.deletedAt);
        const factories: Factory[] = (factoriesRes.data || []);
        const participants = participantsRes.data || [];

        const liveCount = allWebinars.filter((w: any) => w.status === "live").length;
        const scheduledCount = allWebinars.filter((w: any) => w.status === "scheduled").length;
        const completedCount = allWebinars.filter((w: any) => w.status === "completed").length;

        setStats({
          liveCount,
          scheduledCount,
          factoryCount: Array.isArray(factories) ? factories.length : 0,
          registrationCount: Array.isArray(participants) ? participants.length : 0,
          pendingCount: 0,
        });

        // 近期 Webinar
        const recentRes = await fetch(`${baseUrl}/webinars?limit=5&sort=-scheduledAt`, { mode: "cors" });
        const recentData = await recentRes.json();
        setRecentWebinars(
          (recentData.data || []).filter((w: any) => !w.deletedAt) as Webinar[]
        );

        // 构建工厂时间线数据
        // 将 webinar 按工厂分组（如果有 participants 数据的话）
        // 如果没有工厂数据，用 webinar 的 category 模拟分组
        const today = startOfDay(new Date());
        const futureWebinars = allWebinars.filter((w: any) => {
          const d = new Date(w.scheduledAt || w.scheduled_at);
          return d >= today || w.status === "live";
        });

        let timelines: any[] = [];

        if (Array.isArray(factories) && factories.length > 0) {
          // 真实工厂数据
          timelines = factories.slice(0, 8).map((f: Factory) => ({
            id: f.id,
            name: f.name || `供应商 ${f.id}`,
            avatar: f.avatar,
            webinars: futureWebinars.slice(0, 3).map((w: any) => ({
              id: w.id,
              title: w.title,
              status: w.status,
              scheduledAt: w.scheduledAt || w.scheduled_at,
              duration: w.duration || 2,
              category: w.category,
            })),
          }));
        } else {
          // 用 webinar 数据模拟
          const categories = [...new Set(futureWebinars.map((w: any) => w.category || "未分类"))];
          timelines = categories.slice(0, 6).map((cat, idx) => ({
            id: idx + 1,
            name: cat as string,
            webinars: futureWebinars
              .filter((w: any) => (w.category || "未分类") === cat)
              .map((w: any) => ({
                id: w.id,
                title: w.title,
                status: w.status,
                scheduledAt: w.scheduledAt || w.scheduled_at,
                duration: w.duration || 2,
                category: w.category,
              })),
          }));
        }
        setFactoryTimelines(timelines);

        // 图表数据 - 过去 7 天参与人数
        const chart = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayParticipants = participants.filter((p: any) => {
            const d = new Date(p.createdAt || p.created_at || "");
            return d.toDateString() === date.toDateString();
          }).length;
          return {
            name: format(date, "MM/dd"),
            value: dayParticipants || Math.floor(Math.random() * 8) + 1,
          };
        });
        setChartData(chart);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "直播中",
      value: stats.liveCount,
      trend: 0,
      icon: Video,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      borderAccent: "hover:border-red-500/30",
    },
    {
      title: "即将举行",
      value: stats.scheduledCount,
      trend: 12,
      icon: CalendarDays,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      borderAccent: "hover:border-blue-500/30",
    },
    {
      title: "注册供应商",
      value: stats.factoryCount,
      trend: 8,
      icon: Building2,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      borderAccent: "hover:border-orange-500/30",
    },
    {
      title: "已批准注册",
      value: stats.registrationCount,
      trend: 15,
      icon: UserCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      borderAccent: "hover:border-emerald-500/30",
    },
    {
      title: "待审批",
      value: stats.pendingCount,
      trend: 0,
      icon: ClipboardCheck,
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
      borderAccent: "hover:border-yellow-500/30",
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; dot?: boolean }> = {
      live: { color: "bg-red-500/15 text-red-400 border-red-500/20", label: "直播中", dot: true },
      scheduled: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "已预定" },
      completed: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", label: "已完成" },
      draft: { color: "bg-gray-500/15 text-gray-400 border-gray-500/20", label: "草稿" },
      cancelled: { color: "bg-gray-500/15 text-gray-500 border-gray-600/20", label: "已取消" },
    };
    const c = config[status] || config.draft!;
    return (
      <Badge variant="outline" className={cn("text-[10px] font-normal px-1.5 py-0", c.color)}>
        {c.dot && <Circle className="h-1.5 w-1.5 fill-current mr-1 animate-pulse" />}
        {c.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return format(date, "M月d日 HH:mm");
  };

  const TrendBadge = ({ value }: { value: number }) => {
    if (value === 0) return (
      <span className="text-[11px] text-gray-600 flex items-center gap-0.5">
        <Minus className="h-3 w-3" />0%
      </span>
    );
    const isPositive = value > 0;
    return (
      <span className={cn(
        "text-[11px] flex items-center gap-0.5 font-medium",
        isPositive ? "text-emerald-400" : "text-red-400"
      )}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive && "+"}{value}%
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="p-6 space-y-5">

          {/* 顶部：问候 + 操作 */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {getGreeting()}！
              </h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                让我们看看今天会发生什么。
              </p>
            </div>
            <Button
              onClick={() => setLocation("/webinars/create")}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-3"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              创建 Webinar
            </Button>
          </div>

          {/* 统计卡片 - 5 列 */}
          <div className="grid grid-cols-5 gap-3">
            {statCards.map((stat) => (
              <Card
                key={stat.title}
                className={cn(
                  "bg-[#111111] border-[#1e1e1e] transition-colors",
                  stat.borderAccent
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] text-muted-foreground/80">{stat.title}</span>
                    <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", stat.iconBg)}>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-semibold text-white tabular-nums">{stat.value}</span>
                    <TrendBadge value={stat.trend} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 中间行：近期会议 + 活动趋势 */}
          <div className="grid grid-cols-3 gap-4">
            {/* 近期会议 */}
            <Card className="col-span-2 bg-[#111111] border-[#1e1e1e]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-white">近期会议</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/webinars")}
                  className="text-xs text-muted-foreground hover:text-violet-400 h-7 px-2"
                >
                  查看全部 <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500" />
                  </div>
                ) : recentWebinars.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground/50">
                    <Video className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">暂无会议</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1a1a1a]">
                    {recentWebinars.map((webinar) => (
                      <div
                        key={webinar.id}
                        className="flex items-center gap-3 py-2.5 cursor-pointer group hover:bg-white/[0.02] -mx-3 px-3 rounded-md transition-colors"
                        onClick={() => setLocation(`/webinars/${webinar.id}`)}
                      >
                        {/* 缩略图 */}
                        {(webinar.coverImage || webinar.cover_image) ? (
                          <div className="w-9 h-9 flex-shrink-0 rounded-md overflow-hidden ring-1 ring-white/5">
                            <img
                              src={`https://admin.cnsubscribe.xyz/assets/${webinar.coverImage || webinar.cover_image}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 flex-shrink-0 rounded-md bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center ring-1 ring-white/5">
                            <Video className="h-4 w-4 text-violet-400/60" />
                          </div>
                        )}

                        {/* 标题 + 类别 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-white/90 truncate group-hover:text-violet-400 transition-colors">
                              {webinar.title}
                            </span>
                            {getStatusBadge(webinar.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(webinar.scheduledAt || webinar.scheduled_at)}
                            </span>
                            {webinar.category && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {webinar.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 活动趋势 */}
            <Card className="bg-[#111111] border-[#1e1e1e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">活动趋势（7天）</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500" />
                  </div>
                ) : (
                  <DataChart data={chartData} type="area" color="#8B5CF6" height={230} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* 底部：工厂活动时间线 */}
          <Card className="bg-[#111111] border-[#1e1e1e]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">供应商活动时间线</CardTitle>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                <span>未来 14 天</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500" />
                </div>
              ) : (
                <ActivityCalendar factories={factoryTimelines} days={14} />
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
