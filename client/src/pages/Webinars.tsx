import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Calendar, Users, MoreHorizontal, Circle, Clock,
  Building2, Globe, Video, Trash2, Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { mockStore, type MockWebinar } from "@/lib/mock-data";

export default function Webinars() {
  const [, setLocation] = useLocation();
  const [webinars, setWebinars] = useState<MockWebinar[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setWebinars(mockStore.getWebinars());
  }, []);

  const refreshWebinars = () => {
    setWebinars(mockStore.getWebinars());
  };

  const filteredWebinars = searchQuery
    ? webinars.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : webinars;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; dot?: boolean }> = {
      live: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Live", dot: true },
      scheduled: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Scheduled" },
      draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Draft" },
      completed: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
      cancelled: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Cancelled" },
    };
    const c = config[status] || config.draft;
    return (
      <Badge className={cn("text-xs font-light", c.color)}>
        {c.dot && <Circle className="h-2 w-2 fill-current mr-1 animate-pulse" />}
        {c.label}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      electronics: "Electronics",
      "smart-home": "Smart Home",
      "consumer-goods": "Consumer Goods",
      textiles: "Textiles",
      furniture: "Furniture",
      automotive: "Automotive",
      packaging: "Packaging",
      other: "Other",
    };
    return labels[category] || category;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (id: number) => {
    mockStore.deleteWebinar(id);
    refreshWebinars();
    toast.success("Webinar deleted");
  };

  const filterByStatus = (status: string) => {
    if (status === "all") return filteredWebinars;
    return filteredWebinars.filter(w => w.status === status);
  };

  const renderWebinarList = (items: MockWebinar[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-20">
          <Video className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-light">No webinars found</p>
          <p className="text-xs text-muted-foreground/60 font-light mt-1">Create your first webinar to get started</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((webinar) => {
          const regs = mockStore.getRegistrations(webinar.id);
          const approvedCount = regs.filter(r => r.status === "approved").length;
          const factoryCount = regs.filter(r => r.role === "factory" && r.status === "approved").length;
          const buyerCount = regs.filter(r => r.role === "buyer" && r.status === "approved").length;
          const pendingCount = regs.filter(r => r.status === "pending").length;

          return (
            <Card
              key={webinar.id}
              className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-all cursor-pointer group"
              onClick={() => setLocation(`/webinars/${webinar.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  {/* Cover Image */}
                  {webinar.cover_image && (
                    <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-l-lg">
                      <img
                        src={webinar.cover_image}
                        alt={webinar.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {webinar.status === "live" && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/90 text-white px-2 py-0.5 rounded text-xs font-medium">
                          <Circle className="h-1.5 w-1.5 fill-current animate-pulse" />
                          LIVE
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 py-5 pr-5">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-light text-white group-hover:text-violet-400 transition-colors truncate">
                        {webinar.title}
                      </h3>
                      {getStatusBadge(webinar.status)}
                      {pendingCount > 0 && (
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs font-light">
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                    {webinar.description && (
                      <p className="text-sm text-muted-foreground font-light line-clamp-1 mb-3 max-w-2xl">
                        {webinar.description}
                      </p>
                    )}
                    <div className="flex items-center gap-5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(webinar.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {webinar.duration} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {approvedCount} / {webinar.max_participants}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" />
                        {factoryCount} factories
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        {buyerCount} buyers
                      </span>
                      {webinar.category && (
                        <Badge variant="outline" className="text-[10px] border-[#262626] text-muted-foreground font-light">
                          {getCategoryLabel(webinar.category)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 py-5 pr-5" onClick={(e) => e.stopPropagation()}>
                    {webinar.status === "live" && (
                      <Button
                        size="sm"
                        onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-light"
                      >
                        <Video className="mr-1.5 h-3.5 w-3.5" />
                        Join Room
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#141414] border-[#262626] text-white">
                        <DropdownMenuItem
                          onClick={() => setLocation(`/webinars/${webinar.id}`)}
                          className="focus:bg-white/5 cursor-pointer font-light"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {webinar.status === "live" && (
                          <DropdownMenuItem
                            onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                            className="focus:bg-white/5 cursor-pointer font-light"
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Enter Room
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-[#262626]" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(webinar.id)}
                          className="focus:bg-red-500/10 text-red-400 cursor-pointer font-light"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white">Webinars</h1>
              <p className="text-muted-foreground mt-1 font-light text-sm">
                Manage your online sourcing exhibitions and live events
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search webinars..."
                className="pl-10 bg-[#141414] border-[#262626] text-white focus:ring-violet-600 font-light"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-[#141414] border border-[#262626]">
              <TabsTrigger value="all" className="font-light data-[state=active]:bg-violet-600/10 data-[state=active]:text-violet-400">
                All ({filteredWebinars.length})
              </TabsTrigger>
              <TabsTrigger value="live" className="font-light data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">
                Live ({filterByStatus("live").length})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="font-light data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400">
                Scheduled ({filterByStatus("scheduled").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="font-light data-[state=active]:bg-green-500/10 data-[state=active]:text-green-400">
                Completed ({filterByStatus("completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">{renderWebinarList(filteredWebinars)}</TabsContent>
            <TabsContent value="live">{renderWebinarList(filterByStatus("live"))}</TabsContent>
            <TabsContent value="scheduled">{renderWebinarList(filterByStatus("scheduled"))}</TabsContent>
            <TabsContent value="completed">{renderWebinarList(filterByStatus("completed"))}</TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
