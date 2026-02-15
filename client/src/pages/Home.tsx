import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Video, Building2, Users, Clock, Plus, ArrowRight,
  Circle, Calendar, Globe, TrendingUp, AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { directus, type Webinar } from "../lib/directus";
import { readItems } from "@directus/sdk";

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 并行获取所有数据
        const [allWebinars, factories, participants] = await Promise.all([
          directus.request(readItems("webinars", { limit: -1 })),
          directus.request(readItems("factories", { limit: -1 })).catch(() => []),
          directus.request(readItems("webinar_participants", { limit: -1 })).catch(() => []),
        ]);

        // 计算统计数据
        const liveCount = allWebinars.filter((w: any) => w.status === "live").length;
        const scheduledCount = allWebinars.filter((w: any) => w.status === "scheduled").length;

        setStats({
          activeWebinars: liveCount,
          scheduledWebinars: scheduledCount,
          totalFactories: Array.isArray(factories) ? factories.length : 0,
          totalRegistrations: Array.isArray(participants) ? participants.length : 0,
          pendingReviews: 0, // 暂时设为 0
        });

        // 获取最近的 4 个 Webinar
        const recent = await directus.request(
          readItems("webinars", {
            sort: ["-created_at"],
            limit: 4,
          })
        );

        setRecentWebinars(recent as Webinar[]);
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
      icon: Video,
      color: "text-red-400",
      bg: "bg-red-500/10",
      desc: "Currently broadcasting",
    },
    {
      title: "Upcoming events",
      value: stats.scheduledWebinars,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      desc: "Upcoming events",
    },
    {
      title: "Registered suppliers",
      value: stats.totalFactories,
      icon: Building2,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      desc: "Registered suppliers",
    },
    {
      title: "Approved registrations",
      value: stats.totalRegistrations,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
      desc: "Approved registrations",
    },
    {
      title: "Awaiting approval",
      value: stats.pendingReviews,
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      desc: "Awaiting approval",
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white">Dashboard</h1>
              <p className="text-muted-foreground mt-1 font-light text-sm">
                Welcome back. Here's your sourcing platform overview.
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

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title} className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </div>
                  <div className="text-2xl font-light text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-light">{stat.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent Webinars */}
            <div className="col-span-2">
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-light text-white">Recent Webinars</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/webinars")}
                    className="text-muted-foreground hover:text-violet-400 font-light"
                  >
                    View All
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
                      <p className="font-light">No webinars yet</p>
                      <Button
                        variant="link"
                        onClick={() => setLocation("/webinars/create")}
                        className="text-violet-400 mt-2"
                      >
                        Create your first webinar
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
                            {/* Cover Thumbnail */}
                            {webinar.cover_image ? (
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                  src={`https://admin.cnsubscribe.xyz/assets/${webinar.cover_image}`}
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
                                  {formatDate(webinar.scheduled_at)}
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

            {/* Pending Reviews */}
            <div>
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-lg font-light text-white">Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-light text-sm">All caught up!</p>
                    <p className="text-xs mt-1">No pending reviews</p>
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
