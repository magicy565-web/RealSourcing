import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Video, Building2, CheckCircle2, Plus, ArrowRight,
  TrendingUp, Clock, Circle, FileText, Zap,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const stats = [
    { name: "Active Webinars", value: "3", icon: Video, change: "+2 from last month", color: "text-blue-400" },
    { name: "Total Factories", value: "24", icon: Building2, change: "+5 from last month", color: "text-green-400" },
    { name: "Closed Orders", value: "12", icon: CheckCircle2, change: "+3 from last month", color: "text-purple-400" },
    { name: "Active Negotiations", value: "8", icon: Activity, change: "+1 from last week", color: "text-orange-400" },
  ];

  const recentActivity = [
    { type: "live", title: "Smart Home Products Showcase is now live", time: "Just now", badge: "Live" },
    { type: "factory", title: "Shenzhen Electronics Co. joined webinar", time: "2 hours ago", badge: null },
    { type: "order", title: "Order #1234 confirmed — WiFi Smart Switch ×5000", time: "5 hours ago", badge: null },
    { type: "ai", title: "AI Report generated for Q4 Supplier Evaluation", time: "Yesterday", badge: "AI" },
    { type: "schedule", title: "Consumer Electronics Q1 2026 scheduled", time: "2 days ago", badge: null },
    { type: "factory", title: "Dongguan Manufacturing Group verified", time: "3 days ago", badge: null },
  ];

  const upcomingWebinars = [
    { id: 1, title: "Smart Home Products Showcase", date: "Today, 10:00 AM", status: "live", factories: 3 },
    { id: 2, title: "Consumer Electronics Q1 2026", date: "Feb 15, 2:00 PM", status: "scheduled", factories: 0 },
    { id: 4, title: "LED Lighting Solutions 2026", date: "Feb 20, 11:00 AM", status: "scheduled", factories: 4 },
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

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's what's happening with your sourcing operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/factories")}>
              <Building2 className="mr-2 h-4 w-4" />
              Add Factory
            </Button>
            <Button onClick={() => setLocation("/webinars/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Webinar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:border-muted-foreground/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Recent Activity - 3 columns */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your sourcing operations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="relative mt-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${getActivityDotColor(item.type)}`}></div>
                      {index < recentActivity.length - 1 && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-6 bg-border"></div>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </p>
                      </div>
                      {item.badge && (
                        <Badge variant={item.badge === "Live" ? "default" : "secondary"}
                          className={item.badge === "Live" ? "bg-red-500/20 text-red-400 border-red-500/30" : ""}
                        >
                          {item.badge === "Live" && <Circle className="h-2 w-2 fill-red-400 mr-1" />}
                          {item.badge === "AI" && <Zap className="h-3 w-3 mr-1" />}
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Webinars - 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Webinars</CardTitle>
                <CardDescription>Your scheduled events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setLocation("/webinars")}>
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingWebinars.map((webinar) => (
                  <div
                    key={webinar.id}
                    className="p-3 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors cursor-pointer"
                    onClick={() => {
                      if (webinar.status === "live") {
                        setLocation(`/webinars/${webinar.id}/room`);
                      } else {
                        setLocation("/webinars");
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{webinar.title}</p>
                      {webinar.status === "live" ? (
                        <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          <Circle className="h-2 w-2 fill-red-400 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Scheduled</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {webinar.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {webinar.factories} factories
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="hover:border-muted-foreground/30 transition-colors cursor-pointer" onClick={() => setLocation("/webinars/create")}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Create Webinar</p>
                <p className="text-xs text-muted-foreground">Start a new sourcing session</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
          <Card className="hover:border-muted-foreground/30 transition-colors cursor-pointer" onClick={() => setLocation("/factories")}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Browse Factories</p>
                <p className="text-xs text-muted-foreground">Explore your supplier network</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
          <Card className="hover:border-muted-foreground/30 transition-colors cursor-pointer" onClick={() => setLocation("/reports")}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium">View Reports</p>
                <p className="text-xs text-muted-foreground">AI-generated supplier insights</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
