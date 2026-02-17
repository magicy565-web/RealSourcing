import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  PhoneOff, Users, MessageSquare, HelpCircle, Package,
  Send, ThumbsUp, Heart, Star, Building2, MapPin,
  Shield, ArrowLeft, Maximize2, Minimize2, Settings,
  Download, Share2, Bookmark, Globe, Clock, TrendingUp, Circle
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
  role: "host" | "speaker" | "factory" | "buyer";
  content: string;
  timestamp: Date;
  isTranslated?: boolean;
}

interface QAQuestion {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  votes: number;
  timestamp: Date;
  status: "pending" | "answered";
}

interface Participant {
  uid: string | number;
  name: string;
  role: "host" | "speaker" | "factory" | "buyer";
  company?: string;
  avatar?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isLocal?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WebinarLiveRoom() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/webinars/:id/live");
  const webinarId = parseInt(params?.id || "0");

  // Fetch webinar data
  const { data: webinar, isLoading } = trpc.webinar.getById.useQuery(
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
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [viewCount, setViewCount] = useState(0);

  // Refs
  const localVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ─── Agora Integration ──────────────────────────────────────────────────

  useEffect(() => {
    if (!webinar) return;

    const joinChannel = async () => {
      try {
        await agoraService.init({
          channel: webinar.agoraChannelName || `webinar_${webinarId}`,
          uid: `user_${Date.now()}`,
        });

        await agoraService.createLocalTracks();
        setJoined(true);

        // Play local video
        if (localVideoRef.current) {
          agoraService.playLocalVideo("local-video");
        }

        toast.success("Successfully joined the webinar!");
      } catch (error) {
        console.error("Failed to join:", error);
        toast.error("Failed to join the webinar");
      }
    };

    joinChannel();

    return () => {
      agoraService.leave();
    };
  }, [webinar, webinarId]);

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
      role: "buyer",
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

  const handleAskQuestion = () => {
    if (!qaQuestion.trim()) return;

    const newQuestion: QAQuestion = {
      id: `qa_${Date.now()}`,
      userId: "current_user",
      userName: "You",
      question: qaQuestion,
      votes: 0,
      timestamp: new Date(),
      status: "pending",
    };

    setQuestions([...questions, newQuestion]);
    setQaQuestion("");
    toast.success("Question submitted!");
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading webinar...</div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Webinar not found</div>
      </div>
    );
  }

  return (
    <div
      ref={roomRef}
      className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-16 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/webinars/${webinarId}`)}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">{webinar.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Circle className="w-2 h-2 mr-1 fill-green-400" />
                LIVE
              </Badge>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {viewCount} viewers
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-300">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToggleFullscreen} className="text-slate-300">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Participants & Factories */}
        <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 flex flex-col">
          <Tabs defaultValue="participants" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 m-2">
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 mr-2" />
                Participants
              </TabsTrigger>
              <TabsTrigger value="factories">
                <Building2 className="w-4 h-4 mr-2" />
                Factories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-2 py-2">
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                          {participant.role === "host" && (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                              Host
                            </Badge>
                          )}
                          {participant.role === "speaker" && (
                            <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                              Speaker
                            </Badge>
                          )}
                        </div>
                        {participant.company && (
                          <p className="text-xs text-slate-400 truncate">{participant.company}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {participant.hasVideo ? (
                          <Video className="w-4 h-4 text-green-400" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-slate-500" />
                        )}
                        {participant.hasAudio ? (
                          <Mic className="w-4 h-4 text-green-400" />
                        ) : (
                          <MicOff className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="factories" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-2">
                  {webinar.exhibitingFactories?.map((factory: any) => (
                    <Card key={factory.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
                      <CardHeader className="p-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-10 h-10 p-2 bg-blue-500/10 text-blue-400 rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm text-white truncate">{factory.name}</CardTitle>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{factory.location}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-slate-300">{factory.rating || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="w-3 h-3 mr-2" />
                          Chat with Factory
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Video Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Main Video */}
          <div className="flex-1 relative bg-slate-900">
            <div id="local-video" className="w-full h-full" ref={localVideoRef}></div>
            {!joined && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">Connecting to webinar...</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="h-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 flex items-center justify-center gap-3 px-6">
            <Button
              variant={micEnabled ? "default" : "destructive"}
              size="lg"
              onClick={handleToggleMic}
              className="rounded-full w-14 h-14"
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={videoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={handleToggleVideo}
              className="rounded-full w-14 h-14"
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={screenSharing ? "secondary" : "outline"}
              size="lg"
              onClick={handleToggleScreenShare}
              className="rounded-full w-14 h-14"
            >
              {screenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>

            <Separator orientation="vertical" className="h-8 bg-slate-700" />

            <Button
              variant="destructive"
              size="lg"
              onClick={handleLeave}
              className="rounded-full w-14 h-14"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Chat & Q&A */}
        <div className="w-96 bg-slate-900/50 backdrop-blur-sm border-l border-slate-700 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 m-2">
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="qa">
                <HelpCircle className="w-4 h-4 mr-2" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="products">
                <Package className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <ScrollArea className="flex-1 px-4" ref={chatScrollRef}>
                <div className="space-y-3 py-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.userAvatar} />
                        <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{msg.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {msg.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{msg.content}</p>
                        <span className="text-xs text-slate-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Q&A Tab */}
            <TabsContent value="qa" className="flex-1 flex flex-col mt-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-2">
                  {questions.map((qa) => (
                    <Card key={qa.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <span className="text-xs text-slate-400">{qa.votes}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{qa.question}</p>
                            <span className="text-xs text-slate-500">{qa.userName}</span>
                            {qa.answer && (
                              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                                <p className="text-sm text-blue-300">{qa.answer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-700">
                <Textarea
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-slate-800 border-slate-700 text-white mb-2"
                  rows={3}
                />
                <Button onClick={handleAskQuestion} className="w-full">
                  Submit Question
                </Button>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-400 text-center">
                        Product showcase coming soon...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
