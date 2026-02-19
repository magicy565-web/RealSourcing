import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  PhoneOff, Users, MessageSquare, HelpCircle, Package,
  Send, Star, Building2, MapPin, ArrowLeft,
  Maximize2, Minimize2, Share2, ChevronRight, ChevronLeft,
  Circle, Smile, MoreVertical, Settings,
  CheckCircle2, Clock, ChevronUp, Pin, Eye,
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
  role?: "host" | "participant" | "system";
}

interface QAQuestion {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  upvotes: number;
  hasUpvoted: boolean;
  answered: boolean;
  answeredBy?: string;
  answer?: string;
  isPinned?: boolean;
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
  role?: "host" | "presenter" | "participant";
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

  const { data: webinarProducts } = trpc.webinarProduct.listByWebinar.useQuery(
    { webinarId, includeDetails: true },
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
      userName: "系统",
      content: "欢迎加入直播！有任何问题请在 Q&A 区提问。",
      timestamp: new Date(),
      role: "system",
    },
  ]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [viewCount, setViewCount] = useState(0);

  // Q&A state
  const [questions, setQuestions] = useState<QAQuestion[]>([
    {
      id: "q1",
      userId: "user1",
      userName: "张先生",
      content: "请问贵工厂的最小起订量是多少？",
      timestamp: new Date(Date.now() - 120000),
      upvotes: 5,
      hasUpvoted: false,
      answered: false,
      isPinned: true,
    },
    {
      id: "q2",
      userId: "user2",
      userName: "李女士",
      content: "产品是否支持定制包装？",
      timestamp: new Date(Date.now() - 60000),
      upvotes: 3,
      hasUpvoted: false,
      answered: true,
      answeredBy: "主持人",
      answer: "是的，我们支持全系列定制包装，最小起订量为 500 件。",
    },
  ]);
  const [qaInput, setQaInput] = useState("");
  const [qaFilter, setQaFilter] = useState<"all" | "unanswered" | "answered">("all");

  // Refs
  const localVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  // ─── Agora Integration ──────────────────────────────────────────────────────

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
        if (localVideoRef.current) {
          agoraService.playLocalVideo("local-video");
        }
        setViewCount(Math.floor(Math.random() * 100) + 50);
        toast.success("成功加入直播！");
      } catch (error) {
        console.error("Failed to join:", error);
        toast.error("加入直播失败，请检查摄像头和麦克风权限");
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
      toast.success(isSharing ? "屏幕共享已开启" : "屏幕共享已关闭");
    } catch {
      toast.error("屏幕共享失败");
    }
  };

  const handleLeave = async () => {
    await agoraService.leave();
    setLocation(`/webinars/${webinarId}`);
  };

  const handleSendMessage = useCallback(() => {
    if (!chatMessage.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "current_user",
      userName: "我",
      content: chatMessage,
      timestamp: new Date(),
      role: "participant",
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatMessage("");
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  }, [chatMessage]);

  const handleSubmitQuestion = useCallback(() => {
    if (!qaInput.trim()) return;
    const newQ: QAQuestion = {
      id: `q_${Date.now()}`,
      userId: "current_user",
      userName: "我",
      content: qaInput,
      timestamp: new Date(),
      upvotes: 0,
      hasUpvoted: false,
      answered: false,
    };
    setQuestions((prev) => [...prev, newQ]);
    setQaInput("");
    toast.success("问题已提交！");
  }, [qaInput]);

  const handleUpvote = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, upvotes: q.hasUpvoted ? q.upvotes - 1 : q.upvotes + 1, hasUpvoted: !q.hasUpvoted }
          : q
      )
    );
  }, []);

  const handleToggleFullscreen = () => {
    if (!fullscreen) {
      roomRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  const filteredQuestions = questions
    .filter((q) => {
      if (qaFilter === "unanswered") return !q.answered;
      if (qaFilter === "answered") return q.answered;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.upvotes - a.upvotes;
    });

  // ─── Render ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-light text-sm">加载直播间...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <h2 className="text-xl font-light text-white mb-4">Webinar 不存在</h2>
          <Button onClick={() => setLocation("/webinars")} variant="outline" className="font-light">
            <ArrowLeft className="mr-2 h-4 w-4" />返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={roomRef}
      className="h-screen w-screen bg-[#0A0A0A] flex flex-col overflow-hidden relative"
    >
      {/* ═══ TOP BAR ═══ */}
      <div className="h-14 bg-[#111111] border-b border-[#1e1e1e] flex items-center justify-between px-5 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/webinars/${webinarId}`)}
            className="text-muted-foreground hover:text-white font-light h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />返回
          </Button>
          <div className="h-5 w-px bg-[#262626]" />
          <div>
            <h1 className="text-sm font-light text-white truncate max-w-sm">{webinar.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-light gap-1 h-4">
                <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse" />LIVE
              </Badge>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />{viewCount} 观看
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white h-8 w-8 p-0">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToggleFullscreen} className="text-muted-foreground hover:text-white h-8 w-8 p-0">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ═══ MAIN AREA ═══ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ─ VIDEO AREA ─ */}
        <div className="flex-1 relative bg-[#0d0d0d] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div id="local-video" ref={localVideoRef} className="w-full h-full" />
            {!joined && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                  <Video className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-muted-foreground font-light text-sm">正在连接直播...</p>
              </div>
            )}
          </div>

          {/* Participant grid */}
          {participants.length > 0 && (
            <div className="absolute bottom-20 left-4 right-4 flex gap-2 overflow-x-auto">
              {participants.map((p) => (
                <div key={p.uid} className="relative w-32 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626] flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600/10 to-indigo-600/10">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback className="bg-violet-600/20 text-violet-400 text-xs">{p.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
                    <p className="text-[10px] text-white truncate font-light">{p.name}</p>
                  </div>
                  {!p.hasAudio && (
                    <div className="absolute top-1.5 right-1.5 bg-red-500/80 rounded-full p-0.5">
                      <MicOff className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─ CONTROL BAR ─ */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-[#111111]/95 backdrop-blur-md border border-[#262626] rounded-2xl px-5 py-2.5 flex items-center gap-2.5 shadow-2xl">
              <button
                onClick={handleToggleMic}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  micEnabled ? "bg-[#1e1e1e] hover:bg-[#262626] text-white" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                )}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={handleToggleVideo}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  videoEnabled ? "bg-[#1e1e1e] hover:bg-[#262626] text-white" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                )}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={handleToggleScreenShare}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  screenSharing ? "bg-violet-600/30 text-violet-400" : "bg-[#1e1e1e] hover:bg-[#262626] text-white"
                )}
              >
                {screenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </button>
              <div className="w-px h-6 bg-[#262626]" />
              <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1e1e1e] hover:bg-[#262626] text-white transition-all">
                <Smile className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1e1e1e] hover:bg-[#262626] text-white transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-[#262626]" />
              <button
                onClick={handleLeave}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─ SIDEBAR TOGGLE ─ */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#1a1a1a] border border-[#262626] rounded-l-lg flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#262626] transition-all",
            sidebarOpen ? "right-[384px]" : "right-0"
          )}
        >
          {sidebarOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className={cn(
          "w-96 bg-[#111111] border-l border-[#1e1e1e] flex flex-col transition-all duration-300 flex-shrink-0",
          !sidebarOpen && "translate-x-full absolute right-0 top-0 bottom-0"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 pt-3 pb-0 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4 bg-[#1a1a1a] border border-[#262626] h-9">
                <TabsTrigger value="chat" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-light h-7">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />聊天
                </TabsTrigger>
                <TabsTrigger value="qa" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-light h-7 relative">
                  <HelpCircle className="w-3.5 h-3.5 mr-1" />Q&A
                  {questions.filter((q) => !q.answered).length > 0 && (
                    <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                      {questions.filter((q) => !q.answered).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="people" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-light h-7">
                  <Users className="w-3.5 h-3.5 mr-1" />成员
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-light h-7">
                  <Package className="w-3.5 h-3.5 mr-1" />产品
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── CHAT TAB ── */}
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden px-3 pb-3 pt-2">
              <ScrollArea className="flex-1" ref={chatScrollRef}>
                <div className="space-y-3 pr-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-2.5", msg.role === "system" && "justify-center")}>
                      {msg.role === "system" ? (
                        <div className="text-[10px] text-muted-foreground font-light bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#262626]">
                          {msg.content}
                        </div>
                      ) : (
                        <>
                          <Avatar className="w-7 h-7 flex-shrink-0">
                            <AvatarImage src={msg.userAvatar} />
                            <AvatarFallback className={cn(
                              "text-[10px] font-light",
                              msg.role === "host" ? "bg-violet-600/20 text-violet-400" : "bg-[#262626] text-muted-foreground"
                            )}>
                              {msg.userName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5">
                              <span className={cn("text-xs font-light", msg.role === "host" ? "text-violet-400" : "text-white")}>
                                {msg.userName}
                              </span>
                              {msg.role === "host" && (
                                <Badge className="bg-violet-600/20 text-violet-300 border-violet-500/20 text-[9px] font-light h-3.5 px-1">主持</Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-light mt-0.5 break-words leading-relaxed">{msg.content}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-2 flex gap-2 flex-shrink-0">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="发送消息..."
                  className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-muted-foreground text-xs font-light h-8"
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-violet-600 hover:bg-violet-700 h-8 w-8 p-0 flex-shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </TabsContent>

            {/* ── Q&A TAB ── */}
            <TabsContent value="qa" className="flex-1 flex flex-col mt-0 overflow-hidden px-3 pb-3 pt-2">
              <div className="flex gap-1.5 mb-2 flex-shrink-0">
                {(["all", "unanswered", "answered"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setQaFilter(f)}
                    className={cn(
                      "flex-1 text-[10px] font-light py-1 rounded-lg border transition-colors",
                      qaFilter === f
                        ? "bg-violet-600/20 text-violet-400 border-violet-500/30"
                        : "bg-[#1a1a1a] text-muted-foreground border-[#262626] hover:border-[#404040]"
                    )}
                  >
                    {f === "all" ? "全部" : f === "unanswered" ? "待回答" : "已回答"}
                  </button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2.5 pr-2">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-10">
                      <HelpCircle className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-light">暂无问题</p>
                    </div>
                  ) : (
                    filteredQuestions.map((q) => (
                      <div
                        key={q.id}
                        className={cn(
                          "rounded-xl border p-3 space-y-2 transition-colors",
                          q.isPinned ? "bg-violet-600/5 border-violet-500/20" : "bg-[#1a1a1a] border-[#262626]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarFallback className="bg-[#262626] text-muted-foreground text-[9px]">{q.userName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-white font-light truncate">{q.userName}</span>
                            {q.isPinned && <Pin className="w-3 h-3 text-violet-400 flex-shrink-0" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {q.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground font-light leading-relaxed">{q.content}</p>

                        {q.answered && q.answer && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2.5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                              <span className="text-[10px] text-green-400 font-light">{q.answeredBy} 已回答</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-light leading-relaxed">{q.answer}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleUpvote(q.id)}
                            className={cn(
                              "flex items-center gap-1.5 text-[10px] font-light px-2 py-1 rounded-lg transition-colors",
                              q.hasUpvoted
                                ? "bg-violet-600/20 text-violet-400"
                                : "bg-[#262626] text-muted-foreground hover:text-white"
                            )}
                          >
                            <ChevronUp className="w-3 h-3" />
                            {q.upvotes}
                          </button>
                          {q.answered ? (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] font-light h-4">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />已回答
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] font-light h-4">
                              <Clock className="w-2.5 h-2.5 mr-1" />待回答
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="mt-2 space-y-1.5 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitQuestion()}
                    placeholder="提交您的问题..."
                    className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-muted-foreground text-xs font-light h-8"
                  />
                  <Button onClick={handleSubmitQuestion} size="sm" className="bg-violet-600 hover:bg-violet-700 h-8 w-8 p-0 flex-shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground font-light text-center">问题将由主持人审核后展示</p>
              </div>
            </TabsContent>

            {/* ── PEOPLE TAB ── */}
            <TabsContent value="people" className="flex-1 overflow-hidden mt-0 px-3 pb-3 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-light">{viewCount} 人在线</span>
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-1.5 pr-2">
                  {participants.length === 0 ? (
                    <div className="text-center py-10">
                      <Users className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-light">暂无参与者</p>
                    </div>
                  ) : (
                    participants.map((p) => (
                      <div key={p.uid} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback className="bg-violet-600/20 text-violet-400 text-xs">{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-light text-white truncate">{p.name}</p>
                          {p.company && <p className="text-[10px] text-muted-foreground truncate">{p.company}</p>}
                        </div>
                        <div className="flex gap-1">
                          {p.hasVideo ? <Video className="w-3.5 h-3.5 text-green-400" /> : <VideoOff className="w-3.5 h-3.5 text-[#404040]" />}
                          {p.hasAudio ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-[#404040]" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── PRODUCTS TAB ── */}
            <TabsContent value="products" className="flex-1 overflow-hidden mt-0 px-3 pb-3 pt-2">
              <ScrollArea className="h-full">
                <div className="space-y-2.5 pr-2">
                  {webinarProducts && (webinarProducts as any[]).length > 0 ? (
                    (webinarProducts as any[]).map((wp) => {
                      const product = wp.product;
                      if (!product) return null;
                      return (
                        <Card key={wp.id} className="bg-[#1a1a1a] border-[#262626] hover:border-violet-500/30 transition-colors group">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="w-14 h-14 rounded-lg bg-[#262626] overflow-hidden flex-shrink-0">
                                {product.mainImage ? (
                                  <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-muted-foreground opacity-30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white font-light truncate group-hover:text-violet-400 transition-colors">{product.name}</p>
                                {product.category && <p className="text-[10px] text-muted-foreground font-light mt-0.5">{product.category}</p>}
                                <div className="flex items-center gap-2 mt-1.5">
                                  {product.minOrderQuantity && (
                                    <span className="text-[10px] text-muted-foreground font-light">MOQ: {product.minOrderQuantity}</span>
                                  )}
                                  {wp.featured === 1 && (
                                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[9px] font-light h-3.5">精选</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full mt-2.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/20 text-[10px] font-light h-7"
                            >
                              <MessageSquare className="w-3 h-3 mr-1.5" />询价
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : webinar.exhibitingFactories && webinar.exhibitingFactories.length > 0 ? (
                    webinar.exhibitingFactories.map((factory: any) => (
                      <Card key={factory.id} className="bg-[#1a1a1a] border-[#262626] hover:border-violet-500/30 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white font-light truncate">{factory.name}</p>
                              {factory.city && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                                  <p className="text-[10px] text-muted-foreground font-light">{factory.city}</p>
                                </div>
                              )}
                              {factory.overallScore && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                  <span className="text-[10px] text-muted-foreground">{Number(factory.overallScore).toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Separator className="bg-[#262626] mb-2.5" />
                          <Button
                            size="sm"
                            className="w-full bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/20 text-[10px] font-light h-7"
                          >
                            <MessageSquare className="w-3 h-3 mr-1.5" />联系工厂
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <Package className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-light">暂无展示产品</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
