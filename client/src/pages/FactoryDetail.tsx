import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Shield,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  Award,
  MessageSquare,
  Heart,
  Share2,
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { mockStore } from "../lib/mock-data";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import ScoreRadarChart from "../components/ScoreRadarChart";
import AIAnalysisCard from "../components/AIAnalysisCard";
import { ImageLightbox } from "../components/ImageLightbox";

const defaultFactoryData = {
  id: 1,
  name: "Shenzhen Electronics Co.",
  location: "Shenzhen, Guangdong, China",
  category: "Electronics & Smart Home",
  score: 92,
  status: "verified",
  established: "2015",
  employees: "200-500",
  annualRevenue: "$5M - $10M",
  website: "www.szelectronics.cn",
  phone: "+86 755 8888 9999",
  email: "sales@szelectronics.cn",
  images: [] as string[],
  certifications: ["ISO 9001", "ISO 14001", "CE", "FCC", "RoHS"],
  specialties: ["LED Controllers", "Smart Switches", "IoT Sensors", "Power Adapters"],
  scoreBreakdown: {
    quality: 95,
    delivery: 90,
    communication: 88,
    pricing: 93,
    compliance: 91,
  },
  webinarHistory: [
    { id: 1, title: "Smart Home Products Showcase", date: "2026-02-10", status: "live", role: "Presenter" },
    { id: 2, title: "IoT Devices Q4 2025", date: "2025-12-15", status: "completed", role: "Presenter" },
    { id: 3, title: "LED Lighting Solutions", date: "2025-10-20", status: "completed", role: "Participant" },
  ],
  orders: [
    { id: 1, product: "Smart LED Controller v3", quantity: 2000, value: "$9,000", date: "2026-01-15", status: "shipped" },
    { id: 2, product: "WiFi Smart Switch", quantity: 5000, value: "$17,500", date: "2025-11-20", status: "delivered" },
    { id: 3, product: "IoT Temperature Sensor", quantity: 3000, value: "$6,000", date: "2025-09-10", status: "delivered" },
  ],
  aiSummary: "Shenzhen Electronics Co. is a highly reliable supplier with consistent quality metrics across 15+ orders. Their LED controller line shows strong innovation with 3 new SKUs in the past quarter. Production capacity is currently at 70% utilization, suggesting room for larger orders. Key strength: competitive pricing with above-average quality. Risk factor: single-source dependency on Broadcom chips for IoT products.",
  aiStrengths: [
    "Competitive pricing with above-average quality",
    "Strong innovation in LED controller line",
    "70% capacity utilization (room for growth)",
  ],
  aiRisks: [
    "Single-source chip dependency (Broadcom)",
    "Limited international shipping experience",
    "No UL certification for US market",
  ],
  aiRecommendations: [
    "Suitable for medium-batch orders (1,000-5,000 units)",
    "Recommend 60-day lead time for custom orders",
    "Consider for customized product development",
  ],
};

