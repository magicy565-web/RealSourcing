import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import RestrictedContent, { UserRole, hasPermission } from "../components/RestrictedContent";
import InviteWebinarDialog from "../components/InviteWebinarDialog";
import RegisterWebinarDialog from "../components/RegisterWebinarDialog";
import VideoPlayerDialog from "../components/VideoPlayerDialog";
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
  Clock,
  Video,
  FileText,
  Play,
  Download,
  Image as ImageIcon,
  Eye,
  Zap
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { cn } from "../lib/utils";
import ScoreRadarChart from "../components/ScoreRadarChart";
import AIAnalysisCard from "../components/AIAnalysisCard";
import { ImageLightbox } from "../components/ImageLightbox";
import { trpc } from "../lib/trpc";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import { mockFactories } from "../lib/mock-factory-data";

// Mock 数据
const mockUpcomingWebinars = [
  {
    id: 1,
    title: "2024 New Product Launch - Smart Manufacturing Solutions",
    description: "Join us for an exclusive preview of our latest smart manufacturing products and automation systems.",
    date: "2024-03-15",
    time: "14:00 UTC",
    duration: "60 min",
    agenda: ["Product Demo", "Live Q&A", "Special Offers for Attendees"],
    participants: 45,
    maxParticipants: 100,
    registered: false,
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    featured: true
  },
  {
    id: 2,
    title: "Manufacturing Excellence Workshop",
    description: "Learn about our quality control processes and industry-leading standards.",
    date: "2024-03-22",
    time: "10:00 UTC",
    duration: "45 min",
    agenda: ["Quality Control Overview", "Case Studies", "Q&A"],
    participants: 32,
    maxParticipants: 80,
    registered: false,
    thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
    featured: false
  },
  {
    id: 3,
    title: "Q&A Session with CEO",
    description: "Direct conversation with our CEO about company vision and partnerships.",
    date: "2024-03-28",
    time: "16:00 UTC",
    duration: "30 min",
    agenda: ["Company Vision", "Partnership Opportunities", "Open Q&A"],
    participants: 28,
    maxParticipants: 50,
    registered: true,
    thumbnail: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800",
    featured: false
  }
];

const mockPastWebinars = [
  {
    id: 4,
    title: "2023 Annual Review & Future Plans",
    date: "2024-01-15",
    duration: "45 min",
    participants: 67,
    views: 234,
    replayUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
    requiredRole: "buyer" as UserRole
  },
  {
    id: 5,
    title: "Sustainability Initiatives Deep Dive",
    date: "2024-02-10",
    duration: "38 min",
    participants: 52,
    views: 189,
    replayUrl: "https://www.w3schools.com/html/movie.mp4",
    thumbnail: "https://images.unsplash.com/photo-1558769132-cb1aea3c8e5e?w=800",
    requiredRole: "buyer" as UserRole
  },
  {
    id: 6,
    title: "Advanced Production Techniques",
    date: "2024-02-25",
    duration: "52 min",
    participants: 41,
    views: 156,
    replayUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800",
    requiredRole: "verified_buyer" as UserRole
  }
];

