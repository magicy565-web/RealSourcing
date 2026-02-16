import DashboardLayout from "../components/DashboardLayout";
import { mockStore } from "../lib/mock-data";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  MoreHorizontal, 
  Plus, 
  Building2,
  Users,
  CheckCircle2,
  Shield,
  Award,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Factories() {
  const [, setLocation] = useLocation();
  const [factories, setFactories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const factoriesData = mockStore.getFactories().map(f => ({
      id: f.id,
      name: f.name,
      location: f.location,
      score: f.score,
      category: f.category,
      webinars: Math.floor(Math.random() * 8) + 2,
      orders: Math.floor(Math.random() * 25) + 5,
      status: f.score >= 90 ? "verified" : f.score >= 80 ? "verified" : "pending",
      employees: `${f.employee_count}`,
      logo: f.logo,
      certifications: f.certifications.split(", ").slice(0, 3),
      onTimeRate: Math.floor(Math.random() * 10) + 90,
      yearsActive: new Date().getFullYear() - f.year_established,
      scoreBreakdown: {
        quality: Math.floor(Math.random() * 10) + 90,
        delivery: Math.floor(Math.random() * 10) + 85,
        communication: Math.floor(Math.random() * 10) + 80,
      }
    }));
    setFactories(factoriesData);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgGradient = (score: number) => {
    if (score >= 90) return "bg-gradient-to-r from-green-500/30 via-green-500/10 to-transparent";
    if (score >= 80) return "bg-gradient-to-r from-blue-500/30 via-blue-500/10 to-transparent";
    if (score >= 70) return "bg-gradient-to-r from-yellow-500/30 via-yellow-500/10 to-transparent";
    return "bg-gradient-to-r from-red-500/30 via-red-500/10 to-transparent";
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 90) return "bg-gradient-to-br from-green-500 to-emerald-600";
    if (score >= 80) return "bg-gradient-to-br from-blue-500 to-cyan-600";
    if (score >= 70) return "bg-gradient-to-br from-yellow-500 to-orange-500";
    return "bg-gradient-to-br from-red-500 to-rose-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">✓ Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="backdrop-blur-sm">⏳ Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 backdrop-blur-sm">⚠ Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterFactories = (status: string) => {
    let filtered = factories;
    if (status !== "all") {
      filtered = filtered.filter((f) => f.status === status);
    }
    if (searchQuery) {
      filtered = filtered.filter((f) => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const renderFactoryList = (items: typeof factories) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No factories found</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {items.map((factory) => (
          <Card 
            key={factory.id} 
            className={cn(
              "group relative overflow-hidden border-muted-foreground/10 shadow-lg shadow-black/20",
              "hover:border-muted-foreground/30 hover:shadow-2xl hover:shadow-black/50",
              "transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-[1.01]"
            )}
            onClick={() => setLocation(`/factories/${factory.id}`)}
          >
            {/* Score Gradient Banner */}
            <div className={cn("absolute top-0 left-0 right-0 h-2", getScoreBgGradient(factory.score))} />
            
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Left: Logo */}
                <div className="relative flex-shrink-0">
                  {factory.logo ? (
                    <img
                      src={factory.logo}
                      alt={factory.name}
                      className="w-16 h-16 rounded-lg object-cover border border-muted-foreground/20 group-hover:border-muted-foreground/40 transition-colors"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center border border-muted-foreground/20 group-hover:border-orange-500/40 transition-colors">
                      <Building2 className="h-8 w-8 text-orange-400" />
                    </div>
                  )}
                  {/* Score Badge Overlay */}
                  <div className={cn(
                    "absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-xl ring-2 ring-background",
                    getScoreBadgeBg(factory.score)
                  )}>
                    {factory.score}
                  </div>
                </div>

                {/* Middle: Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name & Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                      {factory.name}
                    </h3>
                    {getStatusBadge(factory.status)}
                  </div>
                  
                  {/* Location & Category */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {factory.location}
                    </span>
                    <span>•</span>
                    <span>{factory.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {factory.employees} employees
                    </span>
                  </div>
                  
                  {/* Certifications */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {factory.certifications.map((cert: string) => (
                      <Badge 
                        key={cert} 
                        variant="outline" 
                        className="text-xs bg-muted/30 border-muted-foreground/20 backdrop-blur-sm"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">{factory.webinars}</div>
                        <div className="text-xs text-muted-foreground">Webinars</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <div className="font-bold">{factory.orders}</div>
                        <div className="text-xs text-muted-foreground">Orders</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                        <Award className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-bold">{factory.onTimeRate}%</div>
                        <div className="text-xs text-muted-foreground">On-Time</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-bold">{factory.yearsActive}y</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Mini Bars */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Quality</span>
                        <span className={getScoreColor(factory.scoreBreakdown.quality)}>{factory.scoreBreakdown.quality}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            factory.scoreBreakdown.quality >= 90 ? "bg-green-400" : "bg-blue-400"
                          )}
                          style={{ width: `${factory.scoreBreakdown.quality}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className={getScoreColor(factory.scoreBreakdown.delivery)}>{factory.scoreBreakdown.delivery}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            factory.scoreBreakdown.delivery >= 90 ? "bg-green-400" : "bg-blue-400"
                          )}
                          style={{ width: `${factory.scoreBreakdown.delivery}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Communication</span>
                        <span className={getScoreColor(factory.scoreBreakdown.communication)}>{factory.scoreBreakdown.communication}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            factory.scoreBreakdown.communication >= 90 ? "bg-green-400" : "bg-blue-400"
                          )}
                          style={{ width: `${factory.scoreBreakdown.communication}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/factories/${factory.id}`); }}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                        Invite to Webinar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                        Add to Favorites
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    size="sm" 
                    className="mt-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toast("Feature coming soon"); 
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Invite
                  </Button>
                </div>
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
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Factories
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover and connect with verified suppliers for your sourcing needs
            </p>
          </div>
          <Button onClick={() => toast("Feature coming soon")} size="lg" className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="mr-2 h-4 w-4" />
            Add Factory
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search factories by name, location, or category..." 
              className="pl-10 bg-muted/30 border-muted-foreground/20 focus:border-primary/50" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/30 border border-muted-foreground/10">
            <TabsTrigger value="all">
              All ({filterFactories("all").length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({filterFactories("verified").length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterFactories("pending").length})
            </TabsTrigger>
            <TabsTrigger value="suspended">
              Suspended ({filterFactories("suspended").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderFactoryList(filterFactories("all"))}</TabsContent>
          <TabsContent value="verified">{renderFactoryList(filterFactories("verified"))}</TabsContent>
          <TabsContent value="pending">{renderFactoryList(filterFactories("pending"))}</TabsContent>
          <TabsContent value="suspended">{renderFactoryList(filterFactories("suspended"))}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
