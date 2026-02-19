import { useState, useEffect, useRef, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  PhoneOff, Users, MessageSquare, HelpCircle, Package,
  Send, ThumbsUp, Star, Building2, MapPin, ArrowLeft,
  Maximize2, Minimize2, Share2, ChevronRight, ChevronLeft,
  Circle, Smile, MoreVertical, Settings, Shield
} from "lucide-react";
import { agoraService } from "../lib/agora";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { cn } from "../lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

interface Participant {
  uid: string | number;
  name: string;
  company?: string;
  avatar?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isLocal?: boolean;
  isSpeaking?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WebinarLiveRoom() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/webinars/:id/live");
  const webinarId = parseInt(params?.id || "0");

  // Fetch webinar data
  const { data: webinar, isLoading } = trpc.webinarEnhanced.getById.useQuery(
    { id: webinarId },
    { enabled: !!webinarId }
  );

  // Agora state
  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "system",
      userName: "System",
      content: "Welcome to the webinar! Feel free to ask questions.",
      timestamp: new Date(),
    },
  ]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [viewCount, setViewCount] = useState(0);

  // Refs
  const localVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ─── Agora Integration ──────────────────────────────────────────────────

  // Fetch Agora token
  const uid = useMemo(() => `user_${Date.now()}`, []);
  const channelName = useMemo(
    () => webinar?.agoraChannelName || `webinar_${webinarId}`,
    [webinar?.agoraChannelName, webinarId]
  );
  
  const { data: tokenData } = trpc.agora.getRtcToken.useQuery(
    { channelName, uid },
    { enabled: !!webinar }
  );

  useEffect(() => {
    if (!webinar || !tokenData) return;

    const joinChannel = async () => {
      try {
        await agoraService.init({
          channel: channelName,
          uid: uid,
          token: tokenData.token,
        });

        await agoraService.createLocalTracks();
        setJoined(true);

        // Play local video
        if (localVideoRef.current) {
          agoraService.playLocalVideo("local-video");
        }

        // Simulate view count
        setViewCount(Math.floor(Math.random() * 100) + 50);

        toast.success("Successfully joined the webinar!");
      } catch (error) {
        console.error("Failed to join:", error);
        toast.error("Failed to join the webinar. Please check your camera and microphone permissions.");
      }
    };

    joinChannel();

    return () => {
      agoraService.leave();
    };
  }, [webinar, tokenData, webinarId, channelName, uid]);

  // ─── Event Handlers ─────────────────────────────────────────────────────

  const handleToggleMic = async () => {
    await agoraService.toggleAudio(!micEnabled);
    setMicEnabled(!micEnabled);
  };

  const handleToggleVideo = async () => {
    await agoraService.toggleVideo(!videoEnabled);
    setVideoEnabled(!videoEnabled);
  };

  const handleToggleScreenShare = async () => {
    try {
      const isSharing = await agoraService.toggleScreenShare();
      setScreenSharing(isSharing);
      toast.success(isSharing ? "Screen sharing started" : "Screen sharing stopped");
    } catch (error) {
      toast.error("Failed to toggle screen share");
    }
  };

  const handleLeave = async () => {
    await agoraService.leave();
    setLocation(`/webinars/${webinarId}`);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "current_user",
      userName: "You",
      content: chatMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setChatMessage("");

    // Scroll to bottom
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleToggleFullscreen = () => {
    if (!fullscreen) {
      roomRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading webinar...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Webinar not found</h2>
          <Button onClick={() => setLocation("/webinars")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Webinars
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={roomRef}
      className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden relative"
    >
      {/* Top Bar */}
      <div className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-6 relative z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/webinars/${webinarId}`)}
            className="text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <h1 className="text-base font-semibold text-white truncate max-w-md">
              {webinar.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Badge variant="outline" className="border-red-500 text-red-400 bg-red-500/10 gap-1">
                <Circle className="w-2 h-2 fill-red-400" />
                LIVE
              </Badge>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {viewCount} viewers
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToggleFullscreen} className="text-slate-300 hover:text-white">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Area */}
        <div className={cn(
          "flex-1 flex flex-col relative transition-all duration-300",
          sidebarOpen ? "mr-96" : "mr-0"
        )}>
          {/* Main Video */}
          <div className="flex-1 relative bg-black/50">
            <div id="local-video" className="w-full h-full" ref={localVideoRef}></div>
            {!joined && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <Video className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">Connecting to webinar...</p>
                </div>
              </div>
            )}

            {/* Participant Grid Overlay (bottom-right) */}
            {participants.length > 0 && (
              <div className="absolute bottom-6 right-6 grid grid-cols-2 gap-2">
                {participants.slice(0, 4).map((participant) => (
                  <div
                    key={participant.uid}
                    className="w-32 h-24 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700 relative"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white truncate">{participant.name}</p>
                    </div>
                    {!participant.hasAudio && (
                      <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full px-6 py-3 flex items-center gap-3 shadow-2xl">
              <Button
                variant={micEnabled ? "default" : "destructive"}
                size="icon"
                onClick={handleToggleMic}
                className="rounded-full w-12 h-12 bg-slate-800 hover:bg-slate-700"
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={handleToggleVideo}
                className="rounded-full w-12 h-12 bg-slate-800 hover:bg-slate-700"
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                variant={screenSharing ? "secondary" : "outline"}
                size="icon"
                onClick={handleToggleScreenShare}
                className="rounded-full w-12 h-12 bg-slate-800 hover:bg-slate-700"
              >
                {screenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </Button>

              <div className="w-px h-8 bg-slate-700" />

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-12 h-12 hover:bg-slate-800"
              >
                <Smile className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-12 h-12 hover:bg-slate-800"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>

              <div className="w-px h-8 bg-slate-700" />

              <Button
                variant="destructive"
                size="icon"
                onClick={handleLeave}
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 bg-slate-800/90 backdrop-blur-md border border-slate-700 hover:bg-slate-700 transition-all duration-300",
            sidebarOpen ? "right-96" : "right-0"
          )}
        >
          {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {/* Right Sidebar */}
        <div className={cn(
          "absolute top-0 right-0 bottom-0 w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800/50 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 m-3 mb-0">
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="people" className="text-xs">
                <Users className="w-4 h-4 mr-1" />
                People
              </TabsTrigger>
              <TabsTrigger value="factories" className="text-xs">
                <Building2 className="w-4 h-4 mr-1" />
                Factories
              </TabsTrigger>
              <TabsTrigger value="qa" className="text-xs">
                <HelpCircle className="w-4 h-4 mr-1" />
                Q&A
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 p-3">
              <ScrollArea className="flex-1 pr-4" ref={chatScrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={msg.userAvatar} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {msg.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-white">{msg.userName}</span>
                          <span className="text-xs text-slate-500">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mt-1 break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-3 flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button onClick={handleSendMessage} size="icon" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="flex-1 overflow-hidden mt-0 p-3">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.uid}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                        {participant.company && (
                          <p className="text-xs text-slate-400 truncate">{participant.company}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {participant.hasVideo ? (
                          <Video className="w-4 h-4 text-green-400" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-slate-600" />
                        )}
                        {participant.hasAudio ? (
                          <Mic className="w-4 h-4 text-green-400" />
                        ) : (
                          <MicOff className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No participants yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Factories Tab */}
            <TabsContent value="factories" className="flex-1 overflow-hidden mt-0 p-3">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {webinar.exhibitingFactories?.map((factory: any) => (
                    <Card key={factory.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Building2 className="w-10 h-10 p-2 bg-blue-500/10 text-blue-400 rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{factory.name}</h4>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{factory.city}, {factory.province}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-slate-300">{Number(factory.overallScore).toFixed(1)}</span>
                              </div>
                              {factory.certifications && (
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Certified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                          <MessageSquare className="w-3 h-3 mr-2" />
                          Chat with Factory
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {(!webinar.exhibitingFactories || webinar.exhibitingFactories.length === 0) && (
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No exhibiting factories yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Q&A Tab */}
            <TabsContent value="qa" className="flex-1 overflow-hidden mt-0 p-3">
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Q&A feature coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
