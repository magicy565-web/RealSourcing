import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { trpc } from "../../lib/trpc";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  MapPin,
  Award,
  TrendingUp,
  Bot,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface FactoryTacticalPanelProps {
  factoryId: number;
  trigger?: React.ReactNode;
}

interface TrustBarProps {
  label: string;
  score: number;
  maxScore?: number;
}

const TrustBar = ({ label, score, maxScore = 100 }: TrustBarProps) => {
  const percentage = (score / maxScore) * 100;
  const blocks = 20; // Total number of blocks
  const filledBlocks = Math.round((percentage / 100) * blocks);

  const getBlockColor = (score: number) => {
    if (score >= 80) return "bg-cyan-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const colorClass = getBlockColor(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold text-white tabular-nums">{score}</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: blocks }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 flex-1 rounded-sm transition-all duration-300",
              index < filledBlocks
                ? colorClass
                : "bg-slate-800"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default function FactoryTacticalPanel({
  factoryId,
  trigger,
}: FactoryTacticalPanelProps) {
  const [open, setOpen] = useState(false);

  const { data: factory, isLoading } = trpc.factory.getById.useQuery(
    { id: factoryId },
    {
      enabled: open, // Only fetch when sheet is open
    }
  );

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
    >
      View Details
      <ChevronRight className="w-4 h-4" />
    </Button>
  );

  // Prepare radar chart data
  const radarData = factory
    ? [
        {
          subject: "Quality",
          score: factory.qualityScore,
          fullMark: 100,
        },
        {
          subject: "Delivery",
          score: factory.deliveryScore,
          fullMark: 100,
        },
        {
          subject: "Communication",
          score: factory.communicationScore,
          fullMark: 100,
        },
        {
          subject: "Pricing",
          score: factory.pricingScore,
          fullMark: 100,
        },
        {
          subject: "Compliance",
          score: factory.complianceScore,
          fullMark: 100,
        },
      ]
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-cyan-400 bg-cyan-500/20 border-cyan-500/30";
    if (score >= 60) return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    return "text-rose-400 bg-rose-500/20 border-rose-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Fair";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-slate-900 border-slate-700 p-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400">Loading factory data...</p>
            </div>
          </div>
        ) : factory ? (
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Header */}
              <SheetHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-cyan-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-2xl text-white mb-2">
                      {factory.name}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {factory.location || "Location not specified"}
                    </SheetDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-center",
                        getScoreColor(factory.overallScore ?? 0)
                      )}
                    >
                      <div className="text-2xl font-bold tabular-nums">
                        {factory.overallScore ?? 0}
                      </div>
                      <div className="text-xs font-medium uppercase tracking-wide">
                        {getScoreLabel(factory.overallScore ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <Separator className="bg-slate-800" />

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {factory.employees && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      Employees
                    </div>
                    <div className="text-sm font-medium text-slate-200">
                      {factory.employees}
                    </div>
                  </div>
                )}
                {factory.established && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      Established
                    </div>
                    <div className="text-sm font-medium text-slate-200">
                      {factory.established}
                    </div>
                  </div>
                )}
                {factory.annualRevenue && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      Annual Revenue
                    </div>
                    <div className="text-sm font-medium text-slate-200">
                      {factory.annualRevenue}
                    </div>
                  </div>
                )}
                {factory.category && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      Category
                    </div>
                    <div className="text-sm font-medium text-slate-200">
                      {factory.category}
                    </div>
                  </div>
                )}
              </div>

              {/* Certifications */}
              {factory.certifications && factory.certifications.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                      Certifications
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {factory.certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-amber-500/30 text-amber-300 bg-amber-500/10"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {factory.specialties && factory.specialties.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                      Specialties
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {factory.specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-blue-500/30 text-blue-300 bg-blue-500/10"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-slate-800" />

              {/* Capability Radar Chart */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Capability Assessment
                </h3>
                <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-800">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#22d3ee"
                        fill="#22d3ee"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trust Bars (Detailed Scores) */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Detailed Metrics
                </h3>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 space-y-4">
                  <TrustBar label="Quality Score" score={factory.qualityScore ?? 0} />
                  <TrustBar label="Delivery Score" score={factory.deliveryScore ?? 0} />
                  <TrustBar
                    label="Communication Score"
                    score={factory.communicationScore ?? 0}
                  />
                  <TrustBar label="Pricing Score" score={factory.pricingScore ?? 0} />
                  <TrustBar
                    label="Compliance Score"
                    score={factory.complianceScore ?? 0}
                  />
                </div>
              </div>

              {/* AI Summary */}
              {factory.aiSummary && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                      AI Analysis
                    </h3>
                  </div>
                  <div className="relative bg-slate-950/80 rounded-lg p-4 border border-purple-500/30">
                    {/* Terminal-style header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        ai-evaluation.log
                      </span>
                    </div>
                    {/* Terminal content */}
                    <div className="font-mono text-sm text-slate-300 leading-relaxed">
                      <span className="text-purple-400">$ </span>
                      {factory.aiSummary}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="pt-4">
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-400">Factory Status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      factory.status === "verified" &&
                        "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
                      factory.status === "pending" &&
                        "border-amber-500/30 text-amber-300 bg-amber-500/10",
                      factory.status === "suspended" &&
                        "border-rose-500/30 text-rose-300 bg-rose-500/10"
                    )}
                  >
                    {factory.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Factory not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
