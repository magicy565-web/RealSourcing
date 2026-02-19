import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Send, ThumbsUp, CheckCircle2, Pin, MessageSquare,
  Package, Radio, Mic, MicOff, Video, VideoOff,
  Volume2, VolumeX, Maximize2, Star,
  Building2, MapPin, Eye, Clock, Globe,
  HelpCircle, PhoneOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  MOCK_WEBINARS,
  MOCK_CHAT_MESSAGES,
  MOCK_QA_ITEMS,
  type MockWebinar,
  type MockChatMessage,
  type MockQAItem,
  type MockProduct,
  type MockFactory,
} from "@/lib/webinar-mock-data";

const AUTO_MESSAGES: Omit<MockChatMessage, "id" | "timestamp">[] = [
  { userId: "u1", userName: "Carlos M.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos", userCountry: "🇲🇽", message: "What's the MOQ for the wireless charger?", type: "text" },
  { userId: "u2", userName: "Anna K.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna", userCountry: "🇩🇪", message: "Great quality! Can you do custom branding?", type: "text" },
  { userId: "u3", userName: "Raj P.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=raj", userCountry: "🇮🇳", message: "Do you have CE certification for EU market?", type: "text" },
  { userId: "u4", userName: "Sophie L.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie", userCountry: "🇫🇷", message: "Très impressionnant! Lead time?", type: "text" },
  { userId: "u5", userName: "James W.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james", userCountry: "🇬🇧", message: "Can we arrange a factory visit?", type: "text" },
  { userId: "u6", userName: "Yuki T.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki", userCountry: "🇯🇵", message: "品質が素晴らしい！OEM可能ですか？", type: "text" },
  { userId: "u7", userName: "Maria G.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", userCountry: "🇧🇷", message: "What payment terms do you accept?", type: "text" },
  { userId: "u8", userName: "Ahmed H.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed", userCountry: "🇦🇪", message: "We need 10,000 units per month. Possible?", type: "text" },
  { userId: "u9", userName: "Liu Wei", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liuwei", userCountry: "🇨🇳", message: "请问有没有BSCI认证？", type: "text" },
  { userId: "u10", userName: "Kim S.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kim", userCountry: "🇰🇷", message: "샘플 주문 가능한가요?", type: "text" },
  { userId: "u11", userName: "Elena V.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena", userCountry: "🇷🇺", message: "Excellent presentation! Very professional.", type: "text" },
  { userId: "u12", userName: "Tom B.", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom", userCountry: "🇺🇸", message: "Do you ship to the US directly?", type: "text" },
];

function SidebarProductCard({ product }: { product: MockProduct }) {
  return (
    <div className="flex gap-3 p-3 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl hover:border-violet-500/30 transition-all cursor-pointer group">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium text-white line-clamp-2 leading-snug mb-1">{product.name}</h4>
        <p className="text-xs text-violet-400 font-medium mb-1">{product.price}</p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>MOQ: {product.moq}</span>
          <span>·</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span>{product.rating}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {product.certification.slice(0, 2).map((c) => (
            <span key={c} className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarFactoryCard({ factory }: { factory: MockFactory }) {
  return (
    <div className="p-3 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl hover:border-blue-500/30 transition-all cursor-pointer">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={factory.logo}
            alt={factory.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              if (el.parentElement) {
                el.parentElement.innerHTML = `<span class="text-sm font-light text-gray-400">${factory.name[0]}</span>`;
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-white line-clamp-1">{factory.name}</h4>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <MapPin className="w-2.5 h-2.5" />
            <span>{factory.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs text-amber-400 font-medium">{factory.rating}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {[
          { label: "成立", value: `${factory.established}年` },
          { label: "员工", value: factory.employees.split("-")[0] + "+" },
          { label: "出口", value: `${factory.exportCountries}国` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#1a1a1a] rounded-md p-1.5 text-center">
            <div className="text-[9px] text-gray-600">{label}</div>
            <div className="text-[10px] text-white font-medium">{value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {factory.certifications.slice(0, 3).map((c) => (
          <span key={c} className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">{c}</span>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ msg, isOwn }: { msg: MockChatMessage; isOwn?: boolean }) {
  if (msg.type === "system") {
    return (
      <div className="text-center py-1">
        <span className="text-[10px] text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded-full">{msg.message}</span>
      </div>
    );
  }
  return (
    <div className={cn("flex gap-2 group", isOwn && "flex-row-reverse")}>
      <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
        <AvatarImage src={msg.userAvatar} />
        <AvatarFallback className="bg-[#2a2a2a] text-[10px]">{msg.userName[0]}</AvatarFallback>
      </Avatar>
      <div className={cn("flex-1 min-w-0", isOwn && "flex flex-col items-end")}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] text-gray-500 font-light">{msg.userCountry} {msg.userName}</span>
          <span className="text-[9px] text-gray-700">{msg.timestamp}</span>
        </div>
        <div className={cn(
          "text-xs font-light px-3 py-2 rounded-xl max-w-[85%] leading-relaxed",
          isOwn
            ? "bg-violet-600/20 text-violet-100 border border-violet-500/20"
            : "bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a]"
        )}>
          {msg.message}
        </div>
      </div>
    </div>
  );
}

function QAItemCard({ item, onUpvote, onPin, onMarkAnswered }: {
  item: MockQAItem;
  onUpvote: (id: string) => void;
  onPin: (id: string) => void;
  onMarkAnswered: (id: string) => void;
}) {
  return (
    <div className={cn(
      "p-3.5 rounded-xl border transition-all",
      item.isPinned ? "bg-amber-500/5 border-amber-500/20" :
        item.isAnswered ? "bg-green-500/5 border-green-500/15" :
          "bg-[#0f0f0f] border-[#1e1e1e]"
    )}>
      {item.isPinned && (
        <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2">
          <Pin className="w-3 h-3" />
          <span>置顶问题</span>
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarImage src={item.userAvatar} />
          <AvatarFallback className="bg-[#2a2a2a] text-[10px]">{item.userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs text-gray-400 font-light">{item.userCountry} {item.userName}</span>
            <span className="text-[9px] text-gray-700">{item.timestamp}</span>
          </div>
          <p className="text-sm text-white font-light leading-relaxed mb-2">{item.question}</p>
          {item.isAnswered && item.answer && (
            <div className="mt-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">{item.answeredBy} 已回答</span>
              </div>
              <p className="text-xs text-gray-300 font-light leading-relaxed">{item.answer}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={() => onUpvote(item.id)}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-violet-400 transition-colors"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{item.upvotes}</span>
            </button>
            {!item.isAnswered && (
              <button
                onClick={() => onMarkAnswered(item.id)}
                className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-green-400 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>标记已答</span>
              </button>
            )}
            <button
              onClick={() => onPin(item.id)}
              className={cn(
                "flex items-center gap-1 text-[10px] transition-colors",
                item.isPinned ? "text-amber-400" : "text-gray-600 hover:text-amber-400"
              )}
            >
              <Pin className="w-3 h-3" />
              <span>{item.isPinned ? "已置顶" : "置顶"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WebinarLiveRoom() {
  const [, params] = useRoute("/webinars/:id/live");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const webinarId = params?.id ? parseInt(params.id) : null;
  const chatEndRef = useRef<HTMLDivElement>(null);

  const webinar = useMemo((): MockWebinar | null => {
    if (!webinarId) return null;
    return MOCK_WEBINARS.find((w) => w.id === webinarId) || MOCK_WEBINARS[0];
  }, [webinarId]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isVolumeOff, setIsVolumeOff] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "qa" | "products" | "factories">("chat");
  const [viewerCount, setViewerCount] = useState(webinar?.currentParticipants || 342);
  const [elapsedSeconds, setElapsedSeconds] = useState(45 * 60);

  const [chatMessages, setChatMessages] = useState<MockChatMessage[]>(() => [...MOCK_CHAT_MESSAGES]);
  const [chatInput, setChatInput] = useState("");
  const [qaItems, setQaItems] = useState<MockQAItem[]>(() => [...MOCK_QA_ITEMS]);
  const [qaInput, setQaInput] = useState("");

  // Auto incoming chat messages
  useEffect(() => {
    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex >= AUTO_MESSAGES.length) msgIndex = 0;
      const newMsg: MockChatMessage = {
        ...AUTO_MESSAGES[msgIndex],
        id: `auto-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev.slice(-60), newMsg]);
      msgIndex++;
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  // Viewer count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((v) => Math.max(200, v + Math.floor(Math.random() * 7) - 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, {
      id: `my-${Date.now()}`,
      userId: "me",
      userName: "You",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
      userCountry: "🌐",
      message: text,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    }]);
    setChatInput("");
  }, [chatInput]);

  const handleSubmitQuestion = useCallback(() => {
    const text = qaInput.trim();
    if (!text) return;
    setQaItems((prev) => [{
      id: `q-${Date.now()}`,
      userId: "me",
      userName: "You",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
      userCountry: "🌐",
      question: text,
      upvotes: 0,
      isAnswered: false,
      isPinned: false,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }, ...prev]);
    setQaInput("");
    toast({ title: "问题已提交", description: "主持人将在互动环节回答" });
  }, [qaInput, toast]);

  const handleUpvote = useCallback((id: string) => {
    setQaItems((prev) => prev.map((q) => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q));
  }, []);

  const handlePin = useCallback((id: string) => {
    setQaItems((prev) => prev.map((q) => q.id === id ? { ...q, isPinned: !q.isPinned } : q));
  }, []);

  const handleMarkAnswered = useCallback((id: string) => {
    setQaItems((prev) => prev.map((q) =>
      q.id === id ? { ...q, isAnswered: true, answer: "感谢您的提问！我们的产品完全符合您的需求，具体细节可以在直播结束后通过平台私信我们进一步沟通。", answeredBy: webinar?.hostName || "主持人" } : q
    ));
  }, [webinar]);

  const sortedQA = useMemo(() => [...qaItems].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isAnswered !== b.isAnswered) return a.isAnswered ? 1 : -1;
    return b.upvotes - a.upvotes;
  }), [qaItems]);

  const products = webinar?.products || [];
  const factories = webinar?.factories || [];

  if (!webinar) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080808]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-light">加载直播间...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#080808] overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0a] border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation(`/webinars/${webinarId}`)}
            className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
            <span className="text-sm font-light text-white line-clamp-1 max-w-xs">{webinar.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums font-medium">{formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-violet-400">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-medium">{viewerCount.toLocaleString()}</span>
            <span className="text-gray-600">在看</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Globe className="w-3.5 h-3.5" />
            <span className="font-light">{webinar.language}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
            <img
              src={webinar.coverImage}
              alt={webinar.title}
              className="w-full h-full object-cover opacity-70"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />

            {/* Live badge */}
            <div className="absolute top-4 left-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <div className="bg-black/50 backdrop-blur-sm text-gray-300 text-xs px-3 py-1.5 rounded-full border border-white/10">
                {formatElapsed(elapsedSeconds)}
              </div>
            </div>

            {/* Host info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-violet-500/50">
                <img
                  src={webinar.hostAvatar}
                  alt={webinar.hostName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${webinar.hostName}`;
                  }}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-white drop-shadow">{webinar.hostName}</div>
                <div className="text-xs text-gray-300 font-light drop-shadow">{webinar.hostTitle} · {webinar.hostCompany}</div>
              </div>
            </div>

            {/* Volume */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsVolumeOff(!isVolumeOff)}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/10 text-white/60 hover:text-white transition-colors"
              >
                {isVolumeOff ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a] flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn("p-2 rounded-lg transition-colors border", isMuted ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:text-white")}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={cn("p-2 rounded-lg transition-colors border", isVideoOff ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:text-white")}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setLocation(`/webinars/${webinarId}`); }}
                className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors border border-red-500"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="font-light">直播进行中</span>
              <span className="text-gray-700">·</span>
              <span className="text-violet-400 font-medium">{viewerCount.toLocaleString()} 人观看</span>
            </div>
            <button className="p-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col border-l border-[#1a1a1a] bg-[#0a0a0a]">
          {/* Tabs */}
          <div className="flex-shrink-0 border-b border-[#1a1a1a]">
            <div className="flex">
              {[
                { key: "chat", icon: MessageSquare, label: "聊天", count: chatMessages.length },
                { key: "qa", icon: HelpCircle, label: "Q&A", count: qaItems.filter((q) => !q.isAnswered).length },
                { key: "products", icon: Package, label: "产品", count: products.length },
                { key: "factories", icon: Building2, label: "工厂", count: factories.length },
              ].map(({ key, icon: Icon, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-light transition-colors border-b-2",
                    activeTab === key ? "text-white border-violet-500" : "text-gray-600 border-transparent hover:text-gray-400"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {count > 0 && (
                    <span className={cn("text-[9px] px-1 rounded-full", activeTab === key ? "bg-violet-500/20 text-violet-400" : "bg-[#1a1a1a] text-gray-600")}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} isOwn={msg.userId === "me"} />
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-[#1a1a1a] flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                    placeholder="发送消息..."
                    className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-xs font-light placeholder:text-gray-600 focus-visible:ring-violet-500/50 h-8"
                  />
                  <Button onClick={handleSendChat} size="sm" className="bg-violet-600 hover:bg-violet-500 text-white px-2.5 h-8">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Q&A Tab */}
          {activeTab === "qa" && (
            <>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {sortedQA.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-light">暂无问题，快来提问吧</p>
                    </div>
                  ) : (
                    sortedQA.map((item) => (
                      <QAItemCard
                        key={item.id}
                        item={item}
                        onUpvote={handleUpvote}
                        onPin={handlePin}
                        onMarkAnswered={handleMarkAnswered}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-[#1a1a1a] flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitQuestion()}
                    placeholder="提交您的问题..."
                    className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-xs font-light placeholder:text-gray-600 focus-visible:ring-violet-500/50 h-8"
                  />
                  <Button onClick={handleSubmitQuestion} size="sm" className="bg-violet-600 hover:bg-violet-500 text-white px-2.5 h-8">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-gray-600 font-light mt-1.5 text-center">
                  {qaItems.filter((q) => !q.isAnswered).length} 个问题待回答
                </p>
              </div>
            </>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <ScrollArea className="flex-1 p-3">
              {products.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-light">暂无展示产品</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-500 font-light uppercase tracking-wider mb-2">
                    本场展示 {products.length} 款产品
                  </p>
                  {products.map((product) => (
                    <SidebarProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Factories Tab */}
          {activeTab === "factories" && (
            <ScrollArea className="flex-1 p-3">
              {factories.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-light">暂无参展工厂</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-500 font-light uppercase tracking-wider mb-2">
                    {factories.length} 家工厂参与本场直播
                  </p>
                  {factories.map((factory) => (
                    <SidebarFactoryCard key={factory.id} factory={factory} />
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
