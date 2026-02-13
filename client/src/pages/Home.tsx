import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video, Building2, Users, Clock, Plus, ArrowRight,
  Circle, Calendar, Globe, TrendingUp, AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { mockStore, type MockWebinar, type MockRegistration, getAvatarByRole } from "@/lib/mock-data";

export default function Home() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    activeWebinars: 0,
    scheduledWebinars: 0,
    totalFactories: 0,
    totalRegistrations: 0,
    pendingReviews: 0,
  });
  const [recentWebinars, setRecentWebinars] = useState<MockWebinar[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<MockRegistration[]>([]);

  useEffect(() => {
    setStats(mockStore.getDashboardStats());
    setRecentWebinars(mockStore.getWebinars().slice(0, 4));
    const allRegs = mockStore.getRegistrations();
    setPendingRegistrations(allRegs.filter(r => r.status === "pending").slice(0, 5));
  }, []);

  const handleApprove = (regId: number) => {
    mockStore.updateRegistrationStatus(regId, "approved");
    setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
    setStats(mockStore.getDashboardStats());
  };

  const handleReject = (regId: number) => {
    mockStore.updateRegistrationStatus(regId, "rejected");
    setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
    setStats(mockStore.getDashboardStats());
  };

  const statCards = [
    {
      title: "Live Webinars",
      value: stats.activeWebinars,
      icon: Video,
      color: "text-red-400",
      bg: "bg-red-500/10",
      desc: "Currently broadcasting",
    },
    {
      title: "Scheduled",
      value: stats.scheduledWebinars,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      desc: "Upcoming events",
    },
    {
      title: "Factories",
      value: stats.totalFactories,
      icon: Building2,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      desc: "Registered suppliers",
    },
    {
      title: "Participants",
      value: stats.totalRegistrations,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
      desc: "Approved registrations",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      desc: "Awaiting approval",
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; dot?: boolean }> = {
      live: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Live", dot: true },
      scheduled: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Scheduled" },
      completed: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
    };
    const c = config[status] || { color: "bg-gray-500/10 text-gray-400", label: status };
    return (
      <Badge className={cn("text-[10px] font-light", c.color)}>
        {c.dot && <Circle className="h-1.5 w-1.5 fill-current mr-1 animate-pulse" />}
        {c.label}
      </Badge>
    );
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
              className="bg-violet-600 hover:bg-violet-700 text-white font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Webinar
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title} className="bg-[#141414] border-[#262626]">
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
                  <div className="space-y-3">
                    {recentWebinars.map((webinar) => {
                      const regs = mockStore.getRegistrations(webinar.id);
                      const approvedCount = regs.filter(r => r.status === "approved").length;

                      return (
                        <div
                          key={webinar.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#262626] hover:border-[#404040] transition-colors cursor-pointer group"
                          onClick={() => setLocation(`/webinars/${webinar.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Cover Thumbnail */}
                            {webinar.cover_image ? (
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                  src={webinar.cover_image}
                                  alt={webinar.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {webinar.status === "live" && (
                                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                    <Circle className="h-2 w-2 fill-red-400 text-red-400 animate-pulse" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={cn(
                                "h-16 w-16 rounded-lg flex items-center justify-center flex-shrink-0",
                                webinar.status === "live" ? "bg-red-500/10" : "bg-violet-500/10"
                              )}>
                                <Video className={cn(
                                  "h-6 w-6",
                                  webinar.status === "live" ? "text-red-400" : "text-violet-400"
                                )} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-light text-white group-hover:text-violet-400 transition-colors">
                                {webinar.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(webinar.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {approvedCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(webinar.status)}
                            {webinar.status === "live" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/webinars/${webinar.id}/room`);
                                }}
                                className="bg-violet-600 hover:bg-violet-700 text-white font-light text-xs"
                              >
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Reviews */}
            <div>
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-lg font-light text-white flex items-center gap-2">
                    Pending Reviews
                    {pendingRegistrations.length > 0 && (
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                        {pendingRegistrations.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRegistrations.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground font-light">All caught up!</p>
                      <p className="text-xs text-muted-foreground/60 font-light mt-1">No pending reviews</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRegistrations.map((reg) => {
                        const webinar = mockStore.getWebinarById(reg.webinar_id);
                        return (
                          <div key={reg.id} className="p-3 rounded-lg border border-[#262626] space-y-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={getAvatarByRole(reg.role, reg.user_name)}
                                alt={reg.user_name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-light text-white truncate">{reg.user_name}</p>
                                <p className="text-xs text-muted-foreground font-light truncate">{reg.company_name}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-[#262626] text-muted-foreground flex-shrink-0">
                                {reg.role === "factory" ? "Factory" : "Buyer"}
                              </Badge>
                            </div>
                            {webinar && (
                              <p className="text-[10px] text-muted-foreground/60 font-light truncate">
                                → {webinar.title}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApprove(reg.id)}
                                className="flex-1 h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(reg.id)}
                                className="flex-1 h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
