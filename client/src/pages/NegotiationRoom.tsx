import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import NegotiationStream from "@/components/tactical/NegotiationStream";
import DecisionMatrix from "@/components/tactical/DecisionMatrix";
import FactoryTacticalPanel from "@/components/tactical/FactoryTacticalPanel";

// Active factories in this webinar session
const activeFactories = [
  {
    id: 1,
    name: "Ningbo AutoParts Co.",
    shortName: "NA",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NingboAuto",
    status: "active" as const,
  },
  {
    id: 2,
    name: "Shaoxing Gear Manufacturing",
    shortName: "SG",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ShaoxingGear",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Hangzhou Motors Ltd.",
    shortName: "HM",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=HangzhouMotors",
    status: "waiting" as const,
  },
];

interface NegotiationRoomProps {
  params: {
    id?: string;
  };
}

export default function NegotiationRoom({ params }: NegotiationRoomProps) {
  const [, setLocation] = useLocation();
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(null);
  const webinarId = parseInt(params?.id || "1", 10);

  return (
    <DashboardLayout>
      {/* Full-height container minus header */}
      <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-950">
        {/* Webinar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/webinars")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">
                  Smart Home Products Showcase
                </h1>
                <Badge
                  variant="default"
                  className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                >
                  <Circle className="h-2 w-2 fill-red-400 mr-1" />
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Started 52 minutes ago · {activeFactories.length} factories online
              </p>
            </div>
          </div>

          {/* Decision Matrix Button */}
          <div className="flex items-center gap-3">
            <DecisionMatrix />
          </div>
        </div>

        {/* Main Content: Three-Column Layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left Column: Negotiation Timeline Stream */}
          <aside className="w-80 border-r border-slate-800 flex-shrink-0 bg-slate-950/50">
            <NegotiationStream webinarId={webinarId} />
          </aside>

          {/* Center Column: Video Feed + Factory Avatars */}
          <main className="flex-1 flex flex-col relative bg-slate-950">
            {/* Live Video Feed Placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="inline-block px-6 py-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-3xl font-mono font-bold text-slate-500 tracking-wider animate-pulse">
                    LIVE FEED
                  </div>
                  <div className="text-sm text-slate-600 font-mono mt-2">
                    WAITING FOR SIGNAL...
                  </div>
                </div>
                
                {/* Loading Indicator */}
                <div className="flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                  <div
                    className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>

            {/* Factory Avatars Bar (Floating Bottom) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="flex gap-5 p-5 bg-slate-950/90 backdrop-blur-md border border-slate-800/60 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                {activeFactories.map((factory) => (
                  <button
                    key={factory.id}
                    onClick={() => setSelectedFactoryId(factory.id)}
                    className={cn(
                      "group relative transition-all duration-300",
                      "hover:scale-110 focus:outline-none focus:scale-110",
                      "active:scale-95"
                    )}
                  >
                    {/* Avatar */}
                    <Avatar
                      className={cn(
                        "w-16 h-16 border-2 transition-all cursor-pointer",
                        selectedFactoryId === factory.id
                          ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] ring-2 ring-cyan-500/50"
                          : "border-slate-700 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      )}
                    >
                      <AvatarImage src={factory.avatar} alt={factory.name} />
                      <AvatarFallback className="bg-slate-800 text-cyan-400 font-mono text-sm font-bold">
                        {factory.shortName}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status Indicator */}
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-950",
                        factory.status === "active"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-amber-500"
                      )}
                    />

                    {/* Hover Tooltip */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/95 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                      <span className="text-xs text-slate-200 font-medium">
                        {factory.name}
                      </span>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="border-[6px] border-transparent border-t-slate-700" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Right Overlay: Factory Tactical Panel */}
      {selectedFactoryId && (
        <FactoryTacticalPanel
          factoryId={selectedFactoryId}
          trigger={<></>}
        />
      )}
    </DashboardLayout>
  );
}
          factoryId={selectedFactoryId}
          trigger={<></>}
        />
      )}
    </div>
  );
}
