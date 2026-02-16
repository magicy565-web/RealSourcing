import { Card, CardContent } from "./ui/card";
import { Users, TrendingUp, Target, DollarSign, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  colorClass: string;
}

function MetricCard({ icon, label, value, subValue, trend, colorClass }: MetricCardProps) {
  return (
    <Card className={cn("bg-gradient-to-br border", colorClass)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", colorClass.replace("/10", "/20"))}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-light text-white mb-1">
          {value}
          {subValue && <span className="text-lg text-muted-foreground">{subValue}</span>}
        </div>
        <div className="text-sm text-muted-foreground font-light mb-2">{label}</div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs", trend.direction === "up" ? "text-green-400" : "text-red-400")}>
            <TrendingUp className={cn("h-3 w-3", trend.direction === "down" && "rotate-180")} />
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BusinessMetricsProps {
  registeredCount: number;
  maxParticipants?: number;
  attendedCount: number;
  attendanceRate: number;
  mqlCount: number;
  estimatedRevenue: number;
}

export default function BusinessMetrics({
  registeredCount,
  maxParticipants,
  attendedCount,
  attendanceRate,
  mqlCount,
  estimatedRevenue,
}: BusinessMetricsProps) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <MetricCard
        icon={<Users className="h-6 w-6 text-violet-400" />}
        label="注册人数"
        value={registeredCount}
        subValue={maxParticipants ? `/${maxParticipants}` : undefined}
        trend={registeredCount > 0 ? { direction: "up", value: "+5 本周" } : undefined}
        colorClass="from-violet-500/10 to-violet-900/10 border-violet-500/20"
      />
      <MetricCard
        icon={<CheckCircle className="h-6 w-6 text-blue-400" />}
        label="实际出席"
        value={attendedCount}
        subValue={` (${attendanceRate}%)`}
        trend={attendanceRate > 0 ? { direction: "up", value: `↑ ${attendanceRate > 80 ? '高于' : '低于'}平均` } : undefined}
        colorClass="from-blue-500/10 to-blue-900/10 border-blue-500/20"
      />
      <MetricCard
        icon={<Target className="h-6 w-6 text-amber-400" />}
        label="MQL 生成"
        value={mqlCount}
        trend={mqlCount > 0 ? { direction: "up", value: "↑ 3 本周" } : undefined}
        colorClass="from-amber-500/10 to-amber-900/10 border-amber-500/20"
      />
      <MetricCard
        icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
        label="预计成交"
        value={`$${(estimatedRevenue / 1000).toFixed(1)}K`}
        trend={estimatedRevenue > 0 ? { direction: "up", value: "↑ $12K" } : undefined}
        colorClass="from-emerald-500/10 to-emerald-900/10 border-emerald-500/20"
      />
    </div>
  );
}
