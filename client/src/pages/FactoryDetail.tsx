import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Heart,
  Share2,
  Globe,
  Phone,
  Mail,
  Award,
  Shield,
  Clock
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import ScoreRadarChart from "../components/ScoreRadarChart";
import AIAnalysisCard from "../components/AIAnalysisCard";
import { ImageLightbox } from "../components/ImageLightbox";
import { trpc } from "../lib/trpc";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import FactoryProductCard from "../components/FactoryProductCard";

export default function FactoryDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/factories/:id");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const factoryId = parseInt(params?.id || "0");
  
  // 使用 tRPC 获取真实工厂详情
  const { data: factory, isLoading, error } = trpc.factory.getById.useQuery(
    { id: factoryId },
    { enabled: !!factoryId }
  );

  // 获取工厂产品列表
  const { data: products, isLoading: productsLoading } = trpc.product.listByFactory.useQuery(
    { factoryId, includeViralScore: true },
    { enabled: !!factoryId }
  );

  if (error) {
    toast.error("加载工厂详情失败");
  }

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!factory) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Factory not found</h2>
          <Button onClick={() => setLocation("/factories")} className="mt-4">
            Back to Factories
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const score = parseFloat(factory.overallScore) || 0;
  const certifications = Array.isArray(factory.certifications) 
    ? factory.certifications.map((c: any) => typeof c === 'string' ? c : c.name || c.type)
    : [];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/factories")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Factories
          </Button>
          
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20" />
            <CardContent className="relative -mt-16 pb-6">
              <div className="flex items-start gap-6">
                {/* Company Logo */}
                <div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center border-4 border-background shadow-xl flex-shrink-0 overflow-hidden">
                  {factory.logo ? (
                    <img
                      src={factory.logo}
                      alt={factory.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 mt-16">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{factory.name}</h1>
                        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {factory.city}, {factory.province}
                        </span>
                        <span>·</span>
                        <span>{factory.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Est. {factory.established}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="lg">
                        Invite to Webinar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center border-2 mx-auto mb-3",
                  getScoreBgColor(score)
                )}>
                  <Star className={cn("h-6 w-6", getScoreColor(score))} />
                </div>
                <p className={cn("text-3xl font-bold", getScoreColor(score))}>
                  {score.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                <p className="text-3xl font-bold">{factory.webinarCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Webinars</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-400" />
                <p className="text-3xl font-bold">{factory.orderCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                <p className="text-3xl font-bold">{certifications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Certifications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
                <p className="text-3xl font-bold">{factory.onTimeRate || 95}%</p>
                <p className="text-xs text-muted-foreground mt-1">On-Time Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="history">Webinar History</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">About the Company</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {factory.description || "No description available for this factory."}
                    </p>
                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Employees</p>
                            <p className="text-sm font-medium">{factory.employees || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Globe className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Website</p>
                            <p className="text-sm font-medium">{factory.website || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{factory.contactEmail || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium">{factory.contactPhone || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {certifications.length > 0 ? certifications.map((cert: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1 gap-1.5">
                          <Shield className="h-3 w-3 text-green-500" />
                          {cert}
                        </Badge>
                      )) : (
                        <p className="text-sm text-muted-foreground">No certifications listed.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Score Analysis</h3>
                    <ScoreRadarChart 
                      data={{
                        quality: 90,
                        delivery: 85,
                        communication: 88,
                        pricing: 82,
                        compliance: 92
                      }} 
                    />
                  </CardContent>
                </Card>
                
                <AIAnalysisCard 
                  summary="AI assessment based on historical performance and verification data."
                  strengths={["High quality consistency", "Verified certifications", "Strong webinar presence"]}
                  risks={["Limited public financial data", "Capacity utilization not disclosed"]}
                  recommendations={["Suitable for high-quality requirements", "Request current capacity report"]}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products">
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">产品目录</h3>
                    <p className="text-sm text-muted-foreground">
                      共 {products.length} 个产品，已集成 AI 爆款评分
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    AI 智能评分
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product: any) => (
                    <FactoryProductCard
                      key={product.id}
                      product={product}
                      onClick={() => {
                        toast.info(`产品详情页面开发中: ${product.name}`);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">该工厂暂无产品信息</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
             <Card>
               <CardContent className="pt-12 pb-12 text-center">
                 <p className="text-muted-foreground">Webinar history loading...</p>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="compliance">
             <Card>
               <CardContent className="pt-12 pb-12 text-center">
                 <p className="text-muted-foreground">Compliance documents and audit reports.</p>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {factory.images && factory.images.length > 0 && (
        <ImageLightbox
          images={factory.images}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          defaultIndex={lightboxIndex}
        />
      )}
    </DashboardLayout>
  );
}
