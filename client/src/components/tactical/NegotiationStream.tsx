import { useEffect, useRef } from "react";
// import { trpc } from "../../lib/trpc";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Bot,
  Mic,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NegotiationStreamProps {
  webinarId: number;
}

const eventTypeConfig = {
  pricing: {
    icon: DollarSign,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  agreement: {
    icon: CheckCircle2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  ai_alert: {
    icon: AlertTriangle,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  factory: {
    icon: Factory,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  ai_insight: {
    icon: Bot,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  presentation: {
    icon: FileText,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  negotiation: {
    icon: Mic,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  system: {
    icon: Mic,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
  },
} as const;

export default function NegotiationStream({ webinarId }: NegotiationStreamProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { data: events, isLoading } = trpc.webinar.timeline.useQuery(
    { webinarId },
    {
      refetchInterval: 3000,
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewportRef.current && events) {
      const viewport = viewportRef.current;
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [events]);

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/50 border-l border-slate-800/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
            Negotiation Log
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-3" ref={viewportRef}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-slate-500 font-mono">
                Loading events...
              </div>
            </div>
          ) : events && events.length > 0 ? (
            events.map((event, index) => {
              const config = eventTypeConfig[event.type] || eventTypeConfig.system;
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg border border-slate-800/50",
                    "animate-in fade-in slide-in-from-bottom-2 duration-300",
                    config.bgColor
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Timestamp */}
                  <div className="flex-shrink-0 w-20 pt-0.5">
                    <span className="text-xs font-mono text-slate-500">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 pt-0.5">
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white mb-0.5 leading-tight">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mic className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-sm text-slate-500 font-mono">
                No events yet
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Negotiation events will appear here
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
