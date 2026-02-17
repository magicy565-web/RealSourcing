import { useLocation } from "wouter";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft, Calendar, Clock, Users, Video, Circle,
  Play, Eye, Share2, Edit, Tag, Globe
} from "lucide-react";
import { cn } from "../lib/utils";
import { trpc } from "../lib/trpc";
import { EnhancedImage } from "../components/EnhancedImage";
import { useToast } from "../hooks/use-toast";
import DecisionMatrix from "../components/tactical/DecisionMatrix";

interface WebinarDetailProps {
  params: {
    id?: string;
  };
}

export default function WebinarDetail({ params }: WebinarDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground font-light">Webinar not found</p>
            <Button variant="outline" onClick={() => setLocation("/webinars")} className="border-[#262626]">
              Back to Webinars
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Extract data with fallbacks
  const coverImage = (webinar as any).coverImage || (webinar as any).cover_image;
  const scheduledAt = (webinar as any).scheduledAt || (webinar as any).scheduled_at;
  const maxParticipants = (webinar as any).maxParticipants || (webinar as any).max_participants || 0;
  const viewCount = (webinar as any).viewCount || (webinar as any).view_count || 0;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "链接已复制",
      description: "Webinar 链接已复制到剪贴板",
    });
  };

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

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Cover Image */}
          {coverImage && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <EnhancedImage
                src={coverImage}
                alt={webinar.title}
                className="rounded-lg"
              />
              {webinar.status === "live" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
                    onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    加入直播
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/webinars")}
                className="text-muted-foreground hover:text-white hover:bg-white/5 mt-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-light tracking-tight text-white">{webinar.title}</h1>
                  <Badge className={cn("text-xs", getStatusColor(webinar.status))}>
                    {webinar.status === "live" && <Circle className="h-2 w-2 fill-current mr-1 animate-pulse" />}
                    {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-light max-w-2xl leading-relaxed">
                  {webinar.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleShare}
                className="bg-[#141414] border-[#262626] hover:border-violet-500/50"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {webinar.status === "live" && (
                <>
                  <DecisionMatrix />
                  <Button
                    onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-light"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Enter Room
                  </Button>
                </>
              )}
              {webinar.status === "completed" && (
                <Button
                  onClick={() => setLocation(`/webinars/${webinar.id}/replay`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-light"
                >
                  <Play className="mr-2 h-4 w-4" />
                  View Replay & Highlights
                </Button>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Date</div>
                  <div className="text-sm font-light text-white">
                    {new Date(scheduledAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Duration</div>
                  <div className="text-sm font-light text-white">{webinar.duration} min</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Participants</div>
                  <div className="text-sm font-light text-white">{maxParticipants}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Views</div>
                  <div className="text-sm font-light text-white">{viewCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          {(webinar.category || webinar.language) && (
            <Card className="bg-[#141414] border-[#262626] mb-8">
              <CardContent className="p-6 space-y-3">
                {webinar.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-light">分类:</span>
                    <Badge variant="outline" className="font-light">{webinar.category}</Badge>
                  </div>
                )}
                {webinar.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-light">语言:</span>
                    <Badge variant="outline" className="font-light">
                      {webinar.language === 'en' ? '🇬🇧 English' : '🇨🇳 中文'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
