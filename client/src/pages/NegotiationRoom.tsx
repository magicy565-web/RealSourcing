import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Circle, Video, Mic, MicOff, VideoOff, 
  Users, TrendingUp, AlertTriangle, Zap, Clock, MessageSquare 
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { directus } from "@/lib/directus";
import { readItem } from "@directus/sdk";
import type { Webinar } from "@/lib/directus";
import { AgoraService } from "@/lib/agora";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface NegotiationRoomProps {
  params: {
    id?: string;
  };
}

export default function NegotiationRoom({ params }: NegotiationRoomProps) {
  const [, setLocation] = useLocation();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [joined, setJoined] = useState(false);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const agoraServiceRef = useRef<AgoraService | null>(null);

  const webinarId = params?.id || "1";

  // Fetch webinar data from Directus
  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const data = await directus.request(
          readItem('webinars', webinarId)
        );
        setWebinar(data);
      } catch (error) {
        console.error('Failed to fetch webinar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [webinarId]);

  // Initialize Agora on mount
  useEffect(() => {
    const initAgora = async () => {
      const appId = import.meta.env.VITE_AGORA_APP_ID || 'demo-app-id';
      agoraServiceRef.current = new AgoraService(appId);
      await agoraServiceRef.current.init();
    };

    initAgora();

    return () => {
      if (agoraServiceRef.current) {
        agoraServiceRef.current.leave();
      }
    };
  }, []);

  const handleJoinChannel = async () => {
    if (!agoraServiceRef.current || !webinar?.agora_channel_name) return;

    try {
      await agoraServiceRef.current.join(
        webinar.agora_channel_name,
        webinar.agora_token || null,
        `user-${Math.random().toString(36).substring(7)}`
      );

      if (localVideoRef.current) {
        await agoraServiceRef.current.publishVideo(localVideoRef.current);
      }
      await agoraServiceRef.current.publishAudio();

      setJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const handleLeaveChannel = async () => {
    if (!agoraServiceRef.current) return;
    await agoraServiceRef.current.leave();
    setJoined(false);
  };

  const toggleMic = async () => {
    if (!agoraServiceRef.current) return;
    if (micEnabled) {
      await agoraServiceRef.current.muteAudio();
    } else {
      await agoraServiceRef.current.unmuteAudio();
    }
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = async () => {
    if (!agoraServiceRef.current) return;
    if (videoEnabled) {
      await agoraServiceRef.current.muteVideo();
    } else {
      await agoraServiceRef.current.unmuteVideo();
    }
    setVideoEnabled(!videoEnabled);
  };

  // Mock data for AI insights
  const radarData = [
    { dimension: 'Quality', value: 85 },
    { dimension: 'Price', value: 78 },
    { dimension: 'Lead Time', value: 92 },
    { dimension: 'Compliance', value: 88 },
    { dimension: 'Capacity', value: 75 },
  ];

  const activities = [
    { time: "2 min ago", event: "Factory shared product catalog", type: "document" },
    { time: "5 min ago", event: "Price negotiation started", type: "negotiation" },
    { time: "12 min ago", event: "Quality certification verified", type: "verification" },
    { time: "18 min ago", event: "Factory joined the session", type: "join" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground font-light">Loading webinar...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground font-light">Webinar not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0A0A0A]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#0F0F0F]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/webinars")}
              className="text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-light text-white tracking-tight">
                  {webinar.title}
                </h1>
                {webinar.status === 'live' && (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">
                    <Circle className="h-2 w-2 fill-red-400 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-light">
                {webinar.description || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!joined ? (
              <Button 
                className="bg-violet-600 hover:bg-violet-700 text-white font-light"
                onClick={handleJoinChannel}
              >
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMic}
                  className={`border-[#262626] ${micEnabled ? 'hover:bg-white/5' : 'bg-red-500/10 border-red-500/20'}`}
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-400" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVideo}
                  className={`border-[#262626] ${videoEnabled ? 'hover:bg-white/5' : 'bg-red-500/10 border-red-500/20'}`}
                >
                  {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-red-400" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLeaveChannel}
                  className="border-[#262626] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 font-light"
                >
                  Leave
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Video Feed */}
          <div className="flex-1 flex flex-col bg-[#0A0A0A] p-6">
            <div className="flex-1 bg-[#141414] rounded-lg border border-[#262626] overflow-hidden relative">
              {/* Remote Video */}
              <div ref={remoteVideoRef} className="w-full h-full flex items-center justify-center">
                {!joined && (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
                      <Video className="h-8 w-8 text-violet-400" />
                    </div>
                    <p className="text-muted-foreground font-light">Click "Join Session" to start</p>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              {joined && (
                <div 
                  ref={localVideoRef}
                  className="absolute bottom-4 right-4 w-48 h-36 bg-[#0A0A0A] rounded-lg border border-[#262626] overflow-hidden"
                />
              )}
            </div>

            {/* AI Insights Bar */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-light">Confidence</div>
                    <div className="text-lg font-light text-white">87%</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-light">Risk Level</div>
                    <div className="text-lg font-light text-white">Low</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#141414] border-[#262626]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-light">Market Fit</div>
                    <div className="text-lg font-light text-white">High</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Analysis Panel */}
          <aside className="w-96 border-l border-[#262626] bg-[#0F0F0F] flex flex-col">
            <Tabs defaultValue="dimensions" className="flex-1 flex flex-col">
              <TabsList className="w-full bg-[#141414] border-b border-[#262626] rounded-none">
                <TabsTrigger value="dimensions" className="flex-1 font-light">Dimensions</TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1 font-light">Timeline</TabsTrigger>
                <TabsTrigger value="assets" className="flex-1 font-light">Assets</TabsTrigger>
              </TabsList>

              <TabsContent value="dimensions" className="flex-1 p-6 overflow-auto">
                <h3 className="text-sm font-light text-muted-foreground mb-4">Supplier Evaluation</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      tick={{ fill: '#888', fontSize: 11 }}
                    />
                    <Radar 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3} 
                    />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-3">
                  {radarData.map((item) => (
                    <div key={item.dimension} className="flex items-center justify-between">
                      <span className="text-sm font-light text-muted-foreground">{item.dimension}</span>
                      <span className="text-sm font-light text-white">{item.value}/100</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="flex-1 p-6 overflow-auto">
                <h3 className="text-sm font-light text-muted-foreground mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative">
                        <Circle className="h-2 w-2 bg-violet-400 fill-violet-400 mt-2" />
                        {index < activities.length - 1 && (
                          <div className="absolute left-1 top-4 h-full w-px bg-[#262626]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-light text-white leading-tight">{activity.event}</p>
                        <p className="text-xs text-muted-foreground font-light mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assets" className="flex-1 p-6 overflow-auto">
                <h3 className="text-sm font-light text-muted-foreground mb-4">Shared Documents</h3>
                <div className="space-y-3">
                  <Card className="bg-[#141414] border-[#262626] hover:bg-white/5 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-sm font-light text-white">Product Catalog 2026.pdf</div>
                      <div className="text-xs text-muted-foreground font-light mt-1">2.4 MB · Shared 5 min ago</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141414] border-[#262626] hover:bg-white/5 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-sm font-light text-white">ISO 9001 Certificate.pdf</div>
                      <div className="text-xs text-muted-foreground font-light mt-1">1.2 MB · Shared 12 min ago</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
