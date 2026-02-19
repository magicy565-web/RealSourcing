import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import RestrictedContent, { UserRole, hasPermission } from "../components/RestrictedContent";
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
  Send,
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
  const { data: factory, isLoading, error } = trpc.factory.getById.useQuery(
    { id: factoryId },
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

  const filteredImages = selectedCategory === "all" 
    ? mockGalleryImages 
    : mockGalleryImages.filter(img => img.category === selectedCategory);

  const handleInviteWebinar = () => {
    if (mockUserRole === "guest") {
      toast.error("Please login to invite factory to webinar");
      return;
    }
    setInviteDialogOpen(true);
  };

  const handleSubmitInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Webinar invitation sent successfully!");
    setInviteDialogOpen(false);
  };

  const handleRegisterWebinar = (webinar: any) => {
    if (mockUserRole === "guest") {
      toast.error("Please login to register for webinar");
      return;
    }
    setSelectedWebinar(webinar);
    setRegisterDialogOpen(true);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Successfully registered for "${selectedWebinar?.title}"!`);
    setRegisterDialogOpen(false);
  };

  const handleWatchReplay = (webinar: any) => {
    if (!hasPermission(webinar.requiredRole, mockUserRole)) {
      if (mockUserRole === "guest") {
        toast.error("Please login to watch webinar replays");
      } else {
        toast.error("This replay is restricted to verified buyers");
      }
      return;
    }
    setSelectedVideo({ ...webinar, url: webinar.replayUrl });
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

  const featuredWebinar = mockUpcomingWebinars.find(w => w.featured);

  return (
    <>
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
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {mockUserRole === "verified_buyer" && (
                          <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Shield className="h-3 w-3 mr-1" />
                            You're a Verified Buyer
                          </Badge>
                        )}
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
                      <Button size="lg" onClick={handleInviteWebinar}>
                        <Send className="h-4 w-4 mr-2" />
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

        {/* Featured Webinar */}
        {featuredWebinar && (
          <Card className="mb-8 overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-0">
              <div className="flex items-stretch">
                {/* Thumbnail */}
                <div className="relative w-1/3 min-h-[240px]">
                  <img 
                    src={featuredWebinar.thumbnail} 
                    alt={featuredWebinar.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white border-0">
                      <Zap className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{featuredWebinar.title}</h3>
                      <p className="text-muted-foreground mb-4">{featuredWebinar.description}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">{featuredWebinar.date}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium">{featuredWebinar.time}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">{featuredWebinar.participants}/{featuredWebinar.maxParticipants} registered</span>
                        </span>
                      </div>
                    </div>
                    <Button size="lg" onClick={() => handleRegisterWebinar(featuredWebinar)} className="ml-4">
                      Register Now
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Agenda:</p>
                    <div className="flex gap-2">
                      {featuredWebinar.agenda.map((item, idx) => (
                        <Badge key={idx} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Content - 继续在下一部分 */}
      </div>
    </DashboardLayout>
  );
}

        {/* Tabs Content */}
        <Tabs defaultValue="webinars" className="space-y-6">
          <TabsList className="bg-background border">
            <TabsTrigger value="webinars">
              <Video className="h-4 w-4 mr-2" />
              Webinars
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Play className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            {mockUserRole !== "guest" && (
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            )}
          </TabsList>

          {/* Webinars Tab */}
          <TabsContent value="webinars" className="space-y-6">
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming Webinars</TabsTrigger>
                <TabsTrigger value="past">Past Webinars</TabsTrigger>
                {mockUserRole !== "guest" && (
                  <TabsTrigger value="private">1:1 Private Sessions</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  {mockUpcomingWebinars.map((webinar) => (
                    <Card key={webinar.id} className={cn(webinar.featured && "border-primary/50")}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-6">
                          <img 
                            src={webinar.thumbnail} 
                            alt={webinar.title}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold mb-2">{webinar.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4">{webinar.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {webinar.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {webinar.time} ({webinar.duration})
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {webinar.participants}/{webinar.maxParticipants} registered
                                  </span>
                                </div>
                              </div>
                              {webinar.registered ? (
                                <Badge variant="outline" className="text-green-500 border-green-500/30">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Registered
                                </Badge>
                              ) : (
                                <Button onClick={() => handleRegisterWebinar(webinar)}>
                                  Register Now
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-2 mt-4">
                              {webinar.agenda.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="past" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPastWebinars.map((webinar) => (
                    <Card key={webinar.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <RestrictedContent
                          requiredRole={webinar.requiredRole}
                          currentRole={mockUserRole}
                          blurContent={true}
                          showOverlay={true}
                          onAction={() => {
                            if (mockUserRole === "guest") {
                              toast.info("Please login to watch replays");
                            } else {
                              toast.info("Apply for verification to access this content");
                            }
                          }}
                        >
                          <img 
                            src={webinar.thumbnail} 
                            alt={webinar.title}
                            className="w-full h-full object-cover"
                          />
                        </RestrictedContent>
                        {hasPermission(webinar.requiredRole, mockUserRole) && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => handleWatchReplay(webinar)}
                          >
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="h-8 w-8 text-primary ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">{webinar.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {webinar.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {webinar.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {webinar.views} views
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {mockUserRole !== "guest" && (
                <TabsContent value="private" className="mt-6">
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Send className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Request 1:1 Private Webinar</h3>
                        <p className="text-sm text-muted-foreground">
                          Schedule a private webinar session with this factory to discuss your specific requirements.
                        </p>
                        <Button size="lg" onClick={handleInviteWebinar}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                      </div>
                    </CardContent>
                    </Card>
                  </TabsContent>
              )}
            </Tabs>
          </TabsContent>
          
          {/* Overview Tab */}
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
                        <RestrictedContent
                          requiredRole="buyer"
                          currentRole={mockUserRole}
                          blurContent={false}
                          showOverlay={false}
                        >
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
                        </RestrictedContent>
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
                      scores={{
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
          
          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Factory Gallery</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedCategory === "all" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={selectedCategory === "factory" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory("factory")}
                    >
                      Factory
                    </Button>
                    <Button 
                      variant={selectedCategory === "production" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory("production")}
                    >
                      Production
                    </Button>
                    <Button 
                      variant={selectedCategory === "products" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory("products")}
                    >
                      Products
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {filteredImages.map((image, index) => (
                    <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden">
                      <RestrictedContent
                        requiredRole={image.requiredRole}
                        currentRole={mockUserRole}
                        blurContent={true}
                        showOverlay={true}
                        onAction={() => {
                          if (mockUserRole === "guest") {
                            toast.info("Please login to view full gallery");
                          } else {
                            toast.info("Apply for verification to access production line photos");
                          }
                        }}
                      >
                        <div 
                          className="cursor-pointer group"
                          onClick={() => {
                            if (hasPermission(image.requiredRole, mockUserRole)) {
                              setLightboxIndex(index);
                              setLightboxOpen(true);
                            }
                          }}
                        >
                          <img 
                            src={image.url} 
                            alt={image.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <p className="text-white text-sm font-medium">{image.title}</p>
                          </div>
                        </div>
                      </RestrictedContent>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-6">Factory Videos</h3>
                <div className="grid grid-cols-3 gap-6">
                  {mockVideos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <RestrictedContent
                          requiredRole={video.requiredRole}
                          currentRole={mockUserRole}
                          blurContent={true}
                          showOverlay={true}
                          onAction={() => {
                            if (mockUserRole === "guest") {
                              toast.info("Please login to watch videos");
                            } else {
                              toast.info("Apply for verification to access production videos");
                            }
                          }}
                        >
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          {hasPermission(video.requiredRole, mockUserRole) && (
                            <div 
                              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
                              onClick={() => setSelectedVideo(video)}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="h-8 w-8 text-primary ml-1" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                            {video.duration}
                          </div>
                        </RestrictedContent>
                      </div>
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-1">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">{video.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          {mockUserRole !== "guest" && (
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-6">Documents & Resources</h3>
                  <div className="space-y-3">
                    {mockDocuments.map((doc) => (
                      <div key={doc.id}>
                        {hasPermission(doc.requiredRole, mockUserRole) ? (
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-primary/10">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{doc.name}</h4>
                                <p className="text-sm text-muted-foreground">{doc.type} · {doc.size}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-muted">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-medium text-muted-foreground">{doc.name}</h4>
                                <p className="text-sm text-muted-foreground">{doc.type} · {doc.size}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified Buyer Only
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {mockUserRole === "buyer" && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        Some documents are restricted to verified buyers.
                      </p>
                      <Button size="sm" variant="outline">
                        Apply for Verification
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Invite to Webinar Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite {factory.name} to 1:1 Webinar</DialogTitle>
            <DialogDescription>
              Send a personalized invitation to schedule a private webinar session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitInvitation}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Product Inquiry for Q2 2024" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred-date">Preferred Date</Label>
                <Input id="preferred-date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred-time">Preferred Time</Label>
                <Input id="preferred-time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your requirements and topics you'd like to discuss..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register for Webinar Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register for Webinar</DialogTitle>
            <DialogDescription>
              {selectedWebinar?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRegistration}>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedWebinar?.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedWebinar?.time}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendee-name">Your Name</Label>
                <Input id="attendee-name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendee-email">Email</Label>
                <Input id="attendee-email" type="email" placeholder="john@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="questions">Questions or Topics (Optional)</Label>
                <Textarea 
                  id="questions" 
                  placeholder="Any specific topics or questions you'd like to discuss?"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Registration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedVideo.title}</DialogTitle>
              {selectedVideo.description && (
                <DialogDescription>{selectedVideo.description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="aspect-video">
              <video 
                src={selectedVideo.url} 
                controls 
                autoPlay
                className="w-full h-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={filteredImages.filter(img => hasPermission(img.requiredRole, mockUserRole)).map(img => img.url)}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        defaultIndex={lightboxIndex}
      />
      </div>
    </DashboardLayout>
    </>
  );
}
