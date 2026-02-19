import { useState, useEffect } from "react";
import { FactoryComparison } from "../components/FactoryComparison";
import { cn } from "../lib/utils";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
  LayoutGrid,
  LayoutList,
  GitCompare,
  X,
  SlidersHorizontal,
  Package,
  Users,
  Factory as FactoryIcon
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { mockFactories } from "../lib/mock-factory-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

type SortOption = "score-desc" | "score-asc" | "orders-desc" | "orders-asc" | "ontime-desc" | "years-desc" | "name-asc";
type ViewMode = "grid" | "list";

export default function FactoriesNew() {
  const [, setLocation] = useLocation();
  const [factories, setFactories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showGoldOnly, setShowGoldOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // 使用tRPC获取工厂数据
  const { data: factoriesData, isLoading, error } = trpc.factoryEnhanced.list.useQuery({ search: searchQuery });

  useEffect(() => {
    // 开发模式下直接使用 mock 数据
    console.log('Loading factory data...', { error, factoriesData });
    
    // 强制使用 mock 数据进行开发测试
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
  }, [factoriesData]);

  if (error) {
    toast.error("加载工厂数据失败");
  }

  // Get unique categories and locations
  const categories = Array.from(new Set(factories.map(f => f.category))).sort();
  const provinces = Array.from(new Set(factories.map(f => f.province))).filter(Boolean).sort();

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "from-yellow-400 to-orange-500";
    if (score >= 80) return "from-gray-300 to-gray-400";
    if (score >= 70) return "from-amber-600 to-amber-700";
    return "from-gray-500 to-gray-600";
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

  const filterFactories = () => {
    let filtered = factories;
    
    if (searchQuery) {
      filtered = filtered.filter((f) => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((f) => selectedCategories.includes(f.category));
    }
    
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((f) => selectedLocations.includes(f.province));
    }
    
    if (minScore > 0) {
      filtered = filtered.filter((f) => f.score >= minScore);
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter((f) => f.isVerified);
    }

    if (showGoldOnly) {
      filtered = filtered.filter((f) => f.isGoldMember);
    }
    
    return sortFactories(filtered);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setMinScore(0);
    setShowVerifiedOnly(false);
    setShowGoldOnly(false);
    setSearchQuery("");
    setSortBy("score-desc");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedLocations.length > 0 || minScore > 0 || searchQuery !== "" || showVerifiedOnly || showGoldOnly;

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

  const filteredFactories = filterFactories();

  // Factory Card Component
  const FactoryCard = ({ factory }: { factory: any }) => (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/30 h-full">
      <CardContent className="p-0">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
          {factory.images && factory.images.length > 0 ? (
            <img 
              src={factory.images[0]} 
              alt={factory.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FactoryIcon className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {factory.isGoldMember && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                <Award className="h-3 w-3 mr-1" />
                Gold Member
              </Badge>
            )}
            {factory.isVerified && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          {/* Score badge */}
          <div className="absolute top-3 right-3">
            <div className={cn(
              "px-4 py-2 rounded-xl bg-gradient-to-br shadow-lg backdrop-blur-sm",
              getScoreBadgeColor(factory.score),
              factory.score >= 80 ? "text-white" : "text-gray-900"
            )}>
              <div className="text-xs font-medium opacity-90">Score</div>
              <div className="text-2xl font-bold">{factory.score}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Logo and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white p-2 border border-border/50 shadow-sm flex-shrink-0">
              <img 
                src={factory.logo} 
                alt={factory.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate mb-1">
                {factory.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{factory.location}</span>
              </div>
              <Badge variant="outline" className="mt-2 bg-primary/5 text-primary border-primary/20">
                {factory.category}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Package className="h-4 w-4" />
                <span className="text-lg font-bold">{factory.orders}</span>
              </div>
              <div className="text-xs text-muted-foreground">Orders</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-lg font-bold">{factory.onTimeRate}%</span>
              </div>
              <div className="text-xs text-muted-foreground">On-Time</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-lg font-bold">{factory.yearsActive}y</span>
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>

          {/* Certifications */}
          {factory.certifications && factory.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {factory.certifications.slice(0, 2).map((cert: any, idx: number) => (
                <Badge 
                  key={idx}
                  variant="outline" 
                  className="bg-muted/30 text-xs"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {cert.name || cert.type}
                </Badge>
              ))}
              {factory.certifications.length > 2 && (
                <Badge variant="outline" className="bg-muted/30 text-xs">
                  +{factory.certifications.length - 2} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/factories/${factory.id}`)}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              variant={selectedForComparison.includes(factory.id) ? "secondary" : "outline"}
              size="icon"
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
            >
              <GitCompare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Factory List Item Component
  const FactoryListItem = ({ factory }: { factory: any }) => (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Left: Logo and Image */}
          <div className="flex flex-col gap-4 flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-white p-2 border border-border/50 shadow-sm">
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
            {factory.images && factory.images.length > 0 && (
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border/50">
                <img 
                  src={factory.images[0]} 
                  alt={factory.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Middle: Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                    {factory.name}
                  </h3>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {factory.category}
                  </Badge>
                  {factory.isVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
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
                "px-4 py-2 rounded-xl bg-gradient-to-br shadow-sm",
                getScoreBadgeColor(factory.score),
                factory.score >= 80 ? "text-white" : "text-gray-900"
              )}>
                <div className="text-xs font-medium opacity-90">Score</div>
                <div className="text-2xl font-bold">{factory.score}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-xl font-bold">{factory.orders}</span>
                </div>
                <div className="text-xs text-muted-foreground">Orders</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xl font-bold">{factory.onTimeRate}%</span>
                </div>
                <div className="text-xs text-muted-foreground">On-Time</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <div className="flex items-center justify-center gap-1.5 text-purple-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xl font-bold">{factory.yearsActive}y</span>
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center justify-center gap-1.5 text-orange-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xl font-bold">{factory.webinars}</span>
                </div>
                <div className="text-xs text-muted-foreground">Webinars</div>
              </div>
            </div>

            {factory.certifications && factory.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {factory.certifications.slice(0, 3).map((cert: any, idx: number) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="bg-muted/30"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {cert.name || cert.type}
                  </Badge>
                ))}
                {factory.certifications.length > 3 && (
                  <Badge variant="outline" className="bg-muted/30">
                    +{factory.certifications.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2 justify-center flex-shrink-0">
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
              className="gap-2"
            >
              <GitCompare className="h-3.5 w-3.5" />
              {selectedForComparison.includes(factory.id) ? "Selected" : "Compare"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Factory Directory
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Discover and connect with {factories.length}+ verified suppliers
              </p>
            </div>
            <div className="flex gap-3">
              {selectedForComparison.length > 0 && (
                <Button 
                  onClick={() => setShowComparison(true)}
                  disabled={selectedForComparison.length < 2}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare ({selectedForComparison.length})
                </Button>
              )}
              <Button onClick={() => toast.info("Add Factory feature coming soon")} className="gap-2 shadow-lg">
                <Plus className="h-4 w-4" />
                Add Factory
              </Button>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search factories by name, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base shadow-sm"
              />
            </div>

            <div className="flex gap-2 bg-[#111111] rounded-lg p-1 shadow-sm border border-[#1e1e1e]">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <LayoutList className="h-4 w-4" />
                List
              </Button>
            </div>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[220px] h-12 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score-desc">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Score: High to Low
                  </div>
                </SelectItem>
                <SelectItem value="score-asc">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Score: Low to High
                  </div>
                </SelectItem>
                <SelectItem value="orders-desc">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Orders: Most First
                  </div>
                </SelectItem>
                <SelectItem value="ontime-desc">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    On-Time Rate: Highest
                  </div>
                </SelectItem>
                <SelectItem value="years-desc">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Experience: Most Years
                  </div>
                </SelectItem>
                <SelectItem value="name-asc">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Name: A to Z
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
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
              {showVerifiedOnly && (
                <Badge variant="secondary" className="gap-1">
                  Verified Only
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setShowVerifiedOnly(false)} />
                </Badge>
              )}
              {showGoldOnly && (
                <Badge variant="secondary" className="gap-1">
                  Gold Members
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setShowGoldOnly(false)} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <Card className="w-72 h-fit sticky top-8 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                    Clear
                  </Button>
                )}
              </div>

              <Separator className="mb-4" />

              {/* Quick Filters */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="verified" 
                    checked={showVerifiedOnly}
                    onCheckedChange={(checked) => setShowVerifiedOnly(checked as boolean)}
                  />
                  <Label htmlFor="verified" className="text-sm cursor-pointer flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Verified Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="gold" 
                    checked={showGoldOnly}
                    onCheckedChange={(checked) => setShowGoldOnly(checked as boolean)}
                  />
                  <Label htmlFor="gold" className="text-sm cursor-pointer flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Gold Members
                  </Label>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Category Filter */}
              <div className="mb-6">
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

              <Separator className="mb-4" />

              {/* Location Filter */}
              <div className="mb-6">
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

              <Separator className="mb-4" />

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
            </CardContent>
          </Card>

          {/* Factory List */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredFactories.length}</span> factories
              </p>
            </div>

            {isLoading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-96 bg-muted/10" />
                  </Card>
                ))}
              </div>
            ) : filteredFactories.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
                <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No factories found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredFactories.map((factory) => (
                  viewMode === "grid" ? (
                    <FactoryCard key={factory.id} factory={factory} />
                  ) : (
                    <FactoryListItem key={factory.id} factory={factory} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </DashboardLayout>
  );
}
