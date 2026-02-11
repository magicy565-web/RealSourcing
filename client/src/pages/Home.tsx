import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Video, Building2, CheckCircle2, Plus, ArrowRight,
  TrendingUp, Clock, Circle, FileText, Zap, FileBarChart,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { directus } from "@/lib/directus";
import type { Webinar, Factory, Order } from "@/lib/directus";
import { readItems, aggregate } from "@directus/sdk";

export default function Home() {
  const [, setLocation] = useLocation();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [stats, setStats] = useState({
    activeWebinars: 0,
    totalFactories: 0,
    closedOrders: 0,
    activeNegotiations: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch data from Directus
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch webinars
        const webinarsData = await directus.request(
          readItems('webinars', {
            limit: 10,
            sort: ['-created_at'],
            filter: {
              status: {
                _in: ['scheduled', 'live'],
              },
            },
          })
        );
        setWebinars(webinarsData);

        // Fetch stats
        const [webinarCount, factoryCount, orderCount] = await Promise.all([
          directus.request(
            aggregate('webinars', {
              aggregate: { count: '*' },
              query: {
                filter: {
                  status: {
                    _in: ['scheduled', 'live'],
                  },
                },
              },
            })
          ),
          directus.request(
            aggregate('factories', {
              aggregate: { count: '*' },
            })
          ),
          directus.request(
            aggregate('orders', {
              aggregate: { count: '*' },
              query: {
                filter: {
                  status: {
                    _in: ['delivered'],
                  },
                },
              },
            })
          ),
        ]);

        setStats({
          activeWebinars: webinarCount[0]?.count || 0,
          totalFactories: factoryCount[0]?.count || 0,
          closedOrders: orderCount[0]?.count || 0,
          activeNegotiations: 8, // Placeholder
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsDisplay = [
    { name: "Active Webinars", value: stats.activeWebinars.toString(), icon: Video, change: "+2 from last month", color: "text-blue-400" },
    { name: "Total Factories", value: stats.totalFactories.toString(), icon: Building2, change: "+5 from last month", color: "text-green-400" },
    { name: "Closed Orders", value: stats.closedOrders.toString(), icon: CheckCircle2, change: "+3 from last month", color: "text-purple-400" },
    { name: "Active Negotiations", value: stats.activeNegotiations.toString(), icon: Activity, change: "+1 from last week", color: "text-orange-400" },
  ];

  const recentActivity = [
    { type: "live", title: "Smart Home Products Showcase is now live", time: "Just now", badge: "Live" },
    { type: "factory", title: "Shenzhen Electronics Co. joined webinar", time: "2 hours ago", badge: null },
    { type: "order", title: "Order #1234 confirmed — WiFi Smart Switch ×5000", time: "5 hours ago", badge: null },
    { type: "ai", title: "AI Report generated for Q4 Supplier Evaluation", time: "Yesterday", badge: "AI" },
    { type: "schedule", title: "Consumer Electronics Q1 2026 scheduled", time: "2 days ago", badge: null },
    { type: "factory", title: "Dongguan Manufacturing Group verified", time: "3 days ago", badge: null },
  ];

  const getActivityDotColor = (type: string) => {
    switch (type) {
      case "live": return "bg-red-400";
      case "factory": return "bg-green-400";
      case "order": return "bg-purple-400";
      case "ai": return "bg-blue-400";
      default: return "bg-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">Live</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Scheduled</Badge>;
      case "ended":
        return <Badge className="bg-muted/50 text-muted-foreground border-muted hover:bg-muted/70">Ended</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
              Good morning, Team
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              Here's what's happening with your sourcing operations today
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-border/50 hover:bg-muted/50"
              onClick={() => setLocation("/factories")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Add Factory
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setLocation("/webinars")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Webinar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsDisplay.map((stat) => (
            <Card key={stat.name} className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground font-light">{stat.change}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light tracking-tight mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground font-light">{stat.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Webinars */}
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-light">Upcoming Webinars</CardTitle>
                  <CardDescription className="text-xs font-light">
                    Scheduled and live sourcing sessions
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                  onClick={() => setLocation("/webinars")}
                >
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webinars.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No upcoming webinars. Create one to get started.
                  </div>
                ) : (
                  webinars.map((webinar) => (
                    <div
                      key={webinar.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/webinars/${webinar.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg ${webinar.status === 'live' ? 'bg-red-500/10' : 'bg-violet-500/10'} flex items-center justify-center`}>
                          <Video className={`h-5 w-5 ${webinar.status === 'live' ? 'text-red-400' : 'text-violet-400'}`} />
                        </div>
                        <div>
                          <div className="font-light text-sm mb-1">{webinar.title}</div>
                          <div className="text-xs text-muted-foreground font-light flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {webinar.scheduled_at ? new Date(webinar.scheduled_at).toLocaleString() : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(webinar.status)}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-light">Recent Activity</CardTitle>
              <CardDescription className="text-xs font-light">
                Latest updates from your operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative">
                      <Circle className={`h-2 w-2 ${getActivityDotColor(activity.type)} fill-current mt-2`} />
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-1 top-4 h-full w-px bg-border/50" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-light leading-tight">{activity.title}</p>
                        {activity.badge && (
                          <Badge className={`${activity.badge === 'Live' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'} text-xs px-2 py-0`}>
                            {activity.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-light">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setLocation("/reports")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <FileBarChart className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <div className="font-light text-sm mb-1">AI Reports</div>
                  <div className="text-xs text-muted-foreground font-light">View supplier analysis</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setLocation("/factories")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="font-light text-sm mb-1">Factories</div>
                  <div className="text-xs text-muted-foreground font-light">Manage suppliers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setLocation("/webinars")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="font-light text-sm mb-1">Webinars</div>
                  <div className="text-xs text-muted-foreground font-light">View all sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
