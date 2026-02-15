import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Video, Building2, Users, Clock, Plus, ArrowRight,
  Circle, Calendar, Globe, AlertCircle, Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import type { Webinar } from "../lib/directus";
import TrendIndicator from "../components/TrendIndicator";
import ActivityCalendar from "../components/ActivityCalendar";
import DataChart from "../components/DataChart";
import { format, subDays } from "date-fns";

export default function Home() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    activeWebinars: 0,
    scheduledWebinars: 0,
    totalFactories: 0,
    totalRegistrations: 0,
    pendingReviews: 0,
  });
  const [trends, setTrends] = useState({
    activeWebinars: 0,
    scheduledWebinars: 12,
    totalFactories: 8,
    totalRegistrations: 15,
    pendingReviews: 0,
  });
  const [recentWebinars, setRecentWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
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
        const factories = factoriesRes.data || [];
        const participants = participantsRes.data || [];

        const liveCount = allWebinars.filter((w: any) => w.status === "live").length;
        const scheduledCount = allWebinars.filter((w: any) => w.status === "scheduled").length;

        setStats({
          activeWebinars: liveCount,
          scheduledWebinars: scheduledCount,
          totalFactories: Array.isArray(factories) ? factories.length : 0,
          totalRegistrations: Array.isArray(participants) ? participants.length : 0,
          pendingReviews: 0,
        });

        // 获取最近的 Webinar
        const recentRes = await fetch(`${baseUrl}/webinars?limit=4`, { mode: "cors" });
        const recentData = await recentRes.json();
        const validRecent = (recentData.data || []).filter((w: any) => !w.deletedAt);
        setRecentWebinars(validRecent as Webinar[]);

        // 生成活动日历数据（模拟）
        const activities = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), 13 - i);
          const webinarsOnDate = allWebinars.filter((w: any) => {
            const scheduledDate = new Date(w.scheduledAt || w.scheduled_at);
            return scheduledDate.toDateString() === date.toDateString();
          });
          return {
            date,
            count: webinarsOnDate.length,
            events: webinarsOnDate.map((w: any) => w.title),
          };
        });
        setActivityData(activities);

        // 生成图表数据（过去 7 天的参与趋势）
        const chart = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return {
            name: format(date, "MM/dd"),
            value: Math.floor(Math.random() * 50) + 10, // 模拟数据
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
      title: "Currently broadcasting",
      value: stats.activeWebinars,
      trend: trends.activeWebinars,
      icon: Video,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      title: "Upcoming events",
      value: stats.scheduledWebinars,
      trend: trends.scheduledWebinars,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Registered suppliers",
      value: stats.totalFactories,
      trend: trends.totalFactories,
      icon: Building2,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      title: "Approved registrations",
      value: stats.totalRegistrations,
      trend: trends.totalRegistrations,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Awaiting approval",
      value: stats.pendingReviews,
      trend: trends.pendingReviews,
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

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
          {/* 个性化问候 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white flex items-center gap-2">
                {getGreeting()}！
                <Sparkles className="h-6 w-6 text-violet-400" />
              </h1>
              <p className="text-muted-foreground mt-1 font-light text-sm">
                让我看看今天会发生什么吧。
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

          {/* 统计卡片（带趋势） */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title} className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-light text-white">{stat.value}</div>
                    <TrendIndicator value={stat.trend} />
                  </div>
                  <div className="text-xs text-muted-foreground font-light">{stat.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* 近期 Webinar */}
            <div className="col-span-2">
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-light text-white">近期网络研讨会</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/webinars")}
                    className="text-muted-foreground hover:text-violet-400 font-light"
                  >
                    查看全部
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                    </div>
                  ) : recentWebinars.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="font-light">暂无网络研讨会</p>
                      <Button
                        variant="link"
                        onClick={() => setLocation("/webinars/create")}
                        className="text-violet-400 mt-2"
                      >
                        创建您的第一个网络研讨会
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentWebinars.map((webinar) => (
                        <div
                          key={webinar.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#262626] hover:border-violet-500/30 transition-all cursor-pointer group hover:bg-[#1a1a1a]"
                          onClick={() => setLocation(`/webinars/${webinar.id}`)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {(webinar.coverImage || webinar.cover_image) ? (
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                  src={`https://admin.cnsubscribe.xyz/assets/${webinar.coverImage || webinar.cover_image}`}
                                  alt={webinar.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                                <Video className="h-6 w-6 text-violet-400" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-light text-white truncate group-hover:text-violet-400 transition-colors">
                                  {webinar.title}
                                </h3>
                                {getStatusBadge(webinar.status)}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                          </div>

                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 transition-colors flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 活动日历 */}
            <div>
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-lg font-light text-white">活动日历</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityCalendar data={activityData} days={14} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 数据可视化 */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-lg font-light text-white">参与趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={chartData} type="area" color="#8B5CF6" height={200} />
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-lg font-light text-white">待处理事项</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-light text-sm">全部完成！</p>
                  <p className="text-xs mt-1">没有待处理的审核</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
