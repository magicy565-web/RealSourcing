import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Circle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  FileText,
  DollarSign,
  Handshake,
  Building2,
  Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NegotiationEvent {
  id: number;
  webinarId: number;
  type: "system" | "factory" | "presentation" | "pricing" | "ai_insight" | "negotiation" | "ai_alert" | "agreement";
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface NegotiationTimelineProps {
  webinarId: number;
  events: NegotiationEvent[];
  onRefresh?: () => void;
}

// ─── Event Type Config ───────────────────────────────────────────────────────

const eventTypeConfig = {
  system: {
    icon: Circle,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    label: "System",
  },
  factory: {
    icon: Building2,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    label: "Factory",
  },
  presentation: {
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Presentation",
  },
  pricing: {
    icon: DollarSign,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    label: "Pricing",
  },
  ai_insight: {
    icon: Sparkles,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    label: "AI Insight",
  },
  negotiation: {
    icon: MessageSquare,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    label: "Negotiation",
  },
  ai_alert: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    label: "AI Alert",
  },
  agreement: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    label: "Agreement",
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NegotiationTimeline({
  webinarId,
  events,
  onRefresh,
}: NegotiationTimelineProps) {
  const [sortedEvents, setSortedEvents] = useState<NegotiationEvent[]>([]);

  useEffect(() => {
    // Sort events by createdAt (newest first)
    const sorted = [...events].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedEvents(sorted);
  }, [events]);

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-6">
        <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center">
          <Clock className="h-7 w-7 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-light text-white">No Events Yet</p>
          <p className="text-xs text-muted-foreground font-light mt-1 max-w-[240px]">
            Events will appear here as the negotiation progresses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
      {sortedEvents.map((event, index) => {
        const config = eventTypeConfig[event.type];
        const Icon = config.icon;
        const isLast = index === sortedEvents.length - 1;

        return (
          <div
            key={event.id}
            className="relative pl-8 pb-6 animate-in fade-in slide-in-from-bottom-1 duration-200"
          >
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-3 top-8 bottom-0 w-px bg-gradient-to-b from-[#262626] to-transparent" />
            )}

            {/* Event Icon */}
            <div
              className={cn(
                "absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center border",
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn("h-3 w-3", config.color)} />
            </div>

            {/* Event Content */}
            <div className="space-y-1.5">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-light text-white truncate">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-xs text-muted-foreground font-light mt-0.5 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-light border-[#262626] flex-shrink-0",
                    config.color
                  )}
                >
                  {config.label}
                </Badge>
              </div>

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(event.metadata).map(([key, value]) => {
                    // Skip internal fields
                    if (key.startsWith("_")) return null;
                    
                    return (
                      <div
                        key={key}
                        className="px-2 py-1 rounded bg-[#141414] border border-[#1A1A1A] text-[10px] text-muted-foreground font-light"
                      >
                        <span className="text-white">{key}:</span> {String(value)}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-light">
                <Clock className="h-2.5 w-2.5" />
                {formatTimestamp(event.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
