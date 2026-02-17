import { useParams } from "wouter";
import { useLocation } from "wouter";
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
} from "lucide-react";
import { format } from "date-fns";

export default function WebinarDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const webinarId = parseInt(id || "0");

  const { data: webinar, isLoading } = trpc.webinar.getById.useQuery(webinarId);

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
          <p className="text-gray-400 mb-6">The webinar you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/webinars")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Webinars
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "scheduled":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const capacityPercentage = webinar.maxParticipants
    ? (webinar.currentParticipants / webinar.maxParticipants) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/webinars")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Webinars
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-gray-800">
              {webinar.coverImage && (
                <div className="aspect-video w-full">
                  <img
                    src={webinar.coverImage}
                    alt={webinar.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className={`${getStatusColor(webinar.status)} border font-semibold`}>
                  {webinar.status === "live" && "🔴 LIVE NOW"}
                  {webinar.status === "scheduled" && "📅 SCHEDULED"}
                  {webinar.status === "completed" && "✓ COMPLETED"}
                </Badge>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                {webinar.title}
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                {webinar.description}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-semibold text-white">
                        {format(new Date(webinar.startTime), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-white">
                        {webinar.duration} min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Participants</p>
                      <p className="text-sm font-semibold text-white">
                        {webinar.currentParticipants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Factories</p>
                      <p className="text-sm font-semibold text-white">
                        {webinar.factories?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="factories" className="w-full">
              <TabsList className="bg-gray-900/50 border border-gray-800">
                <TabsTrigger value="factories" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
                  Exhibiting Factories
                </TabsTrigger>
                <TabsTrigger value="agenda" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
                  Agenda
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="factories" className="mt-6 space-y-4">
                {webinar.factories && webinar.factories.length > 0 ? (
                  <div className="grid gap-4">
                    {webinar.factories.map((factory: any) => (
                      <Card
                        key={factory.id}
                        className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group"
                        onClick={() => setLocation(`/factories/${factory.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Factory Logo */}
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-8 w-8 text-blue-500" />
                            </div>

                            {/* Factory Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-500 transition-colors">
                                  {factory.name}
                                </h3>
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-bold text-yellow-500">
                                    {factory.rating || "4.5"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{factory.location || "China"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{factory.employeeCount || "100-500"} employees</span>
                                </div>
                              </div>

                              {/* Certifications */}
                              {factory.certifications && factory.certifications.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {factory.certifications.slice(0, 3).map((cert: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="bg-green-500/10 text-green-500 border-green-500/20"
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      {cert}
                                    </Badge>
                                  ))}
                                  {factory.certifications.length > 3 && (
                                    <Badge variant="outline" className="border-gray-700 text-gray-400">
                                      +{factory.certifications.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* View Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
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

              <TabsContent value="agenda" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-800 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="text-sm text-gray-500 mb-1">
                            {format(new Date(webinar.startTime), "h:mm a")}
                          </p>
                          <h4 className="text-lg font-semibold text-white mb-2">Opening & Welcome</h4>
                          <p className="text-gray-400">Introduction and overview of the webinar</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-800 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="text-sm text-gray-500 mb-1">Main Session</p>
                          <h4 className="text-lg font-semibold text-white mb-2">Factory Presentations</h4>
                          <p className="text-gray-400">Exhibiting factories showcase their capabilities</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-green-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">Closing</p>
                          <h4 className="text-lg font-semibold text-white mb-2">Q&A & Networking</h4>
                          <p className="text-gray-400">Interactive session with participants</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Category</h4>
                      <Badge variant="outline" className="border-blue-500/20 text-blue-500">
                        {webinar.category || "General"}
                      </Badge>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Language</h4>
                      <p className="text-white">English, Chinese</p>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Platform</h4>
                      <p className="text-white">Agora RTC</p>
                      {webinar.channelName && (
                        <p className="text-sm text-gray-500 mt-1">Channel: {webinar.channelName}</p>
                      )}
                    </div>

                    <Separator className="bg-gray-800" />

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Recording</h4>
                      <p className="text-white">
                        {webinar.status === "completed" ? "Available after event" : "Will be available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-gray-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Join This Webinar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Capacity</span>
                    <span className="text-white font-semibold">
                      {webinar.currentParticipants} / {webinar.maxParticipants || "Unlimited"}
                    </span>
                  </div>
                  {webinar.maxParticipants && (
                    <Progress value={capacityPercentage} className="h-2" />
                  )}
                </div>

                <Separator className="bg-gray-800" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-white">
                      {format(new Date(webinar.startTime), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-white">
                      {format(new Date(webinar.startTime), "h:mm a")} ({webinar.duration} min)
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  size="lg"
                >
                  {webinar.status === "live" ? (
                    <>
                      <Video className="mr-2 h-5 w-5" />
                      Join Live Now
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Register Now
                    </>
                  )}
                </Button>

                {webinar.status === "scheduled" && (
                  <p className="text-xs text-center text-gray-400">
                    You'll receive a reminder before the event starts
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Hosted by</p>
                  <p className="text-white font-semibold">RealSourcing Platform</p>
                </div>
                <Separator className="bg-gray-800" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Event Type</p>
                  <p className="text-white">Virtual Webinar</p>
                </div>
                <Separator className="bg-gray-800" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Industry</p>
                  <p className="text-white">{webinar.category || "Manufacturing"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
