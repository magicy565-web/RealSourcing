import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  Video,
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
} from "lucide-react";
import { format } from "date-fns";

export default function WebinarDetailEnhanced() {
  const [, params] = useRoute("/webinars/:id");
  const [, setLocation] = useLocation();
  const webinarId = parseInt(params?.id || "0");

  const { data: webinar, isLoading } = trpc.webinar.getById.useQuery(
    { id: webinarId },
    { enabled: !!webinarId }
  );

  // 获取AI推荐
  const { data: recommendations } = trpc.ai.getRecommendations.useQuery(
    { webinarId, limit: 5 },
    { enabled: !!webinarId }
  );

  // 获取Webinar报告
  const { data: report } = trpc.ai.getWebinarReport.useQuery(
    { webinarId },
    { enabled: !!webinarId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading webinar details...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Webinar Not Found</h2>
          <Button onClick={() => setLocation("/webinars")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Webinars
          </Button>
        </div>
      </div>
    );
  }

  const scheduledDate = webinar.scheduledAt ? new Date(webinar.scheduledAt) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section with Banner */}
      <div className="relative h-96 overflow-hidden">
        {webinar.bannerImage || webinar.coverImage ? (
          <img
            src={webinar.bannerImage || webinar.coverImage || ""}
            alt={webinar.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
        
        {/* Back Button */}
        <Button
          onClick={() => setLocation("/webinars")}
          variant="ghost"
          className="absolute top-6 left-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {webinar.category || "General"}
              </Badge>
              <Badge variant="secondary" className={
                webinar.status === 'live' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                webinar.status === 'scheduled' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                'bg-gray-500/20 text-gray-300 border-gray-500/30'
              }>
                {webinar.status?.toUpperCase()}
              </Badge>
              {webinar.level && (
                <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                  {webinar.level}
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {webinar.title}
            </h1>
            
            {webinar.subtitle && (
              <p className="text-xl text-gray-300 mb-4">{webinar.subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              {scheduledDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(scheduledDate, "MMM d, yyyy, h:mm a")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{webinar.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{webinar.registrationCount || 0} registered</span>
              </div>
              {webinar.speaker && (
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <span>{webinar.speaker}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">About This Webinar</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>{webinar.description}</p>
                
                {webinar.highlights && webinar.highlights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Key Highlights
                    </h3>
                    <ul className="space-y-2">
                      {webinar.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {webinar.learningOutcomes && webinar.learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-400" />
                      What You'll Learn
                    </h3>
                    <ul className="space-y-2">
                      {webinar.learningOutcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Award className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="factories" className="w-full">
              <TabsList className="bg-gray-900/50 border border-gray-800">
                <TabsTrigger value="factories">
                  Exhibiting Factories ({webinar.exhibitingFactories?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="speaker">Speaker</TabsTrigger>
                {report && (
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                )}
              </TabsList>

              {/* Exhibiting Factories */}
              <TabsContent value="factories" className="mt-6">
                {webinar.exhibitingFactories && webinar.exhibitingFactories.length > 0 ? (
                  <div className="grid gap-4">
                    {webinar.exhibitingFactories.map((factory) => (
                      <Card key={factory.id} className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/factories/${factory.id}`)}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {factory.logo && (
                              <img src={factory.logo} alt={factory.name} className="w-16 h-16 rounded-lg object-cover" />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">{factory.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {factory.city}, {factory.province}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {factory.category}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-white font-semibold">{Number(factory.overallScore).toFixed(1)}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-400">{factory.reviewCount} reviews</span>
                              </div>
                            </div>
                            <ExternalLink className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-12 text-center">
                      <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No exhibiting factories yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Agenda */}
              <TabsContent value="agenda" className="mt-6">
                {webinar.agenda && webinar.agenda.length > 0 ? (
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {webinar.agenda.map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="text-blue-400 font-semibold min-w-[80px]">{item.time}</div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                              {item.description && (
                                <p className="text-gray-400 text-sm">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-12 text-center">
                      <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Agenda will be announced soon</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Speaker */}
              <TabsContent value="speaker" className="mt-6">
                {webinar.speaker ? (
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {webinar.speakerAvatar && (
                          <img src={webinar.speakerAvatar} alt={webinar.speaker} className="w-24 h-24 rounded-full object-cover" />
                        )}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-1">{webinar.speaker}</h3>
                          {webinar.speakerTitle && (
                            <p className="text-blue-400 mb-2">{webinar.speakerTitle}</p>
                          )}
                          {webinar.speakerCompany && (
                            <p className="text-gray-400 mb-4">{webinar.speakerCompany}</p>
                          )}
                          {webinar.speakerBio && (
                            <p className="text-gray-300">{webinar.speakerBio}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Speaker information will be announced soon</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* AI Insights */}
              {report && (
                <TabsContent value="insights" className="mt-6">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        AI-Generated Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="text-3xl font-bold text-blue-400">{report.totalParticipants}</div>
                          <div className="text-sm text-gray-400">Participants</div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                          <div className="text-3xl font-bold text-purple-400">{report.totalProducts}</div>
                          <div className="text-sm text-gray-400">Products</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="text-3xl font-bold text-green-400">{report.totalFavorites}</div>
                          <div className="text-sm text-gray-400">Favorites</div>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                          <div className="text-3xl font-bold text-orange-400">{report.totalInquiries}</div>
                          <div className="text-sm text-gray-400">Inquiries</div>
                        </div>
                      </div>

                      {report.aiInsights && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Summary</h4>
                          <p className="text-gray-300">{report.aiInsights}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="bg-gray-900/50 border-gray-800 sticky top-6">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Capacity</span>
                    <span className="text-white font-semibold">
                      {webinar.registrationCount || 0} / {webinar.maxParticipants}
                    </span>
                  </div>
                  <Progress 
                    value={((webinar.registrationCount || 0) / (webinar.maxParticipants || 1)) * 100} 
                    className="h-2"
                  />
                </div>

                <Separator className="bg-gray-800" />

                <div className="space-y-2">
                  {webinar.averageRating && Number(webinar.averageRating) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-semibold">{Number(webinar.averageRating).toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({webinar.ratingCount})</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Views</span>
                    <span className="text-white">{webinar.viewCount || 0}</span>
                  </div>
                  {webinar.timezone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Timezone</span>
                      <span className="text-white">{webinar.timezone}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-800" />

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    onClick={() => setLocation(`/webinars/${webinarId}/live`)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Live Webinar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            {webinar.organizer && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Organized by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {webinar.organizerLogo && (
                      <img src={webinar.organizerLogo} alt={webinar.organizer} className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-white font-semibold">{webinar.organizer}</p>
                      {webinar.coOrganizers && webinar.coOrganizers.length > 0 && (
                        <p className="text-sm text-gray-400">+{webinar.coOrganizers.length} co-organizers</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-sm">Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Shares</span>
                  <span className="text-white">{webinar.shareCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Questions</span>
                  <span className="text-white">{webinar.questionCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Inquiries</span>
                  <span className="text-white">{webinar.inquiryCount || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
