import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, Calendar, Clock, Users, Globe, Video, Circle,
  Play, Building2, MapPin, Shield, Star, Share2, Bookmark,
  TrendingUp, Award, CheckCircle2, ExternalLink, Download,
  MessageSquare, Eye, BarChart3
} from "lucide-react";
import { cn } from "../lib/utils";
import { trpc } from "../lib/trpc";
import DecisionMatrix from "../components/tactical/DecisionMatrix";

interface WebinarDetailProps {
  params: {
    id?: string;
  };
}

export default function WebinarDetail({ params }: WebinarDetailProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const webinarId = parseInt(params?.id || "0");
  
  // 使用真实的 tRPC 查询
  const { data: webinar, isLoading } = trpc.webinar.getById.useQuery(
    { id: webinarId },
    { enabled: !!webinarId }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
            <p className="text-muted-foreground font-light">Loading webinar details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <Video className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-light text-white mb-2">Webinar Not Found</h3>
              <p className="text-muted-foreground font-light">The webinar you're looking for doesn't exist or has been removed.</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/webinars")} className="border-[#262626]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Webinars
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      live: "bg-red-500/10 text-red-400 border-red-500/20",
      scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      completed: "bg-green-500/10 text-green-400 border-green-500/20",
      cancelled: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };
    return colors[status] || colors.draft;
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const exhibitingFactories = (webinar as any).exhibitingFactories || [];
  const participants = (webinar as any).participants || [];
  const approvedParticipants = participants.filter((p: any) => p.status === "accepted" || p.status === "joined");
  const factoryCount = exhibitingFactories.length;
  const buyerCount = approvedParticipants.filter((p: any) => !p.factoryId).length;
  const capacityPercentage = (approvedParticipants.length / webinar.maxParticipants) * 100;

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with Cover Image */}
          <div className="relative h-80 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-pink-600/20 border-b border-[#262626]">
            {webinar.coverImage && (
              <img 
                src={webinar.coverImage} 
                alt={webinar.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
            
            {/* Back Button */}
            <div className="absolute top-6 left-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/webinars")}
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>

            {/* Title and Status */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={cn("text-xs px-3 py-1", getStatusColor(webinar.status))}>
                    {webinar.status === "live" && <Circle className="h-2 w-2 fill-current mr-1.5 animate-pulse" />}
                    {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                  </Badge>
                  {webinar.category && (
                    <Badge variant="outline" className="text-xs px-3 py-1 border-white/20 text-white/80">
                      {webinar.category}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-light tracking-tight text-white mb-3">{webinar.title}</h1>
                <p className="text-lg text-white/70 font-light leading-relaxed max-w-3xl">
                  {webinar.description}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-6 gap-4 mb-8">
              <Card className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Date</div>
                      <div className="text-sm font-medium text-white">
                        {new Date(webinar.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Duration</div>
                      <div className="text-sm font-medium text-white">{webinar.duration} min</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Attendees</div>
                      <div className="text-sm font-medium text-white">{approvedParticipants.length}/{webinar.maxParticipants}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Factories</div>
                      <div className="text-sm font-medium text-white">{factoryCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Buyers</div>
                      <div className="text-sm font-medium text-white">{buyerCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626] hover:border-[#404040] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Views</div>
                      <div className="text-sm font-medium text-white">{webinar.viewCount || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            {webinar.status === "live" && (
              <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <Circle className="h-6 w-6 text-red-400 fill-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white mb-1">This webinar is live now!</h3>
                        <p className="text-sm text-white/70 font-light">Join {approvedParticipants.length} other participants</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DecisionMatrix />
                      <Button
                        onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                        size="lg"
                        className="bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg shadow-violet-600/20"
                      >
                        <Video className="mr-2 h-5 w-5" />
                        Join Webinar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {webinar.status === "scheduled" && (
              <Card className="bg-[#141414] border-[#262626] mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Registration Status</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span>{approvedParticipants.length} registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                          <span>{Math.round(capacityPercentage)}% capacity</span>
                        </div>
                      </div>
                      <Progress value={capacityPercentage} className="mt-3 h-2" />
                    </div>
                    <Button
                      size="lg"
                      className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
                    >
                      Register Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-[#141414] border border-[#262626] p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="factories" className="data-[state=active]:bg-violet-600">
                  Exhibiting Factories ({factoryCount})
                </TabsTrigger>
                <TabsTrigger value="participants" className="data-[state=active]:bg-violet-600">
                  Participants ({approvedParticipants.length})
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-violet-600">
                  Event Details
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    {/* About Section */}
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader>
                        <CardTitle className="text-xl font-light text-white">About This Webinar</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground font-light leading-relaxed">
                          {webinar.description}
                        </p>
                        {webinar.workSpec && (
                          <div className="pt-4 border-t border-[#262626]">
                            <h4 className="text-sm font-medium text-white mb-2">Work Specifications</h4>
                            <p className="text-sm text-muted-foreground font-light">{webinar.workSpec}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Top Factories Preview */}
                    {exhibitingFactories.length > 0 && (
                      <Card className="bg-[#141414] border-[#262626]">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-xl font-light text-white">Featured Factories</CardTitle>
                            <p className="text-sm text-muted-foreground font-light mt-1">
                              Top exhibitors at this event
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("factories")}
                            className="text-violet-400 hover:text-violet-300"
                          >
                            View All
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {exhibitingFactories.slice(0, 4).map((factory: any) => (
                              <div
                                key={factory.id}
                                className="group p-4 rounded-lg bg-[#0A0A0A] border border-[#262626] hover:border-violet-500/50 transition-all cursor-pointer"
                                onClick={() => setLocation(`/factories/${factory.id}`)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6 text-violet-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium text-white truncate">{factory.name}</p>
                                      {factory.status === "verified" && (
                                        <Shield className="h-3 w-3 text-green-400 flex-shrink-0" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate">{factory.city}, {factory.province}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                      <span className="text-xs font-medium text-white">{factory.overallScore || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Event Info */}
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-white uppercase tracking-wider">Event Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-violet-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground font-light mb-1">Date & Time</p>
                              <p className="text-sm text-white font-light">{formatDate(webinar.scheduledAt)}</p>
                            </div>
                          </div>
                          <Separator className="bg-[#262626]" />
                          <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground font-light mb-1">Duration</p>
                              <p className="text-sm text-white font-light">{webinar.duration} minutes</p>
                            </div>
                          </div>
                          <Separator className="bg-[#262626]" />
                          <div className="flex items-start gap-3">
                            <Globe className="h-4 w-4 text-cyan-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground font-light mb-1">Language</p>
                              <p className="text-sm text-white font-light">
                                {webinar.language === "en" ? "English" : webinar.language === "zh" ? "中文" : webinar.language}
                              </p>
                            </div>
                          </div>
                          <Separator className="bg-[#262626]" />
                          <div className="flex items-start gap-3">
                            <Shield className="h-4 w-4 text-green-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground font-light mb-1">Access Type</p>
                              <p className="text-sm text-white font-light">
                                {webinar.type === "webinar" ? "Public Webinar" : webinar.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-white uppercase tracking-wider">Engagement Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>Views</span>
                          </div>
                          <span className="text-sm font-medium text-white">{webinar.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Registered</span>
                          </div>
                          <span className="text-sm font-medium text-white">{participants.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Confirmed</span>
                          </div>
                          <span className="text-sm font-medium text-green-400">{approvedParticipants.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            <span>Capacity</span>
                          </div>
                          <span className="text-sm font-medium text-white">{Math.round(capacityPercentage)}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recording Info */}
                    {webinar.recordingEnabled && (
                      <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <Video className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white mb-1">Recording Available</p>
                              <p className="text-xs text-white/70 font-light">
                                This session will be recorded and available for replay
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Factories Tab */}
              <TabsContent value="factories">
                <Card className="bg-[#141414] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="text-xl font-light text-white">Exhibiting Factories</CardTitle>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      {factoryCount} {factoryCount === 1 ? 'factory is' : 'factories are'} participating in this webinar
                    </p>
                  </CardHeader>
                  <CardContent>
                    {exhibitingFactories.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center mx-auto mb-4">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Factories Yet</h3>
                        <p className="text-muted-foreground font-light">Factories will be listed here once they register for this webinar</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {exhibitingFactories.map((factory: any) => (
                          <div
                            key={factory.id}
                            className="group p-5 rounded-lg bg-[#0A0A0A] border border-[#262626] hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer"
                            onClick={() => setLocation(`/factories/${factory.id}`)}
                          >
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Building2 className="h-7 w-7 text-violet-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-medium text-white truncate">{factory.name}</h3>
                                  {factory.status === "verified" && (
                                    <Shield className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{factory.city}, {factory.province}</span>
                                </div>
                                {factory.category && (
                                  <Badge variant="outline" className="text-xs border-[#262626]">
                                    {factory.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <Separator className="bg-[#262626] mb-4" />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-medium text-white">{factory.overallScore || "N/A"}</span>
                                <span className="text-xs text-muted-foreground ml-1">rating</span>
                              </div>
                              {factory.employees && (
                                <div className="text-xs text-muted-foreground">
                                  {factory.employees} employees
                                </div>
                              )}
                            </div>

                            {factory.description && (
                              <p className="text-xs text-muted-foreground font-light mt-3 line-clamp-2">
                                {factory.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Participants Tab */}
              <TabsContent value="participants">
                <Card className="bg-[#141414] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="text-xl font-light text-white">Registered Participants</CardTitle>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      {approvedParticipants.length} confirmed participants
                    </p>
                  </CardHeader>
                  <CardContent>
                    {approvedParticipants.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Participants Yet</h3>
                        <p className="text-muted-foreground font-light">Be the first to register for this webinar</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {approvedParticipants.map((participant: any) => (
                          <div
                            key={participant.id}
                            className="p-4 rounded-lg bg-[#0A0A0A] border border-[#262626] hover:border-[#404040] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                <Users className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  Participant #{participant.id}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-[10px] border-[#262626] px-2 py-0">
                                    {participant.role}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {participant.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-[#141414] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-xl font-light text-white">Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                          <span className="text-sm text-muted-foreground">Webinar ID</span>
                          <span className="text-sm font-mono text-white">#{webinar.id}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                          <span className="text-sm text-muted-foreground">Channel Name</span>
                          <span className="text-xs font-mono text-white">{webinar.agoraChannelName || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                          <span className="text-sm text-muted-foreground">Recording</span>
                          <Badge variant={webinar.recordingEnabled ? "default" : "outline"} className="text-xs">
                            {webinar.recordingEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                          <span className="text-sm text-muted-foreground">Max Participants</span>
                          <span className="text-sm text-white">{webinar.maxParticipants}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">Created At</span>
                          <span className="text-sm text-white">
                            {new Date(webinar.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#141414] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-xl font-light text-white">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {webinar.tags && webinar.tags.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {webinar.tags.map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs border-[#262626]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {webinar.aiSummary && (
                        <div className="pt-4 border-t border-[#262626]">
                          <p className="text-sm text-muted-foreground mb-2">AI Summary</p>
                          <p className="text-sm text-white/80 font-light leading-relaxed">
                            {webinar.aiSummary}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
