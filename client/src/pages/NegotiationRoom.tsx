import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { cn } from "../lib/utils";
import {
  ArrowLeft, Circle, Video, Mic, MicOff, VideoOff,
  Users, TrendingUp, AlertTriangle, Zap, Clock, MessageSquare,
  Monitor, MonitorOff, Maximize2, Minimize2, PhoneOff,
  MoreVertical, Globe, Building2, Shield, Send,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { agoraService } from "../lib/agora";
import { trpc } from "../lib/trpc";
import NegotiationTimeline from "../components/NegotiationTimeline";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  sender: string;
  role: "system" | "user" | "ai" | "participant";
  content: string;
  timestamp: Date;
  avatar?: string;
}

interface Participant {
  uid: string | number;
  name: string;
  role: "factory" | "buyer" | "admin";
  company: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isLocal?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function NegotiationRoom() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/webinars/:id/room");
  const webinarId = parseInt(params?.id || "0");
  
  // 使用 tRPC 获取真实 Webinar 详情
  const { data: webinar, isLoading: loadingWebinar, error: webinarError } = trpc.webinar.getById.useQuery(
    { id: webinarId },
    { enabled: !!webinarId }
  );
  
  const utils = trpc.useUtils();

  // Agora state
  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const { data: timelineData } = trpc.webinar.timeline.useQuery(
    { webinarId },
    { enabled: !!webinarId }
  );
  
  const { data: factoryData } = trpc.webinar.factories.useQuery(
    { webinarId },
    { enabled: !!webinarId }
  );

  useEffect(() => {
    if (webinar && factoryData) {
      // Build participant list from real factory data
      const factoryParticipants: Participant[] = factoryData.map((f: any) => ({
        uid: `factory-${f.id}`,
        name: f.name,
        role: "factory",
        company: f.name,
        hasVideo: false,
        hasAudio: false,
      }));
      setParticipants(factoryParticipants);
    }
  }, [webinar, factoryData]);

  useEffect(() => {
    if (timelineData) {
      setTimelineEvents(timelineData);
    }
  }, [timelineData]);

  // ─── Timer ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (joined) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [joined]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Remote User Polling ────────────────────────────────────────────────

