import { mockStore } from "../lib/mock-data";
import { useEffect, useState } from "react";
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
  GitCompare
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type SortOption = "score-desc" | "score-asc" | "orders-desc" | "orders-asc" | "ontime-desc" | "years-desc" | "name-asc";

export default function Factories() {
  const [, setLocation] = useLocation();
  const [factories, setFactories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

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

  // Get unique categories and locations
  const categories = ["all", ...Array.from(new Set(factories.map(f => f.category)))];
  const locations = ["all", ...Array.from(new Set(factories.map(f => f.location.split(",")[1]?.trim() || f.location)))];

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
    
    // Status filter
    if (status !== "all") {
      filtered = filtered.filter((f) => f.status === status);
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((f) => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((f) => f.category === selectedCategory);
    }
    
    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((f) => f.location.includes(selectedLocation));
    }
    
    // Score filter
    if (minScore > 0) {
      filtered = filtered.filter((f) => f.score >= minScore);
    }
    
    // Sort
    return sortFactories(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedLocation("all");
    setMinScore(0);
    setSearchQuery("");
    setSortBy("score-desc");
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedLocation !== "all" || minScore > 0 || searchQuery !== "";

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
              className="w-24 h-24 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-muted-foreground/10 flex items-center justify-center"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
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
            className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50 bg-muted/20 group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-primary/50"
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
      {/* Header */}
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

        {/* Search and Filters Bar */}
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

          {/* Sort Dropdown */}
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
              <DropdownMenuItem onClick={() => setSortBy("orders-asc")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Orders: Least First
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("ontime-desc")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                On-Time Rate: Highest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("years-desc")}>
                <Calendar className="h-4 w-4 mr-2" />
                Experience: Most Years
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                <Building2 className="h-4 w-4 mr-2" />
                Name: A to Z
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Toggle */}
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 min-w-5">
                {[selectedCategory !== "all", selectedLocation !== "all", minScore > 0, searchQuery !== ""].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="mt-4 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc === "all" ? "All Locations" : loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Score Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Score</label>
                  <Select value={minScore.toString()} onValueChange={(v) => setMinScore(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Score</SelectItem>
                      <SelectItem value="70">70+</SelectItem>
                      <SelectItem value="80">80+</SelectItem>
                      <SelectItem value="90">90+</SelectItem>
                      <SelectItem value="95">95+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
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

        {["all", "verified", "pending", "suspended"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterFactories(status).length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">No factories found</p>
                  <p className="text-sm">Try adjusting your filters or search query</p>
                </div>
              </Card>
            ) : (
              filterFactories(status).map((factory) => (
                <Card 
                  key={factory.id} 
                  className={cn(
                    "overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border-border/50",
                    selectedForComparison.includes(factory.id) && "ring-2 ring-purple-500"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Comparison Checkbox */}
                      <div className="flex-shrink-0 flex items-start pt-2">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(factory.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selectedForComparison.length >= 4) {
                                toast.error("You can compare up to 4 factories at once");
                                return;
                              }
                              setSelectedForComparison([...selectedForComparison, factory.id]);
                            } else {
                              setSelectedForComparison(selectedForComparison.filter(id => id !== factory.id));
                            }
                          }}
                          className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>
                      {/* Image Gallery */}
                      <div className="flex-shrink-0">
                        {renderImageGallery(factory.images)}
                      </div>

                      {/* Factory Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold mb-1 truncate">{factory.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{factory.location}</span>
                              <span className="text-muted-foreground/50">•</span>
                              <span>{factory.category}</span>
                            </div>
                          </div>
                          
                          {/* Score Badge */}
                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-lg ring-2 ring-white/20",
                            getScoreBadgeStyle(factory.score)
                          )}>
                            <Star className="h-5 w-5 fill-current" />
                            {factory.score}
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {factory.status === "verified" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified Supplier
                            </Badge>
                          )}
                          {factory.status === "pending" && (
                            <Badge variant="secondary" className="gap-1">
                              <Calendar className="h-3 w-3" />
                              Pending Review
                            </Badge>
                          )}
                          {factory.isGoldMember && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 gap-1">
                              <Award className="h-3 w-3" />
                              Gold Member
                            </Badge>
                          )}
                        </div>

                        {/* Certifications */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {factory.certifications.map((cert: string, idx: number) => (
                            <Badge 
                              key={idx}
                              variant="outline" 
                              className="bg-muted/30 gap-1.5 px-3 py-1"
                            >
                              <Shield className="h-3 w-3" />
                              {cert}
                            </Badge>
                          ))}
                        </div>

                        {/* Key Metrics */}
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

                      {/* Action Buttons */}
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

      {/* Factory Comparison Modal */}
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
