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
import { directus, safeRequest } from "@/lib/directus";
import { readItem } from "@directus/sdk";
import type { Webinar } from "@/lib/directus";
import { mockWebinars } from "@/lib/mock-data";
import { agoraService } from "@/lib/agora";
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
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  
  const webinarId = params?.id || "1";

  // Fetch webinar data from Directus
  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const data = await safeRequest('webinars', () =>
          directus.request(readItem('webinars', webinarId))
        );
        setWebinar(data);
      } catch (error) {
        console.error('Failed to fetch webinar:', error);
        // Fallback to mock data
        const mockWebinar = mockWebinars.find(w => w.id.toString() === webinarId);
        if (mockWebinar) {
          setWebinar(mockWebinar as Webinar);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [webinarId]);

  // Handle remote user updates
  useEffect(() => {
    let interval: any;
    if (joined) {
      interval = setInterval(() => {
        setRemoteUsers(agoraService.getRemoteUsers());
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [joined]);

  const handleJoinChannel = async () => {
    if (!webinar?.agora_channel_name) return;

    try {
      await agoraService.init({
        channel: webinar.agora_channel_name,
        token: webinar.agora_token || null,
        uid: Math.floor(Math.random() * 10000)
      });

      await agoraService.createLocalTracks();
      
      // Play local video in the local container
      setTimeout(() => {
        agoraService.playLocalVideo('local-video-container');
      }, 500);

      setJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const handleLeaveChannel = async () => {
    await agoraService.leave();
    setJoined(false);
  };

  const toggleMic = async () => {
    await agoraService.toggleAudio(!micEnabled);
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = async () => {
    await agoraService.toggleVideo(!videoEnabled);
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
              {/* Remote Video Container */}
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {remoteUsers.length === 0 && !joined && (
                  <div className="col-span-full flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
                        <Video className="h-8 w-8 text-violet-400" />
                      </div>
                      <p className="text-muted-foreground font-light">Click "Join Session" to start</p>
                    </div>
                  </div>
                )}
                
                {/* Remote User Tracks */}
                {remoteUsers.map(user => (
                  <div 
                    key={user.uid} 
                    id={`remote-video-${user.uid}`}
                    className="bg-[#0A0A0A] rounded-lg border border-[#262626] relative overflow-hidden h-full"
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="outline" className="bg-black/50 border-[#262626] text-xs font-light">
                        User {user.uid}
                      </Badge>
                    </div>
                    {useEffect(() => {
                      agoraService.playRemoteVideo(user.uid, `remote-video-${user.uid}`);
                    }, [user.uid])}
                  </div>
                ))}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              {joined && (
                <div 
                  id="local-video-container"
                  className="absolute bottom-4 right-4 w-48 h-36 bg-[#0A0A0A] rounded-lg border border-[#262626] overflow-hidden z-20 shadow-2xl"
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
              
              <TabsContent value="dimensions" className="p-6 flex-1">
                <div className="space-y-6">
                  <h3 className="text-sm font-light text-white uppercase tracking-wider">Supplier Assessment</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#262626" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#737373', fontSize: 12 }} />
                        <Radar
                          name="Assessment"
                          dataKey="value"
                          stroke="#7c3aed"
                          fill="#7c3aed"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {radarData.map(item => (
                      <div key={item.dimension} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-light">{item.dimension}</span>
                        <span className="text-sm text-white font-light">{item.value}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="p-6 flex-1">
                <div className="space-y-6">
                  <h3 className="text-sm font-light text-white uppercase tracking-wider">Live Activity</h3>
                  <div className="space-y-4">
                    {activities.map((activity, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1">
                          <div className="h-2 w-2 rounded-full bg-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-light">{activity.event}</p>
                          <p className="text-xs text-muted-foreground font-light">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="p-6 flex-1">
                <div className="space-y-6">
                  <h3 className="text-sm font-light text-white uppercase tracking-wider">Shared Resources</h3>
                  <div className="space-y-2">
                    {['Product_Catalog_2026.pdf', 'Quality_Cert_ISO9001.jpg', 'Pricing_Tier_Structure.xlsx'].map(file => (
                      <div key={file} className="flex items-center justify-between p-3 rounded bg-[#141414] border border-[#262626]">
                        <span className="text-xs text-white font-light">{file}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Bottom: Chat Input Placeholder */}
            <div className="p-4 border-t border-[#262626] bg-[#141414]">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] rounded border border-[#262626]">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Type a message or AI command..." 
                  className="bg-transparent border-none focus:ring-0 text-sm font-light text-white flex-1"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
