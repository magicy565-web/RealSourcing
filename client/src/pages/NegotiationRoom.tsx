import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import NegotiationStream from "@/components/tactical/NegotiationStream";
import DecisionMatrix from "@/components/tactical/DecisionMatrix";
import FactoryTacticalPanel from "@/components/tactical/FactoryTacticalPanel";

// Mock factory data for avatars
const mockFactories = [
  {
    id: 1,
    name: "Ningbo AutoParts",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NA",
    status: "active",
  },
  {
    id: 2,
    name: "Shaoxing Gear",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SG",
    status: "active",
  },
  {
    id: 3,
    name: "Hangzhou Motors",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=HM",
    status: "waiting",
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
  const webinarId = parseInt(params?.id || "1", 10); // Get webinar ID from route params

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/webinars")}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-mono font-bold text-white">
            RealSourcing <span className="text-cyan-500">LIVE</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400 font-mono">
              Broadcasting
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DecisionMatrix />
        </div>
      </header>

      {/* Main Content: Holy Grail Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: NegotiationStream */}
        <aside className="w-80 border-r border-slate-800 flex-shrink-0">
          <NegotiationStream webinarId={webinarId} />
        </aside>

        {/* Center: Video Stage */}
        <main className="flex-1 flex flex-col relative">
          {/* Video Placeholder */}
          <div className="flex-1 flex items-center justify-center bg-slate-900/50">
            <div className="text-center space-y-4">
              <div className="text-2xl font-mono text-slate-600 animate-pulse">
                WAITING FOR SIGNAL...
              </div>
              <div className="flex gap-1 justify-center">
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

          {/* Bottom: Factory Avatars (Floating) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            {mockFactories.map((factory) => (
              <button
                key={factory.id}
                onClick={() => setSelectedFactoryId(factory.id)}
                className={cn(
                  "group relative transition-all duration-300",
                  "hover:scale-110 focus:outline-none focus:scale-110"
                )}
              >
                <Avatar
                  className={cn(
                    "w-14 h-14 border-2 transition-all cursor-pointer",
                    selectedFactoryId === factory.id
                      ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                      : "border-slate-700 hover:border-cyan-500"
                  )}
                >
                  <AvatarImage src={factory.avatar} alt={factory.name} />
                  <AvatarFallback className="bg-slate-800 text-cyan-400 font-mono">
                    {factory.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status Indicator */}
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950",
                    factory.status === "active"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  )}
                />

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <span className="text-xs text-slate-300 font-medium">
                    {factory.name}
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700" />
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* Factory Tactical Panel (Right Overlay) */}
      {selectedFactoryId && (
        <FactoryTacticalPanel
          factoryId={selectedFactoryId}
          trigger={<></>}
        />
      )}
    </div>
  );
}
