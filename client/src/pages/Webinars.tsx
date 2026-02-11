import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Users, MoreHorizontal, Circle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Webinars() {
  const [, setLocation] = useLocation();

  const webinars = [
    {
      id: 1,
      title: "Smart Home Products Showcase",
      status: "live",
      date: "2026-02-10 10:00",
      participants: 12,
      factories: 3,
    },
    {
      id: 2,
      title: "Consumer Electronics Q1 2026",
      status: "draft",
      date: "2026-02-15 14:00",
      participants: 0,
      factories: 0,
    },
    {
      id: 3,
      title: "Sustainable Packaging Solutions",
      status: "completed",
      date: "2026-02-05 09:00",
      participants: 18,
      factories: 5,
    },
    {
      id: 4,
      title: "LED Lighting Solutions 2026",
      status: "scheduled",
      date: "2026-02-20 11:00",
      participants: 0,
      factories: 4,
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "live") {
      return (
        <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
          <Circle className="h-2 w-2 fill-red-400 mr-1" />
          Live
        </Badge>
      );
    }
    const variants: Record<string, "secondary" | "outline"> = {
      draft: "secondary",
      completed: "outline",
      scheduled: "secondary",
      archived: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filterWebinars = (status: string) => {
    if (status === "all") return webinars;
    return webinars.filter((w) => w.status === status);
  };

  const renderWebinarList = (items: typeof webinars) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No webinars found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((webinar) => (
          <Card key={webinar.id} className="hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      if (webinar.status === "live") {
                        setLocation(`/webinars/${webinar.id}/room`);
                      } else {
                        toast("Feature coming soon");
                      }
                    }}
                  >
                    {webinar.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {webinar.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {webinar.participants} participants
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(webinar.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast("Feature coming soon")}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast("Feature coming soon")}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast("Feature coming soon")}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => toast("Feature coming soon")}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{webinar.factories} factories invited</span>
                {webinar.status === "live" && (
                  <Button size="sm" variant="default" onClick={() => setLocation(`/webinars/${webinar.id}/room`)}>
                    Join Negotiation Room
                  </Button>
                )}
                {webinar.status === "draft" && (
                  <Button size="sm" variant="outline" onClick={() => setLocation("/webinars/create")}>
                    Continue Setup
                  </Button>
                )}
                {webinar.status === "completed" && (
                  <Button size="sm" variant="outline" onClick={() => setLocation("/reports")}>
                    View Report
                  </Button>
                )}
                {webinar.status === "scheduled" && (
                  <Button size="sm" variant="outline" onClick={() => toast("Feature coming soon")}>
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webinars</h1>
            <p className="text-muted-foreground mt-2">
              Manage your live sourcing webinars and negotiations
            </p>
          </div>
          <Button onClick={() => setLocation("/webinars/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Webinar
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search webinars..." className="pl-10" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({webinars.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({filterWebinars("draft").length})</TabsTrigger>
            <TabsTrigger value="live">Live ({filterWebinars("live").length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({filterWebinars("scheduled").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterWebinars("completed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderWebinarList(webinars)}</TabsContent>
          <TabsContent value="draft">{renderWebinarList(filterWebinars("draft"))}</TabsContent>
          <TabsContent value="live">{renderWebinarList(filterWebinars("live"))}</TabsContent>
          <TabsContent value="scheduled">{renderWebinarList(filterWebinars("scheduled"))}</TabsContent>
          <TabsContent value="completed">{renderWebinarList(filterWebinars("completed"))}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
