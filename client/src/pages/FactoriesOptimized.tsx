import { useState, useEffect } from "react";
import { FactoryComparison } from "../components/FactoryComparison";
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
  Image as ImageIcon,
  ArrowUpDown,
  Filter,
  X,
  GitCompare,
  Users
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { mockFactories } from "../lib/mock-factory-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

type SortOption = "score-desc" | "score-asc" | "orders-desc" | "orders-asc" | "ontime-desc" | "years-desc" | "name-asc";

export default function FactoriesOptimized() {
  const [, setLocation] = useLocation();
  const [factories, setFactories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // 使用tRPC获取工厂数据
  const { data: factoriesData, isLoading, error } = trpc.factory.list.useQuery({ search: searchQuery });

  useEffect(() => {
    // 开发模式下优先使用 mock 数据
    const USE_MOCK_DATA = true;
    
    if (USE_MOCK_DATA || error || !factoriesData || factoriesData.length === 0) {
      console.log('Using mock factory data');
      const formattedMockFactories = mockFactories.map((f: any) => ({
        ...f,
        orderCount: f.orders,
        overallScore: f.score,
      }));
      setFactories(formattedMockFactories);
      return;
    }

    if (factoriesData) {
      const formattedFactories = factoriesData.map((f: any) => ({
        id: f.id,
        name: f.name,
        location: `${f.city}, ${f.province}`,
        province: f.province,
        score: parseFloat(f.overallScore) || 0,
        category: f.category || "Uncategorized",
        webinars: f.webinarCount || 0,
        orders: f.orderCount || 0,
        status: f.status,
        employees: f.employees || "N/A",
        logo: f.logo || "/logos/default.png",
        images: f.images || [],
        certifications: f.certifications || [],
        onTimeRate: f.onTimeRate || 95,
        yearsActive: f.established ? new Date().getFullYear() - f.established : 0,
        isGoldMember: parseFloat(f.overallScore) >= 92,
        isVerified: f.status === "verified",
      }));
      setFactories(formattedFactories);
    }
  }, [factoriesData, error]);

  // 初始化时立即加载 Mock 数据
  useEffect(() => {
    const formattedMockFactories = mockFactories.map((f: any) => ({
      ...f,
      orderCount: f.orders,
      overallScore: f.score,
    }));
    setFactories(formattedMockFactories);
  }, []);

  if (error) {
    console.error("加载工厂数据失败", error);
  }

  // Get unique categories and locations
  const categories = Array.from(new Set(factories.map(f => f.category))).sort();
  const provinces = Array.from(new Set(factories.map(f => f.province))).filter(Boolean).sort();

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 90) return "bg-gradient-to-br from-yellow-400 to-orange-500 text-white";
    if (score >= 80) return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900";
    if (score >= 70) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
    return "bg-gradient-to-br from-gray-500 to-gray-600 text-white";
  };

  const sortFactories = (factoriesToSort: any[]) => {
    const sorted = [...factoriesToSort];
    switch (sortBy) {
      case "score-desc":
        return sorted.sort((a, b) => b.score - a.score);
      case "score-asc":
        return sorted.sort((a, b) => a.score - b.score);
      case "orders-desc":
        return sorted.sort((a, b) => b.orders - a.orders);
      case "orders-asc":
        return sorted.sort((a, b) => a.orders - b.orders);
      case "ontime-desc":
        return sorted.sort((a, b) => b.onTimeRate - a.onTimeRate);
      case "years-desc":
        return sorted.sort((a, b) => b.yearsActive - a.yearsActive);
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const filterFactories = (status: string) => {
    let filtered = factories;
    
    // Status filter (from tabs)
    if (status === "verified") {
      filtered = filtered.filter((f) => f.isVerified);
    } else if (status === "new") {
      filtered = filtered.filter((f) => f.status === "new");
    } else if (status === "gold") {
      filtered = filtered.filter((f) => f.isGoldMember);
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((f) => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter (multi-select)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((f) => selectedCategories.includes(f.category));
    }
    
    // Location filter (multi-select)
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((f) => selectedLocations.includes(f.province));
    }
    
    // Score filter
    if (minScore > 0) {
      filtered = filtered.filter((f) => f.score >= minScore);
    }
    
    return sortFactories(filtered);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setMinScore(0);
    setSearchQuery("");
    setSortBy("score-desc");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedLocations.length > 0 || minScore > 0 || searchQuery !== "";

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "score-desc": return "Score: High to Low";
      case "score-asc": return "Score: Low to High";
      case "orders-desc": return "Orders: Most First";
      case "orders-asc": return "Orders: Least First";
      case "ontime-desc": return "On-Time Rate: Highest";
      case "years-desc": return "Experience: Most Years";
      case "name-asc": return "Name: A to Z";
      default: return "Sort By";
    }
  };

  const renderImageGallery = (images: string[]) => {
    if (!images || images.length === 0) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="w-20 h-20 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-muted-foreground/10 flex items-center justify-center"
            >
              <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
            </div>
          ))}
        </div>
      );
    }

    const displayImages = images.slice(0, 4);
    return (
      <div className={cn(
        "grid gap-2",
        displayImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
      )}>
        {displayImages.map((img, idx) => (
          <div 
            key={idx}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 bg-muted/20 group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-primary/50"
          >
            <img 
              src={img} 
              alt={`Factory ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Factories</h1>
            <p className="text-muted-foreground mt-1">
              Discover and connect with verified suppliers for your sourcing needs
            </p>
          </div>
          <div className="flex gap-2">
            {selectedForComparison.length > 0 && (
              <Button 
                onClick={() => setShowComparison(true)}
                disabled={selectedForComparison.length < 2}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <GitCompare className="h-4 w-4" />
                Compare ({selectedForComparison.length})
              </Button>
            )}
            <Button onClick={() => toast.info("Add Factory feature coming soon")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Factory
            </Button>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search factories by name, location, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px]">
                <ArrowUpDown className="h-4 w-4" />
                {getSortLabel(sortBy)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("score-desc")}>
                <Star className="h-4 w-4 mr-2" />
                Score: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("score-asc")}>
                <Star className="h-4 w-4 mr-2" />
                Score: Low to High
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("orders-desc")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Orders: Most First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("ontime-desc")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                On-Time Rate: Highest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("years-desc")}>
                <Calendar className="h-4 w-4 mr-2" />
                Experience: Most Years
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Name: A to Z
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1 h-5 min-w-5 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="mt-4 border-dashed bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Advanced Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Category</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer flex-1">
                          {category}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {factories.filter(f => f.category === category).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Location</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {provinces.map(province => (
                      <div key={province} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`loc-${province}`}
                          checked={selectedLocations.includes(province)}
                          onCheckedChange={() => toggleLocation(province)}
                        />
                        <Label htmlFor={`loc-${province}`} className="text-sm cursor-pointer flex-1">
                          {province}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {factories.filter(f => f.province === province).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Minimum Score: {minScore}</h4>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active:</span>
                    {selectedCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="gap-1">
                        {cat}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                      </Badge>
                    ))}
                    {selectedLocations.map(loc => (
                      <Badge key={loc} variant="secondary" className="gap-1">
                        {loc}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleLocation(loc)} />
                      </Badge>
                    ))}
                    {minScore > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        Score ≥ {minScore}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setMinScore(0)} />
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="px-6">All Factories</TabsTrigger>
          <TabsTrigger value="verified" className="px-6">Verified Only</TabsTrigger>
          <TabsTrigger value="gold" className="px-6">Gold Members</TabsTrigger>
          <TabsTrigger value="new" className="px-6">New Suppliers</TabsTrigger>
        </TabsList>

        {["all", "verified", "gold", "new"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-40 bg-muted/10" />
                  </Card>
                ))}
              </div>
            ) : filterFactories(status).length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No factories found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              filterFactories(status).map((factory) => (
                <Card key={factory.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Left: Logo + Image Gallery + Compare Button */}
                      <div className="flex flex-col gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-white p-2 border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                            <img 
                              src={factory.logo} 
                              alt={factory.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {factory.isGoldMember && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-1.5 rounded-full shadow-lg">
                              <Award className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        {renderImageGallery(factory.images)}
                        <Button 
                          variant={selectedForComparison.includes(factory.id) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedForComparison.includes(factory.id)) {
                              setSelectedForComparison(selectedForComparison.filter(id => id !== factory.id));
                            } else {
                              if (selectedForComparison.length >= 4) {
                                toast.error("You can compare up to 4 factories");
                                return;
                              }
                              setSelectedForComparison([...selectedForComparison, factory.id]);
                            }
                          }}
                          className="w-full gap-2"
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                          {selectedForComparison.includes(factory.id) ? "Selected" : "Compare"}
                        </Button>
                      </div>

                      {/* Middle: Factory Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                                {factory.name}
                              </h3>
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                                {factory.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {factory.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {factory.employees} Employees
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-center shadow-sm",
                            getScoreBadgeStyle(factory.score)
                          )}>
                            <div className="text-xs font-medium opacity-90">Score</div>
                            <div className="text-2xl font-bold">{factory.score}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4">
                          {factory.isVerified && (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5 px-3 py-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Verified Supplier
                            </Badge>
                          )}
                          {factory.webinars > 0 && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 gap-1.5 px-3 py-1">
                              <ImageIcon className="h-3.5 w-3.5" />
                              {factory.webinars} Active Webinars
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {factory.certifications && factory.certifications.slice(0, 3).map((cert: any, idx: number) => (
                            <Badge 
                              key={idx}
                              variant="outline" 
                              className="bg-muted/30 gap-1.5 px-3 py-1"
                            >
                              <Shield className="h-3 w-3" />
                              {cert.name || cert.type}
                            </Badge>
                          ))}
                          {factory.certifications && factory.certifications.length > 3 && (
                            <Badge variant="outline" className="bg-muted/30 px-3 py-1">
                              +{factory.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-2xl font-bold">{factory.orders}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Orders</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-2xl font-bold">{factory.onTimeRate}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">On-Time</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                            <div className="flex items-center justify-center gap-1.5 text-purple-600 mb-1">
                              <Calendar className="h-4 w-4" />
                              <span className="text-2xl font-bold">{factory.yearsActive}y</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Active</div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex flex-col gap-2 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setLocation(`/factories/${factory.id}`)}
                          className="whitespace-nowrap"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => toast.success(`Contact request sent to ${factory.name}`)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 whitespace-nowrap"
                        >
                          Contact
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {showComparison && (
        <FactoryComparison
          factories={factories.filter(f => selectedForComparison.includes(f.id))}
          onRemove={(id) => {
            setSelectedForComparison(selectedForComparison.filter(fid => fid !== id));
            if (selectedForComparison.length <= 2) {
              setShowComparison(false);
            }
          }}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
