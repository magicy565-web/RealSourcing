import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, DollarSign, Clock, FileText, Zap } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SmartReply {
  id: string;
  text: string;
  category: "question" | "negotiation" | "request" | "confirmation";
  icon?: React.ReactNode;
  confidence?: number;
}

interface SmartRepliesProps {
  context?: {
    lastMessage?: string;
    sessionTopic?: string;
    negotiationPhase?: "intro" | "discovery" | "negotiation" | "closing";
  };
  onSelect: (reply: string) => void;
  maxReplies?: number;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SmartReplies({
  context,
  onSelect,
  maxReplies = 3,
  className,
}: SmartRepliesProps) {
  const [replies, setReplies] = useState<SmartReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate smart replies based on context
  useEffect(() => {
    generateSmartReplies();
  }, [context?.lastMessage, context?.negotiationPhase]);

  const generateSmartReplies = () => {
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const generatedReplies = getContextualReplies();
      setReplies(generatedReplies.slice(0, maxReplies));
      setIsLoading(false);
    }, 300);
  };

  // Generate contextual replies based on session state
  const getContextualReplies = (): SmartReply[] => {
    const phase = context?.negotiationPhase || "discovery";
    const lastMsg = context?.lastMessage?.toLowerCase() || "";

    // Price-related context
    if (lastMsg.includes("price") || lastMsg.includes("cost") || lastMsg.includes("$")) {
      return [
        {
          id: "price-1",
          text: "Can you provide a volume discount structure?",
          category: "negotiation",
          icon: <DollarSign className="h-3 w-3" />,
          confidence: 0.95,
        },
        {
          id: "price-2",
          text: "What are the payment terms for this pricing?",
          category: "question",
          icon: <FileText className="h-3 w-3" />,
          confidence: 0.88,
        },
        {
          id: "price-3",
          text: "Is this your best offer for our order quantity?",
          category: "negotiation",
          icon: <TrendingUp className="h-3 w-3" />,
          confidence: 0.82,
        },
      ];
    }

    // Quality/Certification context
    if (lastMsg.includes("quality") || lastMsg.includes("certification") || lastMsg.includes("iso")) {
      return [
        {
          id: "quality-1",
          text: "Can you share recent quality inspection reports?",
          category: "request",
          icon: <FileText className="h-3 w-3" />,
          confidence: 0.92,
        },
        {
          id: "quality-2",
          text: "What's your defect rate for this product line?",
          category: "question",
          icon: <TrendingUp className="h-3 w-3" />,
          confidence: 0.85,
        },
        {
          id: "quality-3",
          text: "Do you offer quality guarantees or warranties?",
          category: "question",
          icon: <Sparkles className="h-3 w-3" />,
          confidence: 0.80,
        },
      ];
    }

    // Lead time / Delivery context
    if (lastMsg.includes("delivery") || lastMsg.includes("lead time") || lastMsg.includes("shipping")) {
      return [
        {
          id: "delivery-1",
          text: "Can you expedite for an urgent order?",
          category: "negotiation",
          icon: <Zap className="h-3 w-3" />,
          confidence: 0.90,
        },
        {
          id: "delivery-2",
          text: "What shipping methods do you typically use?",
          category: "question",
          icon: <Clock className="h-3 w-3" />,
          confidence: 0.87,
        },
        {
          id: "delivery-3",
          text: "Is partial shipment available?",
          category: "question",
          icon: <FileText className="h-3 w-3" />,
          confidence: 0.78,
        },
      ];
    }

    // Phase-based default replies
    switch (phase) {
      case "intro":
        return [
          {
            id: "intro-1",
            text: "Can you tell me more about your production capacity?",
            category: "question",
            icon: <Sparkles className="h-3 w-3" />,
            confidence: 0.85,
          },
          {
            id: "intro-2",
            text: "What are your main product categories?",
            category: "question",
            icon: <FileText className="h-3 w-3" />,
            confidence: 0.82,
          },
          {
            id: "intro-3",
            text: "Do you have experience with international clients?",
            category: "question",
            icon: <TrendingUp className="h-3 w-3" />,
            confidence: 0.79,
          },
        ];

      case "discovery":
        return [
          {
            id: "discovery-1",
            text: "What's your MOQ for this product?",
            category: "question",
            icon: <DollarSign className="h-3 w-3" />,
            confidence: 0.88,
          },
          {
            id: "discovery-2",
            text: "Can you provide product samples?",
            category: "request",
            icon: <FileText className="h-3 w-3" />,
            confidence: 0.85,
          },
          {
            id: "discovery-3",
            text: "What certifications do you hold?",
            category: "question",
            icon: <Sparkles className="h-3 w-3" />,
            confidence: 0.80,
          },
        ];

      case "negotiation":
        return [
          {
            id: "nego-1",
            text: "Can we discuss a better price for larger volumes?",
            category: "negotiation",
            icon: <TrendingUp className="h-3 w-3" />,
            confidence: 0.92,
          },
          {
            id: "nego-2",
            text: "What flexibility do you have on payment terms?",
            category: "negotiation",
            icon: <DollarSign className="h-3 w-3" />,
            confidence: 0.87,
          },
          {
            id: "nego-3",
            text: "Can you match competitor pricing?",
            category: "negotiation",
            icon: <Zap className="h-3 w-3" />,
            confidence: 0.83,
          },
        ];

      case "closing":
        return [
          {
            id: "closing-1",
            text: "Let's finalize the contract details.",
            category: "confirmation",
            icon: <FileText className="h-3 w-3" />,
            confidence: 0.95,
          },
          {
            id: "closing-2",
            text: "Can you send the proforma invoice?",
            category: "request",
            icon: <DollarSign className="h-3 w-3" />,
            confidence: 0.90,
          },
          {
            id: "closing-3",
            text: "When can we start production?",
            category: "question",
            icon: <Clock className="h-3 w-3" />,
            confidence: 0.85,
          },
        ];

      default:
        return [
          {
            id: "default-1",
            text: "Can you provide more details?",
            category: "question",
            icon: <Sparkles className="h-3 w-3" />,
            confidence: 0.75,
          },
          {
            id: "default-2",
            text: "That sounds interesting, tell me more.",
            category: "confirmation",
            icon: <TrendingUp className="h-3 w-3" />,
            confidence: 0.70,
          },
          {
            id: "default-3",
            text: "What are the next steps?",
            category: "question",
            icon: <Clock className="h-3 w-3" />,
            confidence: 0.68,
          },
        ];
    }
  };

  // Category colors
  const getCategoryColor = (category: SmartReply["category"]) => {
    switch (category) {
      case "negotiation":
        return "border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/50";
      case "question":
        return "border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50";
      case "request":
        return "border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50";
      case "confirmation":
        return "border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50";
      default:
        return "border-[#262626] hover:bg-white/5";
    }
  };

  if (replies.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={cn("px-4 py-3 border-t border-[#262626]/50 bg-[#0A0A0A]/30", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
          AI Suggestions
        </span>
        {isLoading && (
          <div className="ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {replies.map((reply, idx) => (
          <button
            key={reply.id}
            onClick={() => onSelect(reply.text)}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-white transition-all animate-in fade-in slide-in-from-bottom-1 hover:scale-[1.02]",
              getCategoryColor(reply.category)
            )}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {reply.icon && (
              <span className="text-muted-foreground group-hover:text-white transition-colors">
                {reply.icon}
              </span>
            )}
            <span className="font-light">{reply.text}</span>
            {reply.confidence && reply.confidence > 0.85 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-[9px] text-violet-300 font-medium">
                High
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
