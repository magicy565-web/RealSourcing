import DashboardLayout from "../components/DashboardLayout";
import { mockStore } from "../lib/mock-data";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
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
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Progress } from "../components/ui/progress";

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
        pricing: Math.floor(Math.random() * 10) + 85,
        compliance: Math.floor(Math.random() * 10) + 88,
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

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10 border-green-500/30";
    if (score >= 80) return "bg-blue-500/10 border-blue-500/30";
    if (score >= 70) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-500/20 to-transparent";
    if (score >= 80) return "from-blue-500/20 to-transparent";
    if (score >= 70) return "from-yellow-500/20 to-transparent";
    return "from-red-500/20 to-transparent";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
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
      <div className="grid gap-6">
        {items.map((factory) => (
          <Card 
            key={factory.id} 
            className={cn(
              "group hover:border-muted-foreground/30 transition-all cursor-pointer overflow-hidden",
              "hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1"
            )}
            onClick={() => setLocation(`/factories/${factory.id}`)}
          >
            {/* Score Gradient Banner */}
            <div className={cn("h-2 bg-gradient-to-r", getScoreGradient(factory.score))} />
            
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Company Logo */}
                  {factory.logo ? (
                    <img
                      src={factory.logo}
                      alt={factory.name}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-[#262626] flex-shrink-0 group-hover:border-muted-foreground/30 transition-colors"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-orange-500/10 flex items-center justify-center border-2 border-[#262626] flex-shrink-0 group-hover:border-orange-500/30 transition-colors">
                      <Building2 className="h-9 w-9 text-orange-400" />
                    </div>
                  )}
                  
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Factory Name & Status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold hover:text-primary transition-colors truncate">
                        {factory.name}
                      </h3>
                      {getStatusBadge(factory.status)}
                    </div>
                    
                    {/* Location & Category */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {factory.location}
                      </span>
                      <span>·</span>
                      <span>{factory.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {factory.employees} employees
                      </span>
                    </div>
                    
                    {/* Certifications */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {factory.certifications.map((cert: string) => (
                        <Badge 
                          key={cert} 
                          variant="secondary" 
                          className="text-xs flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center border-2",
                    getScoreBgColor(factory.score)
                  )}>
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getScoreColor(factory.score))}>
                        {factory.score}
                      </div>
                    </div>
                  </div>
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
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold">{factory.webinars}</div>
                  <div className="text-xs text-muted-foreground">Webinars</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xl font-bold">{factory.orders}</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold">{factory.onTimeRate}%</div>
                  <div className="text-xs text-muted-foreground">On-Time</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="text-xl font-bold">{factory.yearsActive}y</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Quality</span>
                  <span className={getScoreColor(factory.scoreBreakdown.quality)}>{factory.scoreBreakdown.quality}</span>
                </div>
                <Progress value={factory.scoreBreakdown.quality} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={getScoreColor(factory.scoreBreakdown.delivery)}>{factory.scoreBreakdown.delivery}</span>
                </div>
                <Progress value={factory.scoreBreakdown.delivery} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Communication</span>
                  <span className={getScoreColor(factory.scoreBreakdown.communication)}>{factory.scoreBreakdown.communication}</span>
                </div>
                <Progress value={factory.scoreBreakdown.communication} className="h-1.5" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="flex-1"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setLocation(`/factories/${factory.id}`); 
                  }}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toast("Feature coming soon"); 
                  }}
                >
                  Invite to Webinar
                </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Factories</h1>
            <p className="text-muted-foreground mt-2">
              Discover and connect with verified suppliers for your sourcing needs
            </p>
          </div>
          <Button onClick={() => toast("Feature coming soon")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Factory
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search factories by name, location, or category..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
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
