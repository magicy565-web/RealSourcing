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
  Plus, 
  Building2,
  Shield,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Award,
  Image as ImageIcon
} from "lucide-react";
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
      images: f.images || [],
      certifications: f.certifications.split(", ").slice(0, 3),
      onTimeRate: Math.floor(Math.random() * 10) + 90,
      yearsActive: new Date().getFullYear() - f.year_established,
      isGoldMember: f.score >= 92,
    }));
    setFactories(factoriesData);
  }, []);

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 90) return "bg-gradient-to-br from-yellow-400 to-orange-500 text-white";
    if (score >= 80) return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900";
    if (score >= 70) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
    return "bg-gradient-to-br from-gray-500 to-gray-600 text-white";
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

  const renderImageGallery = (images: string[]) => {
    if (!images || images.length === 0) {
      // Default placeholder images
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="w-24 h-24 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-muted-foreground/10 flex items-center justify-center"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          ))}
        </div>
      );
    }

    // Render actual images
    const displayImages = images.slice(0, 4);
    return (
      <div className={cn(
        "grid gap-2",
        displayImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
      )}>
        {displayImages.map((img, idx) => (
          <div 
            key={idx}
            className={cn(
              "rounded-lg overflow-hidden border border-muted-foreground/20",
              "hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer",
              displayImages.length === 1 ? "w-48 h-48" : "w-24 h-24"
            )}
            onClick={(e) => {
              e.stopPropagation();
              toast("Image preview coming soon");
            }}
          >
            <img 
              src={img} 
              alt={`Factory ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
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
              "group relative overflow-hidden border-muted-foreground/10",
              "hover:border-primary/30 hover:shadow-xl hover:shadow-black/30",
              "transition-all duration-200 cursor-pointer hover:-translate-y-1",
              "bg-card/50 backdrop-blur-sm"
            )}
            onClick={() => setLocation(`/factories/${factory.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Left: Image Gallery */}
                <div className="flex-shrink-0 p-3 rounded-xl bg-muted/20 border border-muted-foreground/10">
                  {renderImageGallery(factory.images)}
                </div>

                {/* Middle: Info */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Name, Location & Score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors truncate">
                        {factory.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {factory.location}
                        </span>
                        <span>•</span>
                        <span>{factory.category}</span>
                      </div>
                    </div>
                    
                    {/* Score Badge */}
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg flex-shrink-0",
                      getScoreBadgeStyle(factory.score)
                    )}>
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold text-base">{factory.score}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {factory.status === "verified" && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified Supplier
                      </Badge>
                    )}
                    {factory.status === "pending" && (
                      <Badge variant="secondary">
                        Pending Review
                      </Badge>
                    )}
                    {factory.isGoldMember && (
                      <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
                        <Award className="h-3 w-3 mr-1" />
                        Gold Member
                      </Badge>
                    )}
                  </div>
                  
                  {/* Certifications */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {factory.certifications.map((cert: string) => (
                      <div 
                        key={cert} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-muted-foreground/20 text-sm"
                      >
                        <Shield className="h-3.5 w-3.5 text-blue-400" />
                        <span className="font-medium">{cert}</span>
                      </div>
                    ))}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-muted-foreground/10">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xl font-bold">{factory.orders}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Orders</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-muted-foreground/10">
                      <div className="flex items-center gap-1.5 text-green-400 mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xl font-bold">{factory.onTimeRate}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">On-Time</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-muted-foreground/10">
                      <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xl font-bold">{factory.yearsActive}y</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="min-w-[120px]"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setLocation(`/factories/${factory.id}`); 
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    className="min-w-[120px] bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toast("Feature coming soon"); 
                    }}
                  >
                    Contact
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
          <Button onClick={() => toast("Feature coming soon")} size="lg" className="bg-gradient-to-r from-primary to-orange-600">
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