const mockGalleryImages = [
  { id: 1, url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800", category: "factory", title: "Factory Exterior", requiredRole: "guest" as UserRole },
  { id: 2, url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800", category: "production", title: "Production Line 1", requiredRole: "verified_buyer" as UserRole },
  { id: 3, url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800", category: "production", title: "Assembly Area", requiredRole: "verified_buyer" as UserRole },
  { id: 4, url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800", category: "products", title: "Product Showcase", requiredRole: "buyer" as UserRole },
  { id: 5, url: "https://images.unsplash.com/photo-1558769132-cb1aea3c8e5e?w=800", category: "factory", title: "Warehouse", requiredRole: "guest" as UserRole },
  { id: 6, url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800", category: "products", title: "Quality Control Lab", requiredRole: "verified_buyer" as UserRole },
];

const mockVideos = [
  {
    id: 1,
    title: "Company Introduction",
    description: "Overview of our company history and capabilities",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400",
    duration: "3:45",
    requiredRole: "buyer" as UserRole
  },
  {
    id: 2,
    title: "Production Process Deep Dive",
    description: "Detailed walkthrough of our manufacturing process",
    url: "https://www.w3schools.com/html/movie.mp4",
    thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400",
    duration: "8:30",
    requiredRole: "verified_buyer" as UserRole
  },
  {
    id: 3,
    title: "Quality Assurance Standards",
    description: "How we maintain industry-leading quality",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400",
    duration: "5:20",
    requiredRole: "verified_buyer" as UserRole
  }
];

const mockDocuments = [
  { id: 1, name: "Company Profile 2024", type: "PDF", size: "2.5 MB", url: "#", requiredRole: "buyer" as UserRole },
  { id: 2, name: "Product Catalog", type: "PDF", size: "5.8 MB", url: "#", requiredRole: "buyer" as UserRole },
  { id: 3, name: "Contract Template", type: "DOCX", size: "1.2 MB", url: "#", requiredRole: "verified_buyer" as UserRole },
  { id: 4, name: "Sample Agreement", type: "PDF", size: "3.1 MB", url: "#", requiredRole: "verified_buyer" as UserRole },
  { id: 5, name: "Quality Certificates", type: "PDF", size: "4.2 MB", url: "#", requiredRole: "verified_buyer" as UserRole }
];

export default function FactoryDetailWebinarCentric() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/factories/:id");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<any>(null);
  
  // 角色切换器（开发工具）
  const [mockUserRole, setMockUserRole] = useState<UserRole>("guest");

  const factoryId = parseInt(params?.id || "0");
  
  // 使用 tRPC 获取真实工厂详情
  const { data: factoryData, isLoading, error } = trpc.factory.getById.useQuery(
    { id: factoryId },
    { enabled: !!factoryId }
  );

  // Fallback to mock data if tRPC fails or returns no data
  const factory = factoryData || mockFactories.find(f => f.id === factoryId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!factory) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Factory not found</h2>
            <Button onClick={() => setLocation("/factories")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Factories
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const certifications = Array.isArray(factory.certifications)
    ? factory.certifications.map((c: any) => typeof c === 'string' ? c : c.name || c.type)
    : [];

  const featuredWebinar = mockUpcomingWebinars.find(w => w.featured);

  const filteredImages = selectedCategory === "all"
    ? mockGalleryImages
    : mockGalleryImages.filter(img => img.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* 角色切换器（开发工具） */}
        <div className="fixed top-4 right-4 z-50 bg-background border rounded-lg p-3 shadow-lg">
          <Label className="text-xs text-muted-foreground mb-2 block">Dev Tool: User Role</Label>
          <Select value={mockUserRole} onValueChange={(value) => setMockUserRole(value as UserRole)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guest">Guest (未认证)</SelectItem>
              <SelectItem value="buyer">Buyer (普通买家)</SelectItem>
              <SelectItem value="verified_buyer">Verified Buyer (认证买家)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/factories")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Factories
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                {factory.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{factory.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{factory.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{factory.employees} Employees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{factory.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {factory.isVerified && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified Supplier
                    </Badge>
                  )}
                  {factory.isGoldMember && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Star className="h-3 w-3 mr-1" />
                      Gold Member
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    <Video className="h-3 w-3 mr-1" />
                    {mockUpcomingWebinars.length} Active Webinars
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Invite to Webinar
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{factory.score}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{mockUpcomingWebinars.length + mockPastWebinars.length}</div>
              <div className="text-sm text-muted-foreground">Total Webinars</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{factory.totalOrders || 0}</div>
              <div className="text-sm text-muted-foreground">Completed Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">{certifications.length}</div>
              <div className="text-sm text-muted-foreground">Certifications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{factory.onTimeRate || 0}%</div>
              <div className="text-sm text-muted-foreground">On-Time Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Webinar */}
        {featuredWebinar && (
          <Card className="mb-8 border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative w-64 h-40 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={featuredWebinar.thumbnail} alt={featuredWebinar.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white">Featured</Badge>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{featuredWebinar.title}</h3>
                  <p className="text-muted-foreground mb-4">{featuredWebinar.description}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredWebinar.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{featuredWebinar.time} ({featuredWebinar.duration})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{featuredWebinar.participants}/{featuredWebinar.maxParticipants} registered</span>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => {
                      setSelectedWebinar(featuredWebinar);
                      setRegisterDialogOpen(true);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Register Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="webinars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="webinars">Webinars</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Webinars Tab */}
          <TabsContent value="webinars" className="space-y-6">
            {/* Upcoming Webinars */}
            <div>
              <h3 className="text-xl font-bold mb-4">Upcoming Webinars</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockUpcomingWebinars.map((webinar) => (
                  <Card key={webinar.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <img src={webinar.thumbnail} alt={webinar.title} className="w-full h-full object-cover rounded-t-lg" />
                        {webinar.registered && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500 text-white">Registered</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2">{webinar.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{webinar.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>{webinar.date}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{webinar.time}</span>
                        </div>
                        <Button 
                          className="w-full" 
                          variant={webinar.registered ? "outline" : "default"}
                          onClick={() => {
                            setSelectedWebinar(webinar);
                            setRegisterDialogOpen(true);
                          }}
                        >
                          {webinar.registered ? "View Details" : "Register"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Past Webinars */}
            <div>
              <h3 className="text-xl font-bold mb-4">Past Webinars (Replays)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPastWebinars.map((webinar) => (
                  <RestrictedContent
                    key={webinar.id}
                    requiredRole={webinar.requiredRole}
                    currentRole={mockUserRole}
                    blurContent={true}
                    showOverlay={true}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative h-40">
                          <img src={webinar.thumbnail} alt={webinar.title} className="w-full h-full object-cover rounded-t-lg" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Button size="icon" variant="secondary" className="rounded-full">
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-2">{webinar.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{webinar.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{webinar.views} views</span>
                            </div>
                          </div>
                          <Button className="w-full" variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Watch Replay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </RestrictedContent>
                ))}
              </div>
            </div>

            {/* 1:1 Private Sessions */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Request 1:1 Private Webinar</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule a personalized session to discuss your specific requirements and get direct answers from the factory team.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Customized product demonstrations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Direct Q&A with factory experts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Flexible scheduling to fit your timezone</span>
                      </li>
                    </ul>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Private Session
                    </Button>
                  </div>
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl">
                    <Video className="h-16 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Company Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {factory.description || "A leading manufacturer with years of experience in the industry, committed to delivering high-quality products and exceptional service to clients worldwide."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <a href="#" className="text-blue-600 hover:underline">www.{factory.name.toLowerCase().replace(/\s+/g, '')}.com</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>+86 123 4567 8900</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>contact@{factory.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {certifications.length > 0 ? (
                        certifications.map((cert: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {cert}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No certifications listed</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <ScoreRadarChart
                  data={{
                    quality: factory.qualityScore || 85,
                    delivery: factory.deliveryScore || 90,
                    service: factory.serviceScore || 88,
                    price: factory.priceScore || 82,
                    innovation: factory.innovationScore || 87
                  }}
                />

                <AIAnalysisCard
                  analysis={{
                    strengths: [
                      "High-quality manufacturing standards",
                      "Excellent on-time delivery record",
                      "Strong customer service"
                    ],
                    concerns: [
                      "Limited product range",
                      "Higher pricing compared to competitors"
                    ],
                    recommendation: "Recommended for buyers prioritizing quality and reliability over cost."
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Factory Gallery</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Images</SelectItem>
                  <SelectItem value="factory">Factory</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <RestrictedContent
                  key={image.id}
                  requiredRole={image.requiredRole}
                  currentRole={mockUserRole}
                  blurContent={true}
                  showOverlay={true}
                >
                  <div 
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      if (hasPermission(image.requiredRole, mockUserRole)) {
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }
                    }}
                  >
                    <img src={image.url} alt={image.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </RestrictedContent>
              ))}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <h3 className="text-xl font-bold">Factory Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockVideos.map((video) => (
                <RestrictedContent
                  key={video.id}
                  requiredRole={video.requiredRole}
                  currentRole={mockUserRole}
                  blurContent={true}
                  showOverlay={true}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                    if (hasPermission(video.requiredRole, mockUserRole)) {
                      setSelectedVideo(video);
                    }
                  }}>
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover rounded-t-lg" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Button size="icon" variant="secondary" className="rounded-full">
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-1">{video.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </RestrictedContent>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <h3 className="text-xl font-bold">Factory Documents</h3>
            <div className="space-y-2">
              {mockDocuments.map((doc) => (
                <RestrictedContent
                  key={doc.id}
                  requiredRole={doc.requiredRole}
                  currentRole={mockUserRole}
                  blurContent={false}
                  showOverlay={true}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </RestrictedContent>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs - 在 DashboardLayout 内但主 div 外 */}
      <InviteWebinarDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        factoryName={factory.name}
      />

      <RegisterWebinarDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        webinar={selectedWebinar}
      />

      <VideoPlayerDialog
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      <ImageLightbox
        images={filteredImages.filter(img => hasPermission(img.requiredRole, mockUserRole)).map(img => img.url)}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        defaultIndex={lightboxIndex}
      />
    </DashboardLayout>
  );
}
