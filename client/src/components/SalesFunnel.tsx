import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface SalesFunnelProps {
  registeredCount: number;
  attendedCount: number;
  mqlCount: number;
  sqlCount: number;
  opportunitiesCount: number;
  closedWonCount: number;
}

export default function SalesFunnel({
  registeredCount,
  attendedCount,
  mqlCount,
  sqlCount,
  opportunitiesCount,
  closedWonCount,
}: SalesFunnelProps) {
  const attendanceRate = registeredCount > 0 ? Math.round((attendedCount / registeredCount) * 100) : 0;

  const funnelStages: FunnelStage[] = [
    { 
      label: "注册", 
      count: registeredCount, 
      percentage: 100, 
      color: "bg-violet-500" 
    },
    { 
      label: "出席", 
      count: attendedCount, 
      percentage: attendanceRate, 
      color: "bg-blue-500" 
    },
    { 
      label: "MQL", 
      count: mqlCount, 
      percentage: registeredCount > 0 ? Math.round((mqlCount / registeredCount) * 100) : 0, 
      color: "bg-green-500" 
    },
    { 
      label: "SQL", 
      count: sqlCount, 
      percentage: registeredCount > 0 ? Math.round((sqlCount / registeredCount) * 100) : 0, 
      color: "bg-yellow-500" 
    },
    { 
      label: "商机", 
      count: opportunitiesCount, 
      percentage: registeredCount > 0 ? Math.round((opportunitiesCount / registeredCount) * 100) : 0, 
      color: "bg-orange-500" 
    },
    { 
      label: "成交", 
      count: closedWonCount, 
      percentage: registeredCount > 0 ? Math.round((closedWonCount / registeredCount) * 100) : 0, 
      color: "bg-emerald-500" 
    },
  ];

  // Calculate conversion rates
  const registrationToAttendance = attendanceRate;
  const attendanceToMQL = attendedCount > 0 ? Math.round((mqlCount / attendedCount) * 100) : 0;
  const mqlToClosedWon = mqlCount > 0 ? Math.round((closedWonCount / mqlCount) * 100) : 0;

  if (registeredCount === 0) {
    return null;
  }

  return (
    <Card className="bg-[#141414] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-xl font-light text-white">销售漏斗</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {funnelStages.map((stage, index) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white w-16">{stage.label}</span>
                  <span className="text-2xl font-light text-white">{stage.count}</span>
                  <span className="text-sm text-muted-foreground">({stage.percentage}%)</span>
                </div>
                {index < funnelStages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="relative h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", stage.color)}
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Summary */}
        <div className="mt-6 pt-6 border-t border-[#262626] grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">注册到出席转化率</div>
            <div className="text-xl font-light text-white">{registrationToAttendance}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">出席到 MQL 转化率</div>
            <div className="text-xl font-light text-white">{attendanceToMQL}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">MQL 到成交转化率</div>
            <div className="text-xl font-light text-white">{mqlToClosedWon}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
