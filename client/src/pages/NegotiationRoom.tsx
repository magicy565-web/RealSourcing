import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Circle, Video, Mic, MicOff, VideoOff,
  Users, TrendingUp, AlertTriangle, Zap, Clock, MessageSquare,
  Monitor, MonitorOff, Maximize2, Minimize2, PhoneOff,
  MoreVertical, Globe, Building2, Shield, Send,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockStore, type MockWebinar, type MockRegistration, getAvatarByRole } from "@/lib/mock-data";
import { agoraService } from "@/lib/agora";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NegotiationRoomProps {
  params: {
    id?: string;
  };
}

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

export default function NegotiationRoom({ params }: NegotiationRoomProps) {
  const [, setLocation] = useLocation();
  const [webinar, setWebinar] = useState<MockWebinar | null>(null);
  const [loading, setLoading] = useState(true);

  // Agora state
  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [registrations, setRegistrations] = useState<MockRegistration[]>([]);

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  const webinarId = params?.id || "1";
  const localVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────

  useEffect(() => {
    const w = mockStore.getWebinarById(parseInt(webinarId));
    if (w) {
      setWebinar(w);
      const regs = mockStore.getRegistrations(parseInt(webinarId))
        .filter(r => r.status === "approved");
      setRegistrations(regs);

      // Build initial participant list from registrations
      const initialParticipants: Participant[] = regs.map((r, i) => ({
        uid: `mock-${r.id}`,
        name: r.user_name,
        role: r.role as "factory" | "buyer",
        company: r.company_name,
        hasVideo: Math.random() > 0.3,
        hasAudio: Math.random() > 0.2,
      }));
      setParticipants(initialParticipants);
    }
    setLoading(false);
  }, [webinarId]);

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
    if (!webinar?.agora_channel_name) return;

    try {
      await agoraService.init({
        channel: webinar.agora_channel_name,
        token: webinar.agora_token || null,
        uid: Math.floor(Math.random() * 10000),
      });

      await agoraService.createLocalTracks();

      setTimeout(() => {
        if (localVideoRef.current) {
          agoraService.playLocalVideo("local-video-pip");
        }
      }, 500);

      setJoined(true);

      // Add system message
      addMessage({
        id: `sys-${Date.now()}`,
        sender: "System",
        role: "system",
        content: "You joined the session",
        timestamp: new Date(),
      });

      // Simulate AI welcome
      setTimeout(() => {
        addMessage({
          id: `ai-${Date.now()}`,
          sender: "AI Assistant",
          role: "ai",
          content: `Welcome to "${webinar.title}". I'm your AI sourcing assistant. I can help with pricing analysis, quality verification, and negotiation strategies. How can I assist you?`,
          timestamp: new Date(),
        });
      }, 1500);
    } catch (error) {
      console.error("Failed to join channel:", error);
      // Still allow "joining" for demo purposes
      setJoined(true);
      addMessage({
        id: `sys-${Date.now()}`,
        sender: "System",
        role: "system",
        content: "Connected in demo mode (no camera/mic access)",
        timestamp: new Date(),
      });
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      sender: "You",
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    const msgText = inputValue.trim();
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(msgText);
      addMessage({
        id: `ai-${Date.now()}`,
        sender: "AI Assistant",
        role: "ai",
        content: aiResponse,
        timestamp: new Date(),
      });
    }, 1200);
  };

  const generateAIResponse = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("price") || lower.includes("cost") || lower.includes("quote")) {
      return "Based on current market data, the average unit price for this category is $8.50-$14.20. The supplier's offer of $12.50 is within range. I recommend negotiating for volume discounts above 2,000 units.";
    }
    if (lower.includes("moq") || lower.includes("minimum")) {
      return "The standard MOQ for this product line is 500 units. For first-time buyers, some factories offer trial orders of 200 units at a 10% premium. Shall I suggest this option?";
    }
    if (lower.includes("quality") || lower.includes("cert")) {
      return "This factory holds ISO 9001:2015, CE, and FCC certifications. Their defect rate is reported at 0.3%, which is below industry average. I recommend requesting a pre-shipment inspection report.";
    }
    if (lower.includes("delivery") || lower.includes("ship") || lower.includes("lead")) {
      return "Standard lead time is 30-45 days. Express production (20 days) is available with a 15% surcharge. Shipping options include FOB Shenzhen, CIF, and DDP.";
    }
    if (lower.includes("sample")) {
      return "I recommend requesting 2-3 samples before placing a bulk order. Most factories offer free samples with buyer-paid shipping (~$30-50 via DHL Express). Shall I draft a sample request?";
    }
    return "I'm analyzing your request. Based on the session context, I suggest focusing on payment terms and quality assurance. Would you like me to provide a detailed comparison or draft specific questions for the supplier?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Smart Replies ──────────────────────────────────────────────────────

  const smartReplies = [
    "What's the unit price for 1,000+ units?",
    "Can you share quality certificates?",
    "What's your standard lead time?",
  ];

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto" />
            <p className="text-muted-foreground font-light text-sm">Loading session...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-3">
            <Video className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-light">Session not found</p>
            <Button variant="outline" onClick={() => setLocation("/webinars")} className="border-[#262626] font-light">
              Back to Webinars
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div ref={roomRef} className="h-[calc(100vh-64px)] flex flex-col bg-[#0A0A0A]">
        {/* ─── Header Bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1A1A1A] bg-[#0A0A0A]/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/webinars/${webinar.id}`)}
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-light text-white tracking-tight truncate max-w-[300px]">
                {webinar.title}
              </h1>
              {joined && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] animate-pulse">
                  <Circle className="h-1.5 w-1.5 fill-red-400 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {joined && (
              <>
                {/* Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#1A1A1A] mr-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-mono text-white">{formatTime(elapsed)}</span>
                </div>

                {/* Participants count */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#1A1A1A] mr-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-white">{participants.length + 1}</span>
                </div>
              </>
            )}

            {!joined ? (
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white font-light text-sm h-9 px-5"
                onClick={handleJoinChannel}
              >
                <Video className="mr-2 h-3.5 w-3.5" />
                Join Session
              </Button>
            ) : (
              <>
                {/* Mic */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMic}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all",
                    micEnabled
                      ? "text-white hover:bg-white/10"
                      : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  )}
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>

                {/* Camera */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVideo}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all",
                    videoEnabled
                      ? "text-white hover:bg-white/10"
                      : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  )}
                >
                  {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>

                {/* Screen Share */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setScreenSharing(!screenSharing)}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all",
                    screenSharing
                      ? "bg-violet-500/15 text-violet-400 hover:bg-violet-500/25"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {screenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-9 w-9 rounded-lg text-white hover:bg-white/10"
                >
                  {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                {/* Leave */}
                <Button
                  onClick={handleLeaveChannel}
                  className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-light text-sm ml-1"
                >
                  <PhoneOff className="mr-1.5 h-3.5 w-3.5" />
                  Leave
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ─── Main Content ───────────────────────────────────────────── */}
        <div className="flex-1 flex min-h-0">
          {/* ─── Left: Video Area ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col p-4 gap-4">
            {/* Main Video Grid */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-[#111111] border border-[#1A1A1A]">
              {!joined ? (
                /* Pre-join Screen */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-600/20 animate-pulse" />
                      <div className="absolute inset-2 rounded-full bg-[#141414] flex items-center justify-center">
                        <Video className="h-10 w-10 text-violet-400" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-light text-white mb-2">{webinar.title}</h2>
                      <p className="text-sm text-muted-foreground font-light">
                        {participants.length} participants waiting · {webinar.duration} min session
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex -space-x-2">
                        {participants.slice(0, 4).map((p, i) => (
                          <img
                            key={p.uid}
                            src={getAvatarByRole(p.role, p.name)}
                            alt={p.name}
                            className="h-8 w-8 rounded-full border-2 border-[#111111] object-cover"
                          />
                        ))}
                        {participants.length > 4 && (
                          <div className="h-8 w-8 rounded-full border-2 border-[#111111] bg-[#262626] flex items-center justify-center text-[10px] text-muted-foreground">
                            +{participants.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleJoinChannel}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-light px-8 h-11 text-sm shadow-lg shadow-violet-900/30"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join Session Now
                    </Button>
                  </div>
                </div>
              ) : (
                /* Video Grid */
                <div className="absolute inset-0">
                  {/* Main stage - show participants or placeholder */}
                  <div className={cn(
                    "w-full h-full grid gap-1.5 p-1.5",
                    remoteUsers.length === 0 ? "grid-cols-1" :
                    remoteUsers.length === 1 ? "grid-cols-1" :
                    remoteUsers.length <= 4 ? "grid-cols-2" :
                    "grid-cols-3"
                  )}>
                    {remoteUsers.length === 0 ? (
                      /* No remote users - show participant cards */
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                        {participants.slice(0, 6).map((p) => (
                          <div
                            key={p.uid}
                            className="bg-[#0A0A0A] rounded-lg border border-[#1A1A1A] flex flex-col items-center justify-center p-6 space-y-3"
                          >
                            <img
                              src={getAvatarByRole(p.role, p.name)}
                              alt={p.name}
                              className="h-16 w-16 rounded-full object-cover border-2 border-[#1A1A1A]"
                            />
                            <div className="text-center">
                              <p className="text-sm font-light text-white">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-light">{p.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "text-[9px] border-[#262626]",
                                p.role === "factory" ? "text-orange-400" : "text-cyan-400"
                              )}>
                                {p.role === "factory" ? <Building2 className="h-2.5 w-2.5 mr-1" /> : <Globe className="h-2.5 w-2.5 mr-1" />}
                                {p.role === "factory" ? "Factory" : "Buyer"}
                              </Badge>
                              {p.hasAudio && <Mic className="h-3 w-3 text-green-400" />}
                              {p.hasVideo && <Video className="h-3 w-3 text-green-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Remote video tracks */
                      remoteUsers.map(user => (
                        <div
                          key={user.uid}
                          id={`remote-video-${user.uid}`}
                          className="bg-[#0A0A0A] rounded-lg overflow-hidden relative"
                        >
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="outline" className="bg-black/60 backdrop-blur-sm border-[#262626] text-[10px] font-light">
                              User {user.uid}
                            </Badge>
                          </div>
                          {!user.hasVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-16 w-16 rounded-full bg-[#262626] flex items-center justify-center">
                                <VideoOff className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Local Video PIP */}
                  <div
                    id="local-video-pip"
                    ref={localVideoRef}
                    className="absolute bottom-4 right-4 w-44 h-32 bg-[#0A0A0A] rounded-xl border border-[#262626] overflow-hidden z-20 shadow-2xl shadow-black/50 group cursor-move"
                  >
                    {!videoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                        <div className="h-10 w-10 rounded-full bg-[#262626] flex items-center justify-center">
                          <VideoOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 z-10">
                      <Badge variant="outline" className="bg-black/60 backdrop-blur-sm border-[#262626] text-[9px] font-light">
                        You
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stats Bar */}
            {joined && (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1A1A1A]">
                  <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Confidence</div>
                    <div className="text-sm font-light text-white">87%</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1A1A1A]">
                  <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Risk Level</div>
                    <div className="text-sm font-light text-white">Low</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1A1A1A]">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Market Fit</div>
                    <div className="text-sm font-light text-white">High</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Side Panel ─────────────────────────────────────── */}
          <aside className="w-[380px] border-l border-[#1A1A1A] bg-[#0A0A0A] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full bg-transparent border-b border-[#1A1A1A] rounded-none h-10 px-1">
                <TabsTrigger
                  value="chat"
                  className="flex-1 font-light text-xs data-[state=active]:bg-transparent data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:shadow-none rounded-none"
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="flex-1 font-light text-xs data-[state=active]:bg-transparent data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:shadow-none rounded-none"
                >
                  <Users className="h-3 w-3 mr-1.5" />
                  People
                  <Badge className="ml-1.5 h-4 px-1 text-[9px] bg-[#262626] text-muted-foreground border-none">
                    {participants.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="flex-1 font-light text-xs data-[state=active]:bg-transparent data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:shadow-none rounded-none"
                >
                  <Zap className="h-3 w-3 mr-1.5" />
                  AI Insights
                </TabsTrigger>
              </TabsList>

              {/* ─── Chat Tab ──────────────────────────────────────────── */}
              <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <MessageSquare className="h-7 w-7 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-light text-white">AI Assistant Ready</p>
                        <p className="text-xs text-muted-foreground font-light mt-1 max-w-[240px]">
                          Join the session to start chatting with AI and other participants
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={cn(
                        "animate-in fade-in slide-in-from-bottom-1 duration-200",
                        msg.role === "system" && "flex justify-center"
                      )}>
                        {msg.role === "system" ? (
                          <div className="px-3 py-1 rounded-full bg-[#141414] border border-[#1A1A1A] text-[10px] text-muted-foreground font-light">
                            {msg.content}
                          </div>
                        ) : (
                          <div className={cn(
                            "flex gap-2.5",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]",
                              msg.role === "ai"
                                ? "bg-gradient-to-br from-violet-600/30 to-purple-600/30 text-violet-300"
                                : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                            )}>
                              {msg.role === "ai" ? "AI" : msg.sender.charAt(0)}
                            </div>
                            <div className={cn(
                              "max-w-[75%] px-3.5 py-2.5 rounded-2xl",
                              msg.role === "user"
                                ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white"
                                : "bg-[#141414] border border-[#1A1A1A] text-white"
                            )}>
                              <p className="text-[13px] leading-relaxed font-light">{msg.content}</p>
                              <p className={cn(
                                "text-[9px] mt-1.5 font-light",
                                msg.role === "user" ? "text-white/50" : "text-muted-foreground"
                              )}>
                                {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Smart Replies */}
                {joined && messages.length > 0 && (
                  <div className="px-3 py-2 border-t border-[#1A1A1A]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap className="h-2.5 w-2.5 text-violet-400" />
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {smartReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => setInputValue(reply)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#1A1A1A] text-[11px] text-white font-light hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-[#1A1A1A]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={joined ? "Ask AI or message participants..." : "Join session to chat"}
                      disabled={!joined}
                      className="flex-1 px-3.5 py-2.5 bg-[#111111] border border-[#1A1A1A] rounded-xl text-[13px] font-light text-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all disabled:opacity-40"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || !joined}
                      size="icon"
                      className="h-9 w-9 bg-violet-600 hover:bg-violet-700 disabled:bg-[#262626] disabled:text-muted-foreground transition-all rounded-xl"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ─── Participants Tab ───────────────────────────────────── */}
              <TabsContent value="participants" className="flex-1 overflow-y-auto m-0 p-4" style={{ scrollbarWidth: "thin" }}>
                <div className="space-y-4">
                  {/* You */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">You</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-violet-500/20">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs text-white">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-white">Magic User</p>
                        <p className="text-[10px] text-muted-foreground font-light">Admin</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {micEnabled ? (
                          <Mic className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <MicOff className="h-3.5 w-3.5 text-red-400" />
                        )}
                        {videoEnabled ? (
                          <Video className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <VideoOff className="h-3.5 w-3.5 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Factories */}
                  {participants.filter(p => p.role === "factory").length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                        Factories ({participants.filter(p => p.role === "factory").length})
                      </p>
                      <div className="space-y-1.5">
                        {participants.filter(p => p.role === "factory").map(p => (
                          <div key={p.uid} className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1A1A1A] hover:border-[#262626] transition-colors">
                            <img
                              src={getAvatarByRole(p.role, p.name)}
                              alt={p.name}
                              className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-light text-white truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-light truncate">{p.company}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {p.hasAudio ? (
                                <Mic className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <MicOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                              )}
                              {p.hasVideo ? (
                                <Video className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <VideoOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buyers */}
                  {participants.filter(p => p.role === "buyer").length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                        Buyers ({participants.filter(p => p.role === "buyer").length})
                      </p>
                      <div className="space-y-1.5">
                        {participants.filter(p => p.role === "buyer").map(p => (
                          <div key={p.uid} className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1A1A1A] hover:border-[#262626] transition-colors">
                            <img
                              src={getAvatarByRole(p.role, p.name)}
                              alt={p.name}
                              className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-light text-white truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-light truncate">{p.company}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {p.hasAudio ? (
                                <Mic className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <MicOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                              )}
                              {p.hasVideo ? (
                                <Video className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <VideoOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ─── AI Insights Tab ───────────────────────────────────── */}
              <TabsContent value="insights" className="flex-1 overflow-y-auto m-0 p-4" style={{ scrollbarWidth: "thin" }}>
                <div className="space-y-5">
                  {/* Supplier Score */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Supplier Assessment</p>
                    <div className="space-y-3">
                      {[
                        { label: "Quality", value: 85, color: "bg-green-500" },
                        { label: "Price Competitiveness", value: 78, color: "bg-blue-500" },
                        { label: "Lead Time", value: 92, color: "bg-violet-500" },
                        { label: "Compliance", value: 88, color: "bg-cyan-500" },
                        { label: "Capacity", value: 75, color: "bg-orange-500" },
                      ].map(item => (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-light">{item.label}</span>
                            <span className="text-xs text-white font-light">{item.value}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                              style={{ width: `${item.value}%`, opacity: 0.7 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Key Insights</p>
                    <div className="space-y-2">
                      {[
                        { icon: TrendingUp, text: "Price is 8% below market average", color: "text-green-400 bg-green-500/10" },
                        { icon: Shield, text: "All certifications verified", color: "text-cyan-400 bg-cyan-500/10" },
                        { icon: Clock, text: "Lead time is industry-leading", color: "text-violet-400 bg-violet-500/10" },
                        { icon: AlertTriangle, text: "Request sample before bulk order", color: "text-orange-400 bg-orange-500/10" },
                      ].map((insight, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#111111] border border-[#1A1A1A]">
                          <div className={cn("h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0", insight.color.split(" ")[1])}>
                            <insight.icon className={cn("h-3.5 w-3.5", insight.color.split(" ")[0])} />
                          </div>
                          <p className="text-xs text-white font-light leading-relaxed pt-1">{insight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Activity */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Session Activity</p>
                    <div className="space-y-3">
                      {[
                        { time: "Just now", event: "Session started", dot: "bg-green-500" },
                        { time: "2 min ago", event: "Factory shared product catalog", dot: "bg-violet-500" },
                        { time: "5 min ago", event: "Price discussion initiated", dot: "bg-blue-500" },
                        { time: "12 min ago", event: "Quality certs verified by AI", dot: "bg-cyan-500" },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1.5 relative">
                            <div className={cn("h-2 w-2 rounded-full", activity.dot)} />
                            {i < 3 && (
                              <div className="absolute top-2 left-[3px] w-[2px] h-6 bg-[#1A1A1A]" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-white font-light">{activity.event}</p>
                            <p className="text-[10px] text-muted-foreground font-light">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
