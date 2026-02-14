import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface QuotaUsageCardProps {
  title: string;
  usage: number;
  limit: number;
  icon?: React.ReactNode;
  unit?: string;
}

export function QuotaUsageCard({ title, usage, limit, icon, unit = "个" }: QuotaUsageCardProps) {
  const [, setLocation] = useLocation();
  
  const percentage = limit === Infinity || limit === -1 ? 0 : (usage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isUnlimited = limit === Infinity || limit === -1;

  const getProgressColor = () => {
    if (isUnlimited) return "bg-blue-500";
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">
              {usage}
              {!isUnlimited && (
                <span className="text-sm text-slate-400 font-normal ml-1">
                  / {limit} {unit}
                </span>
              )}
              {isUnlimited && (
                <span className="text-sm text-blue-400 font-normal ml-1">
                  / 无限
                </span>
              )}
            </p>
          </div>
        </div>

        {isNearLimit && !isUnlimited && (
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        )}
      </div>

      {!isUnlimited && (
        <>
          <Progress value={percentage} className="h-2 mb-2" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              已使用 {percentage.toFixed(0)}%
            </span>
            {isNearLimit && (
              <span className="text-yellow-400">接近限额</span>
            )}
          </div>

          {isNearLimit && (
            <Button
              size="sm"
              onClick={() => setLocation("/subscription/plans")}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              升级计划
            </Button>
          )}
        </>
      )}

      {isUnlimited && (
        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400 text-center">
            ✨ 无限使用
          </p>
        </div>
      )}
    </Card>
  );
}