export default function FactoryDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/factories/:id");
  const [factoryData, setFactoryData] = useState(defaultFactoryData);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (params?.id) {
      const factory = mockStore.getFactoryById(parseInt(params.id));
      if (factory) {
        setFactoryData({
          ...defaultFactoryData,
          id: factory.id,
          name: factory.name,
          location: factory.location,
          category: factory.category,
          score: factory.score,
          logo: factory.logo,
          images: factory.images || [],
          phone: factory.contact_phone,
          email: factory.contact_email,
          employees: `${factory.employee_count}`,
          established: factory.year_established.toString(),
          certifications: factory.certifications.split(", "),
        });
      }
    }
  }, [params?.id]);

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
                {factoryData.logo ? (
                  <img
                    src={factoryData.logo}
                    alt={factoryData.name}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-background shadow-xl flex-shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-orange-500/10 flex items-center justify-center border-4 border-background shadow-xl flex-shrink-0">
                    <Building2 className="h-16 w-16 text-orange-400" />
                  </div>
                )}
                
                <div className="flex-1 mt-16">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{factoryData.name}</h1>
                        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {factoryData.location}
                        </span>
                        <span>·</span>
                        <span>{factoryData.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Est. {factoryData.established}
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
                  getScoreBgColor(factoryData.score)
                )}>
                  <Star className={cn("h-6 w-6", getScoreColor(factoryData.score))} />
                </div>
                <p className={cn("text-3xl font-bold", getScoreColor(factoryData.score))}>
                  {factoryData.score}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                <p className="text-3xl font-bold">{factoryData.webinarHistory.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Webinars</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-400" />
                <p className="text-3xl font-bold">{factoryData.orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                <p className="text-3xl font-bold">{factoryData.certifications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Certifications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
                <p className="text-3xl font-bold">95%</p>
                <p className="text-xs text-muted-foreground mt-1">On-Time Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scores">Scores</TabsTrigger>
                <TabsTrigger value="history">Webinars</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                {/* Image Gallery */}
                {factoryData.images && factoryData.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Factory & Products</CardTitle>
                      <CardDescription>Browse through our facilities and product showcase</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={cn(
                        "grid gap-4",
                        factoryData.images.length === 1 ? "grid-cols-1" :
                        factoryData.images.length === 2 ? "grid-cols-2" :
                        "grid-cols-2"
                      )}>
                        {factoryData.images.map((img, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "relative rounded-xl overflow-hidden border-2 border-muted-foreground/20",
                              "hover:scale-[1.02] hover:shadow-2xl hover:border-primary/50",
                              "transition-all duration-300 cursor-pointer group",
                              factoryData.images.length === 1 ? "h-96" : "h-64"
                            )}
                            onClick={() => {
                              setLightboxIndex(idx);
                              setLightboxOpen(true);
                            }}
                          >
                            <img
                              src={img}
                              alt={`Factory image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Click to enlarge
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> Employees
                        </span>
                        <span className="text-sm font-medium">{factoryData.employees}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Annual Revenue
                        </span>
                        <span className="text-sm font-medium">{factoryData.annualRevenue}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreRadarChart scores={factoryData.scoreBreakdown} showIndustryAverage={true} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications & Specialties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {factoryData.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Product Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {factoryData.specialties.map((spec) => (
                          <Badge key={spec} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Score Breakdown */}
              <TabsContent value="scores">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Score Breakdown</CardTitle>
                    <CardDescription>
                      Detailed scoring across key performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScoreRadarChart scores={factoryData.scoreBreakdown} showIndustryAverage={true} />
                    
                    <div className="mt-8 space-y-4">
                      {Object.entries(factoryData.scoreBreakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full",
                                  value >= 90 ? "bg-green-400" : value >= 80 ? "bg-blue-400" : "bg-yellow-400"
                                )}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className={cn("text-sm font-bold w-8 text-right", getScoreColor(value))}>
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Webinar History */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Webinar Participation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {factoryData.webinarHistory.map((webinar) => (
                        <div
                          key={webinar.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{webinar.title}</p>
                              <p className="text-xs text-muted-foreground">{webinar.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{webinar.role}</Badge>
                            <Badge
                              variant={webinar.status === "live" ? "default" : "secondary"}
                            >
                              {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Order History */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {factoryData.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{order.product}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.quantity} units · {order.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">{order.value}</span>
                            <Badge
                              variant={order.status === "shipped" ? "default" : "secondary"}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analysis */}
              <TabsContent value="ai">
                <AIAnalysisCard
                  summary={factoryData.aiSummary}
                  strengths={factoryData.aiStrengths}
                  risks={factoryData.aiRisks}
                  recommendations={factoryData.aiRecommendations}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Contact & Quick Actions */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </div>
                    <p className="text-sm font-medium">{factoryData.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1">Copy</Button>
                      <Button size="sm" className="flex-1">Send</Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </div>
                    <p className="text-sm font-medium">{factoryData.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1">Copy</Button>
                      <Button size="sm" className="flex-1">Call</Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Globe className="h-3 w-3" />
                      Website
                    </div>
                    <p className="text-sm font-medium">{factoryData.website}</p>
                    <Button size="sm" variant="outline" className="w-full mt-2">Visit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
              </CardContent>
            </Card>

            {/* Similar Factories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Factories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <p className="text-sm font-medium">Guangzhou Smart Home Ltd.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">88 Score</Badge>
                    <span className="text-xs text-muted-foreground">Smart Home</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <p className="text-sm font-medium">Dongguan Manufacturing</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">85 Score</Badge>
                    <span className="text-xs text-muted-foreground">Electronics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && factoryData.images && factoryData.images.length > 0 && (
        <ImageLightbox
          images={factoryData.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