  useEffect(() => {
    let interval: any;
    if (joined) {
      interval = setInterval(() => {
        const users = agoraService.getRemoteUsers();
        setRemoteUsers(users);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [joined]);

  // ─── Play Remote Videos ─────────────────────────────────────────────────

  useEffect(() => {
    remoteUsers.forEach(user => {
      const el = document.getElementById(`remote-video-${user.uid}`);
      if (el && user.hasVideo) {
        agoraService.playRemoteVideo(user.uid, `remote-video-${user.uid}`);
      }
    });
  }, [remoteUsers]);

  // ─── Agora Actions ──────────────────────────────────────────────────────

  const handleJoinChannel = async () => {
    if (!webinar) return;

    try {
      const channelName = `webinar-${webinarId}`;
      const uid = Math.floor(Math.random() * 1000000);

      // Get Agora token from backend
      let token: string | undefined = undefined;
      try {
        const data = await utils.client.agora.getRtcToken.query({ channelName, uid });
        token = data.token;
      } catch (error) {
        console.error('Failed to get Agora token:', error);
      }

      await agoraService.init({
        channel: channelName,
        token,
        uid,
      });

      await agoraService.createLocalTracks();

      setTimeout(() => {
        if (localVideoRef.current) {
          agoraService.playLocalVideo("local-video-pip");
        }
      }, 500);

      setJoined(true);

      addMessage({
        id: `sys-${Date.now()}`,
        sender: "System",
        role: "system",
        content: "You joined the session",
        timestamp: new Date(),
      });

      setTimeout(() => {
        addMessage({
          id: `ai-${Date.now()}`,
          sender: "AI Assistant",
          role: "ai",
          content: `Welcome to "${webinar.title}". I'm your AI sourcing assistant. I can help with pricing analysis, quality verification, and negotiation strategies. How can I assist you?`,
          timestamp: new Date(),
        });
      }, 1500);
    } catch (error: any) {
      console.error("Failed to join channel:", error);
      toast.error(`Connection failed: ${error.message || "Please check your network and try again."}`);
    }
  };

  const handleLeaveChannel = async () => {
    try {
      await agoraService.leave();
    } catch (e) {
      console.log("Leave error:", e);
    }
    setJoined(false);
    setElapsed(0);
    setRemoteUsers([]);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleMic = async () => {
    try {
      await agoraService.toggleAudio(!micEnabled);
    } catch (e) {}
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = async () => {
    try {
      await agoraService.toggleVideo(!videoEnabled);
    } catch (e) {}
    setVideoEnabled(!videoEnabled);
  };

  const toggleScreenShare = async () => {
    try {
      const isSharing = await agoraService.toggleScreenShare();
      setScreenSharing(isSharing);
      
      if (isSharing) {
        setTimeout(() => {
          agoraService.playLocalVideo("local-video-presentation");
        }, 500);
        
        addMessage({
          id: `sys-${Date.now()}`,
          sender: "System",
          role: "system",
          content: "You started screen sharing",
          timestamp: new Date(),
        });
      } else {
        addMessage({
          id: `sys-${Date.now()}`,
          sender: "System",
          role: "system",
          content: "You stopped screen sharing",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      toast.error("Failed to start screen sharing. Please check permissions.");
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen && roomRef.current) {
      roomRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  // ─── Chat ───────────────────────────────────────────────────────────────

  const addMessage = useCallback((msg: ChatMsg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    const msgText = inputValue.trim();
    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      sender: "You",
      role: "user",
      content: msgText,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInputValue("");

    try {
      const history = messages
        .filter(m => m.role !== "system")
        .slice(-5)
        .map(m => ({
          role: m.role === "ai" ? "assistant" : m.role === "user" ? "user" : "system",
          content: m.content
        })) as any[];

      const result = await chatMutation.mutateAsync({
        message: msgText,
        history,
        context: {
          webinarTitle: webinar?.title,
          webinarId: webinarId
        }
      });

      if (result && result.message) {
        addMessage({
          id: `ai-${Date.now()}`,
          sender: "AI Assistant",
          role: "ai",
          content: result.message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      toast.error("AI Assistant is currently unavailable.");
    }
  };

  if (loadingWebinar) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-12 w-1/2" />
          <div className="grid grid-cols-4 gap-6 h-[600px]">
            <Skeleton className="col-span-3 h-full" />
            <Skeleton className="col-span-1 h-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (webinarError || !webinar) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400">Error: Webinar session not found</h2>
          <Button onClick={() => setLocation("/webinars")} className="mt-4">
            Back to Webinars
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div ref={roomRef} className={cn(
        "flex flex-col h-[calc(100vh-64px)] bg-[#0A0A12] text-white overflow-hidden",
        fullscreen && "h-screen fixed inset-0 z-50"
      )}>
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0F0F1E]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/webinars/${webinarId}`)} className="text-white/60 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg">{webinar.title}</h1>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 gap-1.5 px-2">
                  <Circle className="h-2 w-2 fill-current" />
                  Live
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {remoteUsers.length + (joined ? 1 : 0)} Participants</span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono"><Clock className="h-3 w-3" /> {formatTime(elapsed)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-white/80">AI Analyzing Session...</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white/60 hover:text-white">
              {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Video Grid Area */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 relative bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
              {!joined ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F0F1E] to-black">
                  <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
                    <Video className="h-10 w-10 text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Ready to join the negotiation?</h2>
                  <p className="text-white/40 mb-8 max-w-md text-center">
                    You'll be joining as a buyer. Please ensure your camera and microphone are working.
                  </p>
                  <Button size="lg" onClick={handleJoinChannel} className="bg-violet-600 hover:bg-violet-700 px-8 py-6 text-lg rounded-xl shadow-xl shadow-violet-600/20">
                    Join Negotiation Room
                  </Button>
                </div>
              ) : (
                <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto">
                   {/* Local Video */}
                   <div className="relative aspect-video bg-[#1A1A2E] rounded-xl border border-white/10 overflow-hidden group">
                     <div id="local-video-pip" className="h-full w-full object-cover" />
                     <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs font-medium border border-white/10">
                       You (Buyer)
                     </div>
                     {!videoEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A2E]">
                           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                              <VideoOff className="h-8 w-8 text-white/20" />
                           </div>
                        </div>
                     )}
                   </div>

                   {/* Remote Videos */}
                   {remoteUsers.map(user => (
                      <div key={user.uid} className="relative aspect-video bg-[#1A1A2E] rounded-xl border border-white/10 overflow-hidden group">
                        <div id={`remote-video-${user.uid}`} className="h-full w-full object-cover" />
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs font-medium border border-white/10">
                          Participant #{user.uid}
                        </div>
                        {!user.hasVideo && (
                           <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A2E]">
                              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                 <VideoOff className="h-8 w-8 text-white/20" />
                              </div>
                           </div>
                        )}
                      </div>
                   ))}

                   {/* Empty Slots */}
                   {remoteUsers.length === 0 && (
                      <div className="relative aspect-video bg-white/[0.02] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                         <Users className="h-8 w-8 text-white/10 mb-2" />
                         <p className="text-xs text-white/20">Waiting for participants...</p>
                      </div>
                   )}
                </div>
              )}

              {/* In-call floating UI */}
              {joined && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleMic}
                    className={cn("h-12 w-12 rounded-xl transition-all", micEnabled ? "bg-white/5 text-white" : "bg-red-500/20 text-red-500")}
                  >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleVideo}
                    className={cn("h-12 w-12 rounded-xl transition-all", videoEnabled ? "bg-white/5 text-white" : "bg-red-500/20 text-red-500")}
                  >
                    {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleScreenShare}
                    className={cn("h-12 w-12 rounded-xl transition-all", screenSharing ? "bg-violet-500/20 text-violet-500" : "bg-white/5 text-white")}
                  >
                    {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-white">
                    <Zap className="h-5 w-5" />
                  </Button>
                  <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={handleLeaveChannel}
                    className="h-12 w-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Timeline/Analysis Area */}
            <div className="h-48 bg-[#0F0F1E] rounded-2xl border border-white/5 p-4 overflow-hidden">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-400" />
                    Negotiation Timeline
                  </h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/5 text-white/60 hover:text-white cursor-pointer">Export Logs</Badge>
                  </div>
               </div>
               <NegotiationTimeline events={timelineEvents} />
            </div>
          </div>

          {/* Right Sidebar (Chat & Participants) */}
          <div className="w-80 flex flex-col gap-4">
            <Card className="flex-1 flex flex-col bg-[#0F0F1E] border-white/5 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList className="w-full bg-black/20 p-1 rounded-xl">
                    <TabsTrigger value="chat" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-[#1A1A2E]">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="participants" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-[#1A1A2E]">
                      <Users className="h-4 w-4" />
                      Team
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn(
                        "flex flex-col gap-1.5",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{msg.sender}</span>
                          <span className="text-[10px] text-white/20">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm max-w-[90%]",
                          msg.role === "user" ? "bg-violet-600 text-white rounded-tr-none" : 
                          msg.role === "ai" ? "bg-white/10 text-white border border-white/10 rounded-tl-none" :
                          msg.role === "system" ? "bg-white/5 text-white/40 italic text-center w-full" :
                          "bg-white/5 text-white/80 rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="relative">
                      <Input 
                        placeholder="Message everyone..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="bg-white/5 border-white/10 pr-10 rounded-xl focus:ring-violet-500/50"
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || chatMutation.isPending}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-violet-500 hover:text-violet-400 hover:bg-transparent"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="participants" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
                   <div className="space-y-4">
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Host & Factories</div>
                      {participants.map((p) => (
                        <div key={p.uid} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/20">
                                 <Building2 className="h-4 w-4 text-orange-400" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-medium">{p.name}</span>
                                 <span className="text-[10px] text-white/40 uppercase tracking-tighter">Verified Supplier</span>
                              </div>
                           </div>
                           <Badge className="bg-green-500/20 text-green-500 text-[10px]">Active</Badge>
                        </div>
                      ))}
                      
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1 pt-2">AI Agents</div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-violet-500/5 border border-violet-500/10">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/20">
                               <Zap className="h-4 w-4 text-violet-400" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-medium">Negotiation Bot</span>
                               <span className="text-[10px] text-violet-400/60 uppercase tracking-tighter">Strategy Analysis</span>
                            </div>
                         </div>
                         <div className="flex gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                         </div>
                      </div>
                   </div>
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="bg-gradient-to-br from-violet-600/20 to-blue-600/20 border-violet-500/20 p-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-2 flex items-center gap-2">
                 <Shield className="h-3 w-3" />
                 Compliance Status
               </h3>
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/60">Verification Score</span>
                    <span className="text-green-400 font-bold">94/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-green-500" />
                  </div>
                  <p className="text-[10px] text-white/40 leading-tight mt-2">
                    All participants have verified business identities and signed NDAs for this session.
                  </p>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const Separator = ({ orientation, className }: { orientation: "vertical" | "horizontal", className?: string }) => (
  <div className={cn(
    orientation === "vertical" ? "w-px h-full" : "h-px w-full",
    "bg-border",
    className
  )} />
);
