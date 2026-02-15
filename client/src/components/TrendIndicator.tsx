import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../lib/utils";

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
  className?: string;
}

export default function TrendIndicator({ value, suffix = "%", className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? "text-gray-400"
    : isPositive
    ? "text-green-400"
    : "text-red-400";

  return (
    <div className={cn("flex items-center gap-1 text-xs font-light", colorClass, className)}>
      <Icon className="h-3 w-3" />
      <span>
        {isPositive && "+"}{Math.abs(value)}{suffix}
      </span>
    </div>
  );
}
