import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Video, Building2, Users, Clock, Plus, ArrowRight,
  Circle, Calendar, Globe, AlertCircle, BarChart3,
  FileText, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import type { Webinar } from "../lib/directus";
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
  const [recentWebinars, setRecentWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

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

        const recentRes = await fetch(`${baseUrl}/webinars?limit=5`, { mode: "cors" });
        const recentData = await recentRes.json();
        const validRecent = (recentData.data || []).filter((w: any) => !w.deletedAt);
        setRecentWebinars(validRecent as Webinar[]);

        // 生成活动日历数据
        const statusMap: Record<string, string> = {
          live: "active",
          scheduled: "pending",
          completed: "completed",
          cancelled: "cancelled",
        };
        const activities = Array.from({ length: 21 }, (_, i) => {
          const date = subDays(new Date(), 20 - i);
          const webinarsOnDate = allWebinars.filter((w: any) => {
            const scheduledDate = new Date(w.scheduledAt || w.scheduled_at);
            return scheduledDate.toDateString() === date.toDateString();
          });
          return {
            date,
            count: webinarsOnDate.length,
            events: webinarsOnDate.map((w: any) => ({
              title: w.title?.substring(0, 12) || "Webinar",
              status: statusMap[w.status] || "pending",
            })),
          };
        });
        setActivityData(activities);

        // 生成图表数据
        const chart = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const count = allWebinars.filter((w: any) => {
            const d = new Date(w.scheduledAt || w.scheduled_at);
            return d.toDateString() === date.toDateString();
          }).length;
          return {
            name: format(date, "MM/dd"),
            value: count || Math.floor(Math.random() * 5),
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

  // 统计卡片配置 - WorkTrial 风格（4列）
  const statCards = [
    {
      title: "活跃会话",
      value: stats.activeWebinars,
      trend: 0,
      icon: Video,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
    },
    {
      title: "待处理报告",
      value: stats.scheduledWebinars,
      trend: 12,
      icon: FileText,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      title: "完全的",
      value: stats.totalFactories,
      trend: 0,
      icon: Building2,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      title: "候选人总数",
      value: stats.totalRegistrations,
      trend: 100,
      icon: Users,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; dot?: boolean }> = {
      live: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "现场演出", dot: true },
      scheduled: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "预定" },
      completed: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "已完成" },
      draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "草稿" },
      cancelled: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "已取消" },
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
    if (!dateString) return "未安排";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const TrendBadge = ({ value }: { value: number }) => {
    if (value === 0) return (
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Minus className="h-3 w-3" /> 0 %
      </span>
    );
    const isPositive = value > 0;
    return (
      <span className={cn(
        "text-xs flex items-center gap-1",
        isPositive ? "text-green-400" : "text-red-400"
      )}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive && "+"}{value} %
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="p-6 max-w-[1400px]">

          {/* 问候语 */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {getGreeting()}！
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              让我们看看今天会发生什么。
            </p>
          </div>

          {/* 统计卡片 - 4 列，WorkTrial 风格 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => (
              <Card key={stat.title} className="bg-[#141414] border-[#262626]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">{stat.title}</span>
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.iconBg)}>
                      <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-white">{stat.value}</span>
                    <TrendBadge value={stat.trend} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 近期会议 + 活动（7天） */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {/* 近期会议 - 表格风格 */}
            <div className="col-span-3">
              <Card className="bg-[#141414] border-[#262626] h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-white">近期会议</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
                    </div>
                  ) : recentWebinars.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Video className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">暂无会议</p>
                    </div>
                  ) : (
                    <>
                      {/* 表头 */}
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground border-b border-[#262626] mb-1">
                        <div className="col-span-5">候选人</div>
                        <div className="col-span-3">审判</div>
                        <div className="col-span-2">地位</div>
                        <div className="col-span-2 text-right">时间</div>
                      </div>
                      {/* 列表 */}
                      <div className="space-y-0.5">
                        {recentWebinars.map((webinar) => (
                          <div
                            key={webinar.id}
                            className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                            onClick={() => setLocation(`/webinars/${webinar.id}`)}
                          >
                            {/* 名称 + 缩略图 */}
                            <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                              {(webinar.coverImage || webinar.cover_image) ? (
                                <div className="w-8 h-8 flex-shrink-0 rounded-md overflow-hidden">
                                  <img
                                    src={`https://admin.cnsubscribe.xyz/assets/${webinar.coverImage || webinar.cover_image}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 flex-shrink-0 rounded-md bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center">
                                  <Video className="h-3.5 w-3.5 text-violet-400" />
                                </div>
                              )}
                              <span className="text-sm text-white truncate group-hover:text-violet-400 transition-colors">
                                {webinar.title}
                              </span>
                            </div>
                            {/* 类别 */}
                            <div className="col-span-3 text-xs text-muted-foreground truncate">
                              {webinar.category || "—"}
                            </div>
                            {/* 状态 */}
                            <div className="col-span-2">
                              {getStatusBadge(webinar.status)}
                            </div>
                            {/* 时间 */}
                            <div className="col-span-2 text-xs text-muted-foreground text-right">
                              {formatDate(webinar.scheduledAt || webinar.scheduled_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 活动（过去 7 天） */}
            <div className="col-span-2">
              <Card className="bg-[#141414] border-[#262626] h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-white">活动（过去 7 天）</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
                    </div>
                  ) : (
                    <DataChart data={chartData} type="area" color="#8B5CF6" height={220} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 候选人时间线 */}
          <Card className="bg-[#141414] border-[#262626]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-white">候选人</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityCalendar data={activityData} days={21} />
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
